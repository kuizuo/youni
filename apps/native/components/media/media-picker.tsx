import {
	type CameraCapturedPicture,
	type CameraView,
	useCameraPermissions,
} from "expo-camera";
import type * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { Spinner } from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	AppState,
	FlatList,
	Modal,
	Platform,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlbumPicker } from "@/components/media/album-picker";
import { CameraPage } from "@/components/media/camera-page";
import {
	AddMoreTile,
	PermissionBanner,
	PermissionMessage,
	PhotoTile,
	PickerHeader,
	PickerTabs,
} from "@/components/media/media-picker-gallery";
import {
	getPhotoPermissionMode,
	imageMimeType,
	insertAddMoreItem,
	toggleSelection,
} from "@/components/media/media-picker-state";
import { mediaPickerStyles as styles } from "@/components/media/media-picker-styles";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";

const PAGE_SIZE = 80;
const ADD_MORE_ID = "__add_more__";
type LibraryItem = {
	asset: MediaLibrary.Asset;
	id: string;
	kind: "library";
	previewUri: string;
};

type CameraItem = {
	asset: ImagePicker.ImagePickerAsset;
	id: string;
	kind: "camera";
	previewUri: string;
};

type AddMoreItem = { id: typeof ADD_MORE_ID; kind: "add-more" };
type PickerItem = AddMoreItem | CameraItem | LibraryItem;

type MediaPickerProps = {
	maxSelection: number;
	onClose: () => void;
	onComplete: (assets: ImagePicker.ImagePickerAsset[]) => Promise<boolean>;
	visible: boolean;
};

function libraryItem(asset: MediaLibrary.Asset): LibraryItem {
	return {
		asset,
		id: `library:${asset.id}`,
		kind: "library",
		previewUri: asset.uri,
	};
}

export function MediaPicker({
	maxSelection,
	onClose,
	onComplete,
	visible,
}: MediaPickerProps) {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const { toast } = useAppToast();
	const cameraRef = useRef<CameraView>(null);
	const loadTokenRef = useRef(0);
	const [permission, setPermission] =
		useState<MediaLibrary.PermissionResponse | null>(null);
	const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
	const [selectedAlbum, setSelectedAlbum] = useState<MediaLibrary.Album | null>(
		null,
	);
	const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
	const [cameraItems, setCameraItems] = useState<CameraItem[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [endCursor, setEndCursor] = useState<string | undefined>();
	const [hasNextPage, setHasNextPage] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [isManagingPermission, setIsManagingPermission] = useState(false);
	const [isAlbumPickerOpen, setIsAlbumPickerOpen] = useState(false);
	const [isCompleting, setIsCompleting] = useState(false);
	const [activeTab, setActiveTab] = useState<"album" | "camera">("album");
	const [cameraPermission, requestCameraPermission] = useCameraPermissions();
	const [cameraFacing, setCameraFacing] = useState<"back" | "front">("back");
	const [flash, setFlash] = useState<"auto" | "off" | "on">("off");
	const [isCameraReady, setIsCameraReady] = useState(false);
	const [isTakingPicture, setIsTakingPicture] = useState(false);
	const [capturedPicture, setCapturedPicture] =
		useState<CameraCapturedPicture | null>(null);
	const permissionMode = getPhotoPermissionMode(permission);
	const cellSize = Math.floor(width / 4);

	const loadAlbums = useCallback(async () => {
		try {
			const result = await MediaLibrary.getAlbumsAsync({
				includeSmartAlbums: true,
			});
			const seen = new Set<string>();
			setAlbums(
				result
					.filter((album) => album.assetCount > 0 && !seen.has(album.id))
					.filter((album) => {
						seen.add(album.id);
						return true;
					})
					.sort((a, b) => b.assetCount - a.assetCount),
			);
		} catch {
			setAlbums([]);
		}
	}, []);

	const loadFirstPage = useCallback(
		async (
			album: MediaLibrary.Album | null = selectedAlbum,
			forceAuthorized = false,
		) => {
			if (
				!forceAuthorized &&
				(permissionMode === "denied" || permissionMode === "undetermined")
			) {
				setLibraryItems([]);
				setHasNextPage(false);
				setEndCursor(undefined);
				return;
			}
			const token = ++loadTokenRef.current;
			setIsLoading(true);
			try {
				const result = await MediaLibrary.getAssetsAsync({
					album: album ?? undefined,
					first: PAGE_SIZE,
					mediaType: MediaLibrary.MediaType.photo,
					resolveWithFullInfo: Platform.OS === "android",
					sortBy: [[MediaLibrary.SortBy.creationTime, false]],
				});
				if (loadTokenRef.current !== token) return;
				setLibraryItems(result.assets.map(libraryItem));
				setEndCursor(result.endCursor);
				setHasNextPage(result.hasNextPage);
			} catch {
				if (loadTokenRef.current !== token) return;
				setLibraryItems([]);
				setHasNextPage(false);
				toast.show({ variant: "danger", label: "照片暂时没有加载出来" });
			} finally {
				if (loadTokenRef.current === token) setIsLoading(false);
			}
		},
		[permissionMode, selectedAlbum, toast],
	);

	const refreshPermission = useCallback(async () => {
		try {
			const nextPermission = await MediaLibrary.getPermissionsAsync(false, [
				"photo",
			]);
			setPermission(nextPermission);
			return nextPermission;
		} catch {
			setPermission({
				canAskAgain: false,
				expires: "never",
				granted: false,
				status: MediaLibrary.PermissionStatus.DENIED,
			});
			return null;
		}
	}, []);

	useEffect(() => {
		if (!visible) return;
		let cancelled = false;
		void MediaLibrary.getPermissionsAsync(false, ["photo"])
			.then((nextPermission) => {
				if (!cancelled) setPermission(nextPermission);
			})
			.catch(() => {
				if (!cancelled) {
					setPermission({
						canAskAgain: false,
						expires: "never",
						granted: false,
						status: MediaLibrary.PermissionStatus.DENIED,
					});
				}
			});
		return () => {
			cancelled = true;
		};
	}, [visible]);

	useEffect(() => {
		if (visible) return;
		loadTokenRef.current += 1;
		setActiveTab("album");
		setCameraItems([]);
		setCapturedPicture(null);
		setIsAlbumPickerOpen(false);
		setSelectedAlbum(null);
		setSelectedIds([]);
	}, [visible]);

	useEffect(() => {
		if (!visible) return;
		const subscription = MediaLibrary.addListener(() => {
			void refreshPermission().then((nextPermission) => {
				if (nextPermission?.granted) {
					void Promise.all([loadAlbums(), loadFirstPage(selectedAlbum, true)]);
				}
			});
		});
		const appStateSubscription = AppState.addEventListener(
			"change",
			(nextState) => {
				if (nextState === "active") {
					void refreshPermission().then((nextPermission) => {
						if (nextPermission?.granted) {
							void Promise.all([
								loadAlbums(),
								loadFirstPage(selectedAlbum, true),
							]);
						}
					});
				}
			},
		);
		return () => {
			subscription.remove();
			appStateSubscription.remove();
		};
	}, [loadAlbums, loadFirstPage, refreshPermission, selectedAlbum, visible]);

	useEffect(() => {
		if (!visible) return;
		if (permissionMode === "all" || permissionMode === "limited") {
			void Promise.all([loadAlbums(), loadFirstPage(selectedAlbum)]);
		}
	}, [loadAlbums, loadFirstPage, permissionMode, selectedAlbum, visible]);

	const resetAndClose = () => {
		fireHaptic();
		loadTokenRef.current += 1;
		setSelectedIds([]);
		setCameraItems([]);
		setCapturedPicture(null);
		setActiveTab("album");
		setIsAlbumPickerOpen(false);
		setSelectedAlbum(null);
		onClose();
	};

	const managePhotoAccess = async () => {
		if (
			isManagingPermission ||
			permissionMode === "all" ||
			permissionMode === "denied"
		)
			return;
		fireHaptic();
		setIsManagingPermission(true);
		try {
			let nextPermission: MediaLibrary.PermissionResponse | null = permission;
			if (permissionMode === "undetermined") {
				nextPermission = await MediaLibrary.requestPermissionsAsync(false, [
					"photo",
				]);
				setPermission(nextPermission);
			} else {
				await MediaLibrary.presentPermissionsPickerAsync(["photo"]);
				nextPermission = await refreshPermission();
			}
			if (nextPermission?.granted) {
				await Promise.all([loadAlbums(), loadFirstPage(selectedAlbum, true)]);
			}
		} catch {
			toast.show({ variant: "warning", label: "照片权限没有更新" });
		} finally {
			setIsManagingPermission(false);
		}
	};

	const loadMore = async () => {
		if (!hasNextPage || !endCursor || isLoading || isLoadingMore) return;
		setIsLoadingMore(true);
		try {
			const result = await MediaLibrary.getAssetsAsync({
				after: endCursor,
				album: selectedAlbum ?? undefined,
				first: PAGE_SIZE,
				mediaType: MediaLibrary.MediaType.photo,
				resolveWithFullInfo: Platform.OS === "android",
				sortBy: [[MediaLibrary.SortBy.creationTime, false]],
			});
			setLibraryItems((current) => {
				const known = new Set(current.map((item) => item.id));
				return [
					...current,
					...result.assets
						.map(libraryItem)
						.filter((item) => !known.has(item.id)),
				];
			});
			setEndCursor(result.endCursor);
			setHasNextPage(result.hasNextPage);
		} catch {
			toast.show({ variant: "warning", label: "更多照片加载失败" });
		} finally {
			setIsLoadingMore(false);
		}
	};

	const visibleItems = useMemo<PickerItem[]>(() => {
		const photos: PickerItem[] = [...cameraItems, ...libraryItems];
		return permissionMode === "limited" || permissionMode === "undetermined"
			? insertAddMoreItem(photos, { id: ADD_MORE_ID, kind: "add-more" }, true)
			: photos;
	}, [cameraItems, libraryItems, permissionMode]);

	const allItemsById = useMemo(
		() =>
			new Map([...cameraItems, ...libraryItems].map((item) => [item.id, item])),
		[cameraItems, libraryItems],
	);

	const toggleItem = (item: CameraItem | LibraryItem) => {
		fireHaptic();
		const alreadySelected = selectedIds.includes(item.id);
		if (!alreadySelected && selectedIds.length >= maxSelection) {
			toast.show({ variant: "warning", label: "最多只能选择 9 张图片" });
			return;
		}
		setSelectedIds((current) =>
			toggleSelection(current, item.id, maxSelection),
		);
	};

	const completeSelection = async () => {
		if (selectedIds.length === 0 || isCompleting) return;
		fireHaptic();
		setIsCompleting(true);
		try {
			const assets = await Promise.all(
				selectedIds.map(async (id) => {
					const item = allItemsById.get(id);
					if (!item) throw new Error("照片已不可用");
					if (item.kind === "camera") return item.asset;
					const info = await MediaLibrary.getAssetInfoAsync(item.asset, {
						shouldDownloadFromNetwork: true,
					});
					return {
						assetId: info.id,
						fileName: info.filename,
						height: info.height,
						mimeType: imageMimeType(info.filename),
						type: "image" as const,
						uri: info.localUri ?? info.uri,
						width: info.width,
					};
				}),
			);
			const didAdd = await onComplete(assets);
			if (didAdd) {
				setSelectedIds([]);
				setCameraItems([]);
				setCapturedPicture(null);
			}
		} catch {
			toast.show({ variant: "danger", label: "图片处理失败，请重新选择" });
		} finally {
			setIsCompleting(false);
		}
	};

	const openCamera = async () => {
		fireHaptic();
		setActiveTab("camera");
		setCapturedPicture(null);
		if (!cameraPermission || cameraPermission.status === "undetermined") {
			await requestCameraPermission();
		}
	};

	const takePicture = async () => {
		if (!cameraRef.current || !isCameraReady || isTakingPicture) return;
		fireHaptic();
		setIsTakingPicture(true);
		try {
			setCapturedPicture(
				await cameraRef.current.takePictureAsync({ quality: 0.92 }),
			);
		} catch {
			toast.show({ variant: "danger", label: "拍照失败" });
		} finally {
			setIsTakingPicture(false);
		}
	};

	const useCapturedPicture = () => {
		if (!capturedPicture) return;
		if (selectedIds.length >= maxSelection) {
			toast.show({ variant: "warning", label: "最多只能选择 9 张图片" });
			return;
		}
		fireHaptic();
		const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const item: CameraItem = {
			asset: {
				assetId: `camera:${stamp}`,
				fileName: `camera-${stamp}.jpg`,
				height: capturedPicture.height,
				mimeType: "image/jpeg",
				type: "image",
				uri: capturedPicture.uri,
				width: capturedPicture.width,
			},
			id: `camera:${stamp}`,
			kind: "camera",
			previewUri: capturedPicture.uri,
		};
		setCameraItems((current) => [item, ...current]);
		setSelectedIds((current) => [...current, item.id]);
		setCapturedPicture(null);
		setActiveTab("album");
	};

	const selectAlbum = (album: MediaLibrary.Album | null) => {
		fireHaptic();
		setSelectedAlbum(album);
		setIsAlbumPickerOpen(false);
	};

	return (
		<Modal
			animationType="slide"
			navigationBarTranslucent
			onRequestClose={resetAndClose}
			presentationStyle="fullScreen"
			statusBarTranslucent
			visible={visible}
		>
			<StatusBar style="light" />
			<View style={styles.root}>
				{activeTab === "camera" ? (
					<CameraPage
						cameraFacing={cameraFacing}
						cameraPermission={cameraPermission}
						cameraRef={cameraRef}
						capturedPicture={capturedPicture}
						flash={flash}
						insets={insets}
						isCameraReady={isCameraReady}
						isTakingPicture={isTakingPicture}
						onBackToAlbum={() => {
							fireHaptic();
							setCapturedPicture(null);
							setActiveTab("album");
						}}
						onCameraReady={() => setIsCameraReady(true)}
						onFacingChange={() =>
							setCameraFacing((current) =>
								current === "back" ? "front" : "back",
							)
						}
						onFlashChange={() =>
							setFlash((current) =>
								current === "off" ? "auto" : current === "auto" ? "on" : "off",
							)
						}
						onRequestPermission={requestCameraPermission}
						onRetake={() => setCapturedPicture(null)}
						onTakePicture={takePicture}
						onUsePicture={useCapturedPicture}
					/>
				) : (
					<>
						<View style={{ height: insets.top }} />
						<PickerHeader
							isCompleting={isCompleting}
							selectedCount={selectedIds.length}
							onClose={resetAndClose}
							onComplete={completeSelection}
						/>

						{permissionMode === "limited" ? (
							<PermissionBanner onPress={managePhotoAccess} />
						) : permissionMode === "denied" ? (
							<PermissionMessage />
						) : null}

						<View style={styles.gridArea}>
							{isLoading ? (
								<View style={styles.centered}>
									<Spinner color="warning" />
								</View>
							) : (
								<FlatList
									data={visibleItems}
									keyExtractor={(item) => item.id}
									numColumns={4}
									onEndReached={loadMore}
									onEndReachedThreshold={0.45}
									renderItem={({ item }) =>
										item.kind === "add-more" ? (
											<AddMoreTile
												isBusy={isManagingPermission}
												onPress={managePhotoAccess}
												size={cellSize}
											/>
										) : (
											<PhotoTile
												item={item}
												selectionNumber={selectedIds.indexOf(item.id) + 1}
												size={cellSize}
												onPress={() => toggleItem(item)}
											/>
										)
									}
									ListEmptyComponent={
										permissionMode === "all" ? (
											<Text style={styles.emptyText}>这个相册里还没有照片</Text>
										) : null
									}
									ListFooterComponent={
										isLoadingMore ? (
											<View style={styles.loadingMore}>
												<Spinner size="sm" color="warning" />
											</View>
										) : null
									}
								/>
							)}
						</View>

						<PickerTabs
							bottomInset={insets.bottom}
							onAlbumPress={() => setIsAlbumPickerOpen(true)}
							onCameraPress={openCamera}
						/>
						{isAlbumPickerOpen ? (
							<AlbumPicker
								albums={albums}
								bottomInset={insets.bottom}
								selectedAlbum={selectedAlbum}
								onClose={() => setIsAlbumPickerOpen(false)}
								onSelect={selectAlbum}
							/>
						) : null}
					</>
				)}
			</View>
		</Modal>
	);
}
