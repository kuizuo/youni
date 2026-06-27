import { createDb } from "@youni/db";
import {
	note,
	notification,
	notificationPushToken,
	user,
} from "@youni/db/schema/index";
import { and, eq } from "drizzle-orm";

type NotificationCategory = "activity" | "followers" | "system";
type NotificationType =
	| "announcement"
	| "collect"
	| "comment"
	| "event"
	| "follow"
	| "like"
	| "mention"
	| "system";

type CreateNotificationInput = {
	actorId?: null | string;
	body: string;
	category: NotificationCategory;
	noteId?: null | string;
	recipientId: string;
	targetId?: null | string;
	targetType?: null | string;
	title: string;
	type: NotificationType;
};

function createDedupeKey(input: CreateNotificationInput) {
	return [
		input.type,
		input.actorId ?? "system",
		input.targetType ?? "none",
		input.targetId ?? input.noteId ?? "none",
	].join(":");
}

export async function createNotification(input: CreateNotificationInput) {
	if (input.actorId && input.actorId === input.recipientId) {
		return null;
	}

	const db = createDb();
	const now = new Date();
	const dedupeKey = createDedupeKey(input);
	const [row] = await db
		.insert(notification)
		.values({
			recipientId: input.recipientId,
			actorId: input.actorId ?? null,
			type: input.type,
			category: input.category,
			title: input.title,
			body: input.body,
			targetType: input.targetType ?? null,
			targetId: input.targetId ?? null,
			noteId: input.noteId ?? null,
			dedupeKey,
			isRead: false,
			isDeleted: false,
			readAt: null,
			deletedAt: null,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [notification.recipientId, notification.dedupeKey],
			set: {
				title: input.title,
				body: input.body,
				targetType: input.targetType ?? null,
				targetId: input.targetId ?? null,
				noteId: input.noteId ?? null,
				isRead: false,
				isDeleted: false,
				readAt: null,
				deletedAt: null,
				updatedAt: now,
			},
		})
		.returning();

	if (row) {
		await sendExpoPushNotification({
			recipientId: row.recipientId,
			title: row.title,
			body: row.body,
			data: {
				notificationId: row.id,
				type: row.type,
				targetType: row.targetType,
				targetId: row.targetId,
				noteId: row.noteId,
			},
		});
	}

	return row ?? null;
}

export async function notifyNoteOwner({
	actorId,
	content,
	noteId,
	type,
}: {
	actorId: string;
	content?: string;
	noteId: string;
	type: Extract<NotificationType, "collect" | "comment" | "like">;
}) {
	const db = createDb();
	const [row] = await db
		.select({
			noteId: note.id,
			noteTitle: note.title,
			recipientId: note.userId,
			actorName: user.name,
		})
		.from(note)
		.innerJoin(user, eq(user.id, actorId))
		.where(eq(note.id, noteId))
		.limit(1);

	if (!row || row.recipientId === actorId) {
		return null;
	}

	const titleByType = {
		collect: `${row.actorName} 收藏了你的笔记`,
		comment: `${row.actorName} 评论了你的内容`,
		like: `${row.actorName} 赞了你的笔记`,
	} satisfies Record<typeof type, string>;

	const body =
		type === "comment" && content
			? content
			: row.noteTitle || "点击查看相关内容";

	return createNotification({
		recipientId: row.recipientId,
		actorId,
		type,
		category: "activity",
		title: titleByType[type],
		body,
		targetType: "note",
		targetId: row.noteId,
		noteId: row.noteId,
	});
}

export async function notifyFollow({
	actorId,
	recipientId,
}: {
	actorId: string;
	recipientId: string;
}) {
	if (actorId === recipientId) {
		return null;
	}

	const db = createDb();
	const [actor] = await db
		.select({
			name: user.name,
			bio: user.bio,
		})
		.from(user)
		.where(eq(user.id, actorId))
		.limit(1);

	if (!actor) {
		return null;
	}

	return createNotification({
		recipientId,
		actorId,
		type: "follow",
		category: "followers",
		title: `${actor.name} 开始关注你`,
		body: actor.bio || "点击查看 TA 的主页",
		targetType: "user",
		targetId: actorId,
	});
}

async function sendExpoPushNotification({
	body,
	data,
	recipientId,
	title,
}: {
	body: string;
	data: Record<string, null | string>;
	recipientId: string;
	title: string;
}) {
	const db = createDb();
	const tokens = await db
		.select({ token: notificationPushToken.token })
		.from(notificationPushToken)
		.where(
			and(
				eq(notificationPushToken.userId, recipientId),
				eq(notificationPushToken.isEnabled, true),
			),
		);

	if (tokens.length === 0) {
		return;
	}

	const messages = tokens.map((item) => ({
		to: item.token,
		title,
		body,
		data,
		sound: "default",
	}));

	try {
		const response = await fetch("https://exp.host/--/api/v2/push/send", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(messages),
		});
		const result = (await response.json().catch(() => null)) as {
			data?: Array<{
				details?: { error?: string };
				message?: string;
				status?: "error" | "ok";
			}>;
		} | null;

		if (!response.ok) {
			console.error("Expo push request failed", result);
			return;
		}

		const invalidTokens = tokens.filter((_, index) => {
			const ticket = result?.data?.[index];
			return ticket?.details?.error === "DeviceNotRegistered";
		});

		for (const item of invalidTokens) {
			await db
				.update(notificationPushToken)
				.set({ isEnabled: false, updatedAt: new Date() })
				.where(eq(notificationPushToken.token, item.token));
		}
	} catch (error) {
		console.error("Expo push send failed", error);
	}
}
