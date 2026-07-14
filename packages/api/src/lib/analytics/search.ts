const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
const SEARCH_KEYWORD_MAX_LENGTH = 50;
const RECENT_WEIGHTS = [1, 0.85, 0.72, 0.61, 0.52, 0.44, 0.37] as const;

export type SearchAggregateRow = {
	day: string;
	keyword: string;
	successfulCount: number;
	totalCount: number;
};

export type SearchEntrySource =
	| "external"
	| "history"
	| "recommended"
	| "typed";

export function getSearchSourceCounts(source: SearchEntrySource) {
	return {
		externalCount: source === "external" ? 1 : 0,
		historyCount: source === "history" ? 1 : 0,
		recommendedCount: source === "recommended" ? 1 : 0,
		typedCount: source === "typed" ? 1 : 0,
	};
}

export async function selectAvailableRecommendedSearches(
	candidates: string[],
	limit: number,
	hasPublicResult: (keyword: string) => Promise<boolean>,
) {
	const items: string[] = [];
	for (
		let offset = 0;
		offset < candidates.length && items.length < limit;
		offset += Math.max(1, limit)
	) {
		const batch = candidates.slice(offset, offset + Math.max(1, limit));
		const resultChecks = await Promise.all(batch.map(hasPublicResult));
		for (const [index, keyword] of batch.entries()) {
			if (resultChecks[index] && items.length < limit) items.push(keyword);
		}
	}
	return items;
}

export function normalizeSearchKeyword(value: string) {
	const normalized = value
		.normalize("NFKC")
		.trim()
		.replace(/^#+\s*/, "")
		.replace(/\s+/g, " ")
		.toLocaleLowerCase("zh-CN");
	return normalized.length > 0 && normalized.length <= SEARCH_KEYWORD_MAX_LENGTH
		? normalized
		: "";
}

export function getShanghaiDay(date: Date) {
	return new Intl.DateTimeFormat("en-CA", {
		day: "2-digit",
		month: "2-digit",
		timeZone: SHANGHAI_TIME_ZONE,
		year: "numeric",
	}).format(date);
}

function dayDifference(laterDay: string, earlierDay: string) {
	const later = Date.parse(`${laterDay}T12:00:00.000Z`);
	const earlier = Date.parse(`${earlierDay}T12:00:00.000Z`);
	return Math.round((later - earlier) / 86_400_000);
}

export function getRetentionCutoffDay(now: Date, retentionDays: number) {
	const today = getShanghaiDay(now);
	const cutoff = new Date(`${today}T12:00:00.000Z`);
	cutoff.setUTCDate(cutoff.getUTCDate() - Math.max(0, retentionDays - 1));
	return cutoff.toISOString().slice(0, 10);
}

export function rankRecommendedSearches({
	activeTopics,
	excludedKeywords,
	limit,
	now,
	rows,
}: {
	activeTopics: string[];
	excludedKeywords: Set<string>;
	limit: number;
	now: Date;
	rows: SearchAggregateRow[];
}) {
	const today = getShanghaiDay(now);
	const grouped = new Map<
		string,
		{
			currentTotal: number;
			previousTotal: number;
			successful: number;
			weighted: number;
		}
	>();
	for (const row of rows) {
		const keyword = normalizeSearchKeyword(row.keyword);
		if (!keyword || excludedKeywords.has(keyword)) continue;
		const difference = dayDifference(today, row.day);
		if (difference < 0 || difference >= 14) continue;
		const current = grouped.get(keyword) ?? {
			currentTotal: 0,
			previousTotal: 0,
			successful: 0,
			weighted: 0,
		};
		if (difference < 7) {
			current.currentTotal += row.totalCount;
			current.successful += row.successfulCount;
			current.weighted += row.totalCount * (RECENT_WEIGHTS[difference] ?? 0);
		} else {
			current.previousTotal += row.totalCount;
		}
		grouped.set(keyword, current);
	}

	const ranked = [...grouped.entries()]
		.filter(([, value]) => value.currentTotal >= 2)
		.map(([keyword, value]) => ({
			keyword,
			score:
				value.weighted +
				Math.max(0, value.currentTotal - value.previousTotal) * 0.25,
		}))
		.sort(
			(left, right) =>
				right.score - left.score || left.keyword.localeCompare(right.keyword),
		)
		.map((item) => item.keyword);

	for (const topic of activeTopics) {
		const keyword = normalizeSearchKeyword(topic);
		if (
			keyword &&
			!excludedKeywords.has(keyword) &&
			!ranked.includes(keyword)
		) {
			ranked.push(keyword);
		}
		if (ranked.length >= limit) break;
	}
	return ranked.slice(0, Math.max(0, limit));
}
