import { Ionicons } from "@expo/vector-icons";
import type { HydratedContentNote } from "@youni/api/contracts/shared";
import * as Clipboard from "expo-clipboard";
import { File as ExpoFile, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as Sharing from "expo-sharing";
import {
	BottomSheet,
	Button,
	ListGroup,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, useWindowDimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef, releaseCapture } from "react-native-view-shot";

import { ListDivider } from "@/components/create/create-ui";
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";
import {
	formatNoteShareDate,
	getDownloadedImageFileName,
	getPublicNoteUrl,
	getSavedImagesFeedback,
} from "@/lib/note-sharing";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";

type SheetAction = "copy" | "save-images" | null;
type PosterAction = "save" | "share" | null;

export function NoteShareSheets({
	isOpen,
	isSelf,
	note,
	onDelete,
	onEdit,
	onOpenChange,
	onOpenVisibility,
	redirectTo,
}: {
	isOpen: boolean;
	isSelf: boolean;
	note: HydratedContentNote;
	onDelete: () => void;
	onEdit: () => void;
	onOpenChange: (isOpen: boolean) => void;
	onOpenVisibility: () => void;
	redirectTo: string;
}) {
	const { toast } = useAppToast();
	const socialActions = useSocialActions();
	const [activeAction, setActiveAction] = useState<SheetAction>(null);
	const [isPosterOpen, setIsPosterOpen] = useState(false);
	const allowShare = note.advancedOptions.allowShare ?? true;
	const isNative = process.env.EXPO_OS !== "web";
	const noteUrl = getPublicNoteUrl(note.id);

	const copyLink = async () => {
		if (!allowShare || activeAction) return;
		setActiveAction("copy");
		try {
			await Clipboard.setStringAsync(noteUrl);
			toast.show({ label: "链接已复制", variant: "success" });
			onOpenChange(false);
		} catch {
			toast.show({ label: "复制失败，请重试", variant: "danger" });
		} finally {
			setActiveAction(null);
		}
	};

	const openMessage = () => {
		if (isSelf || activeAction) return;
		onOpenChange(false);
		socialActions.startChat(
			{
				handle: note.author.handle ?? undefined,
				image: note.author.image ?? undefined,
				name: note.author.name,
				userId: note.author.id,
			},
			{ redirectTo },
		);
	};

	const saveImages = async () => {
		if (!allowShare || !isNative || note.images.length === 0 || activeAction) {
			return;
		}
		setActiveAction("save-images");
		try {
			if (!(await requestPhotoWritePermission())) return;
			const MediaLibrary = await import("expo-media-library");

			const batchId = Date.now();
			let savedCount = 0;
			for (const [index, imageUrl] of note.images.entries()) {
				const destination = new ExpoFile(
					Paths.cache,
					getDownloadedImageFileName({
						batchId,
						index,
						noteId: note.id,
						url: imageUrl,
					}),
				);
				try {
					const downloaded = await ExpoFile.downloadFileAsync(
						imageUrl,
						destination,
						{ idempotent: true },
					);
					await MediaLibrary.Asset.create(downloaded.uri);
					savedCount += 1;
				} catch {
					// Continue so one broken remote image does not block the rest.
				} finally {
					try {
						if (destination.exists) destination.delete();
					} catch {
						// Cache cleanup is best-effort.
					}
				}
			}

			const feedback = getSavedImagesFeedback(savedCount, note.images.length);
			toast.show(feedback);
			if (savedCount > 0) onOpenChange(false);
		} catch (error) {
			toast.show({
				label: error instanceof Error ? error.message : "图片保存失败，请重试",
				variant: "danger",
			});
		} finally {
			setActiveAction(null);
		}
	};

	const openPoster = () => {
		if (!allowShare || !isNative || activeAction) return;
		onOpenChange(false);
		setIsPosterOpen(true);
	};

	return (
		<>
			<NoteShareActionsSheet
				activeAction={activeAction}
				allowShare={allowShare}
				hasImages={note.images.length > 0}
				isNative={isNative}
				isOpen={isOpen}
				isSelf={isSelf}
				onCopyLink={() => void copyLink()}
				onDelete={onDelete}
				onEdit={onEdit}
				onGeneratePoster={openPoster}
				onMessage={openMessage}
				onOpenChange={onOpenChange}
				onOpenVisibility={onOpenVisibility}
				onSaveImages={() => void saveImages()}
			/>
			<NoteSharePosterSheet
				key={note.id}
				isOpen={isPosterOpen}
				note={note}
				noteUrl={noteUrl}
				onOpenChange={setIsPosterOpen}
			/>
		</>
	);
}

function NoteShareActionsSheet({
	activeAction,
	allowShare,
	hasImages,
	isNative,
	isOpen,
	isSelf,
	onCopyLink,
	onDelete,
	onEdit,
	onGeneratePoster,
	onMessage,
	onOpenChange,
	onOpenVisibility,
	onSaveImages,
}: {
	activeAction: SheetAction;
	allowShare: boolean;
	hasImages: boolean;
	isNative: boolean;
	isOpen: boolean;
	isSelf: boolean;
	onCopyLink: () => void;
	onDelete: () => void;
	onEdit: () => void;
	onGeneratePoster: () => void;
	onMessage: () => void;
	onOpenChange: (isOpen: boolean) => void;
	onOpenVisibility: () => void;
	onSaveImages: () => void;
}) {
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const isBusy = activeAction !== null;
	const isShareDisabled = !allowShare;
	const isNativeDisabled = !isNative;

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent enableOverDrag={false}>
					<View className="gap-3">
						<BottomSheet.Title>更多操作</BottomSheet.Title>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							<ShareActionItem
								disabled={isShareDisabled || isBusy}
								icon="link-outline"
								iconColor={mutedColor}
								label={activeAction === "copy" ? "正在复制" : "复制链接"}
								loading={activeAction === "copy"}
								onPress={onCopyLink}
							/>
							{isSelf ? null : (
								<>
									<ListDivider />
									<ShareActionItem
										disabled={isBusy}
										icon="chatbubble-ellipses-outline"
										iconColor={mutedColor}
										label="私信"
										onPress={onMessage}
									/>
								</>
							)}
							<ListDivider />
							<ShareActionItem
								disabled={
									isShareDisabled || isNativeDisabled || !hasImages || isBusy
								}
								icon="download-outline"
								iconColor={mutedColor}
								label={activeAction === "save-images" ? "正在保存" : "保存图片"}
								loading={activeAction === "save-images"}
								onPress={onSaveImages}
							/>
							<ListDivider />
							<ShareActionItem
								disabled={isShareDisabled || isNativeDisabled || isBusy}
								icon="image-outline"
								iconColor={mutedColor}
								label="生成分享图"
								onPress={onGeneratePoster}
							/>
						</ListGroup>
						{isSelf ? (
							<ListGroup
								variant="secondary"
								className="overflow-hidden rounded-xl"
							>
								<ShareActionItem
									disabled={isBusy}
									icon="create-outline"
									iconColor={mutedColor}
									label="编辑"
									onPress={onEdit}
								/>
								<ListDivider />
								<ShareActionItem
									disabled={isBusy}
									icon="lock-open-outline"
									iconColor={mutedColor}
									label="权限设置"
									onPress={onOpenVisibility}
								/>
								<ListDivider />
								<ShareActionItem
									danger
									disabled={isBusy}
									icon="trash-outline"
									iconColor={dangerColor}
									label="删除"
									onPress={onDelete}
								/>
							</ListGroup>
						) : null}
					</View>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function ShareActionItem({
	danger = false,
	disabled,
	icon,
	iconColor,
	label,
	loading = false,
	onPress,
}: {
	danger?: boolean;
	disabled: boolean;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	label: string;
	loading?: boolean;
	onPress: () => void;
}) {
	return (
		<ListGroup.Item
			accessibilityLabel={label}
			disabled={disabled}
			className="gap-2.5 px-3 py-2.5"
			onPress={() => {
				fireHaptic();
				onPress();
			}}
		>
			<ListGroup.ItemPrefix>
				<Ionicons name={icon} size={21} color={iconColor} />
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle
					className={
						disabled
							? "text-muted text-sm"
							: danger
								? "text-danger text-sm"
								: "text-sm"
					}
				>
					{label}
				</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
			{loading ? (
				<ListGroup.ItemSuffix>
					<Spinner size="sm" />
				</ListGroup.ItemSuffix>
			) : null}
		</ListGroup.Item>
	);
}

function NoteSharePosterSheet({
	isOpen,
	note,
	noteUrl,
	onOpenChange,
}: {
	isOpen: boolean;
	note: HydratedContentNote;
	noteUrl: string;
	onOpenChange: (isOpen: boolean) => void;
}) {
	const { toast } = useAppToast();
	const insets = useSafeAreaInsets();
	const accentColor = useThemeColor("accent");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const foregroundColor = useThemeColor("foreground");
	const { height, width } = useWindowDimensions();
	const posterRef = useRef<View>(null);
	const capturedUriRef = useRef<string | null>(null);
	const preparedFilesRef = useRef<ExpoFile[]>([]);
	const coverImage = note.images[0];
	const authorImage = note.author.image;
	const [activeAction, setActiveAction] = useState<PosterAction>(null);
	const [preparedCoverImage, setPreparedCoverImage] = useState<
		string | undefined
	>();
	const [preparedAuthorImage, setPreparedAuthorImage] = useState<
		string | undefined
	>();
	const [coverFailed, setCoverFailed] = useState(false);
	const [coverReady, setCoverReady] = useState(!coverImage);
	const [avatarFailed, setAvatarFailed] = useState(false);
	const [avatarReady, setAvatarReady] = useState(!authorImage);
	const isNative = process.env.EXPO_OS !== "web";
	const availableHeight = Math.max(
		240,
		height - insets.top - insets.bottom - 220,
	);
	const posterWidth = Math.min(
		400,
		Math.max(180, width - 32),
		availableHeight * 0.75,
	);
	const posterHeight = posterWidth * (4 / 3);
	const posterReady =
		(!coverImage || coverFailed || coverReady) &&
		(!authorImage || avatarFailed || avatarReady);

	const clearCapturedPoster = useCallback(() => {
		const uri = capturedUriRef.current;
		capturedUriRef.current = null;
		if (!uri) return;
		try {
			releaseCapture(uri);
		} catch {
			// The operating system may have already removed the temporary file.
		}
	}, []);

	const clearPreparedImages = useCallback(() => {
		for (const file of preparedFilesRef.current) {
			try {
				if (file.exists) file.delete();
			} catch {
				// Cache cleanup is best-effort.
			}
		}
		preparedFilesRef.current = [];
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		let cancelled = false;
		const batchId = Date.now();
		clearCapturedPoster();
		clearPreparedImages();
		setPreparedCoverImage(undefined);
		setPreparedAuthorImage(undefined);
		setCoverFailed(false);
		setCoverReady(!coverImage);
		setAvatarFailed(false);
		setAvatarReady(!authorImage);

		const prepareImage = async ({
			index,
			kind,
			url,
		}: {
			index: number;
			kind: "avatar" | "cover";
			url: string;
		}) => {
			const destination = new ExpoFile(
				Paths.cache,
				getDownloadedImageFileName({
					batchId,
					index,
					noteId: `${note.id}-${kind}`,
					url,
				}),
			);
			try {
				const downloaded = await ExpoFile.downloadFileAsync(url, destination, {
					idempotent: true,
				});
				if (cancelled) {
					if (downloaded.exists) downloaded.delete();
					return;
				}
				preparedFilesRef.current.push(downloaded);
				if (kind === "cover") {
					setPreparedCoverImage(downloaded.uri);
					setCoverReady(true);
				} else {
					setPreparedAuthorImage(downloaded.uri);
					setAvatarReady(true);
				}
			} catch {
				if (cancelled) return;
				if (kind === "cover") {
					setCoverFailed(true);
					setCoverReady(true);
				} else {
					setAvatarFailed(true);
					setAvatarReady(true);
				}
			}
		};

		if (coverImage) {
			void prepareImage({ index: 0, kind: "cover", url: coverImage });
		}
		if (authorImage) {
			void prepareImage({ index: 1, kind: "avatar", url: authorImage });
		}

		return () => {
			cancelled = true;
			clearPreparedImages();
		};
	}, [
		authorImage,
		clearCapturedPoster,
		clearPreparedImages,
		coverImage,
		isOpen,
		note.id,
	]);

	useEffect(
		() => () => {
			clearCapturedPoster();
			clearPreparedImages();
		},
		[clearCapturedPoster, clearPreparedImages],
	);

	const capturePoster = async () => {
		if (capturedUriRef.current) return capturedUriRef.current;
		if (!posterReady || !posterRef.current) {
			throw new Error("分享图仍在生成，请稍后重试");
		}
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});
		const uri = await captureRef(posterRef, {
			format: "png",
			height: 1440,
			quality: 1,
			result: "tmpfile",
			width: 1080,
		});
		capturedUriRef.current = uri;
		return uri;
	};

	const savePoster = async () => {
		if (!isNative || activeAction) return;
		fireHaptic();
		setActiveAction("save");
		try {
			if (!(await requestPhotoWritePermission())) return;
			const MediaLibrary = await import("expo-media-library");
			const uri = await capturePoster();
			await MediaLibrary.Asset.create(uri);
			toast.show({ label: "分享图已保存", variant: "success" });
		} catch (error) {
			toast.show({
				label: error instanceof Error ? error.message : "分享图保存失败",
				variant: "danger",
			});
		} finally {
			setActiveAction(null);
		}
	};

	const sharePoster = async () => {
		if (!isNative || activeAction) return;
		fireHaptic();
		setActiveAction("share");
		try {
			if (!(await Sharing.isAvailableAsync())) {
				throw new Error("当前设备暂不支持系统分享");
			}
			const uri = await capturePoster();
			await Sharing.shareAsync(uri, {
				UTI: "public.png",
				dialogTitle: "分享图文",
				mimeType: "image/png",
			});
		} catch (error) {
			toast.show({
				label: error instanceof Error ? error.message : "分享失败，请重试",
				variant: "danger",
			});
		} finally {
			setActiveAction(null);
		}
	};

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) clearCapturedPoster();
		onOpenChange(nextOpen);
	};

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={handleOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent enablePanDownToClose>
					<View className="items-center gap-3">
						<View style={{ height: posterHeight, width: posterWidth }}>
							{posterReady ? (
								<SharePoster
									accentColor={accentColor}
									authorImage={preparedAuthorImage}
									avatarFailed={avatarFailed}
									coverImage={preparedCoverImage}
									note={note}
									noteUrl={noteUrl}
									posterHeight={posterHeight}
									posterRef={posterRef}
									posterWidth={posterWidth}
								/>
							) : (
								<View className="absolute inset-0 items-center justify-center rounded-3xl bg-content2">
									<Spinner />
								</View>
							)}
						</View>
						<View className="w-full flex-row gap-2">
							<Button
								variant="secondary"
								className="flex-1 rounded-full"
								feedbackVariant="scale-ripple"
								isDisabled={!posterReady || activeAction !== null || !isNative}
								onPress={() => void savePoster()}
							>
								{activeAction === "save" ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name="download-outline"
										size={18}
										color={foregroundColor}
									/>
								)}
								<Button.Label>
									{activeAction === "save" ? "正在保存" : "保存分享图"}
								</Button.Label>
							</Button>
							<Button
								className="flex-1 rounded-full"
								feedbackVariant="scale-ripple"
								isDisabled={!posterReady || activeAction !== null || !isNative}
								onPress={() => void sharePoster()}
							>
								{activeAction === "share" ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name="share-social-outline"
										size={18}
										color={accentForegroundColor}
									/>
								)}
								<Button.Label>
									{activeAction === "share" ? "正在打开" : "系统分享"}
								</Button.Label>
							</Button>
						</View>
					</View>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function SharePoster({
	accentColor,
	authorImage,
	avatarFailed,
	coverImage,
	note,
	noteUrl,
	posterHeight,
	posterRef,
	posterWidth,
}: {
	accentColor: string;
	authorImage?: null | string;
	avatarFailed: boolean;
	coverImage?: string;
	note: HydratedContentNote;
	noteUrl: string;
	posterHeight: number;
	posterRef: React.RefObject<View | null>;
	posterWidth: number;
}) {
	const hasCover = Boolean(coverImage);
	const posterPadding = posterWidth * 0.04;
	const avatarSize = posterWidth * 0.075;
	const qrSize = posterWidth * 0.15;
	const publishedAt = note.publishedAt ?? note.createdAt;
	const exactTime = formatNoteShareDate(publishedAt);
	const metricColor = "#8e8e93";

	return (
		<View
			ref={posterRef}
			collapsable={false}
			className="overflow-hidden rounded-3xl bg-white"
			style={{
				borderCurve: "continuous",
				height: posterHeight,
				width: posterWidth,
			}}
		>
			{hasCover ? (
				<Image
					cachePolicy="memory-disk"
					contentFit="cover"
					source={{ uri: coverImage }}
					style={{ height: "40%", width: "100%" }}
				/>
			) : null}

			<View
				className={hasCover ? "justify-between bg-white" : "bg-white"}
				style={{
					height: hasCover ? "41%" : "81%",
					padding: posterPadding,
				}}
			>
				<View
					className="flex-row items-center gap-2"
					style={{ marginBottom: posterWidth * 0.022 }}
				>
					<View
						className="items-center justify-center overflow-hidden rounded-full bg-gray-200"
						style={{ height: avatarSize, width: avatarSize }}
					>
						{authorImage && !avatarFailed ? (
							<Image
								cachePolicy="memory-disk"
								contentFit="cover"
								source={{ uri: authorImage }}
								style={{ height: avatarSize, width: avatarSize }}
							/>
						) : (
							<Typography.Paragraph weight="bold" className="text-black">
								{note.author.name.slice(0, 1)}
							</Typography.Paragraph>
						)}
					</View>
					<View className="min-w-0 flex-1">
						<Typography.Paragraph
							weight="semibold"
							numberOfLines={1}
							className="text-black"
							style={{ fontSize: posterWidth * 0.038 }}
						>
							{note.author.name}
						</Typography.Paragraph>
					</View>
				</View>
				<View className={hasCover ? "gap-1" : "mt-6 gap-1"}>
					<Typography.Paragraph
						weight="bold"
						numberOfLines={2}
						className="text-black"
						style={{
							fontSize: posterWidth * 0.052,
							lineHeight: posterWidth * 0.06,
						}}
					>
						{note.title}
					</Typography.Paragraph>
					<Typography.Paragraph
						numberOfLines={3}
						className="text-gray-700"
						style={{
							fontSize: posterWidth * 0.036,
							lineHeight: posterWidth * 0.047,
						}}
					>
						{note.content}
					</Typography.Paragraph>
					{note.topics.length > 0 ? (
						<Typography.Paragraph
							numberOfLines={1}
							style={{
								color: accentColor,
								fontSize: posterWidth * 0.033,
								lineHeight: posterWidth * 0.044,
							}}
						>
							{note.topics.map((topic) => `#${topic}`).join("  ")}
						</Typography.Paragraph>
					) : null}
				</View>
				<View
					className={
						hasCover
							? "flex-row items-center justify-between"
							: "mt-auto flex-row items-center justify-between"
					}
				>
					<Typography.Paragraph
						className="text-gray-500"
						style={{ fontSize: posterWidth * 0.029 }}
					>
						{exactTime}
					</Typography.Paragraph>
					<View className="flex-row items-center gap-2.5">
						<PosterMetric
							color={metricColor}
							count={note.likedCount}
							icon="heart-outline"
							posterWidth={posterWidth}
						/>
						<PosterMetric
							color={metricColor}
							count={note.collectedCount}
							icon="star-outline"
							posterWidth={posterWidth}
						/>
						<PosterMetric
							color={metricColor}
							count={note.commentCount}
							icon="chatbubble-ellipses-outline"
							posterWidth={posterWidth}
						/>
					</View>
				</View>
			</View>

			<View
				className="relative flex-row items-center justify-between overflow-hidden bg-white"
				style={{ height: "19%", padding: posterPadding }}
			>
				<View
					pointerEvents="none"
					className="absolute inset-0"
					style={{
						experimental_backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, ${accentColor} 100%)`,
						opacity: 0.32,
					}}
				/>
				<View className="gap-2">
					<View
						className="self-start rounded-full px-3 py-1"
						style={{ backgroundColor: accentColor }}
					>
						<Typography.Paragraph
							weight="bold"
							className="text-white"
							style={{ fontSize: posterWidth * 0.035 }}
						>
							Youni
						</Typography.Paragraph>
					</View>
					<Typography.Paragraph
						className="text-gray-600"
						style={{ fontSize: posterWidth * 0.032 }}
					>
						扫码查看图文
					</Typography.Paragraph>
				</View>
				<View className="rounded-xl bg-white p-1.5">
					<QRCode
						backgroundColor="#ffffff"
						color="#111111"
						ecl="M"
						size={qrSize}
						value={noteUrl}
					/>
				</View>
			</View>
		</View>
	);
}

function PosterMetric({
	color,
	count,
	icon,
	posterWidth,
}: {
	color: string;
	count: number;
	icon: keyof typeof Ionicons.glyphMap;
	posterWidth: number;
}) {
	return (
		<View className="flex-row items-center gap-1">
			<Ionicons name={icon} size={posterWidth * 0.038} color={color} />
			<Typography.Paragraph style={{ color, fontSize: posterWidth * 0.029 }}>
				{count}
			</Typography.Paragraph>
		</View>
	);
}

async function requestPhotoWritePermission() {
	const MediaLibrary = await import("expo-media-library");
	let permission = await MediaLibrary.getPermissionsAsync(true);
	if (!permission.granted && permission.canAskAgain) {
		permission = await MediaLibrary.requestPermissionsAsync(true);
	}
	if (permission.granted) return true;

	Alert.alert("需要相册权限", "请在系统设置中允许 Youni 保存照片，然后重试。", [
		{ text: "取消", style: "cancel" },
		{
			text: "前往设置",
			onPress: () => {
				void Linking.openSettings();
			},
		},
	]);
	return false;
}
