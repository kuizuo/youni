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
import {
	invalidateNotifications,
	optimisticDeleteNotification,
	optimisticMarkNotificationKindRead,
	optimisticMarkNotificationRead,
} from "@/lib/query/optimistic-cache";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { client } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

export default function NotificationListScreen() {
	const params = useLocalSearchParams<{ kind?: string | string[] }>();
	const kind = getNotificationKind(getRouteParam(params.kind));
	const config = NOTIFICATION_KIND_CONFIG[kind];
	const emptyIconColor = useThemeColor(config.iconColor);
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const notifications = useInfiniteQuery({
		queryKey: nativeQueryKeys.notifications.list(kind),
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
	const deleteOne = useMutation<
		Awaited<ReturnType<typeof client.notifications.delete>>,
		Error,
		string,
		{ rollback?: () => void }
	>({
		mutationFn: (id: string) => client.notifications.delete({ id }),
		onError: (error, _variables, context) => {
			context?.rollback?.();
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "删除失败",
			});
		},
		onMutate: (id) => optimisticDeleteNotification(id),
		onSettled: () => {
			void invalidateNotifications(kind);
		},
	});

	useEffect(() => {
		void optimisticMarkNotificationKindRead(kind)
			.then((context) =>
				client.notifications
					.markAllRead({
						category: config.category,
						types: [...config.types],
					})
					.then(() => invalidateNotifications(kind))
					.catch((error) => {
						context.rollback();
						toast.show({
							variant: "danger",
							label: error instanceof Error ? error.message : "标记已读失败",
						});
					}),
			)
			.catch(() => undefined);
	}, [config.category, config.types, kind, toast.show]);

	const markRead = async (item: NotificationItem) => {
		if (item.isRead) return;
		const context = await optimisticMarkNotificationRead(item.id);
		void client.notifications
			.markRead({ id: item.id, isRead: true })
			.then(() => invalidateNotifications(kind))
			.catch((error) => {
				context.rollback();
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "标记已读失败",
				});
			});
	};

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
		await markRead(item);
		if (item.targetType === "user" && item.targetId) {
			router.push({
				pathname: "/user/[id]",
				params: { id: item.targetId },
			} as unknown as Href);
			return;
		}
		if (item.targetType === "comment" && item.noteId) {
			const noteParams: { commentId?: string; id: string } = {
				id: item.noteId,
			};
			if (item.targetId) {
				noteParams.commentId = item.targetId;
			}
			router.push({
				pathname: "/note/[id]",
				params: noteParams,
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
						<ErrorState onRetry={() => notifications.refetch()} />
					) : (
						<EmptyState
							icon={config.emptyIcon}
							iconColor={emptyIconColor}
							title={config.emptyTitle}
						/>
					)
				}
			/>
		</View>
	);
}
