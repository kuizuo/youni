import { createDb } from "@youni/db";
import {
	noteFeedDailyMetric,
	noteFeedEvent,
	searchKeywordDaily,
} from "@youni/db/schema/index";
import { lt } from "drizzle-orm";

import { getRetentionCutoffDay } from "./search-analytics";

const NOTE_FEED_EVENT_RETENTION_DAYS = 30;
const ANALYTICS_RETENTION_DAYS = 90;

export async function cleanupExpiredAnalytics(now = new Date()) {
	const db = createDb();
	const eventCutoff = new Date(
		now.getTime() - NOTE_FEED_EVENT_RETENTION_DAYS * 86_400_000,
	);
	const aggregateCutoff = getRetentionCutoffDay(now, ANALYTICS_RETENTION_DAYS);
	const [events, feedMetrics, searchMetrics] = await db.batch([
		db
			.delete(noteFeedEvent)
			.where(lt(noteFeedEvent.occurredAt, eventCutoff))
			.returning({ id: noteFeedEvent.id }),
		db
			.delete(noteFeedDailyMetric)
			.where(lt(noteFeedDailyMetric.day, aggregateCutoff))
			.returning({ day: noteFeedDailyMetric.day }),
		db
			.delete(searchKeywordDaily)
			.where(lt(searchKeywordDaily.day, aggregateCutoff))
			.returning({
				day: searchKeywordDaily.day,
				keyword: searchKeywordDaily.keyword,
			}),
	]);
	return {
		feedEvents: events.length,
		feedMetrics: feedMetrics.length,
		searchMetrics: searchMetrics.length,
	};
}
