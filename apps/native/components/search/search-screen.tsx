import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, SearchField, Spinner, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import {
	PagingFooter,
	SearchHome,
	SearchTabs,
	TopicResultRow,
	UserResultRow,
} from "@/components/search/search-components";
import {
	flattenPages,
	getCachedSearchHistory,
	getRouteParam,
	loadSearchHistory,
	type NoteSearchItem,
	PAGE_SIZE,
	persistSearchHistory,
	QUICK_WORDS,
	SEARCH_HISTORY_LIMIT,
	type SearchTabKey,
	type TopicSearchItem,
	type UserSearchItem,
	uniqueWords,
} from "@/components/search/search-utils";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, queryClient } from "@/utils/orpc";

export default function SearchScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		actionAt?: string | string[];
		keyword?: string | string[];
		source?: string | string[];
	}>();
	const insets = useSafeAreaInsets();
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const handledExternalSearch = useRef<string | null>(null);
	const historyRevision = useRef(0);
	const [keyword, setKeyword] = useState("");
	const [activeKeyword, setActiveKeyword] = useState("");
	const [activeTab, setActiveTab] = useState<SearchTabKey>("notes");
	const [recentWords, setRecentWords] = useState<string[]>(
		getCachedSearchHistory(),
	);
	const [isEditingHistory, setIsEditingHistory] = useState(false);
	const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
	const hasActiveSearch = activeKeyword.length > 0;
	const normalizedKeyword = keyword.trim();
	const canSubmitKeyword = normalizedKeyword.length > 0;
	const notesQueryKey = useMemo(
		() => ["search", "notes", activeKeyword] as const,
		[activeKeyword],
	);
	const usersQueryKey = useMemo(
		() => ["search", "users", activeKeyword] as const,
		[activeKeyword],
	);
	const topicsQueryKey = useMemo(
		() => ["search", "topics", activeKeyword] as const,
		[activeKeyword],
	);
	const notes = useInfiniteQuery({
		queryKey: notesQueryKey,
		queryFn: ({ pageParam }) =>
			client.searchNotes({
				keyword: activeKeyword,
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: hasActiveSearch,
	});
	const users = useInfiniteQuery({
		queryKey: usersQueryKey,
		queryFn: ({ pageParam }) =>
			client.searchUsersPage({
				keyword: activeKeyword,
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: hasActiveSearch && activeTab === "users",
	});
	const topics = useInfiniteQuery({
		queryKey: topicsQueryKey,
		queryFn: ({ pageParam }) =>
			client.searchTopics({
				keyword: activeKeyword,
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: hasActiveSearch && activeTab === "topics",
	});
	const noteResults = useMemo(
		() => flattenPages<NoteSearchItem>(notes.data?.pages),
		[notes.data?.pages],
	);
	const userResults = useMemo(
		() => flattenPages<UserSearchItem>(users.data?.pages),
		[users.data?.pages],
	);
	const topicResults = useMemo(
		() => flattenPages<TopicSearchItem>(topics.data?.pages),
		[topics.data?.pages],
	);
	const quickWords = useMemo(
		() => uniqueWords([...recentWords, ...QUICK_WORDS], 12),
		[recentWords],
	);
	const currentUserId = socialActions.currentUserId;

	const updateRecentWords = useCallback(
		(updater: (items: string[]) => string[]) => {
			historyRevision.current += 1;
			setRecentWords((items) => {
				const nextItems = updater(items);
				persistSearchHistory(nextItems);
				return nextItems;
			});
		},
		[],
	);

	const applyKeyword = useCallback(
		(value: string) => {
			const nextKeyword = value.trim();
			if (!nextKeyword) return;

			fireHaptic();
			setKeyword(nextKeyword);
			setActiveKeyword(nextKeyword);
			setActiveTab("notes");
			updateRecentWords((items) =>
				uniqueWords([nextKeyword, ...items], SEARCH_HISTORY_LIMIT),
			);
		},
		[updateRecentWords],
	);

	useEffect(() => {
		let isMounted = true;
		const revision = historyRevision.current;

		loadSearchHistory().then((items) => {
			if (!isMounted || historyRevision.current !== revision) return;
			setRecentWords(items);
		});

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (recentWords.length === 0) {
			setIsEditingHistory(false);
		}
	}, [recentWords.length]);

	useEffect(() => {
		const nextKeyword = getRouteParam(params.keyword)?.trim();
		if (!nextKeyword) return;

		const source = getRouteParam(params.source) ?? "external";
		const actionAt = getRouteParam(params.actionAt) ?? "";
		const key = `${source}:${nextKeyword}:${actionAt}`;
		if (handledExternalSearch.current === key) return;

		handledExternalSearch.current = key;
		applyKeyword(nextKeyword);
	}, [applyKeyword, params.actionAt, params.keyword, params.source]);

	const goBack = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/" as Href);
	};

	const submitSearch = () => {
		applyKeyword(keyword);
	};

	const clearSearch = () => {
		fireHaptic();
		setKeyword("");
		setActiveKeyword("");
		setActiveTab("notes");
	};

	const startEditingHistory = () => {
		fireHaptic();
		setIsEditingHistory(true);
	};

	const finishEditingHistory = () => {
		fireHaptic();
		setIsEditingHistory(false);
	};

	const deleteHistoryWord = (word: string) => {
		fireHaptic();
		updateRecentWords((items) => items.filter((item) => item !== word));
	};

	const clearHistory = () => {
		if (recentWords.length === 0) return;

		Alert.alert("全部删除历史记录", "删除后不能恢复。", [
			{ text: "取消", style: "cancel" },
			{
				text: "全部删除",
				style: "destructive",
				onPress: () => {
					fireHaptic();
					updateRecentWords(() => []);
				},
			},
		]);
	};

	const toggleFollow = (userId: string) => {
		if (currentUserId === userId) return;
		fireHaptic();
		setPendingFollowId(userId);
		const started = socialActions.toggleFollow(
			{ userId },
			{
				onSettled: () => {
					setPendingFollowId(null);
				},
				redirectTo: "/search",
			},
		);
		if (!started) {
			setPendingFollowId(null);
		}
	};

	const openTopic = (topicId: string) => {
		router.push({
			pathname: "/topic/[id]",
			params: { id: topicId },
		} as unknown as Href);
	};

	const refreshActiveTab = () => {
		const queryKey =
			activeTab === "notes"
				? notesQueryKey
				: activeTab === "users"
					? usersQueryKey
					: topicsQueryKey;
		void queryClient.resetQueries({ queryKey });
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="mx-auto w-full max-w-xl border-border border-b bg-background px-3 pb-0"
				style={{ paddingTop: Math.max(insets.top, 8) + 6 }}
			>
				<View className="flex-row items-center gap-2 pb-3">
					<Button
						isIconOnly
						variant="ghost"
						className="h-11 w-11 rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="返回"
						onPress={goBack}
					>
						<Ionicons name="chevron-back" size={24} color={foregroundColor} />
					</Button>

					<SearchField
						value={keyword}
						onChange={setKeyword}
						className="min-w-0 flex-1"
					>
						<SearchField.Group>
							<SearchField.SearchIcon iconProps={{ color: mutedColor }} />
							<SearchField.Input
								autoFocus
								placeholder="搜索图文、用户和话题"
								placeholderTextColor={mutedColor}
								returnKeyType="search"
								className="h-11 rounded-full bg-content2"
								onSubmitEditing={submitSearch}
							/>
							<SearchField.ClearButton
								accessibilityLabel="清空搜索"
								iconProps={{ color: mutedColor }}
								onPress={clearSearch}
							/>
						</SearchField.Group>
					</SearchField>

					<Button
						size="sm"
						variant={canSubmitKeyword ? "primary" : "ghost"}
						className="h-11 rounded-full px-4"
						feedbackVariant="scale-ripple"
						accessibilityLabel="执行搜索"
						isDisabled={!canSubmitKeyword}
						onPress={submitSearch}
					>
						<Button.Label>搜索</Button.Label>
					</Button>
				</View>

				{hasActiveSearch ? (
					<SearchTabs activeTab={activeTab} onChange={setActiveTab} />
				) : null}
			</View>

			{hasActiveSearch ? (
				activeTab === "notes" ? (
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
						refreshing={notes.isRefetching && !notes.isFetchingNextPage}
						onRefresh={refreshActiveTab}
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
							paddingBottom: insets.bottom + 28,
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
								<ErrorState
									description="图文暂时没有加载出来，请检查网络后重试。"
									onRetry={() => notes.refetch()}
								/>
							) : (
								<EmptyState
									icon="images-outline"
									title="没有找到图文"
									description="换个标题、正文或话题关键词再试。"
								/>
							)
						}
					/>
				) : activeTab === "users" ? (
					<FlatList
						className="mx-auto w-full max-w-xl"
						data={userResults}
						keyExtractor={(item) => item.id}
						showsVerticalScrollIndicator={false}
						keyboardDismissMode="on-drag"
						keyboardShouldPersistTaps="handled"
						refreshing={users.isRefetching && !users.isFetchingNextPage}
						onRefresh={refreshActiveTab}
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
							paddingBottom: insets.bottom + 28,
						}}
						renderItem={({ item }) => (
							<UserResultRow
								currentUserId={currentUserId}
								isPending={pendingFollowId === item.id}
								item={item}
								onToggleFollow={toggleFollow}
							/>
						)}
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
								<ErrorState
									description="用户暂时没有加载出来，请检查网络后重试。"
									onRetry={() => users.refetch()}
								/>
							) : (
								<EmptyState
									icon="person-outline"
									title="没有找到用户"
									description="换个名字、用户名或简介关键词再试。"
								/>
							)
						}
					/>
				) : (
					<FlatList
						className="mx-auto w-full max-w-xl"
						data={topicResults}
						keyExtractor={(item) => item.id}
						showsVerticalScrollIndicator={false}
						keyboardDismissMode="on-drag"
						keyboardShouldPersistTaps="handled"
						refreshing={topics.isRefetching && !topics.isFetchingNextPage}
						onRefresh={refreshActiveTab}
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
							paddingBottom: insets.bottom + 28,
						}}
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
								<ErrorState
									description="话题暂时没有加载出来，请检查网络后重试。"
									onRetry={() => topics.refetch()}
								/>
							) : (
								<EmptyState
									icon="pricetag-outline"
									title="没有找到话题"
									description="换个话题名再试。"
								/>
							)
						}
					/>
				)
			) : (
				<SearchHome
					bottomInset={insets.bottom}
					isEditingHistory={isEditingHistory}
					mutedColor={mutedColor}
					quickWords={quickWords}
					recentWords={recentWords}
					onClearHistory={clearHistory}
					onDeleteHistoryWord={deleteHistoryWord}
					onFinishEditingHistory={finishEditingHistory}
					onPressWord={applyKeyword}
					onStartEditingHistory={startEditingHistory}
				/>
			)}
		</View>
	);
}
