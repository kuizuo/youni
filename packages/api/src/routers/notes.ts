import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteViewHistory,
} from "@youni/db/schema/index";
import { and, count, eq, inArray, ne, or } from "drizzle-orm";
import {
	activeUserProcedure,
	protectedProcedure,
	publicProcedure,
} from "../index";
import {
	createContentNote,
	getDraftContentNoteById,
	getEditableContentNoteById,
	hydrateContentNotes,
	listDraftContentNotes,
	listViewedContentNoteRows,
	selectContentNoteRows,
	softDeleteContentNote,
	updateContentNoteVisibility,
	updateDraftContentNote,
	updateEditableContentNote,
} from "../lib/content-notes";
import { notifyNoteOwner } from "../lib/notifications";
import { listRootComments } from "./comments";
import {
	draftUpdateInput,
	idInput,
	listInput,
	noteCreateInput,
	noteEditInput,
	noteVisibilityUpdateInput,
	paginatedListInput,
} from "./schemas";
import { getSearchNoteWhereClause } from "./topics";
import { toNumber, toPage } from "./utils";

async function recordNoteView(noteId: string, userId: string) {
	const now = new Date();
	await createDb()
		.insert(noteViewHistory)
		.values({
			noteId,
			userId,
			viewedAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [noteViewHistory.userId, noteViewHistory.noteId],
			set: {
				viewedAt: now,
				updatedAt: now,
			},
		});
}

async function canViewNoteDetail(
	row: Awaited<ReturnType<typeof selectContentNoteRows>>[number],
	viewerId?: string,
) {
	if (viewerId && row.userId === viewerId) return true;
	if (row.status !== "published") return false;
	if (row.visibility === "public") return true;
	if (row.visibility !== "followers" || !viewerId) return false;

	const [followingRow] = await createDb()
		.select({ followingId: follow.followingId })
		.from(follow)
		.where(
			and(eq(follow.followerId, viewerId), eq(follow.followingId, row.userId)),
		)
		.limit(1);
	return Boolean(followingRow);
}

export const notesRouter = {
	feed: publicProcedure.input(listInput).handler(async ({ input, context }) => {
		const whereClause = await getSearchNoteWhereClause(input.keyword);
		const rows = (await selectContentNoteRows(whereClause)).slice(
			0,
			input.limit,
		);
		return hydrateContentNotes(rows, context.session?.user.id);
	}),

	followingFeed: protectedProcedure
		.input(listInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const followingRows = await db
				.select({ followingId: follow.followingId })
				.from(follow)
				.where(eq(follow.followerId, context.session.user.id));
			const followingIds = followingRows.map((row) => row.followingId);

			if (followingIds.length === 0) {
				return [];
			}

			const rows = (
				await selectContentNoteRows(
					and(
						eq(note.status, "published"),
						inArray(note.userId, followingIds),
						or(eq(note.visibility, "public"), eq(note.visibility, "followers")),
					),
				)
			).slice(0, input.limit);

			return hydrateContentNotes(rows, context.session.user.id);
		}),

	searchNotes: publicProcedure
		.input(paginatedListInput)
		.handler(async ({ input, context }) => {
			const whereClause = await getSearchNoteWhereClause(input.keyword);
			const rows = (await selectContentNoteRows(whereClause)).slice(
				input.offset,
				input.offset + input.limit + 1,
			);
			const page = toPage(rows, input.limit, input.offset);

			return {
				...page,
				items: await hydrateContentNotes(page.items, context.session?.user.id),
			};
		}),

	byId: publicProcedure.input(idInput).handler(async ({ input, context }) => {
		const [row] = await selectContentNoteRows(
			and(eq(note.id, input.id), ne(note.status, "hidden")),
		);

		if (!row || !(await canViewNoteDetail(row, context.session?.user.id))) {
			throw new ORPCError("NOT_FOUND");
		}

		const [item] = await hydrateContentNotes([row], context.session?.user.id);
		const comments = await listRootComments({
			noteId: input.id,
			limit: 20,
			offset: 0,
			viewerId: context.session?.user.id,
		});
		if (context.session?.user.id) {
			await recordNoteView(input.id, context.session.user.id);
		}

		return {
			...item,
			comments: comments.items,
			commentsNextOffset: comments.nextOffset,
		};
	}),

	drafts: protectedProcedure.handler(async ({ context }) => {
		return listDraftContentNotes(context.session.user.id);
	}),

	draftById: protectedProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			return getDraftContentNoteById({
				id: input.id,
				userId: context.session.user.id,
			});
		}),

	editById: protectedProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			return getEditableContentNoteById({
				id: input.id,
				userId: context.session.user.id,
			});
		}),

	updateDraft: activeUserProcedure
		.input(draftUpdateInput)
		.handler(async ({ input, context }) => {
			return updateDraftContentNote({
				input,
				userId: context.session.user.id,
			});
		}),

	updateNote: activeUserProcedure
		.input(noteEditInput)
		.handler(async ({ input, context }) => {
			return updateEditableContentNote({
				input,
				userId: context.session.user.id,
			});
		}),

	updateNoteVisibility: activeUserProcedure
		.input(noteVisibilityUpdateInput)
		.handler(async ({ input, context }) => {
			return updateContentNoteVisibility({
				id: input.id,
				userId: context.session.user.id,
				visibility: input.visibility,
			});
		}),

	deleteMyNote: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			return softDeleteContentNote({
				id: input.id,
				userId: context.session.user.id,
			});
		}),

	creatorStats: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;
		const db = createDb();
		const [statusRows, [likeCount], [collectionCount], [commentCount]] =
			await Promise.all([
				db
					.select({ status: note.status, value: count() })
					.from(note)
					.where(eq(note.userId, userId))
					.groupBy(note.status),
				db
					.select({ value: count() })
					.from(noteLike)
					.innerJoin(note, eq(noteLike.noteId, note.id))
					.where(eq(note.userId, userId)),
				db
					.select({ value: count() })
					.from(noteCollection)
					.innerJoin(note, eq(noteCollection.noteId, note.id))
					.where(eq(note.userId, userId)),
				db
					.select({ value: count() })
					.from(comment)
					.innerJoin(note, eq(comment.noteId, note.id))
					.where(eq(note.userId, userId)),
			]);
		const byStatus = new Map(
			statusRows.map((row) => [row.status, toNumber(row.value)]),
		);
		const published = byStatus.get("published") ?? 0;
		const draft = byStatus.get("draft") ?? 0;
		const audit = byStatus.get("audit") ?? 0;
		const rejected = byStatus.get("rejected") ?? 0;
		const hidden = byStatus.get("hidden") ?? 0;

		return {
			total: published + draft + audit + rejected + hidden,
			published,
			draft,
			audit,
			rejected,
			hidden,
			liked: toNumber(likeCount?.value),
			collected: toNumber(collectionCount?.value),
			comments: toNumber(commentCount?.value),
		};
	}),

	viewHistory: protectedProcedure
		.input(listInput)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			const rows = await listViewedContentNoteRows(userId, input.limit);
			const hydratedRows = await hydrateContentNotes(rows, userId);
			const viewedAtById = new Map(rows.map((row) => [row.id, row.viewedAt]));

			return hydratedRows.map((item) => ({
				note: item,
				viewedAt: viewedAtById.get(item.id) ?? item.updatedAt,
			}));
		}),

	deleteViewHistory: protectedProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			await createDb()
				.delete(noteViewHistory)
				.where(
					and(
						eq(noteViewHistory.noteId, input.id),
						eq(noteViewHistory.userId, context.session.user.id),
					),
				);

			return { ok: true };
		}),

	clearViewHistory: protectedProcedure.handler(async ({ context }) => {
		await createDb()
			.delete(noteViewHistory)
			.where(eq(noteViewHistory.userId, context.session.user.id));

		return { ok: true };
	}),

	create: activeUserProcedure
		.input(noteCreateInput)
		.handler(async ({ input, context }) => {
			return createContentNote({
				input,
				userId: context.session.user.id,
			});
		}),

	toggleLike: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const whereClause = and(
				eq(noteLike.noteId, input.id),
				eq(noteLike.userId, context.session.user.id),
			);
			const existing = await db
				.select({ noteId: noteLike.noteId })
				.from(noteLike)
				.where(whereClause)
				.limit(1);
			const liked = existing.length === 0;

			if (liked) {
				await db
					.insert(noteLike)
					.values({ noteId: input.id, userId: context.session.user.id });
				await notifyNoteOwner({
					type: "like",
					noteId: input.id,
					actorId: context.session.user.id,
				});
			} else {
				await db.delete(noteLike).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(noteLike)
				.where(eq(noteLike.noteId, input.id));
			return { liked, likedCount: toNumber(row?.value) };
		}),

	toggleCollect: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const whereClause = and(
				eq(noteCollection.noteId, input.id),
				eq(noteCollection.userId, context.session.user.id),
			);
			const existing = await db
				.select({ noteId: noteCollection.noteId })
				.from(noteCollection)
				.where(whereClause)
				.limit(1);
			const collected = existing.length === 0;

			if (collected) {
				await db
					.insert(noteCollection)
					.values({ noteId: input.id, userId: context.session.user.id });
				await notifyNoteOwner({
					type: "collect",
					noteId: input.id,
					actorId: context.session.user.id,
				});
			} else {
				await db.delete(noteCollection).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(noteCollection)
				.where(eq(noteCollection.noteId, input.id));
			return { collected, collectedCount: toNumber(row?.value) };
		}),
};
