import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Spinner } from "heroui-native";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MessageActionMenu } from "@/components/messages/inbox/action-menu";
import { HEADER_HEIGHT } from "@/components/messages/inbox/constants";
import { ConversationRow } from "@/components/messages/inbox/conversation-row";
import { MessagesHeader } from "@/components/messages/inbox/header";
import { NotificationShortcutsSection } from "@/components/messages/inbox/notification-shortcuts";
import type {
	ConversationItem,
	MessageGroupSummary,
} from "@/components/messages/inbox/types";
import { EmptyState, ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc } from "@/utils/orpc";

export default function MessagesScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const socialNavigation = useSocialNavigation();
	const [menuVisible, setMenuVisible] = useState(false);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const isAuthenticated = Boolean(session.data?.user);
	const conversations = useQuery({
		...orpc.messages.conversations.queryOptions(),
		enabled: isAuthenticated,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		staleTime: 30_000,
	});
	const notificationSummary = useQuery({
		...orpc.notifications.summary.queryOptions(),
		enabled: isAuthenticated,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		staleTime: 30_000,
	});
	const items = useMemo(
		() => (conversations.data ?? []) as ConversationItem[],
		[conversations.data],
	);
	const messageGroups = useMemo(
		() =>
			(notificationSummary.data?.messageGroups ?? []) as MessageGroupSummary[],
		[notificationSummary.data?.messageGroups],
	);

	const openAction = (href: Href) => {
		fireHaptic();
		setMenuVisible(false);
		router.push(href);
	};

	const refreshMessages = async () => {
		if (!isAuthenticated) return;
		setIsManuallyRefreshing(true);
		try {
			await Promise.all([
				conversations.refetch(),
				notificationSummary.refetch(),
			]);
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<MessagesHeader
				isMenuVisible={menuVisible}
				topInset={insets.top}
				onOpenMenu={() => {
					fireHaptic();
					setMenuVisible(true);
				}}
			/>

			<FlatList
				className="mx-auto w-full max-w-xl"
				data={items}
				keyExtractor={(item) => item.id}
				showsVerticalScrollIndicator={false}
				contentContainerClassName="bg-background pb-32"
				contentContainerStyle={{
					paddingTop: insets.top + HEADER_HEIGHT + 8,
				}}
				scrollIndicatorInsets={{
					top: insets.top + HEADER_HEIGHT,
					bottom: 96,
				}}
				refreshControl={
					<RefreshControl
						enabled={isAuthenticated}
						progressViewOffset={insets.top + HEADER_HEIGHT}
						refreshing={isManuallyRefreshing}
						onRefresh={refreshMessages}
					/>
				}
				renderItem={({ item }) => <ConversationRow item={item} />}
				ListHeaderComponent={
					<NotificationShortcutsSection
						messageGroups={messageGroups}
						onOpenAction={openAction}
					/>
				}
				ListEmptyComponent={
					conversations.isLoading ? (
						<View className="items-center py-16">
							<Spinner />
						</View>
					) : conversations.isError ? (
						<ErrorState onRetry={() => conversations.refetch()} />
					) : (
						<EmptyState
							icon="chatbubble-ellipses-outline"
							title={
								isAuthenticated ? "去发现感兴趣的人，聊聊吧" : "登录后查看私信"
							}
							description={
								isAuthenticated
									? undefined
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

			<MessageActionMenu
				isVisible={menuVisible}
				topInset={insets.top}
				onClose={() => setMenuVisible(false)}
				onOpenAction={openAction}
			/>
		</View>
	);
}
