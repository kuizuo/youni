import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import { comment, note, noteTopic, topic } from "@youni/db/schema/index";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { publicProcedure } from "../index";
import {
	hydrateContentNotes,
	selectContentNoteRows,
} from "../lib/content-notes";
import { containsInsensitive } from "../lib/search";
import { toNumber, toPage } from "./utils";

export async function getTopicNoteIds(keyword: string) {
	const rows = await createDb()
		.select({ noteId: noteTopic.noteId })
		.from(noteTopic)
		.innerJoin(topic, eq(noteTopic.topicId, topic.id))
		.where(containsInsensitive(topic.name, keyword));

	return Array.from(new Set(rows.map((row) => row.noteId)));
}

export async function getSearchNoteWhereClause(keyword?: string) {
	const normalizedKeyword = keyword?.trim();
	if (!normalizedKeyword) {
		return and(eq(note.status, "published"), eq(note.visibility, "public"));
	}

	const topicNoteIds = await getTopicNoteIds(normalizedKeyword);
	const keywordClause =
		topicNoteIds.length > 0
			? or(
					containsInsensitive(note.title, normalizedKeyword),
					containsInsensitive(note.content, normalizedKeyword),
					inArray(note.id, topicNoteIds),
				)
			: or(
					containsInsensitive(note.title, normalizedKeyword),
					containsInsensitive(note.content, normalizedKeyword),
				);

	return and(
		eq(note.status, "published"),
		eq(note.visibility, "public"),
		keywordClause,
	);
}

async function getPublicTopicStats(topicIds: string[]) {
	if (topicIds.length === 0) {
		return {
			discussionsByTopic: new Map<string, number>(),
			notesByTopic: new Map<string, number>(),
		};
	}

	const db = createDb();
	const noteRows = await db
		.select({ noteId: noteTopic.noteId, topicId: noteTopic.topicId })
		.from(noteTopic)
		.innerJoin(note, eq(noteTopic.noteId, note.id))
		.where(
			and(
				inArray(noteTopic.topicId, topicIds),
				eq(note.status, "published"),
				eq(note.visibility, "public"),
			),
		);
	const notesByTopic = new Map<string, number>();
	const noteIdsByTopic = new Map<string, string[]>();

	for (const row of noteRows) {
		notesByTopic.set(row.topicId, (notesByTopic.get(row.topicId) ?? 0) + 1);
		noteIdsByTopic.set(row.topicId, [
			...(noteIdsByTopic.get(row.topicId) ?? []),
			row.noteId,
		]);
	}

	const allNoteIds = Array.from(new Set(noteRows.map((row) => row.noteId)));
	if (allNoteIds.length === 0) {
		return {
			discussionsByTopic: new Map<string, number>(),
			notesByTopic,
		};
	}

	const commentRows = await db
		.select({ noteId: comment.noteId, value: count() })
		.from(comment)
		.where(inArray(comment.noteId, allNoteIds))
		.groupBy(comment.noteId);
	const commentsByNote = new Map(
		commentRows.map((row) => [row.noteId, toNumber(row.value)]),
	);
	const discussionsByTopic = new Map<string, number>();

	for (const [topicId, noteIds] of noteIdsByTopic) {
		discussionsByTopic.set(
			topicId,
			noteIds.reduce(
				(total, noteId) => total + (commentsByNote.get(noteId) ?? 0),
				0,
			),
		);
	}

	return { discussionsByTopic, notesByTopic };
}

export const topicsRouter = {
	topics: publicProcedure.topics.handler(async ({ input }) => {
		const db = createDb();
		const rows = input.keyword
			? await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.where(containsInsensitive(topic.name, input.keyword))
					.orderBy(desc(topic.createdAt))
					.limit(input.limit)
			: await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.orderBy(desc(topic.createdAt))
					.limit(input.limit);

		if (rows.length === 0) return [];

		const counts = await db
			.select({ topicId: noteTopic.topicId, value: count() })
			.from(noteTopic)
			.where(
				inArray(
					noteTopic.topicId,
					rows.map((row) => row.id),
				),
			)
			.groupBy(noteTopic.topicId);
		const countByTopic = new Map(
			counts.map((row) => [row.topicId, toNumber(row.value)]),
		);

		return rows.map((row) => ({
			...row,
			noteCount: countByTopic.get(row.id) ?? 0,
		}));
	}),

	searchTopics: publicProcedure.searchTopics.handler(async ({ input }) => {
		const db = createDb();
		const rows = input.keyword
			? await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.where(containsInsensitive(topic.name, input.keyword))
					.orderBy(desc(topic.createdAt))
					.limit(input.limit + 1)
					.offset(input.offset)
			: await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.orderBy(desc(topic.createdAt))
					.limit(input.limit + 1)
					.offset(input.offset);
		const page = toPage(rows, input.limit, input.offset);
		const topicIds = page.items.map((row) => row.id);
		const { discussionsByTopic, notesByTopic } =
			await getPublicTopicStats(topicIds);

		return {
			...page,
			items: page.items.map((row) => ({
				...row,
				discussionCount: discussionsByTopic.get(row.id) ?? 0,
				noteCount: notesByTopic.get(row.id) ?? 0,
			})),
		};
	}),

	topicDetail: publicProcedure.topicDetail.handler(
		async ({ input, context }) => {
			const db = createDb();
			const [topicRow] = await db
				.select({
					id: topic.id,
					name: topic.name,
					createdAt: topic.createdAt,
				})
				.from(topic)
				.where(eq(topic.id, input.id))
				.limit(1);

			if (!topicRow) {
				throw new ORPCError("NOT_FOUND");
			}

			const noteIdRows = await db
				.select({ noteId: noteTopic.noteId })
				.from(noteTopic)
				.innerJoin(note, eq(noteTopic.noteId, note.id))
				.where(
					and(
						eq(noteTopic.topicId, input.id),
						eq(note.status, "published"),
						eq(note.visibility, "public"),
					),
				)
				.orderBy(desc(note.createdAt));
			const noteIds = noteIdRows.map((row) => row.noteId);
			const discussionRows =
				noteIds.length > 0
					? await db
							.select({ value: count() })
							.from(comment)
							.where(inArray(comment.noteId, noteIds))
					: [];
			const rows =
				noteIds.length > 0
					? await selectContentNoteRows(
							and(
								inArray(note.id, noteIds),
								eq(note.status, "published"),
								eq(note.visibility, "public"),
							),
						)
					: [];
			const hydratedRows = await hydrateContentNotes(
				rows,
				context.session?.user.id,
			);
			const sortedRows =
				input.sort === "hot"
					? hydratedRows.toSorted((left, right) => {
							const likeDelta = right.likedCount - left.likedCount;
							if (likeDelta !== 0) return likeDelta;
							return (
								new Date(right.createdAt).getTime() -
								new Date(left.createdAt).getTime()
							);
						})
					: hydratedRows;
			const page = toPage(
				sortedRows.slice(input.offset, input.offset + input.limit + 1),
				input.limit,
				input.offset,
			);

			return {
				topic: {
					...topicRow,
					discussionCount: toNumber(discussionRows[0]?.value),
					noteCount: noteIds.length,
				},
				notes: page,
			};
		},
	),

	topicByName: publicProcedure.topicByName.handler(async ({ input }) => {
		const [row] = await createDb()
			.select({
				id: topic.id,
				name: topic.name,
				createdAt: topic.createdAt,
			})
			.from(topic)
			.where(eq(topic.name, input.name))
			.limit(1);

		if (!row) {
			throw new ORPCError("NOT_FOUND");
		}

		return row;
	}),
};
