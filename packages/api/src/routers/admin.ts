import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	account,
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
	topic,
	user,
} from "@youni/db/schema/index";
import { hashPassword } from "better-auth/crypto";
import { and, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";

const userRoleInput = z.enum(["admin", "operator", "user"]);
const userStatusInput = z.enum(["active", "disabled", "deleted"]);
const manageableUserStatusInput = z.enum(["active", "disabled"]);

type UserRole = z.infer<typeof userRoleInput>;
type UserStatus = z.infer<typeof userStatusInput>;

const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
	const role = parseRole(context.account.role);
	const status = parseStatus(context.account.status);

	if (!role || !status || status !== "active" || !isBackofficeRole(role)) {
		throw new ORPCError("FORBIDDEN");
	}

	return next({
		context: {
			...context,
			adminUser: {
				...context.account,
				role,
				status,
			},
		},
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
	status: userStatusInput.optional(),
	limit: z.number().int().min(1).max(100).default(50),
});

const userStatusChangeInput = z.object({
	id: z.string().min(1),
	status: userStatusInput,
});

const userCreateInput = z.object({
	name: z.string().trim().min(1).max(50),
	email: z.string().trim().toLowerCase().email(),
	password: z.string().min(8).max(128),
	role: userRoleInput.default("user"),
	status: manageableUserStatusInput.default("active"),
	image: z.string().trim().url().optional().or(z.literal("")),
	handle: z
		.string()
		.trim()
		.min(2)
		.max(30)
		.regex(/^[a-zA-Z0-9_]+$/)
		.optional()
		.or(z.literal("")),
	bio: z.string().trim().max(160).optional(),
	gender: z.enum(["unknown", "male", "female"]).default("unknown"),
});

const userUpdateInput = userCreateInput.omit({ password: true }).extend({
	id: z.string().min(1),
	status: userStatusInput,
	password: z.string().min(8).max(128).optional().or(z.literal("")),
});

const userRestoreInput = z.object({
	id: z.string().min(1),
	status: manageableUserStatusInput.default("active"),
});

function createId() {
	return crypto.randomUUID();
}

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

function parseRole(value?: string | null): UserRole | null {
	return userRoleInput.safeParse(value).success ? (value as UserRole) : null;
}

function parseStatus(value?: string | null): UserStatus | null {
	return userStatusInput.safeParse(value).success
		? (value as UserStatus)
		: null;
}

function isBackofficeRole(role: UserRole) {
	return role === "admin" || role === "operator";
}

function normalizeText(value?: string) {
	const normalized = value?.trim();
	return normalized ? normalized : null;
}

function assertCanManageUser({
	actorRole,
	desiredRole,
	desiredStatus,
	target,
}: {
	actorRole: UserRole;
	desiredRole: UserRole;
	desiredStatus?: UserStatus;
	target: {
		id: string;
		role: string;
		status: string;
	};
}) {
	const targetRole = parseRole(target.role);
	const targetStatus = parseStatus(target.status);

	if (!targetRole || !targetStatus) {
		throw new ORPCError("BAD_REQUEST");
	}

	if (actorRole === "operator") {
		if (targetRole !== "user" || desiredRole !== "user") {
			throw new ORPCError("FORBIDDEN", {
				message: "运营只能管理普通用户",
			});
		}
		return;
	}

	if (actorRole !== "admin") {
		throw new ORPCError("FORBIDDEN");
	}

	if (desiredStatus && desiredStatus !== targetStatus) {
		return;
	}
}

function assertCanManageSelf({
	actorId,
	desiredRole,
	desiredStatus,
	target,
}: {
	actorId: string;
	desiredRole: UserRole;
	desiredStatus?: UserStatus;
	target: {
		id: string;
		role: string;
		status: string;
	};
}) {
	if (actorId !== target.id) return;

	if (desiredRole !== target.role || desiredStatus !== target.status) {
		throw new ORPCError("FORBIDDEN", {
			message: "不能修改自己的角色或状态",
		});
	}
}

function assertCanCreateRole(actorRole: UserRole, role: UserRole) {
	if (actorRole === "admin") return;
	if (actorRole === "operator" && role === "user") return;

	throw new ORPCError("FORBIDDEN", {
		message: "运营只能创建普通用户",
	});
}

function duplicateUserError(error: unknown): never {
	if (
		error &&
		typeof error === "object" &&
		"code" in error &&
		error.code === "23505"
	) {
		throw new ORPCError("BAD_REQUEST", {
			message: "邮箱或用户名已存在",
		});
	}

	throw error;
}

async function getUserForAdmin(id: string) {
	const [target] = await createDb()
		.select({
			id: user.id,
			role: user.role,
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, id))
		.limit(1);

	if (!target) {
		throw new ORPCError("NOT_FOUND");
	}

	return target;
}

async function enrichNoteRows<
	T extends {
		id: string;
	},
>(db: ReturnType<typeof createDb>, rows: T[]) {
	if (rows.length === 0) return [];

	const noteIds = rows.map((row) => row.id);
	const [topicRows, likeRows, commentRows, collectionRows] = await Promise.all([
		db
			.select({ noteId: noteTopic.noteId, id: topic.id, name: topic.name })
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

	const topicsByNote = new Map<string, { id: string; name: string }[]>();
	for (const row of topicRows) {
		topicsByNote.set(row.noteId, [
			...(topicsByNote.get(row.noteId) ?? []),
			{ id: row.id, name: row.name },
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

	return rows.map((row) => {
		const topics = topicsByNote.get(row.id) ?? [];
		return {
			...row,
			topics: topics.map((item) => item.name),
			topicDetails: topics,
			likedCount: likesByNote.get(row.id) ?? 0,
			commentCount: commentsByNote.get(row.id) ?? 0,
			collectedCount: collectionsByNote.get(row.id) ?? 0,
		};
	});
}

export const adminRouter = {
	me: adminProcedure.handler(({ context }) => {
		return {
			isAdmin: true,
			role: context.adminUser.role,
			user: {
				...context.session.user,
				role: context.adminUser.role,
				status: context.adminUser.status,
			},
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
			db
				.select({ value: count() })
				.from(user)
				.where(ne(user.status, "deleted")),
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

		return enrichNoteRows(db, rows);
	}),

	noteDetail: adminProcedure.input(idInput).handler(async ({ input }) => {
		const db = createDb();
		const [row] = await db
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
				updatedAt: note.updatedAt,
				publishedAt: note.publishedAt,
				draftSavedAt: note.draftSavedAt,
				userId: note.userId,
				authorName: user.name,
				authorEmail: user.email,
				authorImage: user.image,
				authorHandle: user.handle,
			})
			.from(note)
			.innerJoin(user, eq(note.userId, user.id))
			.where(eq(note.id, input.id))
			.limit(1);

		if (!row) {
			throw new ORPCError("NOT_FOUND");
		}

		const [detail] = await enrichNoteRows(db, [row]);
		const [comments, likedUsers, collectedUsers] = await Promise.all([
			db
				.select({
					id: comment.id,
					content: comment.content,
					createdAt: comment.createdAt,
					authorId: user.id,
					authorName: user.name,
					authorEmail: user.email,
					authorImage: user.image,
				})
				.from(comment)
				.innerJoin(user, eq(comment.userId, user.id))
				.where(eq(comment.noteId, input.id))
				.orderBy(desc(comment.createdAt))
				.limit(50),
			db
				.select({
					userId: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					createdAt: noteLike.createdAt,
				})
				.from(noteLike)
				.innerJoin(user, eq(noteLike.userId, user.id))
				.where(eq(noteLike.noteId, input.id))
				.orderBy(desc(noteLike.createdAt))
				.limit(20),
			db
				.select({
					userId: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					createdAt: noteCollection.createdAt,
				})
				.from(noteCollection)
				.innerJoin(user, eq(noteCollection.userId, user.id))
				.where(eq(noteCollection.noteId, input.id))
				.orderBy(desc(noteCollection.createdAt))
				.limit(20),
		]);

		return {
			...detail,
			comments,
			likedUsers,
			collectedUsers,
		};
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

	topicDetail: adminProcedure.input(idInput).handler(async ({ input }) => {
		const db = createDb();
		const [topicRow] = await db
			.select({
				id: topic.id,
				name: topic.name,
				createdAt: topic.createdAt,
				updatedAt: topic.updatedAt,
			})
			.from(topic)
			.where(eq(topic.id, input.id))
			.limit(1);

		if (!topicRow) {
			throw new ORPCError("NOT_FOUND");
		}

		const rows = await db
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
			.from(noteTopic)
			.innerJoin(note, eq(noteTopic.noteId, note.id))
			.innerJoin(user, eq(note.userId, user.id))
			.where(eq(noteTopic.topicId, input.id))
			.orderBy(desc(note.createdAt))
			.limit(100);

		const notes = await enrichNoteRows(db, rows);
		return {
			topic: {
				...topicRow,
				noteCount: notes.length,
			},
			notes,
		};
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
		const conditions = [
			input.status ? eq(user.status, input.status) : ne(user.status, "deleted"),
			input.keyword
				? or(
						ilike(user.name, `%${input.keyword}%`),
						ilike(user.email, `%${input.keyword}%`),
						ilike(user.handle, `%${input.keyword}%`),
					)
				: undefined,
		].filter(Boolean);
		const whereClause = conditions.length ? and(...conditions) : undefined;
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
						role: user.role,
						status: user.status,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
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
						role: user.role,
						status: user.status,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
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

	userDetail: adminProcedure.input(idInput).handler(async ({ input }) => {
		const db = createDb();
		const [userRow] = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				handle: user.handle,
				bio: user.bio,
				gender: user.gender,
				role: user.role,
				status: user.status,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			})
			.from(user)
			.where(eq(user.id, input.id))
			.limit(1);

		if (!userRow) {
			throw new ORPCError("NOT_FOUND");
		}

		const [
			noteRows,
			[followerCountRow],
			[followingCountRow],
			followers,
			following,
		] = await Promise.all([
			db
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
				.where(eq(note.userId, input.id))
				.orderBy(desc(note.createdAt))
				.limit(100),
			db
				.select({ value: count() })
				.from(follow)
				.where(eq(follow.followingId, input.id)),
			db
				.select({ value: count() })
				.from(follow)
				.where(eq(follow.followerId, input.id)),
			db
				.select({
					userId: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					createdAt: follow.createdAt,
				})
				.from(follow)
				.innerJoin(user, eq(follow.followerId, user.id))
				.where(eq(follow.followingId, input.id))
				.orderBy(desc(follow.createdAt))
				.limit(20),
			db
				.select({
					userId: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					createdAt: follow.createdAt,
				})
				.from(follow)
				.innerJoin(user, eq(follow.followingId, user.id))
				.where(eq(follow.followerId, input.id))
				.orderBy(desc(follow.createdAt))
				.limit(20),
		]);

		const notes = await enrichNoteRows(db, noteRows);

		return {
			user: {
				...userRow,
				noteCount: notes.length,
				followerCount: toNumber(followerCountRow?.value),
				followingCount: toNumber(followingCountRow?.value),
			},
			notes,
			followers,
			following,
		};
	}),

	createUser: adminProcedure
		.input(userCreateInput)
		.handler(async ({ input, context }) => {
			assertCanCreateRole(context.adminUser.role, input.role);

			const db = createDb();
			const now = new Date();
			const id = createId();
			const password = await hashPassword(input.password);

			try {
				return await db.transaction(async (tx) => {
					const [createdUser] = await tx
						.insert(user)
						.values({
							id,
							name: input.name,
							email: input.email,
							emailVerified: true,
							image: normalizeText(input.image),
							handle: normalizeText(input.handle),
							bio: normalizeText(input.bio),
							gender: input.gender,
							role: input.role,
							status: input.status,
							createdAt: now,
							updatedAt: now,
						})
						.returning();

					await tx.insert(account).values({
						id: createId(),
						accountId: id,
						providerId: "credential",
						userId: id,
						password,
						createdAt: now,
						updatedAt: now,
					});

					return createdUser;
				});
			} catch (error) {
				duplicateUserError(error);
			}
		}),

	updateUser: adminProcedure
		.input(userUpdateInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			assertCanManageSelf({
				actorId: context.adminUser.id,
				desiredRole: input.role,
				desiredStatus: input.status,
				target,
			});
			assertCanManageUser({
				actorRole: context.adminUser.role,
				desiredRole: input.role,
				desiredStatus: input.status,
				target,
			});

			const db = createDb();
			const now = new Date();

			try {
				return await db.transaction(async (tx) => {
					const [updatedUser] = await tx
						.update(user)
						.set({
							name: input.name,
							email: input.email,
							image: normalizeText(input.image),
							handle: normalizeText(input.handle),
							bio: normalizeText(input.bio),
							gender: input.gender,
							role: input.role,
							status: input.status,
							updatedAt: now,
						})
						.where(eq(user.id, input.id))
						.returning();

					if (input.password) {
						const password = await hashPassword(input.password);
						const [existing] = await tx
							.select({ id: account.id })
							.from(account)
							.where(
								and(
									eq(account.userId, input.id),
									eq(account.providerId, "credential"),
								),
							)
							.limit(1);

						if (existing) {
							await tx
								.update(account)
								.set({
									accountId: input.id,
									password,
									updatedAt: now,
								})
								.where(eq(account.id, existing.id));
						} else {
							await tx.insert(account).values({
								id: createId(),
								accountId: input.id,
								providerId: "credential",
								userId: input.id,
								password,
								createdAt: now,
								updatedAt: now,
							});
						}
					}

					return updatedUser;
				});
			} catch (error) {
				duplicateUserError(error);
			}
		}),

	updateUserStatus: adminProcedure
		.input(userStatusChangeInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			const targetRole = parseRole(target.role);
			if (!targetRole) {
				throw new ORPCError("BAD_REQUEST");
			}
			assertCanManageSelf({
				actorId: context.adminUser.id,
				desiredRole: targetRole,
				desiredStatus: input.status,
				target,
			});
			assertCanManageUser({
				actorRole: context.adminUser.role,
				desiredRole: targetRole,
				desiredStatus: input.status,
				target,
			});

			const [updated] = await createDb()
				.update(user)
				.set({ status: input.status, updatedAt: new Date() })
				.where(eq(user.id, input.id))
				.returning();
			return updated;
		}),

	softDeleteUser: adminProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			const targetRole = parseRole(target.role);
			if (!targetRole) {
				throw new ORPCError("BAD_REQUEST");
			}
			assertCanManageSelf({
				actorId: context.adminUser.id,
				desiredRole: targetRole,
				desiredStatus: "deleted",
				target,
			});
			assertCanManageUser({
				actorRole: context.adminUser.role,
				desiredRole: targetRole,
				desiredStatus: "deleted",
				target,
			});

			const [updated] = await createDb()
				.update(user)
				.set({ status: "deleted", updatedAt: new Date() })
				.where(eq(user.id, input.id))
				.returning();

			return updated;
		}),

	restoreUser: adminProcedure
		.input(userRestoreInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			const targetRole = parseRole(target.role);
			if (!targetRole) {
				throw new ORPCError("BAD_REQUEST");
			}
			assertCanManageSelf({
				actorId: context.adminUser.id,
				desiredRole: targetRole,
				desiredStatus: input.status,
				target,
			});
			assertCanManageUser({
				actorRole: context.adminUser.role,
				desiredRole: targetRole,
				desiredStatus: input.status,
				target,
			});

			const [updated] = await createDb()
				.update(user)
				.set({ status: input.status, updatedAt: new Date() })
				.where(eq(user.id, input.id))
				.returning();

			return updated;
		}),
};
