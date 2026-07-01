import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc } from "@/utils/orpc";

const HEADER_HEIGHT = 64;

type ConversationItem = {
	id: string;
	lastMessage: null | {
		content: string;
		createdAt: Date | string;
		id: string;
		senderId: string;
	};
	peer: {
		bio: null | string;
		email: string;
		handle: null | string;
		id: string;
		image: null | string;
		name: string;
	};
	unreadCount: number;
	updatedAt: Date | string;
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
	const session = authClient.useSession();
	const socialNavigation = useSocialNavigation();
	const foregroundColor = useThemeColor("foreground");
	const [menuVisible, setMenuVisible] = useState(false);
	const isAuthenticated = Boolean(session.data?.user);
	const conversations = useQuery({
		...orpc.messages.conversations.queryOptions(),
		enabled: isAuthenticated,
		refetchInterval: isAuthenticated ? 5000 : false,
	});
	const items = useMemo(
		() => (conversations.data ?? []) as ConversationItem[],
		[conversations.data],
	);

	const openAction = (href: Href) => {
		fireHaptic();
		setMenuVisible(false);
		router.push(href);
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="absolute top-0 right-0 left-0 z-10 border-border-secondary border-b bg-background/95"
				style={{ paddingTop: insets.top }}
			>
				<View className="mx-auto h-16 w-full max-w-xl flex-row items-center justify-between px-4">
					<View className="w-11" />
					<View className="items-center">
						<Text.Paragraph
							weight="bold"
							className="text-foreground"
							style={{ fontSize: 18 }}
						>
							消息
						</Text.Paragraph>
					</View>
					<Button
						isIconOnly
						variant={menuVisible ? "secondary" : "ghost"}
						accessibilityLabel="新建消息操作"
						className="h-11 w-11 rounded-full"
						feedbackVariant="scale-ripple"
						onPress={() => {
							fireHaptic();
							setMenuVisible(true);
						}}
					>
						<Ionicons name="add" size={26} color={foregroundColor} />
					</Button>
				</View>
			</View>

			<FlatList
				className="mx-auto w-full max-w-xl"
				data={items}
				keyExtractor={(item) => item.id}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="bg-background pb-32"
				contentContainerStyle={{
					paddingTop: insets.top + HEADER_HEIGHT + 8,
				}}
				refreshControl={
					<RefreshControl
						refreshing={conversations.isRefetching}
						onRefresh={() => conversations.refetch()}
					/>
				}
				renderItem={({ item }) => <ConversationRow item={item} />}
				ListEmptyComponent={
					conversations.isLoading ? (
						<View className="items-center py-16">
							<Spinner />
						</View>
					) : conversations.isError ? (
						<ErrorState
							description="消息暂时没有加载出来，请检查网络后重试。"
							onRetry={() => conversations.refetch()}
						/>
					) : (
						<EmptyState
							icon="chatbubble-ellipses-outline"
							title={isAuthenticated ? "还没有私信" : "登录后查看私信"}
							description={
								isAuthenticated
									? "去用户主页点击发私信，聊天会出现在这里。"
									: "登录后可以查看聊天记录和未读消息。"
							}
							actionLabel={isAuthenticated ? "去发现" : "去登录"}
							onAction={() =>
								isAuthenticated
									? router.replace("/" as Href)
									: socialNavigation.goTo({
											type: "login",
											redirectTo: "/messages",
										})
							}
						/>
					)
				}
			/>

			<Modal
				transparent
				animationType="fade"
				visible={menuVisible}
				onRequestClose={() => setMenuVisible(false)}
			>
				<View className="flex-1 bg-overlay-backdrop">
					<Pressable
						accessibilityLabel="关闭菜单"
						accessibilityRole="button"
						className="absolute inset-0"
						onPress={() => setMenuVisible(false)}
					/>
					<View
						pointerEvents="box-none"
						className="mx-auto w-full max-w-xl items-end px-4"
						style={{ paddingTop: insets.top + 58 }}
					>
						<Surface className="w-44 gap-1 rounded-2xl p-2">
							<ActionButton
								icon="person-add-outline"
								label="添加好友"
								onPress={() => openAction("/add-friend" as Href)}
							/>
							<ActionButton
								icon="scan-outline"
								label="扫一扫"
								onPress={() => openAction("/scan" as Href)}
							/>
						</Surface>
					</View>
				</View>
			</Modal>
		</View>
	);
}

function ConversationRow({ item }: { item: ConversationItem }) {
	const socialNavigation = useSocialNavigation();
	const mutedColor = useThemeColor("muted");
	const lastMessage = item.lastMessage?.content ?? "还没有消息";

	const openChat = () => {
		fireHaptic();
		socialNavigation.goTo({ type: "chat", id: item.id });
	};

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`打开与 ${item.peer.name} 的聊天`}
			className="flex-row items-center gap-3 border-border-tertiary border-b px-4 py-4"
			onPress={openChat}
		>
			<Avatar size="lg" alt={item.peer.name}>
				{item.peer.image ? (
					<Avatar.Image source={{ uri: item.peer.image }} />
				) : null}
				<Avatar.Fallback>{item.peer.name.slice(0, 1)}</Avatar.Fallback>
			</Avatar>
			<View className="min-w-0 flex-1 gap-1">
				<View className="flex-row items-center gap-2">
					<Text.Paragraph
						weight="semibold"
						className="min-w-0 flex-1 text-foreground"
						numberOfLines={1}
					>
						{item.peer.name}
					</Text.Paragraph>
					<Text.Paragraph type="body-xs" color="muted">
						{formatRelativeTime(item.lastMessage?.createdAt ?? item.updatedAt)}
					</Text.Paragraph>
				</View>
				<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
					{lastMessage}
				</Text.Paragraph>
			</View>
			{item.unreadCount > 0 ? (
				<View className="min-w-6 items-center rounded-full bg-accent px-2 py-1">
					<Text.Paragraph
						type="body-xs"
						weight="semibold"
						className="text-accent-foreground"
					>
						{item.unreadCount > 99 ? "99+" : item.unreadCount}
					</Text.Paragraph>
				</View>
			) : (
				<Ionicons name="chevron-forward" size={18} color={mutedColor} />
			)}
		</PressableFeedback>
	);
}

function ActionButton({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<Button
			variant="ghost"
			className="h-12 justify-start rounded-xl px-3"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons name={icon} size={20} color={mutedColor} />
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
