import { useQuery } from "@tanstack/react-query";
import type { SearchSource } from "@youni/api/contracts/search-discovery";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SearchHeader } from "@/components/search/header";
import { SearchHome } from "@/components/search/home";
import { SearchResults } from "@/components/search/results";
import {
	getCachedSearchHistory,
	loadSearchHistory,
	persistSearchHistory,
	SEARCH_HISTORY_LIMIT,
	type SearchTabKey,
	uniqueWords,
} from "@/components/search/search-utils";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, orpc } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

export default function SearchScreen() {
	const params = useLocalSearchParams<{
		actionAt?: string | string[];
		keyword?: string | string[];
		source?: string | string[];
	}>();
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const [pageWidth, setPageWidth] = useState(dimensions.width);
	const pagerScrollX = useSharedValue(0);
	const handledExternalSearch = useRef<string | null>(null);
	const historyRevision = useRef(0);
	const [keyword, setKeyword] = useState("");
	const [activeKeyword, setActiveKeyword] = useState("");
	const [activeTab, setActiveTab] = useState<SearchTabKey>("notes");
	const [recentWords, setRecentWords] = useState<string[]>(
		getCachedSearchHistory(),
	);
	const [isEditingHistory, setIsEditingHistory] = useState(false);
	const recommendations = useQuery({
		...orpc.searchDiscovery.recommendations.queryOptions({
			input: { limit: 12 },
		}),
		staleTime: 5 * 60 * 1_000,
	});
	const hasActiveSearch = activeKeyword.length > 0;
	const normalizedKeyword = keyword.trim();
	const canSubmitKeyword = normalizedKeyword.length > 0;
	const quickWords = uniqueWords(
		(recommendations.data?.items ?? []).filter(
			(item) => !recentWords.includes(item),
		),
		12,
	);
	const contentBottomPadding =
		process.env.EXPO_OS === "ios" ? insets.bottom + 28 : 128;

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
		(value: string, source: SearchSource = "typed") => {
			const nextKeyword = value.trim();
			if (!nextKeyword) return;

			fireHaptic();
			setKeyword(nextKeyword);
			setActiveKeyword(nextKeyword);
			setActiveTab("notes");
			pagerScrollX.value = 0;
			updateRecentWords((items) =>
				uniqueWords([nextKeyword, ...items], SEARCH_HISTORY_LIMIT),
			);
			void client.searchDiscovery
				.record({ keyword: nextKeyword, source })
				.catch(() => undefined);
		},
		[pagerScrollX, updateRecentWords],
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
		applyKeyword(nextKeyword, "external");
	}, [applyKeyword, params.actionAt, params.keyword, params.source]);

	const submitSearch = () => {
		applyKeyword(keyword, "typed");
	};

	const clearSearch = () => {
		fireHaptic();
		setKeyword("");
		setActiveKeyword("");
		setActiveTab("notes");
		pagerScrollX.value = 0;
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

	return (
		<View
			className="flex-1 bg-background"
			onLayout={(event) => {
				setPageWidth(Math.ceil(event.nativeEvent.layout.width));
			}}
		>
			<SearchHeader
				activeTab={activeTab}
				canSubmitKeyword={canSubmitKeyword}
				hasActiveSearch={hasActiveSearch}
				keyword={keyword}
				pageWidth={pageWidth}
				pagerScrollX={pagerScrollX}
				topInset={insets.top}
				onChangeKeyword={setKeyword}
				onChangeTab={setActiveTab}
				onClearSearch={clearSearch}
				onSubmitSearch={submitSearch}
			/>

			{hasActiveSearch ? (
				<SearchResults
					activeKeyword={activeKeyword}
					activeTab={activeTab}
					contentBottomPadding={contentBottomPadding}
					pageWidth={pageWidth}
					pagerScrollX={pagerScrollX}
					onChangeTab={setActiveTab}
				/>
			) : (
				<SearchHome
					contentBottomPadding={contentBottomPadding}
					isEditingHistory={isEditingHistory}
					quickWords={quickWords}
					recentWords={recentWords}
					onClearHistory={clearHistory}
					onDeleteHistoryWord={deleteHistoryWord}
					onFinishEditingHistory={finishEditingHistory}
					onPressHistoryWord={(word) => applyKeyword(word, "history")}
					onPressRecommendedWord={(word) => applyKeyword(word, "recommended")}
					onStartEditingHistory={startEditingHistory}
				/>
			)}
		</View>
	);
}
