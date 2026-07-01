import { ORPCError } from "@orpc/server";
import {
	type AdminPermissionRequest,
	hasAdminPermission,
} from "@youni/auth/permissions";
import { createDb } from "@youni/db";
import {
	account,
	comment,
	follow,
	note,
	noteLike,
	noteTopic,
	session,
	topic,
	user,
} from "@youni/db/schema/index";
import { hashPassword } from "better-auth/crypto";
import { and, count, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import z from "zod";

import {
	type AdminUserRuleResult,
	type AdminUserStatus,
	adminUserRoleOptions,
	adminUserStatusOptions,
	checkCreateUserPermission,
	checkManageUserPermission,
	checkSelfUserManagement,
	manageableUserStatusOptions,
	parseAdminUserRole,
	parseAdminUserStatus,
} from "../admin-user-governance";
import { protectedProcedure } from "../index";
import {
	deleteContentNote,
	getAdminContentNoteDetail,
	listAdminContentNotes,
	listAdminContentNotesByTopic,
	listAdminContentNotesByUser,
	updateContentNoteStatus,
} from "../lib/content-notes";

const userRoleInput = z.enum(adminUserRoleOptions);
const userStatusInput = z.enum(adminUserStatusOptions);
const manageableUserStatusInput = z.enum(manageableUserStatusOptions);

const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
	const role = parseAdminUserRole(context.account.role);
	const status = parseAdminUserStatus(context.account.status);

	if (
		!role ||
		!status ||
		status !== "active" ||
		!hasAdminPermission(role, { backoffice: ["access"] })
	) {
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

function adminPermissionProcedure(permissions: AdminPermissionRequest) {
	return adminProcedure.use(async ({ context, next }) => {
		assertAdminPermission(context.adminUser.role, permissions);

		return next({ context });
	});
}

const adminListInput = z.object({
	keyword: z.string().trim().optional(),
	status: z
		.enum(["draft", "audit", "published", "rejected", "hidden"])
		.optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
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
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
});

const topicListInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
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

const currentProfileInput = z.object({
	name: z.string().trim().min(1).max(50),
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

function normalizeText(value?: string) {
	const normalized = value?.trim();
	return normalized ? normalized : null;
}

function assertAdminUserRule(result: AdminUserRuleResult) {
	if (result.allowed) return;

	throw new ORPCError(result.message ? "FORBIDDEN" : "BAD_REQUEST", {
		message: result.message,
	});
}

function assertAdminPermission(
	role: string | null | undefined,
	permissions: AdminPermissionRequest,
) {
	if (hasAdminPermission(role, permissions)) return;

	throw new ORPCError("FORBIDDEN");
}

function authStatusPatch(status: AdminUserStatus) {
	if (status === "active") {
		return {
			banExpires: null,
			banReason: null,
			banned: false,
			status,
		};
	}

	return {
		banExpires: null,
		banReason: status === "deleted" ? "账号已删除" : "账号已禁用",
		banned: true,
		status,
	};
}

function shouldRevokeSessions(status: AdminUserStatus) {
	return status !== "active";
}

function getDatabaseErrorCode(error: unknown): string | null {
	if (!error || typeof error !== "object") return null;

	if ("code" in error && typeof error.code === "string") {
		return error.code;
	}

	if ("cause" in error) {
		return getDatabaseErrorCode(error.cause);
	}

	return null;
}

function duplicateUserError(error: unknown): never {
	if (getDatabaseErrorCode(error) === "23505") {
		throw new ORPCError("BAD_REQUEST", {
			message: "邮箱或用户名已存在",
		});
	}

	throw error;
}

function duplicateProfileError(error: unknown): never {
	if (getDatabaseErrorCode(error) === "23505") {
		throw new ORPCError("BAD_REQUEST", {
			message: "用户名已存在",
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

export const adminRouter = {
	me: adminProcedure.handler(async ({ context }) => {
		const [profile] = await createDb()
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
			.where(eq(user.id, context.adminUser.id))
			.limit(1);

		if (!profile) {
			throw new ORPCError("NOT_FOUND");
		}

		return {
			isAdmin: true,
			role: context.adminUser.role,
			user: profile,
		};
	}),

	updateCurrentProfile: adminPermissionProcedure({ profile: ["update"] })
		.input(currentProfileInput)
		.handler(async ({ input, context }) => {
			try {
				const [updated] = await createDb()
					.update(user)
					.set({
						name: input.name,
						image: normalizeText(input.image),
						handle: normalizeText(input.handle),
						bio: normalizeText(input.bio),
						gender: input.gender,
						updatedAt: new Date(),
					})
					.where(eq(user.id, context.adminUser.id))
					.returning({
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
					});

				if (!updated) {
					throw new ORPCError("NOT_FOUND");
				}

				return updated;
			} catch (error) {
				duplicateProfileError(error);
			}
		}),

	overview: adminPermissionProcedure({ dashboard: ["view"] }).handler(
		async () => {
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
				db
					.select({ value: count() })
					.from(note)
					.where(eq(note.status, "audit")),
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
		},
	),

	notes: adminPermissionProcedure({ note: ["list"] })
		.input(adminListInput)
		.handler(async ({ input }) => {
			return listAdminContentNotes(input);
		}),

	noteDetail: adminPermissionProcedure({ note: ["detail"] })
		.input(idInput)
		.handler(async ({ input }) => {
			return getAdminContentNoteDetail(input.id);
		}),

	updateNoteStatus: adminPermissionProcedure({ note: ["audit"] })
		.input(statusInput)
		.handler(async ({ input }) => {
			return updateContentNoteStatus(input);
		}),

	deleteNote: adminPermissionProcedure({ note: ["delete"] })
		.input(idInput)
		.handler(async ({ input }) => {
			return deleteContentNote(input.id);
		}),

	topics: adminPermissionProcedure({ topic: ["list"] })
		.input(topicListInput)
		.handler(async ({ input }) => {
			const db = createDb();
			const whereClause = input.keyword
				? ilike(topic.name, `%${input.keyword}%`)
				: undefined;
			const [totalRow] = whereClause
				? await db.select({ value: count() }).from(topic).where(whereClause)
				: await db.select({ value: count() }).from(topic);
			const rows = whereClause
				? await db
						.select({
							id: topic.id,
							name: topic.name,
							createdAt: topic.createdAt,
						})
						.from(topic)
						.where(whereClause)
						.orderBy(desc(topic.createdAt))
						.limit(input.limit)
						.offset(input.offset)
				: await db
						.select({
							id: topic.id,
							name: topic.name,
							createdAt: topic.createdAt,
						})
						.from(topic)
						.orderBy(desc(topic.createdAt))
						.limit(input.limit)
						.offset(input.offset);

			if (rows.length === 0) {
				return { items: [], total: toNumber(totalRow?.value) };
			}
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

			return {
				items: rows.map((row) => ({
					...row,
					noteCount: countByTopic.get(row.id) ?? 0,
				})),
				total: toNumber(totalRow?.value),
			};
		}),

	topicDetail: adminPermissionProcedure({ topic: ["detail"] })
		.input(idInput)
		.handler(async ({ input }) => {
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

			const notes = await listAdminContentNotesByTopic(input.id);
			return {
				topic: {
					...topicRow,
					noteCount: notes.length,
				},
				notes,
			};
		}),

	saveTopic: adminPermissionProcedure({ topic: ["save"] })
		.input(topicInput)
		.handler(async ({ input }) => {
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
				.values({ name: input.name })
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

	deleteTopic: adminPermissionProcedure({ topic: ["delete"] })
		.input(idInput)
		.handler(async ({ input }) => {
			const db = createDb();
			await db.delete(topic).where(eq(topic.id, input.id));
			return { ok: true };
		}),

	users: adminPermissionProcedure({ user: ["list"] })
		.input(userListInput)
		.handler(async ({ input }) => {
			const db = createDb();
			const conditions = [
				input.status
					? eq(user.status, input.status)
					: ne(user.status, "deleted"),
				input.keyword
					? or(
							ilike(user.name, `%${input.keyword}%`),
							ilike(user.email, `%${input.keyword}%`),
							ilike(user.handle, `%${input.keyword}%`),
						)
					: undefined,
			].filter(Boolean);
			const whereClause = conditions.length ? and(...conditions) : undefined;
			const [totalRow] = whereClause
				? await db.select({ value: count() }).from(user).where(whereClause)
				: await db.select({ value: count() }).from(user);
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
						.offset(input.offset)
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
						.limit(input.limit)
						.offset(input.offset);

			if (rows.length === 0) {
				return { items: [], total: toNumber(totalRow?.value) };
			}
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

			return {
				items: rows.map((row) => ({
					...row,
					noteCount: noteCountByUser.get(row.id) ?? 0,
					followerCount: followerCountByUser.get(row.id) ?? 0,
					followingCount: followingCountByUser.get(row.id) ?? 0,
				})),
				total: toNumber(totalRow?.value),
			};
		}),

	userDetail: adminPermissionProcedure({ user: ["get"] })
		.input(idInput)
		.handler(async ({ input }) => {
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

			const [[followerCountRow], [followingCountRow], followers, following] =
				await Promise.all([
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

			const notes = await listAdminContentNotesByUser(input.id);

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

	createUser: adminPermissionProcedure({ user: ["create"] })
		.input(userCreateInput)
		.handler(async ({ input, context }) => {
			if (input.role !== "user") {
				assertAdminPermission(context.adminUser.role, { user: ["set-role"] });
			}
			if (input.status !== "active") {
				assertAdminPermission(context.adminUser.role, { user: ["ban"] });
			}
			assertAdminUserRule(
				checkCreateUserPermission({
					actorRole: context.adminUser.role,
					role: input.role,
				}),
			);

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
							...authStatusPatch(input.status),
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

	updateUser: adminPermissionProcedure({ user: ["update"] })
		.input(userUpdateInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			if (input.role !== target.role) {
				assertAdminPermission(context.adminUser.role, { user: ["set-role"] });
			}
			if (input.status !== target.status) {
				assertAdminPermission(context.adminUser.role, { user: ["ban"] });
			}
			if (input.password) {
				assertAdminPermission(context.adminUser.role, {
					user: ["set-password"],
				});
			}
			assertAdminUserRule(
				checkSelfUserManagement({
					actorId: context.adminUser.id,
					desiredRole: input.role,
					desiredStatus: input.status,
					target,
				}),
			);
			assertAdminUserRule(
				checkManageUserPermission({
					actorRole: context.adminUser.role,
					desiredRole: input.role,
					target,
				}),
			);

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
							...authStatusPatch(input.status),
							updatedAt: now,
						})
						.where(eq(user.id, input.id))
						.returning();

					if (
						input.status !== target.status &&
						shouldRevokeSessions(input.status)
					) {
						await tx.delete(session).where(eq(session.userId, input.id));
					}

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

	updateUserStatus: adminPermissionProcedure({ user: ["ban"] })
		.input(userStatusChangeInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			const targetRole = parseAdminUserRole(target.role);
			if (!targetRole) {
				throw new ORPCError("BAD_REQUEST");
			}
			assertAdminUserRule(
				checkSelfUserManagement({
					actorId: context.adminUser.id,
					desiredRole: targetRole,
					desiredStatus: input.status,
					target,
				}),
			);
			assertAdminUserRule(
				checkManageUserPermission({
					actorRole: context.adminUser.role,
					desiredRole: targetRole,
					target,
				}),
			);

			return createDb().transaction(async (tx) => {
				const [updated] = await tx
					.update(user)
					.set({ ...authStatusPatch(input.status), updatedAt: new Date() })
					.where(eq(user.id, input.id))
					.returning();

				if (shouldRevokeSessions(input.status)) {
					await tx.delete(session).where(eq(session.userId, input.id));
				}

				return updated;
			});
		}),

	softDeleteUser: adminPermissionProcedure({ user: ["delete"] })
		.input(idInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			const targetRole = parseAdminUserRole(target.role);
			if (!targetRole) {
				throw new ORPCError("BAD_REQUEST");
			}
			assertAdminUserRule(
				checkSelfUserManagement({
					actorId: context.adminUser.id,
					desiredRole: targetRole,
					desiredStatus: "deleted",
					target,
				}),
			);
			assertAdminUserRule(
				checkManageUserPermission({
					actorRole: context.adminUser.role,
					desiredRole: targetRole,
					target,
				}),
			);

			return createDb().transaction(async (tx) => {
				const [deleted] = await tx
					.update(user)
					.set({ ...authStatusPatch("deleted"), updatedAt: new Date() })
					.where(eq(user.id, input.id))
					.returning();

				await tx.delete(session).where(eq(session.userId, input.id));

				return deleted;
			});
		}),

	restoreUser: adminPermissionProcedure({ user: ["restore"] })
		.input(userRestoreInput)
		.handler(async ({ input, context }) => {
			const target = await getUserForAdmin(input.id);
			const targetRole = parseAdminUserRole(target.role);
			if (!targetRole) {
				throw new ORPCError("BAD_REQUEST");
			}
			assertAdminUserRule(
				checkSelfUserManagement({
					actorId: context.adminUser.id,
					desiredRole: targetRole,
					desiredStatus: input.status,
					target,
				}),
			);
			assertAdminUserRule(
				checkManageUserPermission({
					actorRole: context.adminUser.role,
					desiredRole: targetRole,
					target,
				}),
			);

			return createDb().transaction(async (tx) => {
				const [updated] = await tx
					.update(user)
					.set({ ...authStatusPatch(input.status), updatedAt: new Date() })
					.where(eq(user.id, input.id))
					.returning();

				if (shouldRevokeSessions(input.status)) {
					await tx.delete(session).where(eq(session.userId, input.id));
				}

				return updated;
			});
		}),
};
