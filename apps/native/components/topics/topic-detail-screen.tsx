import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Platform, Share, View } from "react-native";
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
import type { TopicNote, TopicSort } from "@/components/topics/detail/types";
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
	const [sort, setSort] = useState<TopicSort>("hot");
	const queryKey = useMemo(() => ["topic", id, sort] as const, [id, sort]);
	const topic = useInfiniteQuery({
		queryKey,
		queryFn: ({ pageParam }) =>
			client.topicDetail({
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
	const notes = useMemo(
		() => topic.data?.pages.flatMap((page) => page.notes.items) ?? [],
		[topic.data?.pages],
	) as TopicNote[];

	const goBack = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/search" as Href);
	};

	const shareTopic = async () => {
		if (!topicInfo?.name) return;
		await Share.share({ message: `#${topicInfo.name}` }).catch(() => undefined);
	};

	if (!id || (topic.isError && notes.length === 0)) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<TopicTopBar
					foregroundColor={foregroundColor}
					onBack={goBack}
					onShare={shareTopic}
				/>
				<ErrorState
					title="话题没有打开"
					description="话题可能不存在，或者网络暂时不可用。"
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
				refreshing={topic.isRefetching && !topic.isFetchingNextPage}
				onRefresh={() => {
					void queryClient.resetQueries({ queryKey });
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
						isLoading={topic.isLoading}
						sort={sort}
						topicName={topicInfo?.name}
						discussionCount={topicInfo?.discussionCount ?? 0}
						noteCount={topicInfo?.noteCount ?? 0}
						topInset={insets.top}
						onBack={goBack}
						onShare={shareTopic}
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
					) : (
						<EmptyState
							icon="images-outline"
							title="还没有相关图文"
							description="这个话题下有新内容后，会出现在这里。"
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
				<Ionicons name="add" size={24} color="#ffffff" />
				<Button.Label className="text-white">去发布</Button.Label>
			</Button>
		</View>
	);
}
