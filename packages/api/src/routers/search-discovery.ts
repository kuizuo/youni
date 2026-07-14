import { createDb } from "@youni/db";
import {
	note,
	noteTopic,
	searchKeywordControl,
	searchKeywordDaily,
	topic,
	user,
} from "@youni/db/schema/index";
import { and, count, desc, eq, gte, or, sql } from "drizzle-orm";

import { publicProcedure } from "../index";
import {
	getRetentionCutoffDay,
	getSearchSourceCounts,
	getShanghaiDay,
	normalizeSearchKeyword,
	rankRecommendedSearches,
	selectAvailableRecommendedSearches,
} from "../lib/analytics/search";
import { containsInsensitive } from "../lib/search";
import { getSearchNoteWhereClause } from "./topics";

async function hasPublicSearchResult(keyword: string) {
	const db = createDb();
	const noteWhere = await getSearchNoteWhereClause(keyword);
	const [noteRows, userRows, topicRows] = await Promise.all([
		db.select({ id: note.id }).from(note).where(noteWhere).limit(1),
		db
			.select({ id: user.id })
			.from(user)
			.where(
				and(
					eq(user.status, "active"),
					eq(user.banned, false),
					eq(user.isAnonymous, false),
					or(
						containsInsensitive(user.name, keyword),
						containsInsensitive(user.handle, keyword),
						containsInsensitive(user.bio, keyword),
					),
				),
			)
			.limit(1),
		db
			.select({ id: topic.id })
			.from(topic)
			.where(containsInsensitive(topic.name, keyword))
			.limit(1),
	]);
	return noteRows.length > 0 || userRows.length > 0 || topicRows.length > 0;
}

export const searchDiscoveryRouter = {
	recommendations: publicProcedure.searchDiscovery.recommendations.handler(
		async ({ input }) => {
			const now = new Date();
			const db = createDb();
			const fourteenDayCutoff = getRetentionCutoffDay(now, 14);
			const recentContentCutoff = new Date(now.getTime() - 30 * 86_400_000);
			const [rows, controlRows, activeTopicRows] = await Promise.all([
				db
					.select({
						day: searchKeywordDaily.day,
						keyword: searchKeywordDaily.keyword,
						successfulCount: searchKeywordDaily.successfulCount,
						totalCount: searchKeywordDaily.totalCount,
					})
					.from(searchKeywordDaily)
					.where(gte(searchKeywordDaily.day, fourteenDayCutoff)),
				db
					.select({ keyword: searchKeywordControl.keyword })
					.from(searchKeywordControl)
					.where(eq(searchKeywordControl.excluded, true)),
				db
					.select({ name: topic.name, value: count() })
					.from(topic)
					.innerJoin(noteTopic, eq(topic.id, noteTopic.topicId))
					.innerJoin(note, eq(noteTopic.noteId, note.id))
					.innerJoin(user, eq(note.userId, user.id))
					.where(
						and(
							eq(note.status, "published"),
							eq(note.visibility, "public"),
							eq(user.status, "active"),
							eq(user.banned, false),
							gte(note.publishedAt, recentContentCutoff),
						),
					)
					.groupBy(topic.id)
					.orderBy(desc(count()))
					.limit(input.limit),
			]);
			const ranked = rankRecommendedSearches({
				activeTopics: activeTopicRows.map((row) => row.name),
				excludedKeywords: new Set(controlRows.map((row) => row.keyword)),
				limit: rows.length + activeTopicRows.length,
				now,
				rows,
			});
			const items = await selectAvailableRecommendedSearches(
				ranked,
				input.limit,
				hasPublicSearchResult,
			);
			return {
				generatedAt: now,
				items,
			};
		},
	),

	record: publicProcedure.searchDiscovery.record.handler(
		async ({ input, context }) => {
			const keyword = normalizeSearchKeyword(input.keyword);
			if (!keyword) return { accepted: false, hasResults: false };
			const rateLimit = await context.searchRateLimit.limit({
				key: context.rateLimitKey,
			});
			if (!rateLimit.success) return { accepted: false, hasResults: false };
			const hasResults = await hasPublicSearchResult(keyword);

			const now = new Date();
			const source = getSearchSourceCounts(input.source);
			const successfulCount = hasResults ? 1 : 0;
			await createDb()
				.insert(searchKeywordDaily)
				.values({
					day: getShanghaiDay(now),
					displayKeyword: keyword,
					keyword,
					successfulCount,
					totalCount: 1,
					...source,
					updatedAt: now,
				})
				.onConflictDoUpdate({
					target: [searchKeywordDaily.day, searchKeywordDaily.keyword],
					set: {
						externalCount: sql`${searchKeywordDaily.externalCount} + ${source.externalCount}`,
						historyCount: sql`${searchKeywordDaily.historyCount} + ${source.historyCount}`,
						recommendedCount: sql`${searchKeywordDaily.recommendedCount} + ${source.recommendedCount}`,
						successfulCount: sql`${searchKeywordDaily.successfulCount} + ${successfulCount}`,
						totalCount: sql`${searchKeywordDaily.totalCount} + 1`,
						typedCount: sql`${searchKeywordDaily.typedCount} + ${source.typedCount}`,
						updatedAt: now,
					},
				});
			return { accepted: true, hasResults };
		},
	),
};
