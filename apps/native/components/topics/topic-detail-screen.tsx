import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { TopicSearchItem, TopicSort } from "@youni/api/contracts/topics";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
	ProfileTabPage,
	ProfileTabPane,
} from "@/components/profile/me-profile-tab-content";
import { ProfileCollapsibleTabs } from "@/components/profile/profile-collapsible-tabs";
import { EmptyState, ErrorState } from "@/components/social-states";
import { TopicFooter } from "@/components/topics/detail/footer";
import { TopicHeader, TopicSortBar } from "@/components/topics/detail/header";
import { TopicTopBar } from "@/components/topics/detail/top-bar";
import { TOPIC_SORTS } from "@/components/topics/detail/types";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { client, queryClient } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

const PAGE_SIZE = 20;
const TOPIC_TAB_BAR_HEIGHT = 50;

function useTopicFeed(id: string, sort: TopicSort) {
	return useInfiniteQuery({
		queryKey: nativeQueryKeys.topic.detail(id, sort),
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
}

export default function TopicDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const socialNavigation = useSocialNavigation();
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const backgroundColor = useThemeColor("background");
	const [sort, setSort] = useState<TopicSort>("hot");
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [topicSummary, setTopicSummary] = useState<TopicSearchItem>();
	const topChromeHeight = insets.top + 64;
	const [headerHeight, setHeaderHeight] = useState(topChromeHeight + 120);
	const contentWidth = Math.min(dimensions.width, 576);
	const minTabContentHeight = Math.max(
		1,
		dimensions.height - topChromeHeight - TOPIC_TAB_BAR_HEIGHT,
	);
	const hotTopic = useTopicFeed(id, "hot");
	const latestTopic = useTopicFeed(id, "latest");
	const topics = { hot: hotTopic, latest: latestTopic };
	const topic = topics[sort];
	const topicInfo =
		topic.data?.pages[0]?.topic ??
		hotTopic.data?.pages[0]?.topic ??
		latestTopic.data?.pages[0]?.topic;

	useEffect(() => {
		if (topicInfo) setTopicSummary(topicInfo);
	}, [topicInfo]);

	const displayedTopicInfo =
		topicInfo ?? (topicSummary?.id === id ? topicSummary : undefined);
	const feeds = useMemo(
		() => ({
			hot: hotTopic.data?.pages.flatMap((page) => page.notes.items) ?? [],
			latest: latestTopic.data?.pages.flatMap((page) => page.notes.items) ?? [],
		}),
		[hotTopic.data?.pages, latestTopic.data?.pages],
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
			await queryClient.resetQueries({
				queryKey: nativeQueryKeys.topic.detail(id, sort),
			});
		} finally {
			setIsManuallyRefreshing(false);
		}
	};
	const loadMore = () => {
		if (topic.hasNextPage && !topic.isFetchingNextPage && !topic.isFetching) {
			void topic.fetchNextPage();
		}
	};

	if (!id || (hotTopic.isError && latestTopic.isError && !displayedTopicInfo)) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<TopicTopBar foregroundColor={foregroundColor} onBack={goBack} />
				<ErrorState
					title="话题未能成功打开"
					description="话题可能已不存在，请重试。"
					onRetry={() => {
						void hotTopic.refetch();
						void latestTopic.refetch();
					}}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<ProfileCollapsibleTabs
				activeTab={sort}
				backgroundColor={backgroundColor}
				contentWidth={contentWidth}
				headerColor={backgroundColor}
				headerHeight={headerHeight}
				minTabContentHeight={minTabContentHeight}
				refreshColor={foregroundColor}
				refreshing={isManuallyRefreshing}
				tabBarHeight={TOPIC_TAB_BAR_HEIGHT}
				tabs={TOPIC_SORTS}
				topChromeHeight={topChromeHeight}
				onEndReached={loadMore}
				onRefresh={() => {
					void refreshTopic();
				}}
				onTabChange={setSort}
				renderHeader={() => (
					<TopicHeader
						accentColor={accentColor}
						isLoading={
							hotTopic.isLoading && latestTopic.isLoading && !displayedTopicInfo
						}
						topicName={displayedTopicInfo?.name}
						discussionCount={displayedTopicInfo?.discussionCount ?? 0}
						noteCount={displayedTopicInfo?.noteCount ?? 0}
						topInset={insets.top}
						onMeasuredHeight={(height) => {
							setHeaderHeight((current) =>
								current === height ? current : height,
							);
						}}
					/>
				)}
				renderStickyHeader={(style, titleStyle) => (
					<Animated.View
						className="absolute top-0 right-0 left-0"
						pointerEvents="box-none"
						style={{ height: topChromeHeight, zIndex: 20 }}
					>
						<Animated.View
							className="absolute inset-0"
							pointerEvents="none"
							style={[{ backgroundColor }, style]}
						/>
						<View style={{ paddingTop: insets.top }}>
							<TopicTopBar
								foregroundColor={foregroundColor}
								titleStyle={titleStyle}
								topicName={displayedTopicInfo?.name}
								onBack={goBack}
							/>
						</View>
					</Animated.View>
				)}
				renderTabBar={({ elevated, onSelect }) => (
					<TopicSortBar
						elevated={elevated}
						sort={sort}
						onSortChange={onSelect}
					/>
				)}
			>
				{TOPIC_SORTS.map((item) => {
					const feedTopic = topics[item.key];
					const notes = feeds[item.key];
					return (
						<ProfileTabPane key={item.key}>
							<ProfileTabPage
								width={contentWidth}
								feedItems={notes}
								isError={feedTopic.isError}
								isLoading={feedTopic.isLoading}
								onRetry={() => feedTopic.refetch()}
								emptyState={
									<EmptyState
										icon="images-outline"
										title="成为第一个分享相关图文的人吧"
										actionLabel="去发布"
										onAction={socialNavigation.openPublish}
									/>
								}
								footer={
									<TopicFooter
										hasItems={notes.length > 0}
										hasMore={Boolean(feedTopic.hasNextPage)}
										isLoading={feedTopic.isFetchingNextPage}
									/>
								}
							/>
						</ProfileTabPane>
					);
				})}
			</ProfileCollapsibleTabs>

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
