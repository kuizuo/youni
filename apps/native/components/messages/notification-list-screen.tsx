import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spinner, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NOTIFICATION_KIND_CONFIG } from "@/components/messages/notifications/constants";
import { NotificationListFooter } from "@/components/messages/notifications/footer";
import { NotificationListHeader } from "@/components/messages/notifications/header";
import { NotificationRow } from "@/components/messages/notifications/notification-row";
import type { NotificationItem } from "@/components/messages/notifications/types";
import { getNotificationKind } from "@/components/messages/notifications/utils";
import { ListSeparator } from "@/components/shared/app-separator";
import { EmptyState, ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, queryClient } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

export default function NotificationListScreen() {
	const params = useLocalSearchParams<{ kind?: string | string[] }>();
	const kind = getNotificationKind(getRouteParam(params.kind));
	const config = NOTIFICATION_KIND_CONFIG[kind];
	const emptyIconColor = useThemeColor(config.iconColor);
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
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
	const deleteOne = useMutation({
		mutationFn: (id: string) => client.notifications.delete({ id }),
		onSuccess: async () => {
			await queryClient.invalidateQueries();
		},
	});

	useEffect(() => {
		void client.notifications
			.markAllRead({
				category: config.category,
				types: [...config.types],
			})
			.then(() => queryClient.invalidateQueries())
			.catch(() => undefined);
	}, [config.category, config.types]);

	const refreshNotifications = async () => {
		setIsManuallyRefreshing(true);
		try {
			await notifications.refetch();
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

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
		if (
			(item.targetType === "note" || item.targetType === "comment") &&
			(item.noteId || item.targetId)
		) {
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
			<NotificationListHeader
				title={config.title}
				topInset={insets.top}
				onBack={() => router.back()}
			/>

			<FlatList
				className="mx-auto w-full max-w-xl"
				contentContainerClassName="bg-background pb-10"
				data={items}
				keyExtractor={(item) => item.id}
				refreshControl={
					<RefreshControl
						refreshing={isManuallyRefreshing}
						onRefresh={refreshNotifications}
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
				ItemSeparatorComponent={ListSeparator}
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
					<NotificationListFooter
						isLoading={notifications.isFetchingNextPage}
					/>
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
							iconColor={emptyIconColor}
							title={config.emptyTitle}
							description="新的动态会显示在这里。"
						/>
					)
				}
			/>
		</View>
	);
}
