import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	cn,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import {
	FlatList,
	Image,
	Modal,
	RefreshControl,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const HEADER_HEIGHT = 64;
const PAGE_SIZE = 10;

type NotificationCategoryId = "activity" | "followers" | "system";
type ActiveCategoryId = "all" | NotificationCategoryId;
type NotificationKind =
	| "announcement"
	| "collect"
	| "comment"
	| "event"
	| "follow"
	| "like"
	| "mention"
	| "system";

type NotificationItem = {
	actor: null | {
		id: string;
		image: null | string;
		name: string;
	};
	body: string;
	categoryId: NotificationCategoryId;
	createdAt: Date | string;
	id: string;
	isRead: boolean;
	kind: NotificationKind;
	noteId: null | string;
	previewUrl: null | string;
	targetId: null | string;
	targetType: null | string;
	title: string;
};

type NotificationCategory = {
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	id: NotificationCategoryId;
	title: string;
	unreadCount: number;
	updatedAt: null | string;
};

const CATEGORY_CONFIG: Record<
	NotificationCategoryId,
	Omit<NotificationCategory, "unreadCount" | "updatedAt">
> = {
	activity: {
		id: "activity",
		title: "互动通知",
		description: "点赞、收藏、评论、@提及",
		icon: "heart-outline",
	},
	followers: {
		id: "followers",
		title: "新增关注",
		description: "新粉丝列表、关注提醒",
		icon: "person-add-outline",
	},
	system: {
		id: "system",
		title: "系统通知",
		description: "官方公告、活动通知、系统消息",
		icon: "notifications-outline",
	},
};

const TARGET_LABEL_BY_KIND: Record<NotificationKind, string> = {
	announcement: "官方公告",
	collect: "收藏",
	comment: "评论",
	event: "活动通知",
	follow: "新粉丝",
	like: "点赞",
	mention: "@提及",
	system: "系统消息",
};

function formatRelativeTime(value: Date | string | null) {
	if (!value) return "暂无";
	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (Number.isNaN(date.getTime())) return "暂无";
	if (diff < minute) return "刚刚";
	if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
	if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
	if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function MessagesScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");
	const [activeCategoryId, setActiveCategoryId] =
		useState<ActiveCategoryId>("all");
	const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
	const [actionsVisible, setActionsVisible] = useState(false);
	const [selectedNotification, setSelectedNotification] =
		useState<NotificationItem | null>(null);
	const isWide = width >= 768;
	const isAuthenticated = Boolean(session.data?.user);

	const summary = useQuery({
		...orpc.notifications.summary.queryOptions(),
		enabled: isAuthenticated,
	});
	const notifications = useQuery({
		...orpc.notifications.list.queryOptions({
			input: {
				category: activeCategoryId,
				limit: visibleLimit,
				offset: 0,
			},
		}),
		enabled: isAuthenticated,
	});
	const items = (notifications.data?.items ?? []) as NotificationItem[];
	const hasMore = notifications.data?.nextOffset != null;
	const unreadTotal = summary.data?.totalUnread ?? 0;

	const categories = useMemo<NotificationCategory[]>(() => {
		const summaryByCategory = new Map(
			(summary.data?.categories ?? []).map((item) => [item.category, item]),
		);

		return (["activity", "followers", "system"] as const).map((id) => {
			const item = summaryByCategory.get(id);
			return {
				...CATEGORY_CONFIG[id],
				unreadCount: item?.unreadCount ?? 0,
				updatedAt: item?.updatedAt ? formatRelativeTime(item.updatedAt) : null,
			};
		});
	}, [summary.data]);

	const refreshNotifications = async () => {
		await Promise.all([summary.refetch(), notifications.refetch()]);
	};

	const invalidateNotifications = async () => {
		await queryClient.invalidateQueries();
	};

	const markReadMutation = useMutation(
		orpc.notifications.markRead.mutationOptions({
			onSuccess: invalidateNotifications,
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const markAllReadMutation = useMutation(
		orpc.notifications.markAllRead.mutationOptions({
			onSuccess: async () => {
				setActionsVisible(false);
				await invalidateNotifications();
				toast.show({ label: "已全部标为已读" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const deleteMutation = useMutation(
		orpc.notifications.delete.mutationOptions({
			onSuccess: async () => {
				await invalidateNotifications();
				toast.show({ label: "已删除通知" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const deleteAllMutation = useMutation(
		orpc.notifications.deleteAll.mutationOptions({
			onSuccess: async () => {
				setActionsVisible(false);
				setVisibleLimit(PAGE_SIZE);
				await invalidateNotifications();
				toast.show({ label: "通知已清空" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	const openNotification = (item: NotificationItem) => {
		fireHaptic();
		setSelectedNotification({ ...item, isRead: true });
		if (!item.isRead) {
			markReadMutation.mutate({ id: item.id, isRead: true });
		}
	};

	const openTarget = (item: NotificationItem) => {
		setSelectedNotification(null);
		const targetId = item.noteId ?? item.targetId;
		if (item.targetType === "note" && targetId) {
			router.push({
				pathname: "/note/[id]",
				params: { id: targetId },
			} as unknown as Href);
			return;
		}
		if (item.targetType === "user" && item.targetId) {
			router.push({
				pathname: "/user/[id]",
				params: { id: item.targetId },
			} as unknown as Href);
		}
	};

	const changeCategory = (id: ActiveCategoryId) => {
		fireHaptic();
		setActiveCategoryId(id);
		setVisibleLimit(PAGE_SIZE);
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="absolute top-0 right-0 left-0 z-10 border-border-secondary border-b bg-background/95"
				style={{ paddingTop: insets.top }}
			>
				<View className="mx-auto h-16 w-full max-w-xl flex-row items-center justify-between px-3">
					<Button
						isIconOnly
						variant="ghost"
						accessibilityLabel="返回"
						className="h-11 w-11 rounded-full"
						feedbackVariant="scale-ripple"
						onPress={() => {
							if (router.canGoBack()) {
								router.back();
								return;
							}
							router.replace("/" as Href);
						}}
					>
						<Ionicons name="chevron-back" size={22} color={foregroundColor} />
					</Button>

					<View className="items-center gap-0.5">
						<Text.Heading type="h2" className="text-foreground">
							消息
						</Text.Heading>
						<Text.Paragraph type="body-xs" color="muted">
							{unreadTotal > 0 ? `${unreadTotal} 条未读` : "全部已读"}
						</Text.Paragraph>
					</View>

					<Button
						isIconOnly
						variant={actionsVisible ? "secondary" : "ghost"}
						accessibilityLabel="消息操作"
						className="h-11 w-11 rounded-full"
						feedbackVariant="scale-ripple"
						onPress={() => setActionsVisible((value) => !value)}
					>
						<Ionicons
							name="ellipsis-horizontal"
							size={22}
							color={foregroundColor}
						/>
					</Button>
				</View>
			</View>

			<FlatList
				className="mx-auto w-full max-w-xl"
				data={items}
				keyExtractor={(item) => item.id}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="bg-background px-3 pb-32"
				contentContainerStyle={{
					paddingTop: insets.top + HEADER_HEIGHT + 12,
					gap: 10,
				}}
				refreshControl={
					<RefreshControl
						refreshing={notifications.isRefetching || summary.isRefetching}
						onRefresh={refreshNotifications}
					/>
				}
				onEndReached={() => {
					if (hasMore && !notifications.isFetching) {
						setVisibleLimit((value) => value + PAGE_SIZE);
					}
				}}
				onEndReachedThreshold={0.35}
				ListHeaderComponent={
					<View className="gap-3 pb-2">
						{actionsVisible ? (
							<Surface className="gap-2 rounded-2xl p-2">
								<View className="flex-row gap-2">
									<Button
										variant="secondary"
										className="h-10 flex-1 rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={markAllReadMutation.isPending}
										onPress={() =>
											markAllReadMutation.mutate({ category: activeCategoryId })
										}
									>
										<Ionicons
											name="checkmark-done-outline"
											size={16}
											color={foregroundColor}
										/>
										<Button.Label>全部已读</Button.Label>
									</Button>
									<Button
										variant="danger-soft"
										className="h-10 flex-1 rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={deleteAllMutation.isPending}
										onPress={() =>
											deleteAllMutation.mutate({ category: activeCategoryId })
										}
									>
										<Ionicons
											name="trash-outline"
											size={16}
											color={dangerColor}
										/>
										<Button.Label>清空通知</Button.Label>
									</Button>
								</View>
								<Button
									variant="ghost"
									className="h-10 rounded-full"
									feedbackVariant="scale-ripple"
									onPress={() => {
										setActionsVisible(false);
										toast.show({ label: "消息设置已打开" });
									}}
								>
									<Ionicons
										name="settings-outline"
										size={16}
										color={mutedColor}
									/>
									<Button.Label>消息设置</Button.Label>
								</Button>
							</Surface>
						) : null}

						<ScrollView
							horizontal={!isWide}
							showsHorizontalScrollIndicator={false}
							contentContainerClassName={cn(
								"gap-3",
								isWide ? "w-full flex-row" : "pr-3",
							)}
						>
							{categories.map((category) => (
								<CategoryCard
									key={category.id}
									category={category}
									isActive={activeCategoryId === category.id}
									isWide={isWide}
									onPress={() =>
										changeCategory(
											activeCategoryId === category.id ? "all" : category.id,
										)
									}
								/>
							))}
						</ScrollView>

						<View className="flex-row items-center justify-between pt-1">
							<View className="min-w-0 flex-1 gap-0.5">
								<Text.Paragraph weight="semibold" className="text-foreground">
									{activeCategoryId === "all"
										? "最新通知"
										: CATEGORY_CONFIG[activeCategoryId].title}
								</Text.Paragraph>
								<Text.Paragraph type="body-xs" color="muted">
									左滑可以快速处理，点击查看详情
								</Text.Paragraph>
							</View>
							<Button
								size="sm"
								variant={activeCategoryId === "all" ? "primary" : "secondary"}
								className="h-9 rounded-full px-4"
								feedbackVariant="scale-ripple"
								onPress={() => changeCategory("all")}
							>
								<Button.Label>全部</Button.Label>
							</Button>
						</View>
					</View>
				}
				renderItem={({ item }) => (
					<NotificationRow
						item={item}
						onDelete={() => deleteMutation.mutate({ id: item.id })}
						onPress={() => openNotification(item)}
						onToggleRead={() =>
							markReadMutation.mutate({ id: item.id, isRead: !item.isRead })
						}
					/>
				)}
				ListEmptyComponent={
					notifications.isLoading || summary.isLoading ? (
						<View className="items-center py-16">
							<Spinner />
						</View>
					) : notifications.isError || summary.isError ? (
						<ErrorState
							description="消息暂时没有加载出来，请检查网络后重试。"
							onRetry={refreshNotifications}
						/>
					) : (
						<NotificationEmptyState
							isAuthenticated={isAuthenticated}
							onAction={() =>
								isAuthenticated
									? router.replace("/" as Href)
									: router.push("/me" as Href)
							}
						/>
					)
				}
				ListFooterComponent={
					notifications.isFetching && items.length > 0 ? (
						<View className="items-center py-5">
							<Spinner size="sm" />
						</View>
					) : hasMore ? (
						<View className="items-center py-4">
							<Text.Paragraph type="body-xs" color="muted">
								继续下滑加载更多
							</Text.Paragraph>
						</View>
					) : items.length > 0 ? (
						<View className="items-center py-5">
							<Text.Paragraph type="body-xs" color="muted">
								没有更多通知了
							</Text.Paragraph>
						</View>
					) : null
				}
			/>

			<Modal
				transparent
				animationType="fade"
				visible={selectedNotification !== null}
				onRequestClose={() => setSelectedNotification(null)}
			>
				<View className="flex-1 justify-end bg-overlay-backdrop px-3 pb-3">
					<Surface className="mx-auto w-full max-w-xl gap-4 rounded-3xl p-4">
						<View className="flex-row items-start justify-between gap-3">
							<View className="min-w-0 flex-1 gap-1">
								<Text.Heading type="h2" className="text-foreground">
									通知详情
								</Text.Heading>
								<Text.Paragraph type="body-sm" color="muted">
									{formatRelativeTime(selectedNotification?.createdAt ?? null)}
								</Text.Paragraph>
							</View>
							<Button
								isIconOnly
								variant="secondary"
								accessibilityLabel="关闭通知详情"
								className="h-10 w-10 rounded-full"
								feedbackVariant="scale-ripple"
								onPress={() => setSelectedNotification(null)}
							>
								<Ionicons name="close" size={18} color={foregroundColor} />
							</Button>
						</View>

						{selectedNotification ? (
							<View className="gap-4">
								<View className="flex-row gap-3">
									<NotificationAvatar item={selectedNotification} />
									<View className="min-w-0 flex-1 gap-1">
										<Text.Paragraph
											weight="semibold"
											className="text-foreground"
										>
											{selectedNotification.title}
										</Text.Paragraph>
										<Text.Paragraph color="muted" className="leading-6">
											{selectedNotification.body}
										</Text.Paragraph>
									</View>
								</View>
								{selectedNotification.previewUrl ? (
									<Image
										source={{ uri: selectedNotification.previewUrl }}
										resizeMode="cover"
										className="h-44 w-full rounded-2xl bg-content2"
									/>
								) : null}
								<Button
									variant="primary"
									className="rounded-full"
									feedbackVariant="scale-ripple"
									onPress={() => openTarget(selectedNotification)}
								>
									<Button.Label>查看相关内容</Button.Label>
								</Button>
							</View>
						) : null}
					</Surface>
				</View>
			</Modal>
		</View>
	);
}

function CategoryCard({
	category,
	isActive,
	isWide,
	onPress,
}: {
	category: NotificationCategory;
	isActive: boolean;
	isWide: boolean;
	onPress: () => void;
}) {
	const accentColor = useThemeColor("accent");
	const mutedColor = useThemeColor("muted");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityState={isActive ? { selected: true } : undefined}
			onPress={onPress}
			className={cn(
				"gap-3 rounded-2xl border p-4",
				isWide ? "min-w-0 flex-1" : "w-64",
				isActive
					? "border-accent bg-accent-soft"
					: "border-border-secondary bg-surface",
			)}
		>
			<PressableFeedback.Highlight />
			<View className="flex-row items-start justify-between gap-3">
				<View
					className={cn(
						"size-12 items-center justify-center rounded-full",
						isActive ? "bg-accent" : "bg-content2",
					)}
				>
					<Ionicons
						name={category.icon}
						size={22}
						color={isActive ? "#ffffff" : accentColor}
					/>
				</View>
				{category.unreadCount > 0 ? (
					<View className="min-w-6 items-center rounded-full bg-accent px-2 py-1">
						<Text.Paragraph
							type="body-xs"
							weight="semibold"
							className="text-accent-foreground"
						>
							{category.unreadCount > 99 ? "99+" : category.unreadCount}
						</Text.Paragraph>
					</View>
				) : null}
			</View>
			<View className="gap-1">
				<Text.Paragraph weight="semibold" className="text-foreground">
					{category.title}
				</Text.Paragraph>
				<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
					{category.description}
				</Text.Paragraph>
				<View className="flex-row items-center gap-1 pt-1">
					<Ionicons name="time-outline" size={13} color={mutedColor} />
					<Text.Paragraph type="body-xs" color="muted">
						{category.updatedAt ?? "暂无"}
					</Text.Paragraph>
				</View>
			</View>
		</PressableFeedback>
	);
}

function NotificationEmptyState({
	isAuthenticated,
	onAction,
}: {
	isAuthenticated: boolean;
	onAction: () => void;
}) {
	const accentColor = useThemeColor("accent");
	const mutedColor = useThemeColor("muted");

	return (
		<View className="items-center gap-4 px-8 py-16">
			<View className="h-32 w-40 items-center justify-center">
				<View className="absolute top-5 left-3 h-16 w-24 rounded-3xl bg-accent-soft" />
				<View className="absolute right-4 bottom-5 h-14 w-24 rounded-3xl bg-content2" />
				<View className="z-10 size-20 items-center justify-center rounded-full bg-surface shadow-overlay">
					<Ionicons
						name="notifications-outline"
						size={36}
						color={accentColor}
					/>
				</View>
				<View className="absolute top-4 right-12 size-3 rounded-full bg-accent" />
				<View className="absolute bottom-8 left-10 size-2 rounded-full bg-content3" />
				<Ionicons
					name="sparkles-outline"
					size={18}
					color={mutedColor}
					style={{ position: "absolute", right: 20, top: 22 }}
				/>
			</View>
			<View className="items-center gap-2">
				<Text.Paragraph
					align="center"
					weight="semibold"
					className="text-foreground"
				>
					{isAuthenticated ? "暂时没有通知" : "登录后查看消息"}
				</Text.Paragraph>
				<Text.Paragraph align="center" type="body-sm" color="muted">
					{isAuthenticated
						? "新的互动、关注和官方消息会出现在这里。"
						: "点赞、评论、关注提醒会同步到你的消息中心。"}
				</Text.Paragraph>
			</View>
			<Button
				size="sm"
				variant="primary"
				className="rounded-full px-5"
				feedbackVariant="scale-ripple"
				onPress={onAction}
			>
				<Button.Label>{isAuthenticated ? "去发现" : "去登录"}</Button.Label>
			</Button>
		</View>
	);
}

function NotificationRow({
	item,
	onDelete,
	onPress,
	onToggleRead,
}: {
	item: NotificationItem;
	onDelete: () => void;
	onPress: () => void;
	onToggleRead: () => void;
}) {
	const dangerColor = useThemeColor("danger");
	const foregroundColor = useThemeColor("foreground");

	return (
		<ReanimatedSwipeable
			friction={2}
			rightThreshold={48}
			overshootRight={false}
			containerStyle={{ borderRadius: 18 }}
			renderRightActions={(_, __, swipeable) => (
				<View className="ml-2 flex-row overflow-hidden rounded-2xl">
					<PressableFeedback
						accessibilityRole="button"
						onPress={() => {
							swipeable.close();
							onToggleRead();
						}}
						className="w-20 items-center justify-center gap-1 bg-background-tertiary"
					>
						<Ionicons
							name={item.isRead ? "mail-unread-outline" : "checkmark-outline"}
							size={18}
							color={foregroundColor}
						/>
						<Text.Paragraph type="body-xs" weight="semibold">
							{item.isRead ? "未读" : "已读"}
						</Text.Paragraph>
					</PressableFeedback>
					<PressableFeedback
						accessibilityRole="button"
						onPress={() => {
							swipeable.close();
							onDelete();
						}}
						className="w-20 items-center justify-center gap-1 bg-danger-soft"
					>
						<Ionicons name="trash-outline" size={18} color={dangerColor} />
						<Text.Paragraph
							type="body-xs"
							weight="semibold"
							className="text-danger-soft-foreground"
						>
							删除
						</Text.Paragraph>
					</PressableFeedback>
				</View>
			)}
		>
			<PressableFeedback
				accessibilityRole="button"
				onPress={onPress}
				className={cn(
					"overflow-hidden rounded-2xl border p-3",
					item.isRead
						? "border-border-tertiary bg-surface"
						: "border-accent-soft bg-surface",
				)}
			>
				<PressableFeedback.Highlight />
				<View className="flex-row gap-3">
					<NotificationAvatar item={item} />
					<View className="min-w-0 flex-1 gap-2">
						<View className="flex-row items-start justify-between gap-2">
							<View className="min-w-0 flex-1 gap-1">
								<View className="flex-row items-center gap-2">
									<Text.Paragraph
										weight="semibold"
										className="min-w-0 flex-1 text-foreground"
										numberOfLines={1}
									>
										{item.title}
									</Text.Paragraph>
									{item.isRead ? null : (
										<View className="size-2 rounded-full bg-accent" />
									)}
								</View>
								<Text.Paragraph type="body-sm" color="muted" numberOfLines={2}>
									{item.body}
								</Text.Paragraph>
							</View>
							<Text.Paragraph type="body-xs" color="muted">
								{formatRelativeTime(item.createdAt)}
							</Text.Paragraph>
						</View>

						<View className="flex-row items-center justify-between gap-3">
							<View className="min-w-0 flex-1 flex-row items-center gap-2">
								<View className="rounded-full bg-content2 px-2.5 py-1">
									<Text.Paragraph type="body-xs" color="muted">
										{TARGET_LABEL_BY_KIND[item.kind]}
									</Text.Paragraph>
								</View>
								<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
									来自 {item.actor?.name ?? "Youni"}
								</Text.Paragraph>
							</View>
							{item.previewUrl ? (
								<Image
									source={{ uri: item.previewUrl }}
									resizeMode="cover"
									className="size-14 rounded-xl bg-content2"
								/>
							) : null}
						</View>
					</View>
				</View>
			</PressableFeedback>
		</ReanimatedSwipeable>
	);
}

function NotificationAvatar({ item }: { item: NotificationItem }) {
	const accentColor = useThemeColor("accent");

	if (item.actor?.image) {
		return (
			<Avatar size="md" alt={item.actor.name} className="bg-content2">
				<Avatar.Image source={{ uri: item.actor.image }} />
				<Avatar.Fallback>{item.actor.name.slice(0, 1)}</Avatar.Fallback>
			</Avatar>
		);
	}

	if (item.actor) {
		return (
			<Avatar size="md" alt={item.actor.name} className="bg-content2">
				<Avatar.Fallback>{item.actor.name.slice(0, 1)}</Avatar.Fallback>
			</Avatar>
		);
	}

	const iconName =
		item.categoryId === "system" ? "megaphone-outline" : "person-outline";

	return (
		<View className="size-10 items-center justify-center rounded-full bg-accent-soft">
			<Ionicons name={iconName} size={20} color={accentColor} />
		</View>
	);
}
