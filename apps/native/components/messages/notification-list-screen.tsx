import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, queryClient } from "@/utils/orpc";

type NotificationKind = "comments" | "followers" | "reactions";

type NotificationItem = {
	actor: null | {
		id: string;
		image: null | string;
		name: string;
	};
	body: string;
	createdAt: Date | string;
	id: string;
	isRead: boolean;
	kind: string;
	noteId: null | string;
	previewUrl: null | string;
	targetId: null | string;
	targetType: null | string;
	title: string;
};

const KIND_CONFIG = {
	reactions: {
		title: "赞和收藏",
		emptyIcon: "heart-outline",
		emptyTitle: "还没有赞和收藏",
		types: ["like", "collect"] as const,
		category: "activity" as const,
	},
	followers: {
		title: "新增关注",
		emptyIcon: "person-add-outline",
		emptyTitle: "还没有新增关注",
		types: ["follow"] as const,
		category: "followers" as const,
	},
	comments: {
		title: "评论",
		emptyIcon: "chatbubble-ellipses-outline",
		emptyTitle: "还没有评论消息",
		types: ["comment"] as const,
		category: "activity" as const,
	},
} satisfies Record<
	NotificationKind,
	{
		category: "activity" | "followers";
		emptyIcon: keyof typeof Ionicons.glyphMap;
		emptyTitle: string;
		title: string;
		types: readonly string[];
	}
>;

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function getKind(value?: string): NotificationKind {
	if (value === "followers" || value === "comments" || value === "reactions") {
		return value;
	}
	return "reactions";
}

function formatRelativeTime(value: Date | string) {
	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (Number.isNaN(date.getTime())) return "";
	if (diff < minute) return "刚刚";
	if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
	if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
	if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function NotificationListScreen() {
	const params = useLocalSearchParams<{ kind?: string | string[] }>();
	const kind = getKind(getRouteParam(params.kind));
	const config = KIND_CONFIG[kind];
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const notifications = useInfiniteQuery({
		queryKey: ["notifications", kind],
		queryFn: ({ pageParam }) =>
			client.notifications.list({
				category: config.category,
				types: [...config.types],
				limit: 20,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
	});
	const items = useMemo(
		() =>
			notifications.data?.pages.flatMap((page) => page.items) ??
			([] as NotificationItem[]),
		[notifications.data?.pages],
	);
	const markAllRead = useMutation({
		mutationFn: () =>
			client.notifications.markAllRead({
				category: config.category,
				types: [...config.types],
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries();
		},
	});
	const deleteAll = useMutation({
		mutationFn: () =>
			client.notifications.deleteAll({
				category: config.category,
				types: [...config.types],
			}),
		onSuccess: async () => {
			await queryClient.invalidateQueries();
		},
	});
	const deleteOne = useMutation({
		mutationFn: (id: string) => client.notifications.delete({ id }),
		onSuccess: async () => {
			await queryClient.invalidateQueries();
		},
	});

	const openItem = async (item: NotificationItem) => {
		fireHaptic();
		if (!item.isRead) {
			await client.notifications
				.markRead({ id: item.id, isRead: true })
				.catch(() => undefined);
			await queryClient.invalidateQueries();
		}
		if (item.targetType === "user" && item.targetId) {
			router.push({
				pathname: "/user/[id]",
				params: { id: item.targetId },
			} as unknown as Href);
			return;
		}
		if (item.targetType === "note" && (item.noteId || item.targetId)) {
			router.push({
				pathname: "/note/[id]",
				params: { id: item.noteId ?? item.targetId ?? "" },
			} as unknown as Href);
			return;
		}
		if (item.targetType === "chat" && item.targetId) {
			router.push({
				pathname: "/chat/[id]",
				params: { id: item.targetId },
			} as unknown as Href);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="border-border-secondary border-b bg-background px-4 pb-3"
				style={{ paddingTop: insets.top + 8 }}
			>
				<View className="mx-auto h-12 w-full max-w-xl flex-row items-center gap-3">
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="返回"
						onPress={() => router.back()}
					>
						<Ionicons name="chevron-back" size={24} color={mutedColor} />
					</Button>
					<View className="min-w-0 flex-1">
						<Text.Paragraph weight="bold" style={{ fontSize: 18 }}>
							{config.title}
						</Text.Paragraph>
					</View>
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="全部已读"
						isDisabled={markAllRead.isPending}
						onPress={() => {
							fireHaptic();
							markAllRead.mutate();
						}}
					>
						<Ionicons name="checkmark-done" size={22} color={foregroundColor} />
					</Button>
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="清空"
						isDisabled={deleteAll.isPending}
						onPress={() => {
							fireHaptic();
							deleteAll.mutate();
						}}
					>
						<Ionicons name="trash-outline" size={21} color={mutedColor} />
					</Button>
				</View>
			</View>

			<FlatList
				className="mx-auto w-full max-w-xl"
				contentContainerClassName="bg-background pb-10"
				data={items}
				keyExtractor={(item) => item.id}
				refreshControl={
					<RefreshControl
						refreshing={
							notifications.isRefetching && !notifications.isFetchingNextPage
						}
						onRefresh={() => notifications.refetch()}
					/>
				}
				renderItem={({ item }) => (
					<NotificationRow
						item={item}
						isDeleting={deleteOne.isPending}
						onDelete={() => deleteOne.mutate(item.id)}
						onPress={() => openItem(item)}
					/>
				)}
				onEndReached={() => {
					if (
						notifications.hasNextPage &&
						!notifications.isFetchingNextPage &&
						!notifications.isFetching
					) {
						void notifications.fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.35}
				ListFooterComponent={
					notifications.isFetchingNextPage ? (
						<View className="items-center py-5">
							<Spinner />
						</View>
					) : null
				}
				ListEmptyComponent={
					notifications.isLoading ? (
						<View className="items-center py-16">
							<Spinner />
						</View>
					) : notifications.isError ? (
						<ErrorState
							description="消息暂时没有加载出来，请稍后重试。"
							onRetry={() => notifications.refetch()}
						/>
					) : (
						<EmptyState
							icon={config.emptyIcon}
							title={config.emptyTitle}
							description="新的动态会显示在这里。"
						/>
					)
				}
			/>
		</View>
	);
}

function NotificationRow({
	isDeleting,
	item,
	onDelete,
	onPress,
}: {
	isDeleting: boolean;
	item: NotificationItem;
	onDelete: () => void;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");
	const accentColor = useThemeColor("accent");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={item.title}
			className="border-border-tertiary border-b px-4 py-4"
			onPress={onPress}
		>
			<View className="flex-row gap-3">
				<Avatar size="md" alt={item.actor?.name ?? "Youni"}>
					{item.actor?.image ? (
						<Avatar.Image source={{ uri: item.actor.image }} />
					) : null}
					<Avatar.Fallback>
						{(item.actor?.name ?? "Youni").slice(0, 1)}
					</Avatar.Fallback>
				</Avatar>
				<View className="min-w-0 flex-1 gap-1">
					<View className="flex-row items-center gap-2">
						{item.isRead ? null : (
							<View className="size-2 rounded-full bg-accent" />
						)}
						<Text.Paragraph
							weight="semibold"
							numberOfLines={1}
							className="min-w-0 flex-1 text-foreground"
						>
							{item.title}
						</Text.Paragraph>
						<Text.Paragraph type="body-xs" color="muted">
							{formatRelativeTime(item.createdAt)}
						</Text.Paragraph>
					</View>
					<Text.Paragraph type="body-sm" color="muted" numberOfLines={2}>
						{item.body}
					</Text.Paragraph>
					<View className="mt-2 flex-row items-center justify-between gap-2">
						<Surface className="min-w-0 flex-1 rounded-2xl bg-content2 px-3 py-2">
							<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
								{item.kind === "collect"
									? "收藏"
									: item.kind === "like"
										? "赞"
										: item.kind === "follow"
											? "关注"
											: "评论"}
							</Text.Paragraph>
						</Surface>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel="删除"
							isDisabled={isDeleting}
							onPress={(event) => {
								event.stopPropagation();
								fireHaptic();
								onDelete();
							}}
						>
							<Ionicons
								name="close"
								size={18}
								color={mutedColor || accentColor}
							/>
						</Button>
					</View>
				</View>
			</View>
		</PressableFeedback>
	);
}
