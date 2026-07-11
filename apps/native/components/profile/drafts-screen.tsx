import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { HydratedContentNote } from "@youni/api/contracts/shared";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Card,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import {
	Alert,
	Image,
	RefreshControl,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { EmptyState, ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const FEED_MAX_WIDTH = 576;
const FEED_HORIZONTAL_PADDING = 24;
const FEED_COLUMN_GAP = 12;
const FEED_ITEM_GAP = 12;
const DRAFT_CARD_BODY_HEIGHT = 74;

type DraftNote = HydratedContentNote;

function formatDate(value: Date | string | null) {
	if (!value) return "刚刚保存";
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
	const { toast } = useAppToast();
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const draftsOptions = orpc.drafts.queryOptions();
	const creatorStatsOptions = orpc.creatorStats.queryOptions();
	const drafts = useQuery(draftsOptions);
	const items = drafts.data ?? [];
	const feedWidth = Math.min(dimensions.width, FEED_MAX_WIDTH);
	const cardWidth = Math.max(
		1,
		(feedWidth - FEED_HORIZONTAL_PADDING - FEED_COLUMN_GAP) / 2,
	);
	const columns = createMasonryColumns(items, cardWidth);
	const deleteDraft = useMutation(
		orpc.deleteMyNote.mutationOptions<{ previous?: DraftNote[] }>({
			onError: (error, _variables, context) => {
				if (context?.previous) {
					queryClient.setQueryData(draftsOptions.queryKey, context.previous);
				}
				if (isRequestTimeoutError(error)) return;
				toast.show({
					label: error instanceof Error ? error.message : "草稿删除失败",
					variant: "danger",
				});
			},
			onMutate: async (input) => {
				await queryClient.cancelQueries({ queryKey: draftsOptions.queryKey });
				const previous = queryClient.getQueryData<DraftNote[]>(
					draftsOptions.queryKey,
				);
				queryClient.setQueryData<DraftNote[]>(
					draftsOptions.queryKey,
					(current) => current?.filter((item) => item.id !== input.id),
				);
				return { previous };
			},
			onSettled: async () => {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: draftsOptions.queryKey }),
					queryClient.invalidateQueries({
						queryKey: creatorStatsOptions.queryKey,
					}),
				]);
			},
			onSuccess: () => {
				toast.show({ label: "草稿已删除", variant: "success" });
			},
		}),
	);

	const openDraft = (id: string) => {
		fireHaptic();
		router.push({
			pathname: "/publish",
			params: { draftId: id },
		} as unknown as Href);
	};
	const confirmDeleteDraft = (item: DraftNote) => {
		fireHaptic();
		Alert.alert(
			"删除草稿？",
			`“${item.title || "未命名草稿"}”删除后无法恢复。`,
			[
				{ style: "cancel", text: "取消" },
				{
					onPress: () => deleteDraft.mutate({ id: item.id }),
					style: "destructive",
					text: "删除",
				},
			],
		);
	};
	const refreshDrafts = async () => {
		setIsManuallyRefreshing(true);
		try {
			await drafts.refetch();
		} finally {
			setIsManuallyRefreshing(false);
		}
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
				<View className="mx-auto w-full max-w-xl pt-3">
					{drafts.isLoading ? (
						<View className="items-center justify-center py-20">
							<Spinner />
						</View>
					) : drafts.isError ? (
						<ErrorState
							description="草稿暂时没有加载出来，请稍后重试。"
							onRetry={() => drafts.refetch()}
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
							actionLabel="去发布"
							description="保存过的草稿会出现在这里。"
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
	item: DraftNote;
	onDelete: (item: DraftNote) => void;
	onOpen: (id: string) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const cover = item.cover ?? item.images[0] ?? null;
	const title = item.title || "未命名草稿";
	const coverImageMeta = item.imageMetas?.find((meta) => meta.url === cover);
	const imageAspectRatio =
		coverImageMeta?.width && coverImageMeta.height
			? coverImageMeta.width / coverImageMeta.height
			: 1;

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
							style={{ aspectRatio: imageAspectRatio }}
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
						{formatDate(item.draftSavedAt ?? item.updatedAt)}
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

function createMasonryColumns(items: DraftNote[], cardWidth: number) {
	const left: DraftNote[] = [];
	const right: DraftNote[] = [];
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

function estimateDraftCardHeight(item: DraftNote, cardWidth: number) {
	const cover = item.cover ?? item.images[0] ?? null;
	const coverImageMeta = item.imageMetas?.find((meta) => meta.url === cover);
	const imageAspectRatio =
		coverImageMeta?.width && coverImageMeta.height
			? coverImageMeta.width / coverImageMeta.height
			: 1;
	return cardWidth / imageAspectRatio + DRAFT_CARD_BODY_HEIGHT;
}
