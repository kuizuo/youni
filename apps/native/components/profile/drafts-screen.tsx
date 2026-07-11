import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import {
	Button,
	Card,
	CloseButton,
	Alert as HeroAlert,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { useCallback, useMemo, useState } from "react";
import {
	Image,
	Platform,
	RefreshControl,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { EmptyState, ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { localDraftCoverUri } from "@/lib/local-drafts/image-io";
import {
	deleteLocalDraft,
	dismissLocalDraftAlert,
	isLocalDraftAlertDismissed,
	listLocalDrafts,
} from "@/lib/local-drafts/store";
import type { LocalDraftSummary } from "@/lib/local-drafts/types";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { confirmAction } from "@/utils/confirm-action";

const FEED_MAX_WIDTH = 576;
const FEED_HORIZONTAL_PADDING = 24;
const FEED_COLUMN_GAP = 12;
const FEED_ITEM_GAP = 12;
const DRAFT_CARD_BODY_HEIGHT = 74;

function formatDate(value: number) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "刚刚保存";
	return `${date.getMonth() + 1}/${date.getDate()} ${date
		.getHours()
		.toString()
		.padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export default function DraftsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const session = authClient.useSession();
	const userId = session.data?.user.id;
	const { toast } = useAppToast();
	const [items, setItems] = useState<LocalDraftSummary[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [showLocalAlert, setShowLocalAlert] = useState(false);

	const loadDrafts = useCallback(async () => {
		if (!userId) return;
		setLoadError(null);
		try {
			const [drafts, alertDismissed] = await Promise.all([
				listLocalDrafts(userId),
				isLocalDraftAlertDismissed(userId),
			]);
			setItems(drafts);
			setShowLocalAlert(!alertDismissed);
		} catch (error) {
			setLoadError(
				error instanceof Error ? error : new Error("本地草稿读取失败"),
			);
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	useFocusEffect(
		useCallback(() => {
			void loadDrafts();
		}, [loadDrafts]),
	);

	const feedWidth = Math.min(dimensions.width, FEED_MAX_WIDTH);
	const cardWidth = Math.max(
		1,
		(feedWidth - FEED_HORIZONTAL_PADDING - FEED_COLUMN_GAP) / 2,
	);
	const columns = useMemo(
		() => createMasonryColumns(items, cardWidth),
		[cardWidth, items],
	);

	const openDraft = (id: string) => {
		fireHaptic();
		router.push({
			pathname: "/publish",
			params: { draftId: id },
		} as unknown as Href);
	};

	const confirmDeleteDraft = (item: LocalDraftSummary) => {
		fireHaptic();
		confirmAction({
			cancelText: "取消",
			confirmText: "删除",
			message: `“${item.title || "未命名草稿"}”删除后无法恢复。`,
			onConfirm: () => {
				if (!userId) return;
				const previous = items;
				setItems((current) => current.filter((draft) => draft.id !== item.id));
				void deleteLocalDraft(userId, item.id)
					.then((deleted) => {
						if (!deleted) throw new Error("草稿已经不存在了");
						toast.show({ label: "草稿已删除", variant: "success" });
					})
					.catch((error: unknown) => {
						setItems(previous);
						toast.show({
							label: error instanceof Error ? error.message : "草稿删除失败",
							variant: "danger",
						});
					});
			},
			title: "删除草稿？",
		});
	};

	const refreshDrafts = async () => {
		setIsManuallyRefreshing(true);
		try {
			await loadDrafts();
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	const dismissStorageAlert = () => {
		if (!userId) return;
		setShowLocalAlert(false);
		void dismissLocalDraftAlert(userId).catch(() => {
			setShowLocalAlert(true);
			toast.show({ label: "暂时无法关闭提示", variant: "danger" });
		});
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="我的草稿" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						refreshing={isManuallyRefreshing}
						onRefresh={refreshDrafts}
					/>
				}
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<View className="mx-auto w-full max-w-xl gap-3 pt-3">
					{showLocalAlert ? (
						<HeroAlert className="mx-3 py-1 items-center" status="warning">
							<HeroAlert.Content className="min-w-0 flex-1">
								<HeroAlert.Title numberOfLines={1} className="text-sm">
									{Platform.OS === "web"
										? "草稿仅保存在当前浏览器，清除浏览器数据后将无法找回"
										: "草稿仅保存在当前设备，卸载应用后将无法找回"}
								</HeroAlert.Title>
							</HeroAlert.Content>
							<CloseButton
								accessibilityLabel="不再显示本地草稿提示"
								className="size-6"
								onPress={dismissStorageAlert}
							/>
						</HeroAlert>
					) : null}

					{isLoading ? (
						<View className="items-center justify-center py-20">
							<Spinner />
						</View>
					) : loadError ? (
						<ErrorState
							description="本地草稿暂时没有加载出来，请稍后重试。"
							onRetry={() => {
								setIsLoading(true);
								void loadDrafts();
							}}
						/>
					) : items.length > 0 ? (
						<View className="flex-row items-start gap-3 px-3">
							{columns.map((column, index) => (
								<View
									key={index === 0 ? "left-column" : "right-column"}
									className="flex-1 gap-3"
								>
									{column.map((item) => (
										<DraftCard
											key={item.id}
											item={item}
											onDelete={confirmDeleteDraft}
											onOpen={openDraft}
										/>
									))}
								</View>
							))}
						</View>
					) : (
						<EmptyState
							description="保存在当前设备的草稿会出现在这里。"
							icon="document-text-outline"
							onAction={() => router.push("/publish" as Href)}
							title="还没有草稿"
						/>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

function DraftCard({
	item,
	onDelete,
	onOpen,
}: {
	item: LocalDraftSummary;
	onDelete: (item: LocalDraftSummary) => void;
	onOpen: (id: string) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const title = item.title || "未命名草稿";
	const cover =
		item.coverData && item.coverMimeType
			? localDraftCoverUri(item.coverData, item.coverMimeType)
			: null;

	return (
		<Card
			className="overflow-hidden rounded-lg p-0 shadow-none"
			variant="transparent"
		>
			<Card.Header className="p-0">
				<PressableFeedback
					accessibilityLabel={`编辑 ${title}`}
					accessibilityRole="button"
					className="bg-content2"
					onPress={() => onOpen(item.id)}
				>
					{cover ? (
						<Image
							className="w-full bg-content2"
							resizeMode="cover"
							source={{ uri: cover }}
							style={{ aspectRatio: item.coverAspectRatio ?? 1 }}
						/>
					) : (
						<Surface
							className="w-full items-center justify-center gap-1 rounded-none"
							style={{ aspectRatio: 1 }}
							variant="secondary"
						>
							<Ionicons
								color={mutedColor}
								name="document-text-outline"
								size={28}
							/>
							<Text.Paragraph color="muted" type="body-xs">
								暂无封面
							</Text.Paragraph>
						</Surface>
					)}
				</PressableFeedback>
			</Card.Header>

			<Card.Body className="gap-1.5 px-2.5 pt-2 pb-2.5">
				<PressableFeedback onPress={() => onOpen(item.id)}>
					<Card.Title
						className="text-foreground text-sm leading-5"
						ellipsizeMode="tail"
						numberOfLines={2}
					>
						{title}
					</Card.Title>
				</PressableFeedback>
				<Card.Footer className="flex-row items-center justify-between gap-2 p-0">
					<Text.Paragraph color="muted" numberOfLines={1} type="body-xs">
						{formatDate(item.updatedAt)}
					</Text.Paragraph>
					<Button
						accessibilityLabel={`删除 ${title}`}
						className="size-8 rounded-full"
						isIconOnly
						onPress={() => onDelete(item)}
						size="sm"
						variant="ghost"
					>
						<Ionicons color={mutedColor} name="trash-outline" size={17} />
					</Button>
				</Card.Footer>
			</Card.Body>
		</Card>
	);
}

function createMasonryColumns(items: LocalDraftSummary[], cardWidth: number) {
	const left: LocalDraftSummary[] = [];
	const right: LocalDraftSummary[] = [];
	let leftHeight = 0;
	let rightHeight = 0;

	for (const item of items) {
		const estimatedHeight = estimateDraftCardHeight(item, cardWidth);
		if (leftHeight <= rightHeight) {
			left.push(item);
			leftHeight += estimatedHeight + FEED_ITEM_GAP;
		} else {
			right.push(item);
			rightHeight += estimatedHeight + FEED_ITEM_GAP;
		}
	}

	return [left, right];
}

function estimateDraftCardHeight(item: LocalDraftSummary, cardWidth: number) {
	const mediaHeight = cardWidth / (item.coverAspectRatio ?? 1);
	return mediaHeight + DRAFT_CARD_BODY_HEIGHT;
}
