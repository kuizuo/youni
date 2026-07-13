import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	note,
	notification,
	notificationPushToken,
	user,
} from "@youni/db/schema/index";
import { and, count, desc, eq, inArray } from "drizzle-orm";
import type z from "zod";

import type {
	NotificationCategory,
	notificationCategoryInput,
	notificationTypeInput,
} from "../contracts/notifications";
import { protectedProcedure } from "../index";

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

function categoryWhere(
	userId: string,
	category: z.infer<typeof notificationCategoryInput>,
	types?: z.infer<typeof notificationTypeInput>[],
) {
	const base = [
		eq(notification.recipientId, userId),
		eq(notification.isDeleted, false),
		types && types.length > 0 ? inArray(notification.type, types) : undefined,
	].filter(Boolean);

	if (category === "all") {
		return and(...base);
	}

	return and(...base, eq(notification.category, category));
}

async function getNotificationSummaryItem({
	category,
	id,
	types,
	userId,
}: {
	category: NotificationCategory;
	id: string;
	types?: z.infer<typeof notificationTypeInput>[];
	userId: string;
}) {
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
					types && types.length > 0
						? inArray(notification.type, types)
						: undefined,
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
					types && types.length > 0
						? inArray(notification.type, types)
						: undefined,
				),
			)
			.orderBy(desc(notification.createdAt))
			.limit(1),
	]);

	return {
		id,
		unreadCount: toNumber(unread?.value),
		updatedAt: latest?.createdAt ?? null,
	};
}

export const notificationsRouter = {
	list: protectedProcedure.notifications.list.handler(
		async ({ input, context }) => {
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
				.where(categoryWhere(userId, input.category, input.types))
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
		},
	),

	summary: protectedProcedure.notifications.summary.handler(
		async ({ context }) => {
			const userId = context.session.user.id;
			const [[totalUnread], categories, messageGroups] = await Promise.all([
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
					getNotificationSummaryItem({
						id: "activity",
						userId,
						category: "activity",
					}),
					getNotificationSummaryItem({
						id: "followers",
						userId,
						category: "followers",
					}),
					getNotificationSummaryItem({
						id: "system",
						userId,
						category: "system",
					}),
				]),
				Promise.all([
					getNotificationSummaryItem({
						id: "reactions",
						userId,
						category: "activity",
						types: ["like", "collect"],
					}),
					getNotificationSummaryItem({
						id: "followers",
						userId,
						category: "followers",
						types: ["follow"],
					}),
					getNotificationSummaryItem({
						id: "comments",
						userId,
						category: "activity",
						types: ["comment"],
					}),
				]),
			]);

			return {
				totalUnread: toNumber(totalUnread?.value),
				categories,
				messageGroups,
			};
		},
	),

	markRead: protectedProcedure.notifications.markRead.handler(
		async ({ input, context }) => {
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
		},
	),

	markAllRead: protectedProcedure.notifications.markAllRead.handler(
		async ({ input, context }) => {
			await createDb()
				.update(notification)
				.set({ isRead: true, readAt: new Date() })
				.where(
					categoryWhere(context.session.user.id, input.category, input.types),
				);

			return { ok: true };
		},
	),

	delete: protectedProcedure.notifications.delete.handler(
		async ({ input, context }) => {
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
		},
	),

	deleteAll: protectedProcedure.notifications.deleteAll.handler(
		async ({ input, context }) => {
			await createDb()
				.update(notification)
				.set({ isDeleted: true, deletedAt: new Date() })
				.where(
					categoryWhere(context.session.user.id, input.category, input.types),
				);

			return { ok: true };
		},
	),

	registerPushToken: protectedProcedure.notifications.registerPushToken.handler(
		async ({ input, context }) => {
			const now = new Date();
			const [row] = await createDb()
				.insert(notificationPushToken)
				.values({
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
		},
	),

	unregisterPushToken:
		protectedProcedure.notifications.unregisterPushToken.handler(
			async ({ input, context }) => {
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
			},
		),
};
