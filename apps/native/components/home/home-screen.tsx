import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, View, type ViewToken } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DiscoverNoteActionsSheet } from "@/components/home/discover-note-actions-sheet";
import { HomeEmptyState } from "@/components/home/empty";
import { DiscoverFooter } from "@/components/home/footer";
import { HomeTopBar } from "@/components/home/top-bar";
import { DISCOVER_PAGE_SIZE, type HomeTab } from "@/components/home/types";
import { NoteCard, type NoteCardNote } from "@/components/note-card";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { useAppToast } from "@/utils/app-toast";
import { client, orpc, queryClient } from "@/utils/orpc";
import { flattenPages } from "@/utils/pagination";

export default function HomeScreen() {
	const socialNavigation = useSocialNavigation();
	const { toast } = useAppToast();
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState<HomeTab>("discover");
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [selectedDiscoverNote, setSelectedDiscoverNote] =
		useState<NoteCardNote | null>(null);
	const [hiddenNoteIds, setHiddenNoteIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [hiddenAuthorIds, setHiddenAuthorIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [guestOpenedNoteIds, setGuestOpenedNoteIds] = useState<Set<string>>(
		() => new Set(),
	);
	const recordedImpressionsRef = useRef(new Set<string>());
	const guestOpenedNoteIdsRef = useRef(new Set<string>());
	const [cachedFollowingFeed, setCachedFollowingFeed] = useState<{
		notes: NoteCardNote[];
		userId: string;
	} | null>(null);
	const sessionUserId = socialNavigation.currentUserId;
	const input = useMemo(() => ({ limit: 30 }), []);
	const discoverQueryKey = useMemo(
		() => nativeQueryKeys.home.discover(sessionUserId ?? "guest"),
		[sessionUserId],
	);
	const discoverFeed = useInfiniteQuery({
		queryKey: discoverQueryKey,
		queryFn: ({ pageParam }) =>
			client.notes.feed({
				cursor: pageParam,
				limit: DISCOVER_PAGE_SIZE,
			}),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});
	const recordEvents = useMutation(
		orpc.notes.recordFeedEvents.mutationOptions(),
	);
	const notInterested = useMutation(
		orpc.notes.setNoteNotInterested.mutationOptions(),
	);
	const setBlocked = useMutation(orpc.profiles.setBlocked.mutationOptions());
	const followingFeed = useQuery({
		...orpc.notes.followingFeed.queryOptions({ input }),
		enabled: activeTab === "following" && Boolean(sessionUserId),
	});
	const discoverNotes = useMemo(() => {
		return flattenPages<NoteCardNote>(discoverFeed.data?.pages).filter(
			(item) =>
				!hiddenNoteIds.has(item.id) &&
				!hiddenAuthorIds.has(item.author.id) &&
				!guestOpenedNoteIds.has(item.id),
		);
	}, [
		discoverFeed.data?.pages,
		guestOpenedNoteIds,
		hiddenAuthorIds,
		hiddenNoteIds,
	]);
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
	const isFollowingGuest = activeTab === "following" && !sessionUserId;
	const refreshActiveFeed = async () => {
		setIsManuallyRefreshing(true);
		try {
			if (activeTab === "following") {
				await followingFeed.refetch();
				return;
			}
			const refreshedPage = await client.notes.feed({
				limit: DISCOVER_PAGE_SIZE,
			});
			setGuestOpenedNoteIds(
				sessionUserId ? new Set() : new Set(guestOpenedNoteIdsRef.current),
			);
			setHiddenNoteIds(new Set());
			recordedImpressionsRef.current.clear();
			queryClient.setQueryData(discoverQueryKey, {
				pageParams: [undefined],
				pages: [refreshedPage],
			});
		} catch {
			toast.show({ label: "刷新失败，请稍后重试", variant: "danger" });
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	const recordDiscoverEvent = useCallback(
		(
			note: NoteCardNote,
			type:
				| "block_author"
				| "collect"
				| "impression"
				| "like"
				| "not_interested"
				| "open",
		) => {
			if (!sessionUserId) {
				if (type === "open") {
					guestOpenedNoteIdsRef.current.add(note.id);
					if (guestOpenedNoteIdsRef.current.size > 200) {
						const oldest = guestOpenedNoteIdsRef.current.values().next().value;
						if (oldest) guestOpenedNoteIdsRef.current.delete(oldest);
					}
				}
				return;
			}
			if (!note.feedContext) return;
			recordEvents.mutate({
				events: [
					{
						impressionId: note.feedContext.impressionId,
						noteId: note.id,
						position: note.feedContext.position,
						type,
					},
				],
			});
		},
		[recordEvents.mutate, sessionUserId],
	);

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: Array<ViewToken<NoteCardNote>> }) => {
			if (activeTab !== "discover") return;
			const events = viewableItems.flatMap((viewToken) => {
				const item = viewToken.item;
				if (!viewToken.isViewable || !item) return [];
				if (!sessionUserId) return [];
				const discoverContext = item.feedContext;
				if (
					!discoverContext ||
					recordedImpressionsRef.current.has(discoverContext.impressionId)
				) {
					return [];
				}
				recordedImpressionsRef.current.add(discoverContext.impressionId);
				return [
					{
						impressionId: discoverContext.impressionId,
						noteId: item.id,
						position: discoverContext.position,
						type: "impression" as const,
					},
				];
			});
			if (events.length > 0) recordEvents.mutate({ events });
		},
		[activeTab, recordEvents.mutate, sessionUserId],
	);

	const handleNotInterested = (note: NoteCardNote) => {
		setSelectedDiscoverNote(null);
		if (!socialNavigation.requireLogin("/")) return;
		setHiddenNoteIds((items) => new Set(items).add(note.id));
		notInterested.mutate(
			{
				impressionId: note.feedContext?.impressionId,
				noteId: note.id,
				notInterested: true,
			},
			{
				onError: () => {
					setHiddenNoteIds((items) => {
						const next = new Set(items);
						next.delete(note.id);
						return next;
					});
				},
				onSuccess: () => {
					toast.show({
						actionLabel: "撤销",
						label: "已减少相似内容推荐",
						onActionPress: () => {
							setHiddenNoteIds((items) => {
								const next = new Set(items);
								next.delete(note.id);
								return next;
							});
							notInterested.mutate({
								noteId: note.id,
								notInterested: false,
							});
						},
						variant: "success",
					});
				},
			},
		);
	};

	const handleBlockAuthor = (note: NoteCardNote) => {
		setSelectedDiscoverNote(null);
		if (!socialNavigation.requireLogin("/")) return;
		Alert.alert(
			`拉黑 ${note.author.name}`,
			"你将不再看到该作者，双方也不能继续私信。可在设置中解除。",
			[
				{ text: "取消", style: "cancel" },
				{
					text: "确认拉黑",
					style: "destructive",
					onPress: () => {
						setHiddenAuthorIds((items) => new Set(items).add(note.author.id));
						setBlocked.mutate(
							{ blocked: true, userId: note.author.id },
							{
								onError: () => {
									setHiddenAuthorIds((items) => {
										const next = new Set(items);
										next.delete(note.author.id);
										return next;
									});
								},
								onSuccess: () => {
									recordDiscoverEvent(note, "block_author");
									void queryClient.invalidateQueries({ queryKey: ["home"] });
									void queryClient.invalidateQueries({ queryKey: ["search"] });
									toast.show({ label: "已拉黑该作者", variant: "success" });
								},
							},
						);
					},
				},
			],
		);
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
						<NoteCard
							compact
							note={item}
							onOpenDiscoverActions={
								activeTab === "discover" ? setSelectedDiscoverNote : undefined
							}
							onRecordDiscoverEvent={recordDiscoverEvent}
						/>
					</View>
				)}
				onViewableItemsChanged={onViewableItemsChanged}
				viewabilityConfig={{
					itemVisiblePercentThreshold: 50,
					minimumViewTime: 1_000,
				}}
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
			<DiscoverNoteActionsSheet
				isOpen={Boolean(selectedDiscoverNote)}
				note={selectedDiscoverNote}
				onBlockAuthor={handleBlockAuthor}
				onNotInterested={handleNotInterested}
				onRecordDiscoverEvent={recordDiscoverEvent}
				onOpenChange={(isOpen) => {
					if (!isOpen) setSelectedDiscoverNote(null);
				}}
			/>
		</View>
	);
}
