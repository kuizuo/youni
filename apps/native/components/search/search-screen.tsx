import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Input, Text, useThemeColor } from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { orpc } from "@/utils/orpc";

const QUICK_WORDS = [
	"穿搭",
	"咖啡",
	"周末",
	"旅行",
	"好物",
	"家居",
	"护肤",
	"摄影",
	"运动",
] as const;

let searchHistoryCache: string[] = [];

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function SearchScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		actionAt?: string | string[];
		keyword?: string | string[];
		source?: string | string[];
	}>();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const handledExternalSearch = useRef<string | null>(null);
	const [keyword, setKeyword] = useState("");
	const [activeKeyword, setActiveKeyword] = useState("");
	const [recentWords, setRecentWords] = useState<string[]>(searchHistoryCache);
	const hasActiveSearch = activeKeyword.length > 0;
	const normalizedKeyword = keyword.trim();
	const canSubmitKeyword = normalizedKeyword.length > 0;
	const input = useMemo(
		() => ({ keyword: activeKeyword || undefined, limit: 40 }),
		[activeKeyword],
	);
	const feed = useQuery({
		...orpc.social.feed.queryOptions({ input }),
		enabled: hasActiveSearch,
	});
	const results = feed.data ?? [];
	const quickWords = useMemo(
		() => uniqueWords([...recentWords, ...QUICK_WORDS], 12),
		[recentWords],
	);

	const applyKeyword = useCallback((value: string) => {
		const nextKeyword = value.trim();
		if (!nextKeyword) return;

		setKeyword(nextKeyword);
		setActiveKeyword(nextKeyword);
		setRecentWords((items) => {
			const nextItems = uniqueWords([nextKeyword, ...items], 8);
			searchHistoryCache = nextItems;
			return nextItems;
		});
	}, []);

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

	const clearKeyword = () => {
		setKeyword("");
		setActiveKeyword("");
	};

	const clearHistory = () => {
		searchHistoryCache = [];
		setRecentWords([]);
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="mx-auto w-full max-w-xl gap-3 border-border border-b px-3 pb-3"
				style={{ paddingTop: Math.max(insets.top, 8) + 6 }}
			>
				<View className="flex-row items-center gap-2">
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

					<View className="min-w-0 flex-1">
						<Input
							value={keyword}
							onChangeText={setKeyword}
							placeholder="搜索你感兴趣的内容"
							placeholderTextColor={mutedColor}
							returnKeyType="search"
							autoFocus
							onSubmitEditing={submitSearch}
							className="h-11 rounded-full bg-content2 pr-10 pl-10"
						/>
						<View className="pointer-events-none absolute top-0 left-3 h-11 items-center justify-center">
							<Ionicons name="search-outline" size={18} color={mutedColor} />
						</View>
						{keyword ? (
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								accessibilityLabel="清空输入"
								className="absolute top-1.5 right-1.5 h-8 w-8 rounded-full"
								feedbackVariant="scale-ripple"
								onPress={() => setKeyword("")}
							>
								<Ionicons name="close" size={15} color={mutedColor} />
							</Button>
						) : null}
					</View>

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
					<View className="flex-row items-center justify-between px-1">
						<View className="min-w-0 flex-1">
							<Text.Paragraph weight="semibold" className="text-foreground">
								关于「{activeKeyword}」
							</Text.Paragraph>
							<Text.Paragraph type="body-xs" color="muted">
								{feed.isFetching
									? "正在搜索"
									: results.length > 0
										? `找到 ${results.length} 篇相关图文`
										: "暂无相关图文"}
							</Text.Paragraph>
						</View>
						<Button
							size="sm"
							variant="ghost"
							className="rounded-full px-3"
							feedbackVariant="scale-ripple"
							onPress={clearKeyword}
						>
							<Button.Label>取消</Button.Label>
						</Button>
					</View>
				) : null}
			</View>

			{hasActiveSearch ? (
				<FlashList
					style={{ alignSelf: "center", width: "100%", maxWidth: 576 }}
					data={results}
					keyExtractor={(item) => item.id}
					numColumns={2}
					masonry
					optimizeItemArrangement={false}
					renderItem={({ item }) => (
						<View className="px-1 pb-2">
							<NoteCard compact note={item} />
						</View>
					)}
					showsVerticalScrollIndicator={false}
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					refreshing={feed.isRefetching}
					onRefresh={() => {
						feed.refetch();
					}}
					contentContainerStyle={{
						paddingTop: 8,
						paddingBottom: insets.bottom + 28,
						paddingHorizontal: 4,
					}}
					ListEmptyComponent={
						feed.isLoading ? (
							<FeedSkeleton />
						) : feed.isError ? (
							<ErrorState
								description="内容暂时没有加载出来，请检查网络后重试。"
								onRetry={() => feed.refetch()}
							/>
						) : (
							<EmptyState
								icon="search-outline"
								title="没有找到相关内容"
								description="换个关键词，或者点上面的推荐词继续逛。"
							/>
						)
					}
				/>
			) : (
				<SearchHome
					bottomInset={insets.bottom}
					mutedColor={mutedColor}
					quickWords={quickWords}
					recentWords={recentWords}
					onClearHistory={clearHistory}
					onPressWord={applyKeyword}
				/>
			)}
		</View>
	);
}

function SearchHome({
	bottomInset,
	mutedColor,
	onClearHistory,
	onPressWord,
	quickWords,
	recentWords,
}: {
	bottomInset: number;
	mutedColor: string;
	onClearHistory: () => void;
	onPressWord: (word: string) => void;
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
							搜索历史
						</Text.Paragraph>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="h-9 w-9 rounded-full"
							accessibilityLabel="清空搜索历史"
							onPress={onClearHistory}
						>
							<Ionicons name="trash-outline" size={17} color={mutedColor} />
						</Button>
					</View>
					<WordWrap words={recentWords} onPressWord={onPressWord} />
				</View>
			) : null}

			<View className="gap-3">
				<Text.Paragraph weight="semibold" className="text-foreground">
					猜你想搜
				</Text.Paragraph>
				<WordWrap words={quickWords} onPressWord={onPressWord} />
			</View>
		</ScrollView>
	);
}

function WordWrap({
	onPressWord,
	words,
}: {
	onPressWord: (word: string) => void;
	words: readonly string[];
}) {
	return (
		<View className="flex-row flex-wrap gap-2">
			{words.map((item) => (
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
			))}
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
