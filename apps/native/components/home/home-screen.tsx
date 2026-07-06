import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
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
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { client, orpc, queryClient } from "@/utils/orpc";
import { flattenPages } from "@/utils/pagination";

export default function HomeScreen() {
	const socialNavigation = useSocialNavigation();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<HomeTab>("discover");
	const input = useMemo(() => ({ limit: 30 }), []);
	const discoverQueryKey = useMemo(() => ["home", "discover"] as const, []);
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
		enabled:
			activeTab === "following" && Boolean(socialNavigation.session.data?.user),
	});
	const discoverNotes = useMemo(
		() => flattenPages<HomeFeedNote>(discoverFeed.data?.pages),
		[discoverFeed.data?.pages],
	);
	const notes =
		activeTab === "following" ? (followingFeed.data ?? []) : discoverNotes;
	const isActiveLoading =
		activeTab === "following"
			? followingFeed.isLoading
			: discoverFeed.isLoading;
	const isActiveError =
		activeTab === "following" ? followingFeed.isError : discoverFeed.isError;
	const isActiveRefetching =
		activeTab === "following"
			? followingFeed.isRefetching
			: discoverFeed.isRefetching && !discoverFeed.isFetchingNextPage;
	const isFollowingGuest =
		activeTab === "following" && !socialNavigation.session.data?.user;

	return (
		<View className="flex-1 bg-background">
			<HomeTopBar
				activeTab={activeTab}
				topInset={insets.top}
				onSearch={() => socialNavigation.goTo({ type: "search" })}
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
				refreshing={isActiveRefetching}
				onRefresh={() => {
					if (activeTab === "following") {
						followingFeed.refetch();
						return;
					}
					void queryClient.resetQueries({ queryKey: discoverQueryKey });
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
