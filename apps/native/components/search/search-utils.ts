import * as SecureStore from "expo-secure-store";

import type { NoteCard } from "@/components/note-card";

export const QUICK_WORDS = [
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

export const PAGE_SIZE = 20;
export const SEARCH_HISTORY_LIMIT = 8;
export const SEARCH_TABS = [
	{ key: "notes", label: "图文" },
	{ key: "users", label: "用户" },
	{ key: "topics", label: "话题" },
] as const;

const SEARCH_HISTORY_STORAGE_KEY = "youni.search.history";

export type SearchTabKey = (typeof SEARCH_TABS)[number]["key"];
export type NoteSearchItem = Parameters<typeof NoteCard>[0]["note"];
export type UserSearchItem = {
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
export type TopicSearchItem = {
	id: string;
	name: string;
	noteCount: number;
	discussionCount: number;
};

let searchHistoryCache: string[] = [];
let hasLoadedSearchHistory = false;

export function uniqueWords(values: readonly string[], limit: number) {
	const words: string[] = [];
	for (const value of values) {
		const word = value.trim();
		if (word && !words.includes(word)) {
			words.push(word);
		}
	}
	return words.slice(0, limit);
}

function readSearchHistoryValue(value: unknown) {
	if (!Array.isArray(value)) return [];
	return uniqueWords(
		value.filter((item): item is string => typeof item === "string"),
		SEARCH_HISTORY_LIMIT,
	);
}

export function getCachedSearchHistory() {
	return searchHistoryCache;
}

export async function loadSearchHistory() {
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

export function persistSearchHistory(items: string[]) {
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
