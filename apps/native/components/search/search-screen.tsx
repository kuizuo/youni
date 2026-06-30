import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
	Avatar,
	Button,
	PressableFeedback,
	SearchField,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const QUICK_WORDS = [
	"摄影",
	"旅行",
	"美食",
	"设计",
	"穿搭",
	"校园",
	"生活方式",
	"创作者",
	"咖啡",
] as const;

const SEARCH_HISTORY_LIMIT = 8;
const SEARCH_HISTORY_STORAGE_KEY = "youni.search.history";

type UserSearchItem = {
	id: string;
	name: string;
	email: string;
	image: null | string;
	handle: null | string;
	bio: null | string;
	noteCount: number;
	followerCount: number;
	followingCount: number;
	likedCount: number;
	isFollowing: boolean;
};

let searchHistoryCache: string[] = [];
let hasLoadedSearchHistory = false;

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function readSearchHistoryValue(value: unknown) {
	if (!Array.isArray(value)) return [];
	return uniqueWords(
		value.filter((item): item is string => typeof item === "string"),
		SEARCH_HISTORY_LIMIT,
	);
}

async function loadSearchHistory() {
	if (hasLoadedSearchHistory) return searchHistoryCache;

	try {
		const value = await SecureStore.getItemAsync(SEARCH_HISTORY_STORAGE_KEY);
		if (!value) return searchHistoryCache;

		searchHistoryCache = readSearchHistoryValue(JSON.parse(value));
		return searchHistoryCache;
	} catch {
		return searchHistoryCache;
	} finally {
		hasLoadedSearchHistory = true;
	}
}

function persistSearchHistory(items: string[]) {
	searchHistoryCache = items;

	const writeHistory =
		items.length > 0
			? SecureStore.setItemAsync(
					SEARCH_HISTORY_STORAGE_KEY,
					JSON.stringify(items),
				)
			: SecureStore.deleteItemAsync(SEARCH_HISTORY_STORAGE_KEY);

	void writeHistory.catch(() => undefined);
}

export default function SearchScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		actionAt?: string | string[];
		keyword?: string | string[];
		source?: string | string[];
	}>();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");
	const handledExternalSearch = useRef<string | null>(null);
	const historyRevision = useRef(0);
	const [keyword, setKeyword] = useState("");
	const [activeKeyword, setActiveKeyword] = useState("");
	const [recentWords, setRecentWords] = useState<string[]>(searchHistoryCache);
	const [isEditingHistory, setIsEditingHistory] = useState(false);
	const [pendingFollowId, setPendingFollowId] = useState<string | null>(null);
	const hasActiveSearch = activeKeyword.length > 0;
	const normalizedKeyword = keyword.trim();
	const canSubmitKeyword = normalizedKeyword.length > 0;
	const input = useMemo(
		() => ({ keyword: activeKeyword || undefined, limit: 40 }),
		[activeKeyword],
	);
	const users = useQuery({
		...orpc.social.searchUsers.queryOptions({ input }),
		enabled: hasActiveSearch,
	});
	const results = (users.data ?? []) as UserSearchItem[];
	const quickWords = useMemo(
		() => uniqueWords([...recentWords, ...QUICK_WORDS], 12),
		[recentWords],
	);
	const currentUserId = session.data?.user?.id;

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

	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: (result) => {
				queryClient.refetchQueries();
				toast.show({ label: result.following ? "已关注" : "已取消关注" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onSettled: () => {
				setPendingFollowId(null);
			},
		}),
	);

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

	const requireLogin = () => {
		if (session.data?.user) return true;
		router.push(getLoginHref("/search"));
		return false;
	};

	const toggleFollow = (userId: string) => {
		if (currentUserId === userId || !requireLogin()) return;
		fireHaptic();
		setPendingFollowId(userId);
		followMutation.mutate({ userId });
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
								placeholder="搜索用户"
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

				<View className="h-11 flex-row items-end">
					<View className="flex-1 items-center justify-end gap-2">
						<Text.Paragraph weight="semibold" className="text-foreground">
							用户
						</Text.Paragraph>
						<View
							className="h-1 w-14 rounded-full"
							style={{ backgroundColor: accentColor }}
						/>
					</View>
				</View>
			</View>

			{hasActiveSearch ? (
				<FlatList
					className="mx-auto w-full max-w-xl"
					data={results}
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					refreshing={users.isRefetching}
					onRefresh={() => {
						users.refetch();
					}}
					contentContainerStyle={{
						paddingBottom: insets.bottom + 28,
					}}
					ListHeaderComponent={
						<SearchResultHeader
							activeKeyword={activeKeyword}
							isFetching={users.isFetching}
							resultCount={results.length}
						/>
					}
					renderItem={({ item }) => (
						<UserResultRow
							currentUserId={currentUserId}
							isPending={pendingFollowId === item.id}
							item={item}
							onToggleFollow={toggleFollow}
						/>
					)}
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

function SearchResultHeader({
	activeKeyword,
	isFetching,
	resultCount,
}: {
	activeKeyword: string;
	isFetching: boolean;
	resultCount: number;
}) {
	return (
		<View className="gap-1 border-border-tertiary border-b px-4 py-4">
			<Text.Paragraph weight="semibold" className="text-foreground">
				{activeKeyword}
			</Text.Paragraph>
			<Text.Paragraph type="body-xs" color="muted">
				{isFetching
					? "正在搜索用户"
					: resultCount > 0
						? `找到 ${resultCount} 位用户`
						: "暂无相关用户"}
			</Text.Paragraph>
		</View>
	);
}

function UserResultRow({
	currentUserId,
	isPending,
	item,
	onToggleFollow,
}: {
	currentUserId?: string;
	isPending: boolean;
	item: UserSearchItem;
	onToggleFollow: (userId: string) => void;
}) {
	const router = useRouter();
	const mutedColor = useThemeColor("muted");
	const isSelf = currentUserId === item.id;
	const secondaryName = item.handle ? `@${item.handle}` : "未设置用户名";

	const openProfile = () => {
		router.push({
			pathname: "/user/[id]",
			params: { id: item.id },
		} as unknown as Href);
	};

	return (
		<View className="flex-row items-start gap-3 border-border-tertiary border-b px-4 py-4">
			<PressableFeedback
				accessibilityRole="button"
				accessibilityLabel={`查看 ${item.name} 的主页`}
				className="min-w-0 flex-1 flex-row items-start gap-3"
				onPress={openProfile}
			>
				<Avatar size="md" alt={item.name}>
					{item.image ? <Avatar.Image source={{ uri: item.image }} /> : null}
					<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
				</Avatar>

				<View className="min-w-0 flex-1 gap-1">
					<View className="gap-0.5">
						<Text.Paragraph
							weight="semibold"
							numberOfLines={1}
							className="text-foreground"
						>
							{item.name}
						</Text.Paragraph>
						<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
							{secondaryName}
						</Text.Paragraph>
					</View>

					{item.bio ? (
						<Text.Paragraph
							type="body-sm"
							numberOfLines={2}
							className="text-foreground leading-5"
						>
							{item.bio}
						</Text.Paragraph>
					) : null}

					<View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
						<UserMetric label="作品" value={item.noteCount} />
						<UserMetric label="粉丝" value={item.followerCount} />
						<View className="flex-row items-center gap-1">
							<Ionicons name="heart-outline" size={14} color={mutedColor} />
							<Text.Paragraph type="body-xs" color="muted">
								{formatCount(item.likedCount)}
							</Text.Paragraph>
						</View>
					</View>
				</View>
			</PressableFeedback>

			{isSelf ? (
				<Button
					size="sm"
					variant="secondary"
					className="rounded-full px-3"
					feedbackVariant="scale-ripple"
					onPress={() => router.push("/me" as Href)}
				>
					<Button.Label>我</Button.Label>
				</Button>
			) : (
				<Button
					size="sm"
					variant={item.isFollowing ? "secondary" : "primary"}
					className="rounded-full px-4"
					feedbackVariant="scale-ripple"
					isDisabled={isPending}
					onPress={() => onToggleFollow(item.id)}
				>
					<Button.Label>{item.isFollowing ? "已关注" : "关注"}</Button.Label>
				</Button>
			)}
		</View>
	);
}

function UserMetric({ label, value }: { label: string; value: number }) {
	return (
		<Text.Paragraph type="body-xs" color="muted">
			{formatCount(value)} {label}
		</Text.Paragraph>
	);
}

function SearchHome({
	bottomInset,
	isEditingHistory,
	mutedColor,
	onClearHistory,
	onDeleteHistoryWord,
	onFinishEditingHistory,
	onPressWord,
	onStartEditingHistory,
	quickWords,
	recentWords,
}: {
	bottomInset: number;
	isEditingHistory: boolean;
	mutedColor: string;
	onClearHistory: () => void;
	onDeleteHistoryWord: (word: string) => void;
	onFinishEditingHistory: () => void;
	onPressWord: (word: string) => void;
	onStartEditingHistory: () => void;
	quickWords: readonly string[];
	recentWords: readonly string[];
}) {
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="mx-auto w-full max-w-xl gap-7 px-4 pt-5"
			contentContainerStyle={{ paddingBottom: bottomInset + 28 }}
			keyboardShouldPersistTaps="handled"
		>
			{recentWords.length > 0 ? (
				<View className="gap-3">
					<View className="flex-row items-center justify-between">
						<Text.Paragraph weight="semibold" className="text-foreground">
							历史记录
						</Text.Paragraph>
						{isEditingHistory ? (
							<View className="flex-row items-center gap-3">
								<Button
									size="sm"
									variant="ghost"
									className="h-9 rounded-full px-2"
									feedbackVariant="scale-ripple"
									accessibilityLabel="全部删除搜索历史"
									onPress={onClearHistory}
								>
									<Button.Label className="text-muted">全部删除</Button.Label>
								</Button>
								<View className="h-4 w-px bg-border" />
								<Button
									size="sm"
									variant="ghost"
									className="h-9 rounded-full px-2"
									feedbackVariant="scale-ripple"
									accessibilityLabel="完成编辑搜索历史"
									onPress={onFinishEditingHistory}
								>
									<Button.Label className="text-muted">完成</Button.Label>
								</Button>
							</View>
						) : (
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								className="h-9 w-9 rounded-full"
								accessibilityLabel="编辑搜索历史"
								onPress={onStartEditingHistory}
							>
								<Ionicons name="trash-outline" size={17} color={mutedColor} />
							</Button>
						)}
					</View>
					<WordWrap
						isEditing={isEditingHistory}
						words={recentWords}
						onDeleteWord={onDeleteHistoryWord}
						onPressWord={onPressWord}
					/>
				</View>
			) : null}

			<View className="gap-3">
				<Text.Paragraph weight="semibold" className="text-foreground">
					推荐搜索
				</Text.Paragraph>
				<WordWrap words={quickWords} onPressWord={onPressWord} />
			</View>
		</ScrollView>
	);
}

function WordWrap({
	isEditing = false,
	onDeleteWord,
	onPressWord,
	words,
}: {
	isEditing?: boolean;
	onDeleteWord?: (word: string) => void;
	onPressWord: (word: string) => void;
	words: readonly string[];
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View className="flex-row flex-wrap gap-2">
			{words.map((item) =>
				isEditing ? (
					<View
						key={item}
						className="h-10 flex-row items-center rounded-full border border-border bg-content2 pr-1 pl-4"
					>
						<Text.Paragraph numberOfLines={1} className="text-foreground">
							{item}
						</Text.Paragraph>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel={`删除搜索历史 ${item}`}
							onPress={() => onDeleteWord?.(item)}
						>
							<Ionicons name="close-outline" size={17} color={mutedColor} />
						</Button>
					</View>
				) : (
					<Button
						key={item}
						size="sm"
						variant="secondary"
						className="rounded-full px-4"
						feedbackVariant="scale-ripple"
						onPress={() => onPressWord(item)}
					>
						<Button.Label>{item}</Button.Label>
					</Button>
				),
			)}
		</View>
	);
}

function uniqueWords(values: readonly string[], limit: number) {
	const words: string[] = [];
	for (const value of values) {
		const word = value.trim();
		if (word && !words.includes(word)) {
			words.push(word);
		}
	}
	return words.slice(0, limit);
}

function formatCount(value: number) {
	if (value >= 10000) {
		const formatted =
			value >= 100000
				? String(Math.round(value / 10000))
				: (value / 10000).toFixed(1).replace(/\.0$/, "");
		return `${formatted}万`;
	}
	return String(value);
}
