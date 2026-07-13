import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { TopicSearchItem, TopicSort } from "@youni/api/contracts/topics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { TopicFooter } from "@/components/topics/detail/footer";
import { TopicHeader } from "@/components/topics/detail/header";
import { TopicTopBar } from "@/components/topics/detail/top-bar";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { client, queryClient } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

const PAGE_SIZE = 20;

export default function TopicDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const socialNavigation = useSocialNavigation();
	const insets = useSafeAreaInsets();
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const [sort, setSort] = useState<TopicSort>("hot");
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [topicSummary, setTopicSummary] = useState<TopicSearchItem>();
	const queryKey = useMemo(
		() => nativeQueryKeys.topic.detail(id, sort),
		[id, sort],
	);
	const topic = useInfiniteQuery({
		queryKey,
		queryFn: ({ pageParam }) =>
			client.topics.topicDetail({
				id: id || "missing",
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
				sort,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.notes.nextOffset ?? undefined,
		enabled: Boolean(id),
	});
	const topicInfo = topic.data?.pages[0]?.topic;
	useEffect(() => {
		if (!topicInfo) return;

		setTopicSummary(topicInfo);
	}, [topicInfo]);
	const displayedTopicInfo =
		topicInfo ?? (topicSummary?.id === id ? topicSummary : undefined);
	const notes = useMemo(
		() => topic.data?.pages.flatMap((page) => page.notes.items) ?? [],
		[topic.data?.pages],
	);

	const goBack = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/search" as Href);
	};

	const refreshTopic = async () => {
		setIsManuallyRefreshing(true);
		try {
			await queryClient.resetQueries({ queryKey });
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	if (!id || (topic.isError && notes.length === 0 && !displayedTopicInfo)) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<TopicTopBar foregroundColor={foregroundColor} onBack={goBack} />
				<ErrorState
					title="话题未能成功打开"
					description="话题可能已不存在，请重试。"
					onRetry={() => topic.refetch()}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<FlashList
				style={{ alignSelf: "center", flex: 1, width: "100%", maxWidth: 576 }}
				data={notes}
				keyExtractor={(item) => item.id}
				numColumns={2}
				masonry
				optimizeItemArrangement={false}
				showsVerticalScrollIndicator={false}
				refreshing={isManuallyRefreshing}
				onRefresh={() => {
					void refreshTopic();
				}}
				onEndReached={() => {
					if (
						topic.hasNextPage &&
						!topic.isFetchingNextPage &&
						!topic.isFetching
					) {
						void topic.fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				contentContainerStyle={{
					paddingHorizontal: 4,
					paddingBottom: Platform.OS === "ios" ? insets.bottom + 36 : 132,
				}}
				ListHeaderComponent={
					<TopicHeader
						accentColor={accentColor}
						foregroundColor={foregroundColor}
						isLoading={topic.isLoading && !displayedTopicInfo}
						sort={sort}
						topicName={displayedTopicInfo?.name}
						discussionCount={displayedTopicInfo?.discussionCount ?? 0}
						noteCount={displayedTopicInfo?.noteCount ?? 0}
						topInset={insets.top}
						onBack={goBack}
						onSortChange={setSort}
					/>
				}
				renderItem={({ item }) => (
					<View className="px-1 pb-2">
						<NoteCard compact note={item} />
					</View>
				)}
				ListFooterComponent={
					<TopicFooter
						hasItems={notes.length > 0}
						hasMore={Boolean(topic.hasNextPage)}
						isLoading={topic.isFetchingNextPage}
					/>
				}
				ListEmptyComponent={
					topic.isLoading ? (
						<FeedSkeleton />
					) : topic.isError ? (
						<ErrorState
							title="图文未能成功加载"
							description="请重试。"
							onRetry={() => topic.refetch()}
						/>
					) : (
						<EmptyState
							icon="images-outline"
							title="成为第一个分享相关图文的人吧"
							actionLabel="去发布"
							onAction={socialNavigation.openPublish}
						/>
					)
				}
			/>

			<Button
				variant="primary"
				className="absolute self-center rounded-full px-7"
				style={{ bottom: insets.bottom + 18 }}
				feedbackVariant="scale-ripple"
				onPress={socialNavigation.openPublish}
			>
				<Ionicons name="add" size={24} color={accentForegroundColor} />
				<Button.Label className="text-accent-foreground">去发布</Button.Label>
			</Button>
		</View>
	);
}
