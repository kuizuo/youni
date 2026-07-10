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
import { and, count, desc, eq, inArray, ne, or } from "drizzle-orm";

import {
	type AdminUserRuleResult,
	type AdminUserStatus,
	checkCreateUserPermission,
	checkManageUserPermission,
	checkSelfUserManagement,
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
import { containsInsensitive } from "../lib/search";

const adminProcedure = protectedProcedure.admin.use(
	async ({ context, next }) => {
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
	},
);

function adminPermissionProcedure(permissions: AdminPermissionRequest) {
	return adminProcedure.use(async ({ context, next }) => {
		assertAdminPermission(context.adminUser.role, permissions);

		return next({ context });
	});
}

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

function getDatabaseErrorMessage(error: unknown): string {
	if (!error || typeof error !== "object") return "";

	if ("message" in error && typeof error.message === "string") {
		return error.message;
	}

	if ("cause" in error) {
		return getDatabaseErrorMessage(error.cause);
	}

	return "";
}

function isUniqueConstraintError(error: unknown) {
	return (
		getDatabaseErrorCode(error) === "23505" ||
		getDatabaseErrorMessage(error).includes("UNIQUE constraint failed")
	);
}

function duplicateUserError(error: unknown): never {
	if (isUniqueConstraintError(error)) {
		throw new ORPCError("BAD_REQUEST", {
			message: "邮箱或用户名已存在",
		});
	}

	throw error;
}

function duplicateProfileError(error: unknown): never {
	if (isUniqueConstraintError(error)) {
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
	me: adminProcedure.me.handler(async ({ context }) => {
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

	updateCurrentProfile: adminPermissionProcedure({
		profile: ["update"],
	}).updateCurrentProfile.handler(async ({ input, context }) => {
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

	overview: adminPermissionProcedure({ dashboard: ["view"] }).overview.handler(
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

	notes: adminPermissionProcedure({ note: ["list"] }).notes.handler(
		async ({ input }) => {
			return listAdminContentNotes(input);
		},
	),

	noteDetail: adminPermissionProcedure({ note: ["detail"] }).noteDetail.handler(
		async ({ input }) => {
			return getAdminContentNoteDetail(input.id);
		},
	),

	updateNoteStatus: adminPermissionProcedure({
		note: ["audit"],
	}).updateNoteStatus.handler(async ({ input }) => {
		return updateContentNoteStatus(input);
	}),

	deleteNote: adminPermissionProcedure({ note: ["delete"] }).deleteNote.handler(
		async ({ input }) => {
			return deleteContentNote(input.id);
		},
	),

	topics: adminPermissionProcedure({ topic: ["list"] }).topics.handler(
		async ({ input }) => {
			const db = createDb();
			const whereClause = input.keyword
				? containsInsensitive(topic.name, input.keyword)
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
		},
	),

	topicDetail: adminPermissionProcedure({
		topic: ["detail"],
	}).topicDetail.handler(async ({ input }) => {
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

	saveTopic: adminPermissionProcedure({ topic: ["save"] }).saveTopic.handler(
		async ({ input }) => {
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
		},
	),

	deleteTopic: adminPermissionProcedure({
		topic: ["delete"],
	}).deleteTopic.handler(async ({ input }) => {
		const db = createDb();
		await db.delete(topic).where(eq(topic.id, input.id));
		return { ok: true };
	}),

	users: adminPermissionProcedure({ user: ["list"] }).users.handler(
		async ({ input }) => {
			const db = createDb();
			const conditions = [
				input.status
					? eq(user.status, input.status)
					: ne(user.status, "deleted"),
				input.keyword
					? or(
							containsInsensitive(user.name, input.keyword),
							containsInsensitive(user.email, input.keyword),
							containsInsensitive(user.handle, input.keyword),
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
		},
	),

	userDetail: adminPermissionProcedure({ user: ["get"] }).userDetail.handler(
		async ({ input }) => {
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
		},
	),

	createUser: adminPermissionProcedure({ user: ["create"] }).createUser.handler(
		async ({ input, context }) => {
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
				const [createdUsers] = await db.batch([
					db
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
						.returning(),
					db.insert(account).values({
						id: createId(),
						accountId: id,
						providerId: "credential",
						userId: id,
						password,
						createdAt: now,
						updatedAt: now,
					}),
				]);

				return createdUsers[0];
			} catch (error) {
				duplicateUserError(error);
			}
		},
	),

	updateUser: adminPermissionProcedure({ user: ["update"] }).updateUser.handler(
		async ({ input, context }) => {
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
				const updateUserQuery = db
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

				const revokeSessions =
					input.status !== target.status && shouldRevokeSessions(input.status);
				const deleteSessionsQuery = db
					.delete(session)
					.where(eq(session.userId, input.id));

				if (!input.password) {
					if (revokeSessions) {
						const [updatedUsers] = await db.batch([
							updateUserQuery,
							deleteSessionsQuery,
						]);
						return updatedUsers[0];
					}

					const [updatedUser] = await updateUserQuery;
					return updatedUser;
				}

				const password = await hashPassword(input.password);
				const [existing] = await db
					.select({ id: account.id })
					.from(account)
					.where(
						and(
							eq(account.userId, input.id),
							eq(account.providerId, "credential"),
						),
					)
					.limit(1);

				const accountQuery = existing
					? db
							.update(account)
							.set({
								accountId: input.id,
								password,
								updatedAt: now,
							})
							.where(eq(account.id, existing.id))
					: db.insert(account).values({
							id: createId(),
							accountId: input.id,
							providerId: "credential",
							userId: input.id,
							password,
							createdAt: now,
							updatedAt: now,
						});

				if (revokeSessions) {
					const [updatedUsers] = await db.batch([
						updateUserQuery,
						deleteSessionsQuery,
						accountQuery,
					]);
					return updatedUsers[0];
				}

				const [updatedUsers] = await db.batch([updateUserQuery, accountQuery]);
				return updatedUsers[0];
			} catch (error) {
				duplicateUserError(error);
			}
		},
	),

	updateUserStatus: adminPermissionProcedure({
		user: ["ban"],
	}).updateUserStatus.handler(async ({ input, context }) => {
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

		const db = createDb();
		const updateUserQuery = db
			.update(user)
			.set({ ...authStatusPatch(input.status), updatedAt: new Date() })
			.where(eq(user.id, input.id))
			.returning();

		if (shouldRevokeSessions(input.status)) {
			const [updatedUsers] = await db.batch([
				updateUserQuery,
				db.delete(session).where(eq(session.userId, input.id)),
			]);

			return updatedUsers[0];
		}

		const [updated] = await updateUserQuery;
		return updated;
	}),

	softDeleteUser: adminPermissionProcedure({
		user: ["delete"],
	}).softDeleteUser.handler(async ({ input, context }) => {
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

		const db = createDb();
		const [deletedUsers] = await db.batch([
			db
				.update(user)
				.set({ ...authStatusPatch("deleted"), updatedAt: new Date() })
				.where(eq(user.id, input.id))
				.returning(),
			db.delete(session).where(eq(session.userId, input.id)),
		]);

		return deletedUsers[0];
	}),

	restoreUser: adminPermissionProcedure({
		user: ["restore"],
	}).restoreUser.handler(async ({ input, context }) => {
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

		const db = createDb();
		const updateUserQuery = db
			.update(user)
			.set({ ...authStatusPatch(input.status), updatedAt: new Date() })
			.where(eq(user.id, input.id))
			.returning();

		if (shouldRevokeSessions(input.status)) {
			const [updatedUsers] = await db.batch([
				updateUserQuery,
				db.delete(session).where(eq(session.userId, input.id)),
			]);

			return updatedUsers[0];
		}

		const [updated] = await updateUserQuery;
		return updated;
	}),
};
