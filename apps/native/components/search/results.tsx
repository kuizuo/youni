import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ProfileUser } from "@youni/api/contracts/profiles";
import type { HydratedContentNote } from "@youni/api/contracts/shared";
import type { TopicSearchItem } from "@youni/api/contracts/topics";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Spinner, Typography } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import {
	FlatList,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	type ScrollView,
	View,
} from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedScrollHandler,
} from "react-native-reanimated";

import { NoteCard } from "@/components/note-card";
import { TopicResultRow, UserResultRow } from "@/components/search/result-rows";
import {
	PAGE_SIZE,
	SEARCH_TABS,
	type SearchTabKey,
} from "@/components/search/search-utils";
import { ListSeparator } from "@/components/shared/app-separator";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, queryClient } from "@/utils/orpc";
import { flattenPages } from "@/utils/pagination";

export function SearchResults({
	activeKeyword,
	activeTab,
	contentBottomPadding,
	onChangeTab,
	pageWidth,
	pagerScrollX,
}: {
	activeKeyword: string;
	activeTab: SearchTabKey;
	contentBottomPadding: number;
	onChangeTab: (tab: SearchTabKey) => void;
	pageWidth: number;
	pagerScrollX: SharedValue<number>;
}) {
	const router = useRouter();
	const socialActions = useSocialActions();
	const pagerRef = useRef<ScrollView>(null);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const currentUserId = socialActions.currentUserId;
	const notesQueryKey = nativeQueryKeys.search.notes(activeKeyword);
	const usersQueryKey = nativeQueryKeys.search.users(activeKeyword);
	const topicsQueryKey = nativeQueryKeys.search.topics(activeKeyword);
	const notes = useInfiniteQuery({
		queryKey: notesQueryKey,
		queryFn: ({ pageParam }) =>
			client.notes.searchNotes({
				keyword: activeKeyword,
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: activeKeyword.length > 0,
	});
	const users = useInfiniteQuery({
		queryKey: usersQueryKey,
		queryFn: ({ pageParam }) =>
			client.profiles.searchUsersPage({
				keyword: activeKeyword,
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: activeKeyword.length > 0,
	});
	const topics = useInfiniteQuery({
		queryKey: topicsQueryKey,
		queryFn: ({ pageParam }) =>
			client.topics.searchTopics({
				keyword: activeKeyword,
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: activeKeyword.length > 0,
	});
	const noteResults = flattenPages<HydratedContentNote>(notes.data?.pages);
	const userResults = flattenPages<ProfileUser>(users.data?.pages);
	const topicResults = flattenPages<TopicSearchItem>(topics.data?.pages);
	const activeIndex = Math.max(
		0,
		SEARCH_TABS.findIndex((item) => item.key === activeTab),
	);
	const onPagerScroll = useAnimatedScrollHandler((event) => {
		pagerScrollX.value = event.contentOffset.x;
	});

	useEffect(() => {
		pagerRef.current?.scrollTo({
			animated: true,
			x: activeIndex * pageWidth,
		});
	}, [activeIndex, pageWidth]);

	const finishPagerScroll = (
		event: NativeSyntheticEvent<NativeScrollEvent>,
	) => {
		const nextTab =
			SEARCH_TABS[
				Math.min(
					SEARCH_TABS.length - 1,
					Math.max(
						0,
						Math.round(event.nativeEvent.contentOffset.x / pageWidth),
					),
				)
			];
		if (nextTab && nextTab.key !== activeTab) onChangeTab(nextTab.key);
	};

	const refreshActiveTab = async () => {
		const queryKey =
			activeTab === "notes"
				? notesQueryKey
				: activeTab === "users"
					? usersQueryKey
					: topicsQueryKey;
		setIsManuallyRefreshing(true);
		try {
			await queryClient.resetQueries({ queryKey });
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	const toggleFollow = (item: ProfileUser) => {
		if (currentUserId === item.id) return;
		fireHaptic();
		socialActions.toggleFollow(
			{
				active: item.isFollowing,
				count: item.followerCount,
				userId: item.id,
			},
			{ redirectTo: "/search" },
		);
	};

	const openTopic = (topicId: string) => {
		router.push({
			pathname: "/topic/[id]",
			params: { id: topicId },
		} as unknown as Href);
	};

	const notePage = (
		<FlashList
			style={{
				alignSelf: "center",
				flex: 1,
				width: "100%",
				maxWidth: 576,
			}}
			data={noteResults}
			keyExtractor={(item) => item.id}
			numColumns={2}
			masonry
			optimizeItemArrangement={false}
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
			refreshing={isManuallyRefreshing}
			onRefresh={() => {
				void refreshActiveTab();
			}}
			onEndReached={() => {
				if (
					notes.hasNextPage &&
					!notes.isFetchingNextPage &&
					!notes.isFetching
				) {
					void notes.fetchNextPage();
				}
			}}
			onEndReachedThreshold={0.4}
			contentContainerStyle={{
				paddingTop: 8,
				paddingHorizontal: 4,
				paddingBottom: contentBottomPadding,
			}}
			renderItem={({ item }) => (
				<View className="px-1 pb-2">
					<NoteCard compact note={item} />
				</View>
			)}
			ListFooterComponent={
				<PagingFooter
					hasItems={noteResults.length > 0}
					hasMore={Boolean(notes.hasNextPage)}
					isLoading={notes.isFetchingNextPage}
				/>
			}
			ListEmptyComponent={
				notes.isLoading ? (
					<FeedSkeleton />
				) : notes.isError ? (
					<ErrorState onRetry={() => notes.refetch()} />
				) : (
					<EmptyState
						icon="images-outline"
						title="没有匹配的图文"
						description="试试其他标题、正文或话题关键词。"
					/>
				)
			}
		/>
	);

	const userPage = (
		<FlatList
			className="mx-auto w-full max-w-xl"
			data={userResults}
			keyExtractor={(item) => item.id}
			showsVerticalScrollIndicator={false}
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
			refreshing={isManuallyRefreshing}
			onRefresh={() => {
				void refreshActiveTab();
			}}
			onEndReached={() => {
				if (
					users.hasNextPage &&
					!users.isFetchingNextPage &&
					!users.isFetching
				) {
					void users.fetchNextPage();
				}
			}}
			onEndReachedThreshold={0.4}
			contentContainerStyle={{
				paddingBottom: contentBottomPadding,
			}}
			ItemSeparatorComponent={ListSeparator}
			renderItem={({ item }) => {
				const followState = socialActions.optimistic.follow(
					item.id,
					item.isFollowing,
					item.followerCount,
				);
				return (
					<UserResultRow
						currentUserId={currentUserId}
						item={{
							...item,
							followerCount: followState.count ?? item.followerCount,
							isFollowing: followState.active,
						}}
						onToggleFollow={toggleFollow}
					/>
				);
			}}
			ListFooterComponent={
				<PagingFooter
					hasItems={userResults.length > 0}
					hasMore={Boolean(users.hasNextPage)}
					isLoading={users.isFetchingNextPage}
				/>
			}
			ListEmptyComponent={
				users.isLoading ? (
					<View className="items-center py-16">
						<Spinner />
					</View>
				) : users.isError ? (
					<ErrorState onRetry={() => users.refetch()} />
				) : (
					<EmptyState
						icon="person-outline"
						title="没有匹配的用户"
						description="试试其他名字、用户名或简介关键词。"
					/>
				)
			}
		/>
	);

	const topicPage = (
		<FlatList
			className="mx-auto w-full max-w-xl"
			data={topicResults}
			keyExtractor={(item) => item.id}
			showsVerticalScrollIndicator={false}
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
			refreshing={isManuallyRefreshing}
			onRefresh={() => {
				void refreshActiveTab();
			}}
			onEndReached={() => {
				if (
					topics.hasNextPage &&
					!topics.isFetchingNextPage &&
					!topics.isFetching
				) {
					void topics.fetchNextPage();
				}
			}}
			onEndReachedThreshold={0.4}
			contentContainerStyle={{
				paddingBottom: contentBottomPadding,
			}}
			ItemSeparatorComponent={ListSeparator}
			renderItem={({ item }) => (
				<TopicResultRow item={item} onPress={openTopic} />
			)}
			ListFooterComponent={
				<PagingFooter
					hasItems={topicResults.length > 0}
					hasMore={Boolean(topics.hasNextPage)}
					isLoading={topics.isFetchingNextPage}
				/>
			}
			ListEmptyComponent={
				topics.isLoading ? (
					<View className="items-center py-16">
						<Spinner />
					</View>
				) : topics.isError ? (
					<ErrorState onRetry={() => topics.refetch()} />
				) : (
					<EmptyState
						icon="pricetag-outline"
						title="没有匹配的话题"
						description="试试其他话题名称。"
					/>
				)
			}
		/>
	);

	return (
		<Animated.ScrollView
			ref={pagerRef}
			horizontal
			bounces={false}
			className="flex-1"
			decelerationRate="fast"
			disableIntervalMomentum
			keyboardDismissMode="on-drag"
			pagingEnabled
			scrollEventThrottle={16}
			showsHorizontalScrollIndicator={false}
			onMomentumScrollEnd={finishPagerScroll}
			onScroll={onPagerScroll}
		>
			{[notePage, userPage, topicPage].map((page, index) => (
				<View
					key={SEARCH_TABS[index]?.key}
					className="flex-1 bg-background"
					style={{ width: pageWidth }}
				>
					{page}
				</View>
			))}
		</Animated.ScrollView>
	);
}

function PagingFooter({
	hasItems,
	hasMore,
	isLoading,
}: {
	hasItems: boolean;
	hasMore: boolean;
	isLoading: boolean;
}) {
	if (!hasItems) return null;

	if (isLoading) {
		return (
			<View className="items-center py-5">
				<Spinner size="sm" />
			</View>
		);
	}

	if (!hasMore) {
		return (
			<View className="items-center py-5">
				<Typography.Paragraph type="body-xs" color="muted">
					没有更多了
				</Typography.Paragraph>
			</View>
		);
	}

	return <View className="h-5" />;
}
