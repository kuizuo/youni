import { Ionicons } from "@expo/vector-icons";
import {
	type CameraCapturedPicture,
	CameraView,
	useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import type * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { StatusBar } from "expo-status-bar";
import { Spinner } from "heroui-native";
import {
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	AppState,
	FlatList,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	getPhotoPermissionMode,
	imageMimeType,
	insertAddMoreItem,
	toggleSelection,
} from "@/components/create/media-picker-state";
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

type CreateMediaPickerProps = {
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

function albumKey(album: MediaLibrary.Album | null) {
	return album?.id ?? "recent";
}

export function CreateMediaPicker({
	maxSelection,
	onClose,
	onComplete,
	visible,
}: CreateMediaPickerProps) {
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

function PickerHeader({
	isCompleting,
	onClose,
	onComplete,
	selectedCount,
}: {
	isCompleting: boolean;
	onClose: () => void;
	onComplete: () => void;
	selectedCount: number;
}) {
	return (
		<View style={styles.header}>
			<Pressable accessibilityLabel="关闭相册" hitSlop={12} onPress={onClose}>
				<Ionicons color="#fff" name="close" size={34} />
			</Pressable>
			<View />
			<Pressable
				accessibilityRole="button"
				disabled={selectedCount === 0 || isCompleting}
				onPress={onComplete}
				style={[
					styles.doneButton,
					selectedCount === 0 && styles.doneButtonDisabled,
				]}
			>
				<Text style={styles.doneText}>
					{isCompleting
						? "处理中"
						: `完成${selectedCount ? `(${selectedCount})` : ""}`}
				</Text>
			</Pressable>
		</View>
	);
}

function PermissionBanner({ onPress }: { onPress: () => void }) {
	return (
		<Pressable style={styles.permissionBanner} onPress={onPress}>
			<Ionicons color="#9d9d9d" name="information-circle-outline" size={22} />
			<Text numberOfLines={1} style={styles.permissionBannerText}>
				你已设置只能访问部分照片，建议允许访问「所有照片」
			</Text>
			<Ionicons color="#9d9d9d" name="chevron-forward" size={22} />
		</Pressable>
	);
}

function PermissionMessage() {
	return (
		<View style={styles.permissionMessage}>
			<Ionicons color="#8a8a8a" name="images-outline" size={36} />
			<Text style={styles.permissionMessageTitle}>无法读取照片</Text>
			<Text style={styles.permissionMessageText}>
				你没有允许 Youni 访问照片，仍可切换到拍照添加图片。
			</Text>
		</View>
	);
}

function AddMoreTile({
	isBusy,
	onPress,
	size,
}: {
	isBusy: boolean;
	onPress: () => void;
	size: number;
}) {
	return (
		<Pressable
			accessibilityLabel="添加更多可选照片"
			onPress={onPress}
			style={[styles.addMoreTile, { height: size, width: size }]}
		>
			{isBusy ? (
				<Spinner size="sm" color="warning" />
			) : (
				<Ionicons color="#8d8d8d" name="add" size={38} />
			)}
			<Text style={styles.addMoreText}>添加更多</Text>
			<Text style={styles.addMoreText}>可选照片</Text>
		</Pressable>
	);
}

function PhotoTile({
	item,
	onPress,
	selectionNumber,
	size,
}: {
	item: CameraItem | LibraryItem;
	onPress: () => void;
	selectionNumber: number;
	size: number;
}) {
	const selected = selectionNumber > 0;
	return (
		<Pressable
			accessibilityLabel={
				selected ? `已选择，第 ${selectionNumber} 张` : "选择照片"
			}
			onPress={onPress}
			style={{ height: size, width: size }}
		>
			<Image
				contentFit="cover"
				source={item.previewUri}
				style={StyleSheet.absoluteFill}
			/>
			{selected ? <View style={styles.selectedOverlay} /> : null}
			<View
				style={[
					styles.selectionBadge,
					selected && styles.selectionBadgeSelected,
				]}
			>
				{selected ? (
					<Text style={styles.selectionNumber}>{selectionNumber}</Text>
				) : null}
			</View>
			{item.kind === "camera" ? (
				<View style={styles.cameraLabel}>
					<Ionicons color="#fff" name="camera" size={12} />
				</View>
			) : null}
		</Pressable>
	);
}

function PickerTabs({
	bottomInset,
	onAlbumPress,
	onCameraPress,
}: {
	bottomInset: number;
	onAlbumPress: () => void;
	onCameraPress: () => void;
}) {
	return (
		<View style={[styles.tabs, { paddingBottom: Math.max(bottomInset, 12) }]}>
			<Pressable style={styles.tab} onPress={onAlbumPress}>
				<Text style={[styles.tabText, styles.tabTextActive]}>相册</Text>
				<View style={styles.tabIndicator} />
			</Pressable>
			<Pressable style={styles.tab} onPress={onCameraPress}>
				<Text style={styles.tabText}>拍照</Text>
			</Pressable>
		</View>
	);
}

function AlbumPicker({
	albums,
	bottomInset,
	onClose,
	onSelect,
	selectedAlbum,
}: {
	albums: MediaLibrary.Album[];
	bottomInset: number;
	onClose: () => void;
	onSelect: (album: MediaLibrary.Album | null) => void;
	selectedAlbum: MediaLibrary.Album | null;
}) {
	const rows: Array<MediaLibrary.Album | null> = [null, ...albums];
	return (
		<View style={styles.albumPickerRoot}>
			<Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
			<View
				style={[styles.albumPickerCard, { paddingBottom: bottomInset + 12 }]}
			>
				<View style={styles.albumPickerHandle} />
				<Text style={styles.albumPickerTitle}>选择相册</Text>
				<FlatList
					data={rows}
					keyExtractor={(album) => albumKey(album)}
					renderItem={({ item: album }) => {
						const selected = albumKey(album) === albumKey(selectedAlbum);
						return (
							<Pressable
								style={styles.albumRow}
								onPress={() => onSelect(album)}
							>
								<View>
									<Text style={styles.albumRowTitle}>
										{album?.title ?? "最近项目"}
									</Text>
									{album ? (
										<Text style={styles.albumRowCount}>
											{album.assetCount} 张
										</Text>
									) : null}
								</View>
								{selected ? (
									<Ionicons color="#f6e52d" name="checkmark" size={23} />
								) : null}
							</Pressable>
						);
					}}
				/>
			</View>
		</View>
	);
}

function CameraPage({
	cameraFacing,
	cameraPermission,
	cameraRef,
	capturedPicture,
	flash,
	insets,
	isCameraReady,
	isTakingPicture,
	onBackToAlbum,
	onCameraReady,
	onFacingChange,
	onFlashChange,
	onRequestPermission,
	onRetake,
	onTakePicture,
	onUsePicture,
}: {
	cameraFacing: "back" | "front";
	cameraPermission: ReturnType<typeof useCameraPermissions>[0];
	cameraRef: RefObject<CameraView | null>;
	capturedPicture: CameraCapturedPicture | null;
	flash: "auto" | "off" | "on";
	insets: { bottom: number; top: number };
	isCameraReady: boolean;
	isTakingPicture: boolean;
	onBackToAlbum: () => void;
	onCameraReady: () => void;
	onFacingChange: () => void;
	onFlashChange: () => void;
	onRequestPermission: () => Promise<unknown>;
	onRetake: () => void;
	onTakePicture: () => void;
	onUsePicture: () => void;
}) {
	if (!cameraPermission?.granted) {
		return (
			<View style={[styles.cameraPermission, { paddingTop: insets.top }]}>
				<Pressable
					accessibilityLabel="返回相册"
					style={[styles.cameraBack, { top: insets.top + 8 }]}
					onPress={onBackToAlbum}
				>
					<Ionicons color="#fff" name="chevron-back" size={30} />
				</Pressable>
				<Ionicons color="#888" name="camera-outline" size={48} />
				<Text style={styles.cameraPermissionTitle}>需要相机权限</Text>
				<Text style={styles.cameraPermissionText}>
					允许后才能拍摄照片，不会申请麦克风权限。
				</Text>
				{!cameraPermission || cameraPermission.canAskAgain ? (
					<Pressable
						style={styles.permissionButton}
						onPress={() => void onRequestPermission()}
					>
						<Text style={styles.permissionButtonText}>允许使用相机</Text>
					</Pressable>
				) : null}
			</View>
		);
	}

	if (capturedPicture) {
		return (
			<View style={styles.cameraRoot}>
				<Image
					contentFit="contain"
					source={capturedPicture.uri}
					style={StyleSheet.absoluteFill}
				/>
				<View
					style={[styles.previewActions, { paddingBottom: insets.bottom + 28 }]}
				>
					<Pressable style={styles.previewButton} onPress={onRetake}>
						<Text style={styles.previewButtonText}>重拍</Text>
					</Pressable>
					<Pressable
						style={[styles.previewButton, styles.previewButtonPrimary]}
						onPress={onUsePicture}
					>
						<Text
							style={[
								styles.previewButtonText,
								styles.previewButtonPrimaryText,
							]}
						>
							使用照片
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.cameraRoot}>
			<CameraView
				active
				facing={cameraFacing}
				flash={flash}
				mirror={cameraFacing === "front"}
				mode="picture"
				onCameraReady={onCameraReady}
				ref={cameraRef}
				style={StyleSheet.absoluteFill}
			/>
			<View style={[styles.cameraTop, { paddingTop: insets.top + 8 }]}>
				<Pressable
					accessibilityLabel="返回相册"
					style={styles.roundIconButton}
					onPress={onBackToAlbum}
				>
					<Ionicons color="#fff" name="close" size={30} />
				</Pressable>
				<Pressable
					accessibilityLabel="切换闪光灯"
					style={styles.roundIconButton}
					onPress={onFlashChange}
				>
					<Ionicons
						color="#fff"
						name={flash === "off" ? "flash-off" : "flash"}
						size={22}
					/>
					<Text style={styles.flashLabel}>
						{flash === "auto" ? "A" : flash === "on" ? "开" : ""}
					</Text>
				</Pressable>
			</View>
			<View
				style={[styles.cameraControls, { paddingBottom: insets.bottom + 24 }]}
			>
				<View style={styles.cameraControlSpacer} />
				<Pressable
					accessibilityLabel="拍照"
					disabled={!isCameraReady || isTakingPicture}
					onPress={onTakePicture}
					style={styles.shutterOuter}
				>
					<View style={styles.shutterInner} />
				</Pressable>
				<Pressable
					accessibilityLabel="切换前后镜头"
					style={styles.flipButton}
					onPress={onFacingChange}
				>
					<Ionicons color="#fff" name="camera-reverse-outline" size={30} />
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { backgroundColor: "#090909", flex: 1 },
	header: {
		alignItems: "center",
		flexDirection: "row",
		height: 58,
		justifyContent: "space-between",
		paddingHorizontal: 16,
	},
	doneButton: {
		alignItems: "center",
		backgroundColor: "#eafa2d",
		borderRadius: 18,
		minWidth: 66,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	doneButtonDisabled: { backgroundColor: "#363636" },
	doneText: { color: "#111", fontSize: 13, fontWeight: "700" },
	permissionBanner: {
		alignItems: "center",
		backgroundColor: "#111",
		flexDirection: "row",
		gap: 8,
		minHeight: 48,
		paddingHorizontal: 14,
	},
	permissionBannerText: { color: "#c7c7c7", flex: 1, fontSize: 13 },
	permissionMessage: {
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 40,
		paddingTop: 62,
	},
	permissionMessageTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
	permissionMessageText: {
		color: "#888",
		fontSize: 14,
		lineHeight: 21,
		textAlign: "center",
	},
	gridArea: { flex: 1 },
	centered: { alignItems: "center", flex: 1, justifyContent: "center" },
	loadingMore: { alignItems: "center", paddingVertical: 18, width: "100%" },
	emptyText: { color: "#777", paddingTop: 60, textAlign: "center" },
	addMoreTile: {
		alignItems: "center",
		backgroundColor: "#242424",
		justifyContent: "center",
	},
	addMoreText: { color: "#919191", fontSize: 12, lineHeight: 16 },
	selectedOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.25)",
	},
	selectionBadge: {
		borderColor: "rgba(255,255,255,0.9)",
		borderRadius: 12,
		borderWidth: 2,
		height: 24,
		position: "absolute",
		right: 7,
		top: 7,
		width: 24,
	},
	selectionBadgeSelected: {
		alignItems: "center",
		backgroundColor: "#eafa2d",
		borderColor: "#eafa2d",
		justifyContent: "center",
	},
	selectionNumber: { color: "#101010", fontSize: 12, fontWeight: "800" },
	cameraLabel: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.55)",
		borderRadius: 10,
		bottom: 6,
		height: 20,
		justifyContent: "center",
		left: 6,
		width: 20,
	},
	tabs: {
		alignItems: "flex-start",
		backgroundColor: "#090909",
		flexDirection: "row",
		gap: 46,
		height: 76,
		justifyContent: "center",
		paddingTop: 12,
	},
	tab: { alignItems: "center", minWidth: 48 },
	tabText: { color: "#888", fontSize: 16, fontWeight: "600" },
	tabTextActive: { color: "#fff", fontWeight: "800" },
	tabIndicator: {
		backgroundColor: "#eafa2d",
		borderRadius: 3,
		height: 4,
		marginTop: 7,
		width: 24,
	},
	albumPickerRoot: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.48)",
		justifyContent: "flex-end",
	},
	albumPickerCard: {
		backgroundColor: "#1a1a1a",
		borderTopLeftRadius: 22,
		borderTopRightRadius: 22,
		maxHeight: "72%",
		minHeight: 260,
		paddingHorizontal: 18,
	},
	albumPickerHandle: {
		alignSelf: "center",
		backgroundColor: "#555",
		borderRadius: 2,
		height: 4,
		marginTop: 10,
		width: 38,
	},
	albumPickerTitle: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
		paddingVertical: 18,
	},
	albumRow: {
		alignItems: "center",
		borderBottomColor: "#303030",
		borderBottomWidth: StyleSheet.hairlineWidth,
		flexDirection: "row",
		justifyContent: "space-between",
		minHeight: 62,
	},
	albumRowTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
	albumRowCount: { color: "#888", fontSize: 12, marginTop: 3 },
	cameraRoot: { backgroundColor: "#000", flex: 1 },
	cameraPermission: {
		alignItems: "center",
		backgroundColor: "#090909",
		flex: 1,
		gap: 12,
		justifyContent: "center",
		paddingHorizontal: 36,
	},
	cameraBack: { left: 16, position: "absolute", top: 14 },
	cameraPermissionTitle: { color: "#fff", fontSize: 19, fontWeight: "700" },
	cameraPermissionText: {
		color: "#999",
		fontSize: 14,
		lineHeight: 21,
		textAlign: "center",
	},
	permissionButton: {
		backgroundColor: "#eafa2d",
		borderRadius: 20,
		marginTop: 8,
		paddingHorizontal: 22,
		paddingVertical: 11,
	},
	permissionButtonText: { color: "#111", fontSize: 15, fontWeight: "700" },
	cameraTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		left: 16,
		position: "absolute",
		right: 16,
		top: 0,
	},
	roundIconButton: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.42)",
		borderRadius: 24,
		height: 46,
		justifyContent: "center",
		width: 46,
	},
	flashLabel: {
		bottom: 5,
		color: "#fff",
		fontSize: 8,
		fontWeight: "800",
		position: "absolute",
	},
	cameraControls: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.18)",
		bottom: 0,
		flexDirection: "row",
		justifyContent: "space-around",
		left: 0,
		paddingTop: 24,
		position: "absolute",
		right: 0,
	},
	cameraControlSpacer: { width: 48 },
	shutterOuter: {
		alignItems: "center",
		borderColor: "#fff",
		borderRadius: 39,
		borderWidth: 4,
		height: 78,
		justifyContent: "center",
		width: 78,
	},
	shutterInner: {
		backgroundColor: "#fff",
		borderRadius: 31,
		height: 62,
		width: 62,
	},
	flipButton: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.35)",
		borderRadius: 24,
		height: 48,
		justifyContent: "center",
		width: 48,
	},
	previewActions: {
		bottom: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		left: 24,
		position: "absolute",
		right: 24,
	},
	previewButton: {
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.58)",
		borderRadius: 23,
		minWidth: 96,
		paddingHorizontal: 20,
		paddingVertical: 13,
	},
	previewButtonPrimary: { backgroundColor: "#eafa2d" },
	previewButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
	previewButtonPrimaryText: { color: "#111" },
});
