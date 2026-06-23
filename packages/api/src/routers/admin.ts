import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
	topic,
	user,
} from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";

const adminEnv = env as unknown as Record<string, string | undefined>;

function adminEmails() {
	return new Set(
		(adminEnv.ADMIN_EMAILS ?? "")
			.split(",")
			.map((email) => email.trim().toLowerCase())
			.filter(Boolean),
	);
}

export function isAdminEmail(email?: string | null) {
	if (!email) return false;
	return adminEmails().has(email.toLowerCase());
}

const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
	if (!isAdminEmail(context.session.user.email)) {
		throw new ORPCError("FORBIDDEN");
	}

	return next({
		context,
	});
});

const adminListInput = z.object({
	keyword: z.string().trim().optional(),
	status: z
		.enum(["draft", "audit", "published", "rejected", "hidden"])
		.optional(),
	limit: z.number().int().min(1).max(100).default(50),
});

const idInput = z.object({ id: z.string().min(1) });

const statusInput = z.object({
	id: z.string().min(1),
	status: z.enum(["draft", "audit", "published", "rejected", "hidden"]),
	rejectionReason: z.string().trim().max(200).optional(),
});

const topicInput = z.object({
	id: z.string().min(1).optional(),
	name: z.string().trim().min(1).max(24),
});

const userListInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(100).default(50),
});

const userStatusInput = z.object({
	id: z.string().min(1),
	status: z.enum(["active", "disabled"]),
});

function createId() {
	return crypto.randomUUID();
}

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

export const adminRouter = {
	me: adminProcedure.handler(({ context }) => {
		return {
			isAdmin: true,
			user: context.session.user,
		};
	}),

	overview: adminProcedure.handler(async () => {
		const db = createDb();
		const [
			[noteCount],
			[auditCount],
			[userCount],
			[topicCount],
			[likeCount],
			[commentCount],
			recentNotes,
		] = await Promise.all([
			db.select({ value: count() }).from(note),
			db.select({ value: count() }).from(note).where(eq(note.status, "audit")),
			db.select({ value: count() }).from(user),
			db.select({ value: count() }).from(topic),
			db.select({ value: count() }).from(noteLike),
			db.select({ value: count() }).from(comment),
			db
				.select({
					id: note.id,
					title: note.title,
					status: note.status,
					createdAt: note.createdAt,
					authorName: user.name,
				})
				.from(note)
				.innerJoin(user, eq(note.userId, user.id))
				.orderBy(desc(note.createdAt))
				.limit(8),
		]);

		return {
			noteCount: toNumber(noteCount?.value),
			auditCount: toNumber(auditCount?.value),
			userCount: toNumber(userCount?.value),
			topicCount: toNumber(topicCount?.value),
			interactionCount:
				toNumber(likeCount?.value) + toNumber(commentCount?.value),
			recentNotes,
		};
	}),

	notes: adminProcedure.input(adminListInput).handler(async ({ input }) => {
		const db = createDb();
		const conditions = [
			input.status ? eq(note.status, input.status) : undefined,
			input.keyword
				? or(
						ilike(note.title, `%${input.keyword}%`),
						ilike(note.content, `%${input.keyword}%`),
					)
				: undefined,
		].filter(Boolean);

		const whereClause = conditions.length ? and(...conditions) : undefined;
		const rows = whereClause
			? await db
					.select({
						id: note.id,
						title: note.title,
						content: note.content,
						cover: note.cover,
						images: note.images,
						locationName: note.locationName,
						visibility: note.visibility,
						components: note.components,
						advancedOptions: note.advancedOptions,
						status: note.status,
						rejectionReason: note.rejectionReason,
						createdAt: note.createdAt,
						publishedAt: note.publishedAt,
						draftSavedAt: note.draftSavedAt,
						userId: note.userId,
						authorName: user.name,
						authorEmail: user.email,
					})
					.from(note)
					.innerJoin(user, eq(note.userId, user.id))
					.where(whereClause)
					.orderBy(desc(note.createdAt))
					.limit(input.limit)
			: await db
					.select({
						id: note.id,
						title: note.title,
						content: note.content,
						cover: note.cover,
						images: note.images,
						locationName: note.locationName,
						visibility: note.visibility,
						components: note.components,
						advancedOptions: note.advancedOptions,
						status: note.status,
						rejectionReason: note.rejectionReason,
						createdAt: note.createdAt,
						publishedAt: note.publishedAt,
						draftSavedAt: note.draftSavedAt,
						userId: note.userId,
						authorName: user.name,
						authorEmail: user.email,
					})
					.from(note)
					.innerJoin(user, eq(note.userId, user.id))
					.orderBy(desc(note.createdAt))
					.limit(input.limit);

		if (rows.length === 0) return [];

		const noteIds = rows.map((row) => row.id);
		const [topicRows, likeRows, commentRows, collectionRows] =
			await Promise.all([
				db
					.select({ noteId: noteTopic.noteId, name: topic.name })
					.from(noteTopic)
					.innerJoin(topic, eq(noteTopic.topicId, topic.id))
					.where(inArray(noteTopic.noteId, noteIds)),
				db
					.select({ noteId: noteLike.noteId, value: count() })
					.from(noteLike)
					.where(inArray(noteLike.noteId, noteIds))
					.groupBy(noteLike.noteId),
				db
					.select({ noteId: comment.noteId, value: count() })
					.from(comment)
					.where(inArray(comment.noteId, noteIds))
					.groupBy(comment.noteId),
				db
					.select({ noteId: noteCollection.noteId, value: count() })
					.from(noteCollection)
					.where(inArray(noteCollection.noteId, noteIds))
					.groupBy(noteCollection.noteId),
			]);

		const topicsByNote = new Map<string, string[]>();
		for (const row of topicRows) {
			topicsByNote.set(row.noteId, [
				...(topicsByNote.get(row.noteId) ?? []),
				row.name,
			]);
		}

		const likesByNote = new Map(
			likeRows.map((row) => [row.noteId, toNumber(row.value)]),
		);
		const commentsByNote = new Map(
			commentRows.map((row) => [row.noteId, toNumber(row.value)]),
		);
		const collectionsByNote = new Map(
			collectionRows.map((row) => [row.noteId, toNumber(row.value)]),
		);

		return rows.map((row) => ({
			...row,
			topics: topicsByNote.get(row.id) ?? [],
			likedCount: likesByNote.get(row.id) ?? 0,
			commentCount: commentsByNote.get(row.id) ?? 0,
			collectedCount: collectionsByNote.get(row.id) ?? 0,
		}));
	}),

	updateNoteStatus: adminProcedure
		.input(statusInput)
		.handler(async ({ input }) => {
			const db = createDb();
			const [updated] = await db
				.update(note)
				.set({
					status: input.status,
					rejectionReason:
						input.status === "rejected"
							? input.rejectionReason || "内容未通过审核"
							: null,
					publishedAt: input.status === "published" ? new Date() : null,
				})
				.where(eq(note.id, input.id))
				.returning();
			return updated;
		}),

	deleteNote: adminProcedure.input(idInput).handler(async ({ input }) => {
		const db = createDb();
		await db.delete(note).where(eq(note.id, input.id));
		return { ok: true };
	}),

	topics: adminProcedure.input(userListInput).handler(async ({ input }) => {
		const db = createDb();
		const rows = input.keyword
			? await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.where(ilike(topic.name, `%${input.keyword}%`))
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

	saveTopic: adminProcedure.input(topicInput).handler(async ({ input }) => {
		const db = createDb();
		if (input.id) {
			const [updated] = await db
				.update(topic)
				.set({ name: input.name })
				.where(eq(topic.id, input.id))
				.returning();
			return updated;
		}

		const [created] = await db
			.insert(topic)
			.values({ id: createId(), name: input.name })
			.onConflictDoNothing({ target: topic.name })
			.returning();

		if (created) return created;

		const [existing] = await db
			.select()
			.from(topic)
			.where(eq(topic.name, input.name))
			.limit(1);
		return existing;
	}),

	deleteTopic: adminProcedure.input(idInput).handler(async ({ input }) => {
		const db = createDb();
		await db.delete(topic).where(eq(topic.id, input.id));
		return { ok: true };
	}),

	users: adminProcedure.input(userListInput).handler(async ({ input }) => {
		const db = createDb();
		const whereClause = input.keyword
			? or(
					ilike(user.name, `%${input.keyword}%`),
					ilike(user.email, `%${input.keyword}%`),
				)
			: undefined;
		const rows = whereClause
			? await db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						handle: user.handle,
						bio: user.bio,
						gender: user.gender,
						status: user.status,
						createdAt: user.createdAt,
					})
					.from(user)
					.where(whereClause)
					.orderBy(desc(user.createdAt))
					.limit(input.limit)
			: await db
					.select({
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						handle: user.handle,
						bio: user.bio,
						gender: user.gender,
						status: user.status,
						createdAt: user.createdAt,
					})
					.from(user)
					.orderBy(desc(user.createdAt))
					.limit(input.limit);

		if (rows.length === 0) return [];
		const userIds = rows.map((row) => row.id);
		const [noteRows, followerRows, followingRows] = await Promise.all([
			db
				.select({ userId: note.userId, value: count() })
				.from(note)
				.where(inArray(note.userId, userIds))
				.groupBy(note.userId),
			db
				.select({ userId: follow.followingId, value: count() })
				.from(follow)
				.where(inArray(follow.followingId, userIds))
				.groupBy(follow.followingId),
			db
				.select({ userId: follow.followerId, value: count() })
				.from(follow)
				.where(inArray(follow.followerId, userIds))
				.groupBy(follow.followerId),
		]);

		const noteCountByUser = new Map(
			noteRows.map((row) => [row.userId, toNumber(row.value)]),
		);
		const followerCountByUser = new Map(
			followerRows.map((row) => [row.userId, toNumber(row.value)]),
		);
		const followingCountByUser = new Map(
			followingRows.map((row) => [row.userId, toNumber(row.value)]),
		);

		return rows.map((row) => ({
			...row,
			noteCount: noteCountByUser.get(row.id) ?? 0,
			followerCount: followerCountByUser.get(row.id) ?? 0,
			followingCount: followingCountByUser.get(row.id) ?? 0,
		}));
	}),

	updateUserStatus: adminProcedure
		.input(userStatusInput)
		.handler(async ({ input }) => {
			const db = createDb();
			const [updated] = await db
				.update(user)
				.set({ status: input.status })
				.where(eq(user.id, input.id))
				.returning();
			return updated;
		}),
};
