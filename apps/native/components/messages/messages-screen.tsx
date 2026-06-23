import { Ionicons } from "@expo/vector-icons";
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

import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";

const HEADER_HEIGHT = 64;
const PAGE_SIZE = 5;

type NotificationCategoryId = "activity" | "followers" | "system";
type NotificationKind =
	| "announcement"
	| "collect"
	| "comment"
	| "event"
	| "follow"
	| "like"
	| "mention"
	| "system";

type NotificationCategory = {
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	id: NotificationCategoryId;
	kinds: NotificationKind[];
	title: string;
};

type NotificationItem = {
	avatarUrl?: string;
	body: string;
	categoryId: NotificationCategoryId;
	id: string;
	isRead: boolean;
	kind: NotificationKind;
	nickname: string;
	previewUrl?: string;
	targetLabel?: string;
	time: string;
	title: string;
};

const CATEGORIES: NotificationCategory[] = [
	{
		id: "activity",
		title: "互动通知",
		description: "点赞、收藏、评论、@提及",
		icon: "heart-outline",
		kinds: ["like", "collect", "comment", "mention"],
	},
	{
		id: "followers",
		title: "新增关注",
		description: "新粉丝列表、关注提醒",
		icon: "person-add-outline",
		kinds: ["follow"],
	},
	{
		id: "system",
		title: "系统通知",
		description: "官方公告、活动通知、系统消息",
		icon: "notifications-outline",
		kinds: ["announcement", "event", "system"],
	},
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
	{
		id: "n-1",
		categoryId: "activity",
		kind: "like",
		nickname: "林小眠",
		title: "林小眠赞了你的笔记",
		body: "春日通勤包里装什么",
		time: "刚刚",
		isRead: false,
		avatarUrl:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
		previewUrl:
			"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=220&h=220&fit=crop",
		targetLabel: "点赞",
	},
	{
		id: "n-2",
		categoryId: "activity",
		kind: "comment",
		nickname: "南风",
		title: "南风评论了你的内容",
		body: "这个配色也太舒服了，求桌面清单。",
		time: "12 分钟前",
		isRead: false,
		avatarUrl:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
		previewUrl:
			"https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=220&h=220&fit=crop",
		targetLabel: "评论",
	},
	{
		id: "n-3",
		categoryId: "followers",
		kind: "follow",
		nickname: "Mori",
		title: "Mori 开始关注你",
		body: "喜欢摄影、旅行和周末咖啡店。",
		time: "38 分钟前",
		isRead: false,
		avatarUrl:
			"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces",
		targetLabel: "新粉丝",
	},
	{
		id: "n-4",
		categoryId: "activity",
		kind: "collect",
		nickname: "阿宁",
		title: "阿宁收藏了你的笔记",
		body: "三天两夜的城市散步路线",
		time: "1 小时前",
		isRead: true,
		avatarUrl:
			"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=160&h=160&fit=crop&crop=faces",
		previewUrl:
			"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=220&h=220&fit=crop",
		targetLabel: "收藏",
	},
	{
		id: "n-5",
		categoryId: "system",
		kind: "announcement",
		nickname: "Youni 官方",
		title: "你的内容获得了更多曝光",
		body: "过去 24 小时内，有 128 位新朋友看到了你的笔记。",
		time: "2 小时前",
		isRead: false,
		targetLabel: "官方公告",
	},
	{
		id: "n-6",
		categoryId: "activity",
		kind: "mention",
		nickname: "小周",
		title: "小周在评论里 @ 了你",
		body: "这家店是不是你上次推荐的那家？",
		time: "昨天 21:18",
		isRead: true,
		avatarUrl:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces",
		previewUrl:
			"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=220&h=220&fit=crop",
		targetLabel: "@提及",
	},
	{
		id: "n-7",
		categoryId: "followers",
		kind: "follow",
		nickname: "许枝",
		title: "许枝关注了你",
		body: "刚刚看完你的 4 篇穿搭笔记。",
		time: "昨天 18:04",
		isRead: true,
		avatarUrl:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces",
		targetLabel: "关注提醒",
	},
	{
		id: "n-8",
		categoryId: "system",
		kind: "event",
		nickname: "Youni 活动",
		title: "周末灵感征集开始了",
		body: "发布带有 #周末灵感 的笔记，有机会进入精选流。",
		time: "周一",
		isRead: true,
		previewUrl:
			"https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=220&h=220&fit=crop",
		targetLabel: "活动通知",
	},
	{
		id: "n-9",
		categoryId: "activity",
		kind: "like",
		nickname: "栗子",
		title: "栗子赞了你的笔记",
		body: "低预算卧室改造记录",
		time: "周日",
		isRead: true,
		avatarUrl:
			"https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&h=160&fit=crop&crop=faces",
		previewUrl:
			"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=220&h=220&fit=crop",
		targetLabel: "点赞",
	},
	{
		id: "n-10",
		categoryId: "system",
		kind: "system",
		nickname: "系统消息",
		title: "账号安全提醒",
		body: "建议完善个人资料，让更多人认识你。",
		time: "上周五",
		isRead: true,
		targetLabel: "系统消息",
	},
];

export default function MessagesScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");
	const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
	const [activeCategoryId, setActiveCategoryId] = useState<
		"all" | NotificationCategoryId
	>("all");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [actionsVisible, setActionsVisible] = useState(false);
	const [selectedNotification, setSelectedNotification] =
		useState<NotificationItem | null>(null);
	const isWide = width >= 768;

	const unreadTotal = useMemo(
		() => notifications.filter((item) => !item.isRead).length,
		[notifications],
	);
	const filteredNotifications = useMemo(() => {
		if (activeCategoryId === "all") return notifications;
		return notifications.filter((item) => item.categoryId === activeCategoryId);
	}, [activeCategoryId, notifications]);
	const visibleNotifications = filteredNotifications.slice(0, visibleCount);
	const hasMore = visibleNotifications.length < filteredNotifications.length;

	const categories = useMemo(
		() =>
			CATEGORIES.map((category) => {
				const categoryItems = notifications.filter(
					(item) => item.categoryId === category.id,
				);
				const latestItem = categoryItems[0];

				return {
					...category,
					unreadCount: categoryItems.filter((item) => !item.isRead).length,
					updatedAt: latestItem?.time ?? "暂无",
				};
			}),
		[notifications],
	);

	const markAllAsRead = () => {
		fireHaptic();
		setNotifications((items) =>
			items.map((item) => ({ ...item, isRead: true })),
		);
		setActionsVisible(false);
		toast.show({ label: "已全部标为已读" });
	};

	const clearNotifications = () => {
		fireHaptic();
		setNotifications([]);
		setVisibleCount(PAGE_SIZE);
		setActionsVisible(false);
		toast.show({ label: "通知已清空" });
	};

	const restoreNotifications = () => {
		setNotifications(INITIAL_NOTIFICATIONS);
		setVisibleCount(PAGE_SIZE);
		toast.show({ label: "已恢复示例通知" });
	};

	const markNotificationRead = (id: string) => {
		setNotifications((items) =>
			items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
		);
	};

	const toggleNotificationRead = (id: string) => {
		fireHaptic();
		setNotifications((items) =>
			items.map((item) =>
				item.id === id ? { ...item, isRead: !item.isRead } : item,
			),
		);
	};

	const deleteNotification = (id: string) => {
		fireHaptic();
		setNotifications((items) => items.filter((item) => item.id !== id));
		setSelectedNotification((item) => (item?.id === id ? null : item));
		toast.show({ label: "已删除通知" });
	};

	const openNotification = (item: NotificationItem) => {
		fireHaptic();
		markNotificationRead(item.id);
		setSelectedNotification({ ...item, isRead: true });
	};

	const refreshNotifications = () => {
		setIsRefreshing(true);
		setTimeout(() => {
			setNotifications((items) => [...items]);
			setIsRefreshing(false);
			toast.show({ label: "已刷新消息" });
		}, 650);
	};

	const loadMore = () => {
		if (!hasMore || isLoadingMore) return;
		setIsLoadingMore(true);
		setTimeout(() => {
			setVisibleCount((count) => count + PAGE_SIZE);
			setIsLoadingMore(false);
		}, 520);
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
				data={visibleNotifications}
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
						refreshing={isRefreshing}
						onRefresh={refreshNotifications}
					/>
				}
				onEndReached={loadMore}
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
										onPress={markAllAsRead}
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
										onPress={clearNotifications}
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
									onPress={() => {
										fireHaptic();
										setActiveCategoryId((value) =>
											value === category.id ? "all" : category.id,
										);
										setVisibleCount(PAGE_SIZE);
									}}
								/>
							))}
						</ScrollView>

						<View className="flex-row items-center justify-between pt-1">
							<View className="min-w-0 flex-1 gap-0.5">
								<Text.Paragraph weight="semibold" className="text-foreground">
									{activeCategoryId === "all"
										? "最新通知"
										: CATEGORIES.find((item) => item.id === activeCategoryId)
												?.title}
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
								onPress={() => {
									setActiveCategoryId("all");
									setVisibleCount(PAGE_SIZE);
								}}
							>
								<Button.Label>全部</Button.Label>
							</Button>
						</View>
					</View>
				}
				renderItem={({ item }) => (
					<NotificationRow
						item={item}
						onDelete={() => deleteNotification(item.id)}
						onPress={() => openNotification(item)}
						onToggleRead={() => toggleNotificationRead(item.id)}
					/>
				)}
				ListEmptyComponent={
					<NotificationEmptyState onRestore={restoreNotifications} />
				}
				ListFooterComponent={
					isLoadingMore ? (
						<View className="items-center py-5">
							<Spinner size="sm" />
						</View>
					) : hasMore ? (
						<View className="items-center py-4">
							<Text.Paragraph type="body-xs" color="muted">
								继续下滑加载更多
							</Text.Paragraph>
						</View>
					) : visibleNotifications.length > 0 ? (
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
									{selectedNotification?.time}
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
									onPress={() => {
										setSelectedNotification(null);
										toast.show({ label: "已进入相关内容" });
									}}
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
	category: NotificationCategory & { unreadCount: number; updatedAt: string };
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
						{category.updatedAt}
					</Text.Paragraph>
				</View>
			</View>
		</PressableFeedback>
	);
}

function NotificationEmptyState({ onRestore }: { onRestore: () => void }) {
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
					暂时没有通知
				</Text.Paragraph>
				<Text.Paragraph align="center" type="body-sm" color="muted">
					新的互动、关注和官方消息会出现在这里。
				</Text.Paragraph>
			</View>
			<Button
				size="sm"
				variant="primary"
				className="rounded-full px-5"
				feedbackVariant="scale-ripple"
				onPress={onRestore}
			>
				<Button.Label>恢复示例</Button.Label>
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
								{item.time}
							</Text.Paragraph>
						</View>

						<View className="flex-row items-center justify-between gap-3">
							<View className="min-w-0 flex-1 flex-row items-center gap-2">
								<View className="rounded-full bg-content2 px-2.5 py-1">
									<Text.Paragraph type="body-xs" color="muted">
										{item.targetLabel}
									</Text.Paragraph>
								</View>
								<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
									来自 {item.nickname}
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

	if (item.avatarUrl) {
		return (
			<Avatar size="md" alt={item.nickname} className="bg-content2">
				<Avatar.Image source={{ uri: item.avatarUrl }} />
				<Avatar.Fallback>{item.nickname.slice(0, 1)}</Avatar.Fallback>
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
