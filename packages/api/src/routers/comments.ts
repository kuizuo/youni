import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	comment,
	commentLike,
	follow,
	note,
	user,
} from "@youni/db/schema/index";
import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import type { CommentListRow } from "../contracts/comments-output";
import {
	activeUserProcedure,
	protectedProcedure,
	publicProcedure,
} from "../index";
import { notifyCommentOwner, notifyNoteOwner } from "../lib/notifications";
import { toNumber, toPage } from "./utils";

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

async function getRawCommentById(commentId: string) {
	const [row] = await createDb()
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
		.where(eq(comment.id, commentId))
		.limit(1);

	return row;
}

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
						limit: 1,
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
	sort = "hot",
	viewerId,
}: {
	limit: number;
	noteId: string;
	offset: number;
	sort?: "hot" | "latest";
	viewerId?: string;
}) {
	const db = createDb();
	const rows = await db
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
		.leftJoin(commentLike, eq(commentLike.commentId, comment.id))
		.where(and(eq(comment.noteId, noteId), isNull(comment.parentId)))
		.groupBy(comment.id)
		.orderBy(
			...(sort === "hot"
				? [desc(count(commentLike.commentId)), desc(comment.createdAt)]
				: [desc(comment.createdAt)]),
		)
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

async function getCommentById({
	commentId,
	viewerId,
}: {
	commentId: string;
	viewerId?: string;
}) {
	const row = await getRawCommentById(commentId);
	if (!row) return null;

	return hydrateComments({
		rows: [row],
		viewerId,
		withPreviewReplies: false,
	}).then((items) => items[0] ?? null);
}

async function getRootCommentId(commentId: string) {
	let currentId = commentId;
	let parentId: null | string | undefined;

	do {
		const [row] = await createDb()
			.select({ id: comment.id, parentId: comment.parentId })
			.from(comment)
			.where(eq(comment.id, currentId))
			.limit(1);
		if (!row) return currentId;
		currentId = row.id;
		parentId = row.parentId;
		if (parentId) {
			currentId = parentId;
		}
	} while (parentId);

	return currentId;
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
	myComments: protectedProcedure.myComments.handler(
		async ({ input, context }) => {
			const db = createDb();
			const viewerId = context.session.user.id;
			const rows = await db
				.select({
					id: comment.id,
					content: comment.content,
					createdAt: comment.createdAt,
					noteId: comment.noteId,
					parentId: comment.parentId,
					noteAuthorId: note.userId,
					noteCover: note.cover,
					noteStatus: note.status,
					noteTitle: note.title,
					noteVisibility: note.visibility,
				})
				.from(comment)
				.innerJoin(note, eq(comment.noteId, note.id))
				.where(eq(comment.userId, viewerId))
				.orderBy(desc(comment.createdAt))
				.limit(input.limit);

			const followerOnlyAuthorIds = Array.from(
				new Set(
					rows.flatMap((row) =>
						row.noteAuthorId !== viewerId &&
						row.noteStatus === "published" &&
						row.noteVisibility === "followers"
							? [row.noteAuthorId]
							: [],
					),
				),
			);
			const parentIds = Array.from(
				new Set(rows.flatMap((row) => (row.parentId ? [row.parentId] : []))),
			);
			const [followingRows, parentRows] = await Promise.all([
				followerOnlyAuthorIds.length > 0
					? db
							.select({ followingId: follow.followingId })
							.from(follow)
							.where(
								and(
									eq(follow.followerId, viewerId),
									inArray(follow.followingId, followerOnlyAuthorIds),
								),
							)
					: Promise.resolve([]),
				parentIds.length > 0
					? db
							.select({
								authorName: user.name,
								content: comment.content,
								id: comment.id,
							})
							.from(comment)
							.innerJoin(user, eq(comment.userId, user.id))
							.where(inArray(comment.id, parentIds))
					: Promise.resolve([]),
			]);
			const followingSet = new Set(followingRows.map((row) => row.followingId));
			const parentById = new Map(parentRows.map((row) => [row.id, row]));

			return rows.map((row) => {
				const canOpenNote =
					row.noteStatus !== "hidden" &&
					(row.noteAuthorId === viewerId ||
						(row.noteStatus === "published" &&
							(row.noteVisibility === "public" ||
								(row.noteVisibility === "followers" &&
									followingSet.has(row.noteAuthorId)))));

				return {
					id: row.id,
					content: row.content,
					createdAt: row.createdAt,
					noteId: row.noteId,
					parentId: row.parentId,
					replyToComment: row.parentId
						? (parentById.get(row.parentId) ?? null)
						: null,
					canOpenNote,
					notePreview: canOpenNote
						? { cover: row.noteCover, title: row.noteTitle }
						: null,
				};
			});
		},
	),

	comments: publicProcedure.comments.handler(async ({ input, context }) => {
		return listRootComments({
			noteId: input.noteId,
			limit: input.limit,
			offset: input.offset,
			sort: input.sort,
			viewerId: context.session?.user.id,
		});
	}),

	commentReplies: publicProcedure.commentReplies.handler(
		async ({ input, context }) => {
			return listCommentReplies({
				parentId: input.parentId,
				limit: input.limit,
				offset: input.offset,
				viewerId: context.session?.user.id,
			});
		},
	),

	commentAnchor: publicProcedure.commentAnchor.handler(
		async ({ input, context }) => {
			const targetComment = await getCommentById({
				commentId: input.id,
				viewerId: context.session?.user.id,
			});
			if (!targetComment) {
				throw new ORPCError("NOT_FOUND");
			}

			return {
				comment: targetComment,
				rootCommentId: await getRootCommentId(input.id),
			};
		},
	),

	addComment: activeUserProcedure.addComment.handler(
		async ({ input, context }) => {
			const db = createDb();
			const parentComment = input.parentId
				? await db
						.select({
							id: comment.id,
							noteId: comment.noteId,
							userId: comment.userId,
						})
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
			if (parentComment) {
				await notifyCommentOwner({
					type: "comment",
					commentId: parentComment.id,
					notificationCommentId: created?.id,
					actorId: context.session.user.id,
					content: input.content,
				});
			} else {
				await notifyNoteOwner({
					type: "comment",
					noteId: input.noteId,
					commentId: created?.id,
					actorId: context.session.user.id,
					content: input.content,
				});
			}
			return created;
		},
	),

	toggleCommentLike: activeUserProcedure.toggleCommentLike.handler(
		async ({ input, context }) => {
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
				await notifyCommentOwner({
					type: "like",
					commentId: input.id,
					actorId: context.session.user.id,
				});
			} else {
				await db.delete(commentLike).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(commentLike)
				.where(eq(commentLike.commentId, input.id));
			return { liked, likedCount: toNumber(row?.value) };
		},
	),

	deleteComment: activeUserProcedure.deleteComment.handler(
		async ({ input, context }) => {
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
		},
	),
};
