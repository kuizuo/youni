import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Platform,
	type ScrollView,
	useWindowDimensions,
	View,
	type ViewToken,
} from "react-native";
import Animated, {
	useAnimatedScrollHandler,
	useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DiscoverNoteActionsSheet } from "@/components/home/discover-note-actions-sheet";
import { HomeEmptyState } from "@/components/home/empty";
import { FollowingAuthorFilter } from "@/components/home/following-author-filter";
import { DiscoverFooter } from "@/components/home/footer";
import { HomeTopBar } from "@/components/home/top-bar";
import {
	DISCOVER_PAGE_SIZE,
	filterFollowingNotes,
	getHomeTabAtOffset,
	getNextFollowingAuthorId,
	HOME_TABS,
	type HomeTab,
} from "@/components/home/types";
import { NoteCard, type NoteCardNote } from "@/components/note-card";
import { EmptyState } from "@/components/social-states";
import { useTabReselect } from "@/lib/navigation/use-tab-reselect";
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { client, orpc, queryClient } from "@/utils/orpc";
import { flattenPages } from "@/utils/pagination";

export default function HomeScreen() {
	const socialNavigation = useSocialNavigation();
	const { toast } = useAppToast();
	const insets = useSafeAreaInsets();
	const { width: windowWidth } = useWindowDimensions();
	const [pageWidth, setPageWidth] = useState(windowWidth);
	const [activeTab, setActiveTab] = useState<HomeTab>("discover");
	const pagerRef = useRef<ScrollView>(null);
	const [initialPagerOffset] = useState(() => ({ x: pageWidth, y: 0 }));
	const pagerScrollX = useSharedValue(pageWidth);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [isFollowingAuthorStripActive, setIsFollowingAuthorStripActive] =
		useState(false);
	const [selectedFollowingAuthorId, setSelectedFollowingAuthorId] = useState<
		string | null
	>(null);
	const hasFocusedRef = useRef(false);
	const discoverListRef = useRef<FlashListRef<NoteCardNote>>(null);
	const followingListRef = useRef<FlashListRef<NoteCardNote>>(null);
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
		enabled: Boolean(sessionUserId),
	});
	const followingUsersQuery = useQuery({
		...orpc.profiles.connections.queryOptions({
			input: {
				limit: 60,
				type: "following",
				userId: sessionUserId ?? "missing",
			},
		}),
		enabled: Boolean(sessionUserId),
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
	const followingUsers = followingUsersQuery.data ?? [];
	const visibleFollowingNotes = useMemo(
		() => filterFollowingNotes(followingNotes, selectedFollowingAuthorId),
		[followingNotes, selectedFollowingAuthorId],
	);
	const selectedFollowingAuthorName =
		followingUsers.find((user) => user.id === selectedFollowingAuthorId)
			?.name ?? "该作者";
	useFocusEffect(
		useCallback(() => {
			if (!hasFocusedRef.current) {
				hasFocusedRef.current = true;
				return;
			}
			setSelectedFollowingAuthorId(null);
			setIsFollowingAuthorStripActive(false);
		}, []),
	);
	useEffect(() => {
		if (!sessionUserId) {
			if (selectedFollowingAuthorId) setSelectedFollowingAuthorId(null);
			return;
		}
		if (!selectedFollowingAuthorId || !followingUsersQuery.data) return;
		if (
			!followingUsersQuery.data.some(
				(user) => user.id === selectedFollowingAuthorId,
			)
		) {
			setSelectedFollowingAuthorId(null);
		}
	}, [followingUsersQuery.data, selectedFollowingAuthorId, sessionUserId]);
	const selectFollowingAuthor = useCallback((userId: string) => {
		fireHaptic();
		setSelectedFollowingAuthorId((current) =>
			getNextFollowingAuthorId(current, userId),
		);
		followingListRef.current?.scrollToOffset({ animated: true, offset: 0 });
	}, []);
	const selectTab = useCallback((tab: HomeTab) => {
		setActiveTab(tab);
	}, []);
	useEffect(() => {
		const activeIndex = HOME_TABS.findIndex((item) => item.id === activeTab);
		const nextOffset = Math.max(0, activeIndex) * pageWidth;
		pagerScrollX.value = nextOffset;
		pagerRef.current?.scrollTo({ animated: true, x: nextOffset });
	}, [activeTab, pageWidth, pagerScrollX]);
	const onPagerScroll = useAnimatedScrollHandler((event) => {
		pagerScrollX.value = event.contentOffset.x;
	});
	const handlePagerEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		setActiveTab(
			getHomeTabAtOffset(event.nativeEvent.contentOffset.x, pageWidth),
		);
	};
	const refreshFeed = async (tab: HomeTab) => {
		setIsManuallyRefreshing(true);
		try {
			if (tab === "following") {
				if (!sessionUserId) return;
				await Promise.all([
					followingFeed.refetch(),
					followingUsersQuery.refetch(),
				]);
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
	useTabReselect(() => {
		const listRef =
			activeTab === "following" ? followingListRef : discoverListRef;
		listRef.current?.scrollToOffset({ animated: true, offset: 0 });
		if (!isManuallyRefreshing) void refreshFeed(activeTab);
	});

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
		<View
			className="flex-1 bg-background"
			onLayout={(event) => {
				setPageWidth(Math.ceil(event.nativeEvent.layout.width));
			}}
		>
			<HomeTopBar
				activeTab={activeTab}
				pageWidth={pageWidth}
				pagerScrollX={pagerScrollX}
				topInset={insets.top}
				onTabChange={selectTab}
			/>
			<Animated.ScrollView
				ref={pagerRef}
				horizontal
				bounces={false}
				className="flex-1"
				contentOffset={initialPagerOffset}
				decelerationRate="fast"
				directionalLockEnabled
				disableIntervalMomentum
				nestedScrollEnabled
				pagingEnabled
				scrollEnabled={!isFollowingAuthorStripActive}
				scrollEventThrottle={16}
				showsHorizontalScrollIndicator={false}
				onMomentumScrollEnd={handlePagerEnd}
				onScroll={onPagerScroll}
				onScrollEndDrag={handlePagerEnd}
			>
				{HOME_TABS.map((tabItem) => {
					const tab = tabItem.id;
					const tabNotes =
						tab === "following" ? visibleFollowingNotes : discoverNotes;
					const isLoading =
						tab === "following"
							? followingFeed.isLoading
							: discoverFeed.isLoading;
					const isError =
						tab === "following" ? followingFeed.isError : discoverFeed.isError;
					const isFilteredEmpty =
						tab === "following" &&
						Boolean(selectedFollowingAuthorId) &&
						!isLoading &&
						!isError;

					return (
						<View key={tab} className="h-full" style={{ width: pageWidth }}>
							<FlashList
								ref={tab === "following" ? followingListRef : discoverListRef}
								style={{
									alignSelf: "center",
									flex: 1,
									maxWidth: 576,
									width: "100%",
								}}
								data={tabNotes}
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
												tab === "discover" ? setSelectedDiscoverNote : undefined
											}
											onRecordDiscoverEvent={recordDiscoverEvent}
										/>
									</View>
								)}
								onViewableItemsChanged={
									tab === "discover" ? onViewableItemsChanged : undefined
								}
								viewabilityConfig={{
									itemVisiblePercentThreshold: 50,
									minimumViewTime: 1_000,
								}}
								contentInsetAdjustmentBehavior="automatic"
								showsVerticalScrollIndicator={false}
								refreshing={isManuallyRefreshing && activeTab === tab}
								onRefresh={() => {
									void refreshFeed(tab);
								}}
								onEndReached={() => {
									if (
										tab === "discover" &&
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
								ListHeaderComponent={
									tab === "following" && sessionUserId ? (
										<FollowingAuthorFilter
											isLoading={followingUsersQuery.isLoading}
											selectedUserId={selectedFollowingAuthorId}
											users={followingUsers}
											onInteractionChange={setIsFollowingAuthorStripActive}
											onSelect={selectFollowingAuthor}
										/>
									) : null
								}
								ListFooterComponent={
									tab === "discover" ? (
										<DiscoverFooter
											hasItems={discoverNotes.length > 0}
											hasMore={Boolean(discoverFeed.hasNextPage)}
											isLoading={discoverFeed.isFetchingNextPage}
										/>
									) : null
								}
								ListEmptyComponent={
									isFilteredEmpty ? (
										<EmptyState
											icon="images-outline"
											title={
												"暂时没有看到 " +
												selectedFollowingAuthorName +
												" 的图文"
											}
											description="再次点击头像可恢复全部内容。"
										/>
									) : (
										<HomeEmptyState
											activeTab={tab}
											isError={isError}
											isFollowingGuest={tab === "following" && !sessionUserId}
											isLoading={isLoading}
											socialNavigation={socialNavigation}
											onDiscover={() => selectTab("discover")}
											onRetry={() => {
												if (tab === "following") {
													followingFeed.refetch();
													return;
												}
												discoverFeed.refetch();
											}}
										/>
									)
								}
							/>
						</View>
					);
				})}
			</Animated.ScrollView>
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
