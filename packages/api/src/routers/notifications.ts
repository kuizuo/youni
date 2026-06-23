import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	note,
	notification,
	notificationPushToken,
	user,
} from "@youni/db/schema/index";
import { and, count, desc, eq } from "drizzle-orm";
import z from "zod";

import { protectedProcedure } from "../index";

const categoryInput = z.enum(["all", "activity", "followers", "system"]);

const listInput = z.object({
	category: categoryInput.default("all"),
	limit: z.number().int().min(1).max(30).default(10),
	offset: z.number().int().min(0).default(0),
});

const idInput = z.object({
	id: z.string().min(1),
});

const markReadInput = idInput.extend({
	isRead: z.boolean().default(true),
});

const registerPushTokenInput = z.object({
	token: z.string().min(1),
	platform: z.enum(["android", "ios", "web", "unknown"]).default("unknown"),
});

function createId() {
	return crypto.randomUUID();
}

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

function categoryWhere(
	userId: string,
	category: z.infer<typeof categoryInput>,
) {
	const base = [
		eq(notification.recipientId, userId),
		eq(notification.isDeleted, false),
	] as const;

	if (category === "all") {
		return and(...base);
	}

	return and(...base, eq(notification.category, category));
}

async function getCategorySummary(
	userId: string,
	category: "activity" | "followers" | "system",
) {
	const db = createDb();
	const [[unread], [latest]] = await Promise.all([
		db
			.select({ value: count() })
			.from(notification)
			.where(
				and(
					eq(notification.recipientId, userId),
					eq(notification.category, category),
					eq(notification.isDeleted, false),
					eq(notification.isRead, false),
				),
			),
		db
			.select({ createdAt: notification.createdAt })
			.from(notification)
			.where(
				and(
					eq(notification.recipientId, userId),
					eq(notification.category, category),
					eq(notification.isDeleted, false),
				),
			)
			.orderBy(desc(notification.createdAt))
			.limit(1),
	]);

	return {
		category,
		unreadCount: toNumber(unread?.value),
		updatedAt: latest?.createdAt ?? null,
	};
}

export const notificationsRouter = {
	list: protectedProcedure
		.input(listInput)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			const rows = await createDb()
				.select({
					id: notification.id,
					type: notification.type,
					category: notification.category,
					title: notification.title,
					body: notification.body,
					targetType: notification.targetType,
					targetId: notification.targetId,
					noteId: notification.noteId,
					isRead: notification.isRead,
					createdAt: notification.createdAt,
					actorId: user.id,
					actorName: user.name,
					actorImage: user.image,
					noteCover: note.cover,
				})
				.from(notification)
				.leftJoin(user, eq(notification.actorId, user.id))
				.leftJoin(note, eq(notification.noteId, note.id))
				.where(categoryWhere(userId, input.category))
				.orderBy(desc(notification.createdAt))
				.limit(input.limit + 1)
				.offset(input.offset);

			const hasMore = rows.length > input.limit;
			const items = rows.slice(0, input.limit).map((row) => ({
				id: row.id,
				kind: row.type,
				categoryId: row.category,
				title: row.title,
				body: row.body,
				targetType: row.targetType,
				targetId: row.targetId,
				noteId: row.noteId,
				isRead: row.isRead,
				createdAt: row.createdAt,
				previewUrl: row.noteCover,
				actor: row.actorId
					? {
							id: row.actorId,
							name: row.actorName ?? "Youni 用户",
							image: row.actorImage,
						}
					: null,
			}));

			return {
				items,
				nextOffset: hasMore ? input.offset + input.limit : null,
			};
		}),

	summary: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;
		const [[totalUnread], categories] = await Promise.all([
			createDb()
				.select({ value: count() })
				.from(notification)
				.where(
					and(
						eq(notification.recipientId, userId),
						eq(notification.isDeleted, false),
						eq(notification.isRead, false),
					),
				),
			Promise.all([
				getCategorySummary(userId, "activity"),
				getCategorySummary(userId, "followers"),
				getCategorySummary(userId, "system"),
			]),
		]);

		return {
			totalUnread: toNumber(totalUnread?.value),
			categories,
		};
	}),

	markRead: protectedProcedure
		.input(markReadInput)
		.handler(async ({ input, context }) => {
			const [updated] = await createDb()
				.update(notification)
				.set({
					isRead: input.isRead,
					readAt: input.isRead ? new Date() : null,
				})
				.where(
					and(
						eq(notification.id, input.id),
						eq(notification.recipientId, context.session.user.id),
					),
				)
				.returning();

			if (!updated) {
				throw new ORPCError("NOT_FOUND");
			}

			return { ok: true };
		}),

	markAllRead: protectedProcedure
		.input(z.object({ category: categoryInput.default("all") }))
		.handler(async ({ input, context }) => {
			await createDb()
				.update(notification)
				.set({ isRead: true, readAt: new Date() })
				.where(categoryWhere(context.session.user.id, input.category));

			return { ok: true };
		}),

	delete: protectedProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			await createDb()
				.update(notification)
				.set({ isDeleted: true, deletedAt: new Date() })
				.where(
					and(
						eq(notification.id, input.id),
						eq(notification.recipientId, context.session.user.id),
					),
				);

			return { ok: true };
		}),

	deleteAll: protectedProcedure
		.input(z.object({ category: categoryInput.default("all") }))
		.handler(async ({ input, context }) => {
			await createDb()
				.update(notification)
				.set({ isDeleted: true, deletedAt: new Date() })
				.where(categoryWhere(context.session.user.id, input.category));

			return { ok: true };
		}),

	registerPushToken: protectedProcedure
		.input(registerPushTokenInput)
		.handler(async ({ input, context }) => {
			const now = new Date();
			const [row] = await createDb()
				.insert(notificationPushToken)
				.values({
					id: createId(),
					userId: context.session.user.id,
					token: input.token,
					platform: input.platform,
					isEnabled: true,
					lastSeenAt: now,
					createdAt: now,
					updatedAt: now,
				})
				.onConflictDoUpdate({
					target: notificationPushToken.token,
					set: {
						userId: context.session.user.id,
						platform: input.platform,
						isEnabled: true,
						lastSeenAt: now,
						updatedAt: now,
					},
				})
				.returning();

			return { id: row?.id ?? null };
		}),

	unregisterPushToken: protectedProcedure
		.input(z.object({ token: z.string().min(1) }))
		.handler(async ({ input, context }) => {
			await createDb()
				.update(notificationPushToken)
				.set({ isEnabled: false, updatedAt: new Date() })
				.where(
					and(
						eq(notificationPushToken.token, input.token),
						eq(notificationPushToken.userId, context.session.user.id),
					),
				);

			return { ok: true };
		}),
};
