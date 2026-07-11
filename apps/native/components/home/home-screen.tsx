import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HomeEmptyState } from "@/components/home/empty";
import { DiscoverFooter } from "@/components/home/footer";
import { HomeTopBar } from "@/components/home/top-bar";
import {
	DISCOVER_PAGE_SIZE,
	type HomeFeedNote,
	type HomeTab,
} from "@/components/home/types";
import { NoteCard } from "@/components/note-card";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { client, orpc } from "@/utils/orpc";
import { flattenPages } from "@/utils/pagination";

export default function HomeScreen() {
	const socialNavigation = useSocialNavigation();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<HomeTab>("discover");
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [cachedFollowingFeed, setCachedFollowingFeed] = useState<{
		notes: HomeFeedNote[];
		userId: string;
	} | null>(null);
	const sessionUserId = socialNavigation.session.data?.user?.id;
	const input = useMemo(() => ({ limit: 30 }), []);
	const discoverQueryKey = useMemo(() => nativeQueryKeys.home.discover(), []);
	const discoverFeed = useInfiniteQuery({
		queryKey: discoverQueryKey,
		queryFn: ({ pageParam }) =>
			client.searchNotes({
				limit: DISCOVER_PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
	});
	const followingFeed = useQuery({
		...orpc.followingFeed.queryOptions({ input }),
		enabled: activeTab === "following" && Boolean(sessionUserId),
	});
	const discoverNotes = useMemo(
		() => flattenPages<HomeFeedNote>(discoverFeed.data?.pages),
		[discoverFeed.data?.pages],
	);
	useEffect(() => {
		if (sessionUserId && followingFeed.data) {
			setCachedFollowingFeed({
				notes: followingFeed.data,
				userId: sessionUserId,
			});
		}
	}, [followingFeed.data, sessionUserId]);
	const cachedFollowingNotes =
		cachedFollowingFeed && cachedFollowingFeed.userId === sessionUserId
			? cachedFollowingFeed.notes
			: [];
	const followingNotes = sessionUserId
		? (followingFeed.data ?? cachedFollowingNotes)
		: [];
	const notes = activeTab === "following" ? followingNotes : discoverNotes;
	const isActiveLoading =
		activeTab === "following"
			? followingFeed.isLoading
			: discoverFeed.isLoading;
	const isActiveError =
		activeTab === "following" ? followingFeed.isError : discoverFeed.isError;
	const isFollowingGuest =
		activeTab === "following" && !socialNavigation.session.data?.user;
	const refreshActiveFeed = async () => {
		setIsManuallyRefreshing(true);
		try {
			if (activeTab === "following") {
				await followingFeed.refetch();
				return;
			}
			await discoverFeed.refetch();
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<HomeTopBar
				activeTab={activeTab}
				topInset={insets.top}
				onTabChange={setActiveTab}
			/>
			<FlashList
				style={{ alignSelf: "center", flex: 1, width: "100%", maxWidth: 576 }}
				data={notes}
				keyExtractor={(item) => item.id}
				numColumns={2}
				masonry
				optimizeItemArrangement={false}
				renderItem={({ item }) => (
					<View className="px-1 pb-2">
						<NoteCard compact note={item} />
					</View>
				)}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				refreshing={isManuallyRefreshing}
				onRefresh={() => {
					void refreshActiveFeed();
				}}
				onEndReached={() => {
					if (
						activeTab === "discover" &&
						discoverFeed.hasNextPage &&
						!discoverFeed.isFetchingNextPage &&
						!discoverFeed.isFetching
					) {
						void discoverFeed.fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				contentContainerStyle={{
					paddingTop: 8,
					paddingBottom: Platform.OS === "ios" ? 32 : 128,
					paddingHorizontal: 4,
				}}
				ListFooterComponent={
					activeTab === "discover" ? (
						<DiscoverFooter
							hasItems={discoverNotes.length > 0}
							hasMore={Boolean(discoverFeed.hasNextPage)}
							isLoading={discoverFeed.isFetchingNextPage}
						/>
					) : null
				}
				ListEmptyComponent={
					<HomeEmptyState
						activeTab={activeTab}
						isError={isActiveError}
						isFollowingGuest={isFollowingGuest}
						isLoading={isActiveLoading}
						socialNavigation={socialNavigation}
						onDiscover={() => setActiveTab("discover")}
						onRetry={() => {
							if (activeTab === "following") {
								followingFeed.refetch();
								return;
							}
							discoverFeed.refetch();
						}}
					/>
				}
			/>
		</View>
	);
}
