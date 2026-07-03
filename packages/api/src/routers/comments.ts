import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import { comment, commentLike, note, user } from "@youni/db/schema/index";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { activeUserProcedure, publicProcedure } from "../index";
import { notifyNoteOwner } from "../lib/notifications";
import {
	commentInput,
	commentRepliesInput,
	idInput,
	noteCommentsInput,
} from "./schemas";
import { toNumber, toPage } from "./utils";

type CommentListRow = {
	authorImage: null | string;
	authorName: string;
	canDelete: boolean;
	content: string;
	createdAt: Date;
	id: string;
	liked: boolean;
	likedCount: number;
	noteId: string;
	parentId: null | string;
	replies: CommentListRow[];
	replyCount: number;
	userId: string;
};

type RawCommentRow = {
	authorImage: null | string;
	authorName: string;
	content: string;
	createdAt: Date;
	id: string;
	noteId: string;
	parentId: null | string;
	userId: string;
};

async function hydrateComments({
	rows,
	viewerId,
	withPreviewReplies,
}: {
	rows: RawCommentRow[];
	viewerId?: string;
	withPreviewReplies?: boolean;
}): Promise<CommentListRow[]> {
	if (rows.length === 0) return [];

	const db = createDb();
	const commentIds = rows.map((row) => row.id);
	const [likeRows, replyRows, likedRows] = await Promise.all([
		db
			.select({ commentId: commentLike.commentId, value: count() })
			.from(commentLike)
			.where(inArray(commentLike.commentId, commentIds))
			.groupBy(commentLike.commentId),
		db
			.select({ parentId: comment.parentId, value: count() })
			.from(comment)
			.where(inArray(comment.parentId, commentIds))
			.groupBy(comment.parentId),
		viewerId
			? db
					.select({ commentId: commentLike.commentId })
					.from(commentLike)
					.where(
						and(
							inArray(commentLike.commentId, commentIds),
							eq(commentLike.userId, viewerId),
						),
					)
			: Promise.resolve([]),
	]);
	const likesByComment = new Map(
		likeRows.map((row) => [row.commentId, toNumber(row.value)]),
	);
	const repliesByComment = new Map(
		replyRows.flatMap((row) =>
			row.parentId ? [[row.parentId, toNumber(row.value)] as const] : [],
		),
	);
	const likedSet = new Set(likedRows.map((row) => row.commentId));

	return Promise.all(
		rows.map(async (row) => ({
			...row,
			canDelete: row.userId === viewerId,
			liked: likedSet.has(row.id),
			likedCount: likesByComment.get(row.id) ?? 0,
			replyCount: repliesByComment.get(row.id) ?? 0,
			replies: withPreviewReplies
				? await listCommentReplies({
						parentId: row.id,
						limit: 2,
						offset: 0,
						viewerId,
					}).then((page) => page.items)
				: [],
		})),
	);
}

export async function listRootComments({
	limit,
	noteId,
	offset,
	viewerId,
}: {
	limit: number;
	noteId: string;
	offset: number;
	viewerId?: string;
}) {
	const rows = await createDb()
		.select({
			id: comment.id,
			content: comment.content,
			createdAt: comment.createdAt,
			noteId: comment.noteId,
			parentId: comment.parentId,
			userId: comment.userId,
			authorName: user.name,
			authorImage: user.image,
		})
		.from(comment)
		.innerJoin(user, eq(comment.userId, user.id))
		.where(and(eq(comment.noteId, noteId), isNull(comment.parentId)))
		.orderBy(desc(comment.createdAt))
		.limit(limit + 1)
		.offset(offset);
	const page = toPage(rows, limit, offset);

	return {
		...page,
		items: await hydrateComments({
			rows: page.items,
			viewerId,
			withPreviewReplies: true,
		}),
	};
}

export async function listCommentReplies({
	limit,
	offset,
	parentId,
	viewerId,
}: {
	limit: number;
	offset: number;
	parentId: string;
	viewerId?: string;
}) {
	const rows = await createDb()
		.select({
			id: comment.id,
			content: comment.content,
			createdAt: comment.createdAt,
			noteId: comment.noteId,
			parentId: comment.parentId,
			userId: comment.userId,
			authorName: user.name,
			authorImage: user.image,
		})
		.from(comment)
		.innerJoin(user, eq(comment.userId, user.id))
		.where(eq(comment.parentId, parentId))
		.orderBy(desc(comment.createdAt))
		.limit(limit + 1)
		.offset(offset);
	const page = toPage(rows, limit, offset);

	return {
		...page,
		items: await hydrateComments({
			rows: page.items,
			viewerId,
			withPreviewReplies: false,
		}),
	};
}

async function collectCommentDescendantIds(rootId: string) {
	const db = createDb();
	const ids = [rootId];
	const queue = [rootId];

	while (queue.length > 0) {
		const parentId = queue.shift();
		if (!parentId) continue;
		const children = await db
			.select({ id: comment.id })
			.from(comment)
			.where(eq(comment.parentId, parentId));
		for (const child of children) {
			ids.push(child.id);
			queue.push(child.id);
		}
	}

	return ids;
}

export const commentsRouter = {
	comments: publicProcedure
		.input(noteCommentsInput)
		.handler(async ({ input, context }) => {
			return listRootComments({
				noteId: input.noteId,
				limit: input.limit,
				offset: input.offset,
				viewerId: context.session?.user.id,
			});
		}),

	commentReplies: publicProcedure
		.input(commentRepliesInput)
		.handler(async ({ input, context }) => {
			return listCommentReplies({
				parentId: input.parentId,
				limit: input.limit,
				offset: input.offset,
				viewerId: context.session?.user.id,
			});
		}),

	addComment: activeUserProcedure
		.input(commentInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const parentComment = input.parentId
				? await db
						.select({ id: comment.id, noteId: comment.noteId })
						.from(comment)
						.where(eq(comment.id, input.parentId))
						.limit(1)
						.then((rows) => rows[0])
				: null;

			if (input.parentId && !parentComment) {
				throw new ORPCError("NOT_FOUND");
			}

			if (parentComment && parentComment.noteId !== input.noteId) {
				throw new ORPCError("BAD_REQUEST");
			}

			const [targetNote] = await db
				.select({ advancedOptions: note.advancedOptions })
				.from(note)
				.where(eq(note.id, input.noteId))
				.limit(1);

			if (!targetNote) {
				throw new ORPCError("NOT_FOUND");
			}

			if (!targetNote.advancedOptions.allowComment) {
				throw new ORPCError("FORBIDDEN", {
					message: "作者已关闭评论",
				});
			}

			const [created] = await db
				.insert(comment)
				.values({
					noteId: input.noteId,
					parentId: input.parentId ?? null,
					userId: context.session.user.id,
					content: input.content,
				})
				.returning();
			await notifyNoteOwner({
				type: "comment",
				noteId: input.noteId,
				actorId: context.session.user.id,
				content: input.content,
			});
			return created;
		}),

	toggleCommentLike: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const [targetComment] = await db
				.select({ id: comment.id })
				.from(comment)
				.where(eq(comment.id, input.id))
				.limit(1);

			if (!targetComment) {
				throw new ORPCError("NOT_FOUND");
			}

			const whereClause = and(
				eq(commentLike.commentId, input.id),
				eq(commentLike.userId, context.session.user.id),
			);
			const existing = await db
				.select({ commentId: commentLike.commentId })
				.from(commentLike)
				.where(whereClause)
				.limit(1);
			const liked = existing.length === 0;

			if (liked) {
				await db
					.insert(commentLike)
					.values({ commentId: input.id, userId: context.session.user.id });
			} else {
				await db.delete(commentLike).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(commentLike)
				.where(eq(commentLike.commentId, input.id));
			return { liked, likedCount: toNumber(row?.value) };
		}),

	deleteComment: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const [targetComment] = await db
				.select({ id: comment.id, userId: comment.userId })
				.from(comment)
				.where(eq(comment.id, input.id))
				.limit(1);

			if (!targetComment) {
				throw new ORPCError("NOT_FOUND");
			}

			if (targetComment.userId !== context.session.user.id) {
				throw new ORPCError("FORBIDDEN", {
					message: "只能删除自己的评论",
				});
			}

			const ids = await collectCommentDescendantIds(input.id);
			await db.delete(commentLike).where(inArray(commentLike.commentId, ids));
			await db.delete(comment).where(inArray(comment.id, ids));

			return { ok: true };
		}),
};
