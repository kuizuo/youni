import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Button, Input, Text, useThemeColor } from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, RefreshControl, ScrollView, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";
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

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function SearchScreen() {
	const params = useLocalSearchParams<{
		actionAt?: string | string[];
		keyword?: string | string[];
		source?: string | string[];
	}>();
	const mutedColor = useThemeColor("muted");
	const handledExternalSearch = useRef<string | null>(null);
	const [keyword, setKeyword] = useState("");
	const [activeKeyword, setActiveKeyword] = useState("");
	const [recentWords, setRecentWords] = useState<string[]>([]);

	useEffect(() => {
		const nextKeyword = getRouteParam(params.keyword)?.trim();
		if (!nextKeyword) return;

		const source = getRouteParam(params.source) ?? "external";
		const actionAt = getRouteParam(params.actionAt) ?? "";
		const key = `${source}:${nextKeyword}:${actionAt}`;
		if (handledExternalSearch.current === key) return;

		handledExternalSearch.current = key;
		setKeyword(nextKeyword);
		setActiveKeyword(nextKeyword);
		setRecentWords((items) => uniqueWords([nextKeyword, ...items], 6));
	}, [params.actionAt, params.keyword, params.source]);

	const input = useMemo(
		() => ({ keyword: activeKeyword || undefined, limit: 40 }),
		[activeKeyword],
	);
	const feed = useQuery(orpc.social.feed.queryOptions({ input }));
	const results = feed.data ?? [];
	const feedItems = useMemo(() => createTwoColumnFeed(results), [results]);
	const normalizedKeyword = keyword.trim();
	const hasActiveSearch = activeKeyword.length > 0;
	const canSubmitKeyword =
		normalizedKeyword.length > 0 && normalizedKeyword !== activeKeyword;
	const searchActionLabel = canSubmitKeyword
		? "搜索"
		: hasActiveSearch
			? "取消"
			: null;
	const quickWords = useMemo(
		() => uniqueWords([...recentWords, ...QUICK_WORDS], 12),
		[recentWords],
	);

	const applyKeyword = (value: string) => {
		const nextKeyword = value.trim();
		setKeyword(nextKeyword);
		setActiveKeyword(nextKeyword);
		if (nextKeyword) {
			setRecentWords((items) => uniqueWords([nextKeyword, ...items], 6));
		}
	};

	const submitSearch = () => {
		applyKeyword(keyword);
	};

	const resetSearch = () => {
		setKeyword("");
		setActiveKeyword("");
	};

	return (
		<View className="flex-1 bg-background">
			<FlatList
				className="mx-auto w-full max-w-xl"
				data={feedItems}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperClassName="gap-3 px-3"
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="bg-background pt-3 pb-32"
				refreshControl={
					<RefreshControl
						refreshing={feed.isRefetching}
						onRefresh={() => feed.refetch()}
					/>
				}
				renderItem={({ item }) => (
					<View className="flex-1 basis-0">
						{item.type === "item" ? (
							<NoteCard compact note={item.item} />
						) : null}
					</View>
				)}
				ListHeaderComponent={
					<View className="gap-3 px-3 pb-3">
						<View className="flex-row items-center gap-2">
							<View className="min-w-0 flex-1">
								<Input
									value={keyword}
									onChangeText={setKeyword}
									placeholder="搜图文、话题、作者"
									placeholderTextColor={mutedColor}
									returnKeyType="search"
									onSubmitEditing={submitSearch}
									className="h-11 rounded-full bg-content2 pr-10 pl-10"
								/>
								<View className="pointer-events-none absolute top-0 left-3 h-11 items-center justify-center">
									<Ionicons
										name="search-outline"
										size={18}
										color={mutedColor}
									/>
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

							{searchActionLabel ? (
								<Button
									size="sm"
									variant={canSubmitKeyword ? "primary" : "ghost"}
									className="h-11 rounded-full px-4"
									feedbackVariant="scale-ripple"
									accessibilityLabel={
										canSubmitKeyword ? "执行搜索" : "取消搜索"
									}
									onPress={canSubmitKeyword ? submitSearch : resetSearch}
								>
									<Button.Label>{searchActionLabel}</Button.Label>
								</Button>
							) : null}
						</View>

						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerClassName="gap-2 pr-3"
						>
							{quickWords.map((item) => {
								const active = item === activeKeyword;
								return (
									<Button
										key={item}
										accessibilityState={active ? { selected: true } : undefined}
										size="sm"
										variant={active ? "primary" : "secondary"}
										className="rounded-full px-4"
										feedbackVariant="scale-ripple"
										onPress={() => applyKeyword(item)}
									>
										<Button.Label>{item}</Button.Label>
									</Button>
								);
							})}
						</ScrollView>

						<View className="flex-row items-center justify-between pt-1">
							<View className="min-w-0 flex-1 gap-0.5">
								<Text.Paragraph weight="semibold" className="text-foreground">
									{activeKeyword ? `关于「${activeKeyword}」` : "正在流行"}
								</Text.Paragraph>
								{activeKeyword ? (
									<Text.Paragraph type="body-xs" color="muted">
										{results.length > 0
											? `找到 ${results.length} 篇相关图文`
											: "暂无相关图文"}
									</Text.Paragraph>
								) : null}
							</View>
							{feed.isFetching ? (
								<Ionicons name="sync-outline" size={15} color={mutedColor} />
							) : null}
						</View>
					</View>
				}
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
							description="换个关键词，或者点上面的热门词继续逛。"
						/>
					)
				}
			/>
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
