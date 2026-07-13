import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	follow,
	note,
	noteCollection,
	noteFeedDailyMetric,
	noteFeedEvent,
	noteLike,
	noteNotInterested,
	noteTopic,
	noteViewHistory,
	topic,
	user,
} from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { and, count, eq, gte, inArray, notInArray, sql } from "drizzle-orm";

import type { NoteFeedEventType } from "../contracts/notes";
import { hydrateContentNotes, selectContentNoteRows } from "./content-notes";
import {
	buildNoteFeedPages,
	type NoteFeedCandidate,
	rankFallbackCandidates,
} from "./note-feed-ranking";
import { decodeNoteFeedToken, encodeNoteFeedToken } from "./note-feed-tokens";
import { getShanghaiDay } from "./search-analytics";
import { getBlockedUserIds } from "./user-blocks";

const CANDIDATE_LIMIT = 300;
const CURSOR_TTL_MS = 30 * 60 * 1_000;
const IMPRESSION_TOKEN_TTL_MS = 24 * 60 * 60 * 1_000;
const INTEREST_WINDOW_MS = 30 * 24 * 60 * 60 * 1_000;
const SEEN_WINDOW_MS = 7 * 24 * 60 * 60 * 1_000;
const SOCIAL_WINDOW_MS = 14 * 24 * 60 * 60 * 1_000;

async function getFeedViewerId(sessionUserId?: string) {
	if (!sessionUserId) return undefined;
	const [account] = await createDb()
		.select({ id: user.id })
		.from(user)
		.where(
			and(
				eq(user.id, sessionUserId),
				eq(user.isAnonymous, false),
				eq(user.status, "active"),
				eq(user.banned, false),
			),
		)
		.limit(1);
	return account?.id;
}

async function getViewerExclusions(viewerId?: string) {
	if (!viewerId) {
		return {
			blockedAuthorIds: [] as string[],
			notInterestedIds: [] as string[],
			seenIds: [] as string[],
		};
	}
	const db = createDb();
	const seenCutoff = new Date(Date.now() - SEEN_WINDOW_MS);
	const [blockedAuthorIds, negativeRows, detailViewRows] = await Promise.all([
		getBlockedUserIds(viewerId),
		db
			.select({ noteId: noteNotInterested.noteId })
			.from(noteNotInterested)
			.where(eq(noteNotInterested.userId, viewerId)),
		db
			.select({ noteId: noteViewHistory.noteId })
			.from(noteViewHistory)
			.where(
				and(
					eq(noteViewHistory.userId, viewerId),
					gte(noteViewHistory.viewedAt, seenCutoff),
				),
			),
	]);
	return {
		blockedAuthorIds,
		notInterestedIds: negativeRows.map((row) => row.noteId),
		seenIds: detailViewRows.map((row) => row.noteId),
	};
}

async function getEligibleRows(viewerId?: string, requestedIds?: string[]) {
	const { blockedAuthorIds, notInterestedIds, seenIds } =
		await getViewerExclusions(viewerId);
	const conditions = [
		eq(note.status, "published"),
		eq(note.visibility, "public"),
		eq(user.status, "active"),
		eq(user.banned, false),
	];
	if (viewerId) conditions.push(sql`${note.userId} <> ${viewerId}`);
	if (blockedAuthorIds.length > 0) {
		conditions.push(notInArray(note.userId, blockedAuthorIds));
	}
	if (notInterestedIds.length > 0) {
		conditions.push(notInArray(note.id, notInterestedIds));
	}
	if (seenIds.length > 0 && !requestedIds) {
		conditions.push(notInArray(note.id, seenIds));
	}
	if (requestedIds) {
		if (requestedIds.length === 0) return [];
		conditions.push(inArray(note.id, requestedIds));
	}
	return (await selectContentNoteRows(and(...conditions))).slice(
		0,
		CANDIDATE_LIMIT,
	);
}

function addTopicWeight(
	weights: Record<string, number>,
	rows: Array<{ name: string }>,
	value: number,
) {
	for (const row of rows) weights[row.name] = (weights[row.name] ?? 0) + value;
}

async function getTopicWeights(viewerId?: string) {
	if (!viewerId) return {};
	const db = createDb();
	const cutoff = new Date(Date.now() - INTEREST_WINDOW_MS);
	const [likedTopics, collectedTopics, viewedTopics, negativeTopics] =
		await Promise.all([
			db
				.select({ name: topic.name })
				.from(noteLike)
				.innerJoin(noteTopic, eq(noteLike.noteId, noteTopic.noteId))
				.innerJoin(topic, eq(noteTopic.topicId, topic.id))
				.where(
					and(eq(noteLike.userId, viewerId), gte(noteLike.createdAt, cutoff)),
				),
			db
				.select({ name: topic.name })
				.from(noteCollection)
				.innerJoin(noteTopic, eq(noteCollection.noteId, noteTopic.noteId))
				.innerJoin(topic, eq(noteTopic.topicId, topic.id))
				.where(
					and(
						eq(noteCollection.userId, viewerId),
						gte(noteCollection.createdAt, cutoff),
					),
				),
			db
				.select({ name: topic.name })
				.from(noteViewHistory)
				.innerJoin(noteTopic, eq(noteViewHistory.noteId, noteTopic.noteId))
				.innerJoin(topic, eq(noteTopic.topicId, topic.id))
				.where(
					and(
						eq(noteViewHistory.userId, viewerId),
						gte(noteViewHistory.viewedAt, cutoff),
					),
				),
			db
				.select({ name: topic.name })
				.from(noteNotInterested)
				.innerJoin(noteTopic, eq(noteNotInterested.noteId, noteTopic.noteId))
				.innerJoin(topic, eq(noteTopic.topicId, topic.id))
				.where(
					and(
						eq(noteNotInterested.userId, viewerId),
						gte(noteNotInterested.createdAt, cutoff),
					),
				),
		]);
	const weights: Record<string, number> = {};
	addTopicWeight(weights, likedTopics, 3);
	addTopicWeight(weights, collectedTopics, 5);
	addTopicWeight(weights, viewedTopics, 1);
	addTopicWeight(weights, negativeTopics, -4);
	return weights;
}

async function getFeedCandidateSignals(noteIds: string[], viewerId?: string) {
	if (noteIds.length === 0) {
		return {
			followedAuthorIds: new Set<string>(),
			impressions: new Map<string, number>(),
			socialProof: new Map<string, Set<string>>(),
		};
	}
	const db = createDb();
	const impressionCutoff = new Date(Date.now() - INTEREST_WINDOW_MS);
	const followingRows = viewerId
		? await db
				.select({ userId: follow.followingId })
				.from(follow)
				.where(eq(follow.followerId, viewerId))
		: [];
	const followedAuthorIds = new Set(followingRows.map((row) => row.userId));
	const followingIds = [...followedAuthorIds];
	const socialCutoff = new Date(Date.now() - SOCIAL_WINDOW_MS);
	const [impressionRows, likedRows, collectedRows] = await Promise.all([
		db
			.select({ noteId: noteFeedEvent.noteId, value: count() })
			.from(noteFeedEvent)
			.where(
				and(
					inArray(noteFeedEvent.noteId, noteIds),
					eq(noteFeedEvent.type, "impression"),
					gte(noteFeedEvent.occurredAt, impressionCutoff),
				),
			)
			.groupBy(noteFeedEvent.noteId),
		followingIds.length > 0
			? db
					.select({ noteId: noteLike.noteId, userId: noteLike.userId })
					.from(noteLike)
					.where(
						and(
							inArray(noteLike.noteId, noteIds),
							inArray(noteLike.userId, followingIds),
							gte(noteLike.createdAt, socialCutoff),
						),
					)
			: Promise.resolve([]),
		followingIds.length > 0
			? db
					.select({
						noteId: noteCollection.noteId,
						userId: noteCollection.userId,
					})
					.from(noteCollection)
					.where(
						and(
							inArray(noteCollection.noteId, noteIds),
							inArray(noteCollection.userId, followingIds),
							gte(noteCollection.createdAt, socialCutoff),
						),
					)
			: Promise.resolve([]),
	]);
	const socialProof = new Map<string, Set<string>>();
	for (const row of [...likedRows, ...collectedRows]) {
		const users = socialProof.get(row.noteId) ?? new Set<string>();
		users.add(row.userId);
		socialProof.set(row.noteId, users);
	}
	return {
		followedAuthorIds,
		impressions: new Map(
			impressionRows.map((row) => [row.noteId, Number(row.value ?? 0)]),
		),
		socialProof,
	};
}

function emptyCandidateSignals() {
	return {
		followedAuthorIds: new Set<string>(),
		impressions: new Map<string, number>(),
		socialProof: new Map<string, Set<string>>(),
	};
}

function buildFallbackPages(
	candidates: NoteFeedCandidate[],
	now: Date,
	pageSize: number,
) {
	const candidatesById = new Map(candidates.map((item) => [item.id, item]));
	let remainingIds = rankFallbackCandidates(candidates, now);
	const pages: string[][] = [];
	while (remainingIds.length > 0) {
		const authorCounts = new Map<string, number>();
		const pageIds: string[] = [];
		const deferredIds: string[] = [];
		for (const id of remainingIds) {
			const candidate = candidatesById.get(id);
			if (
				candidate &&
				pageIds.length < pageSize &&
				(authorCounts.get(candidate.authorId) ?? 0) < 2
			) {
				pageIds.push(id);
				authorCounts.set(
					candidate.authorId,
					(authorCounts.get(candidate.authorId) ?? 0) + 1,
				);
			} else {
				deferredIds.push(id);
			}
		}
		if (pageIds.length === 0) break;
		pages.push(pageIds);
		remainingIds = deferredIds;
	}
	return pages;
}

async function createPage({
	itemsById,
	orderedPages,
	pageSize,
	position,
	sessionId,
}: {
	itemsById: Map<
		string,
		Awaited<ReturnType<typeof hydrateContentNotes>>[number]
	>;
	orderedPages: string[][];
	pageSize: number;
	position: number;
	sessionId: string;
}) {
	const [currentPage = [], ...laterPages] = orderedPages;
	const pageIds = currentPage.slice(0, pageSize);
	const remainingCurrentPageIds = currentPage.slice(pageSize);
	const remainingPages = [
		...(remainingCurrentPageIds.length > 0 ? [remainingCurrentPageIds] : []),
		...laterPages,
	].filter((page) => page.length > 0);
	const expiresAt = Date.now() + IMPRESSION_TOKEN_TTL_MS;
	const items = await Promise.all(
		pageIds.flatMap((id, index) => {
			const item = itemsById.get(id);
			return item
				? [
						encodeNoteFeedToken(
							{
								expiresAt,
								kind: "impression",
								noteId: id,
								position: position + index,
								sessionId,
							},
							env.BETTER_AUTH_SECRET,
						).then((impressionId) => ({
							...item,
							feedContext: { impressionId, position: position + index },
						})),
					]
				: [];
		}),
	);
	const nextCursor =
		remainingPages.length > 0
			? await encodeNoteFeedToken(
					{
						expiresAt: Date.now() + CURSOR_TTL_MS,
						kind: "cursor",
						position: position + pageIds.length,
						remainingPages,
						sessionId,
					},
					env.BETTER_AUTH_SECRET,
				)
			: null;
	return { items, nextCursor };
}

function metricValues(type: NoteFeedEventType) {
	return {
		blockAuthorCount: type === "block_author" ? 1 : 0,
		collectCount: type === "collect" ? 1 : 0,
		impressionCount: type === "impression" ? 1 : 0,
		likeCount: type === "like" ? 1 : 0,
		notInterestedCount: type === "not_interested" ? 1 : 0,
		openCount: type === "open" ? 1 : 0,
	};
}

async function incrementDailyMetric(type: NoteFeedEventType, now: Date) {
	const values = metricValues(type);
	await createDb()
		.insert(noteFeedDailyMetric)
		.values({ day: getShanghaiDay(now), ...values, updatedAt: now })
		.onConflictDoUpdate({
			target: noteFeedDailyMetric.day,
			set: {
				blockAuthorCount: sql`${noteFeedDailyMetric.blockAuthorCount} + ${values.blockAuthorCount}`,
				collectCount: sql`${noteFeedDailyMetric.collectCount} + ${values.collectCount}`,
				impressionCount: sql`${noteFeedDailyMetric.impressionCount} + ${values.impressionCount}`,
				likeCount: sql`${noteFeedDailyMetric.likeCount} + ${values.likeCount}`,
				notInterestedCount: sql`${noteFeedDailyMetric.notInterestedCount} + ${values.notInterestedCount}`,
				openCount: sql`${noteFeedDailyMetric.openCount} + ${values.openCount}`,
				updatedAt: now,
			},
		});
}

async function recordFeedEvent({
	impressionId,
	noteId,
	position,
	type,
	userId,
}: {
	impressionId: string;
	noteId: string;
	position?: number;
	type: NoteFeedEventType;
	userId: string;
}) {
	const payload = await decodeNoteFeedToken(
		impressionId,
		env.BETTER_AUTH_SECRET,
	);
	if (
		!payload ||
		payload.kind !== "impression" ||
		payload.noteId !== noteId ||
		(position !== undefined && payload.position !== position)
	) {
		return false;
	}
	const now = new Date();
	const inserted = await createDb()
		.insert(noteFeedEvent)
		.values({
			impressionId,
			noteId,
			occurredAt: now,
			position: payload.position,
			type,
			userId,
		})
		.onConflictDoNothing()
		.returning({ id: noteFeedEvent.id });
	if (inserted.length === 0) return false;
	await incrementDailyMetric(type, now);
	return true;
}

export async function getNoteFeed({
	cursor,
	limit,
	sessionUserId,
}: {
	cursor?: string;
	limit: number;
	sessionUserId?: string;
}) {
	const viewerId = await getFeedViewerId(sessionUserId);
	if (cursor) {
		const payload = await decodeNoteFeedToken(cursor, env.BETTER_AUTH_SECRET);
		if (!payload || payload.kind !== "cursor") {
			throw new ORPCError("BAD_REQUEST", {
				message: "发现内容已过期，请刷新后重试",
			});
		}
		const remainingIds = payload.remainingPages.flat();
		const rows = await getEligibleRows(viewerId, remainingIds);
		const hydrated = await hydrateContentNotes(rows, viewerId);
		const itemsById = new Map(hydrated.map((item) => [item.id, item]));
		const orderedPages = payload.remainingPages
			.map((page) => page.filter((id) => itemsById.has(id)))
			.filter((page) => page.length > 0);
		return createPage({
			itemsById,
			orderedPages,
			pageSize: limit,
			position: payload.position,
			sessionId: payload.sessionId,
		});
	}

	const rows = await getEligibleRows(viewerId);
	const hydrated = await hydrateContentNotes(rows, viewerId);
	const noteIds = hydrated.map((item) => item.id);
	const [topicWeights, signals] = await Promise.all([
		getTopicWeights(viewerId),
		getFeedCandidateSignals(noteIds, viewerId),
	]).catch(() => [{}, emptyCandidateSignals()] as const);
	const candidates = hydrated.map<NoteFeedCandidate>((item) => ({
		authorId: item.userId,
		collectedCount: item.collectedCount,
		commentCount: item.commentCount,
		followedEngagerCount:
			(signals.socialProof.get(item.id)?.size ?? 0) +
			(signals.followedAuthorIds.has(item.userId) ? 3 : 0),
		id: item.id,
		impressionCount: signals.impressions.get(item.id) ?? 0,
		likedCount: item.likedCount,
		publishedAt: item.publishedAt ?? item.createdAt,
		topics: item.topics,
	}));
	const sessionId = crypto.randomUUID();
	const now = new Date();
	let orderedPages: string[][];
	try {
		orderedPages = buildNoteFeedPages({
			candidates,
			now,
			pageSize: limit,
			seed: sessionId,
			topicWeights,
		});
	} catch {
		orderedPages = buildFallbackPages(candidates, now, limit);
	}
	const itemsById = new Map(hydrated.map((item) => [item.id, item]));
	return createPage({
		itemsById,
		orderedPages,
		pageSize: limit,
		position: 0,
		sessionId,
	});
}

export async function recordNoteFeedEvents({
	events,
	userId,
}: {
	events: Array<{
		impressionId: string;
		noteId: string;
		position?: number;
		type: NoteFeedEventType;
	}>;
	userId: string;
}) {
	let accepted = 0;
	for (const event of events) {
		if (await recordFeedEvent({ ...event, userId })) accepted += 1;
	}
	return { accepted };
}

export async function setNoteNotInterested({
	impressionId,
	noteId,
	notInterested,
	userId,
}: {
	impressionId?: string;
	noteId: string;
	notInterested: boolean;
	userId: string;
}) {
	const db = createDb();
	if (notInterested) {
		await db
			.insert(noteNotInterested)
			.values({ noteId, userId })
			.onConflictDoNothing();
		if (impressionId) {
			await recordFeedEvent({
				impressionId,
				noteId,
				type: "not_interested",
				userId,
			});
		}
	} else {
		await db
			.delete(noteNotInterested)
			.where(
				and(
					eq(noteNotInterested.noteId, noteId),
					eq(noteNotInterested.userId, userId),
				),
			);
	}
	return { noteId, notInterested };
}
