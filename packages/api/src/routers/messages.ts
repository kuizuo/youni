import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	directConversation,
	directConversationParticipant,
	directMessage,
	user,
} from "@youni/db/schema/index";
import { and, count, desc, eq, gt, ne } from "drizzle-orm";
import z from "zod";

import { activeUserProcedure, protectedProcedure } from "../index";
import { notifyMessage } from "../lib/notifications";

const conversationInput = z.object({
	conversationId: z.string().min(1),
	limit: z.number().int().min(1).max(80).default(40),
});

const startInput = z.object({
	userId: z.string().min(1),
});

const sendInput = z.object({
	conversationId: z.string().min(1),
	content: z.string().trim().min(1).max(1000),
});

function createMemberKey(leftUserId: string, rightUserId: string) {
	return [leftUserId, rightUserId].sort().join(":");
}

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

async function assertParticipant(conversationId: string, userId: string) {
	const [participant] = await createDb()
		.select({
			conversationId: directConversationParticipant.conversationId,
			lastReadAt: directConversationParticipant.lastReadAt,
		})
		.from(directConversationParticipant)
		.where(
			and(
				eq(directConversationParticipant.conversationId, conversationId),
				eq(directConversationParticipant.userId, userId),
			),
		)
		.limit(1);

	if (!participant) {
		throw new ORPCError("NOT_FOUND");
	}

	return participant;
}

async function getPeer(conversationId: string, viewerId: string) {
	const [peer] = await createDb()
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			handle: user.handle,
			bio: user.bio,
		})
		.from(directConversationParticipant)
		.innerJoin(user, eq(directConversationParticipant.userId, user.id))
		.where(
			and(
				eq(directConversationParticipant.conversationId, conversationId),
				ne(directConversationParticipant.userId, viewerId),
			),
		)
		.limit(1);

	if (!peer) {
		throw new ORPCError("NOT_FOUND");
	}

	return peer;
}

async function ensureConversation(viewerId: string, peerId: string) {
	if (viewerId === peerId) {
		throw new ORPCError("BAD_REQUEST", {
			message: "不能给自己发私信",
		});
	}

	const db = createDb();
	const [peer] = await db
		.select({ id: user.id })
		.from(user)
		.where(and(eq(user.id, peerId), eq(user.status, "active")))
		.limit(1);

	if (!peer) {
		throw new ORPCError("NOT_FOUND");
	}

	const memberKey = createMemberKey(viewerId, peerId);
	const now = new Date();
	const [created] = await db
		.insert(directConversation)
		.values({
			memberKey,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoNothing({ target: directConversation.memberKey })
		.returning();

	const conversation =
		created ??
		(
			await db
				.select()
				.from(directConversation)
				.where(eq(directConversation.memberKey, memberKey))
				.limit(1)
		)[0];

	if (!conversation) {
		throw new ORPCError("INTERNAL_SERVER_ERROR");
	}

	await db
		.insert(directConversationParticipant)
		.values([
			{
				conversationId: conversation.id,
				userId: viewerId,
				lastReadAt: now,
				createdAt: now,
				updatedAt: now,
			},
			{
				conversationId: conversation.id,
				userId: peerId,
				lastReadAt: null,
				createdAt: now,
				updatedAt: now,
			},
		])
		.onConflictDoNothing();

	return conversation.id;
}

export const messagesRouter = {
	start: protectedProcedure
		.input(startInput)
		.handler(async ({ input, context }) => {
			const conversationId = await ensureConversation(
				context.session.user.id,
				input.userId,
			);
			const peer = await getPeer(conversationId, context.session.user.id);
			return { id: conversationId, peer };
		}),

	conversations: protectedProcedure.handler(async ({ context }) => {
		const viewerId = context.session.user.id;
		const db = createDb();
		const rows = await db
			.select({
				id: directConversation.id,
				updatedAt: directConversation.updatedAt,
				lastReadAt: directConversationParticipant.lastReadAt,
			})
			.from(directConversationParticipant)
			.innerJoin(
				directConversation,
				eq(directConversationParticipant.conversationId, directConversation.id),
			)
			.where(eq(directConversationParticipant.userId, viewerId))
			.orderBy(desc(directConversation.updatedAt))
			.limit(60);

		return Promise.all(
			rows.map(async (row) => {
				const [peer, [lastMessage], [unread]] = await Promise.all([
					getPeer(row.id, viewerId),
					db
						.select({
							id: directMessage.id,
							content: directMessage.content,
							senderId: directMessage.senderId,
							createdAt: directMessage.createdAt,
						})
						.from(directMessage)
						.where(eq(directMessage.conversationId, row.id))
						.orderBy(desc(directMessage.createdAt))
						.limit(1),
					db
						.select({ value: count() })
						.from(directMessage)
						.where(
							row.lastReadAt
								? and(
										eq(directMessage.conversationId, row.id),
										ne(directMessage.senderId, viewerId),
										gt(directMessage.createdAt, row.lastReadAt),
									)
								: and(
										eq(directMessage.conversationId, row.id),
										ne(directMessage.senderId, viewerId),
									),
						),
				]);

				return {
					id: row.id,
					peer,
					lastMessage: lastMessage ?? null,
					unreadCount: toNumber(unread?.value),
					updatedAt: row.updatedAt,
				};
			}),
		);
	}),

	byId: protectedProcedure
		.input(conversationInput)
		.handler(async ({ input, context }) => {
			const viewerId = context.session.user.id;
			await assertParticipant(input.conversationId, viewerId);

			const db = createDb();
			const [peer, rows] = await Promise.all([
				getPeer(input.conversationId, viewerId),
				db
					.select({
						id: directMessage.id,
						content: directMessage.content,
						senderId: directMessage.senderId,
						createdAt: directMessage.createdAt,
					})
					.from(directMessage)
					.where(eq(directMessage.conversationId, input.conversationId))
					.orderBy(desc(directMessage.createdAt))
					.limit(input.limit),
			]);

			await db
				.update(directConversationParticipant)
				.set({ lastReadAt: new Date(), updatedAt: new Date() })
				.where(
					and(
						eq(
							directConversationParticipant.conversationId,
							input.conversationId,
						),
						eq(directConversationParticipant.userId, viewerId),
					),
				);

			return {
				id: input.conversationId,
				peer,
				messages: rows.reverse(),
			};
		}),

	send: activeUserProcedure
		.input(sendInput)
		.handler(async ({ input, context }) => {
			const viewerId = context.session.user.id;
			await assertParticipant(input.conversationId, viewerId);
			const peer = await getPeer(input.conversationId, viewerId);
			const db = createDb();
			const now = new Date();
			const [message] = await db
				.insert(directMessage)
				.values({
					conversationId: input.conversationId,
					senderId: viewerId,
					content: input.content,
					createdAt: now,
					updatedAt: now,
				})
				.returning({
					id: directMessage.id,
					content: directMessage.content,
					senderId: directMessage.senderId,
					createdAt: directMessage.createdAt,
				});

			if (!message) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}

			await Promise.all([
				db
					.update(directConversation)
					.set({ updatedAt: now })
					.where(eq(directConversation.id, input.conversationId)),
				db
					.update(directConversationParticipant)
					.set({ lastReadAt: now, updatedAt: now })
					.where(
						and(
							eq(
								directConversationParticipant.conversationId,
								input.conversationId,
							),
							eq(directConversationParticipant.userId, viewerId),
						),
					),
				notifyMessage({
					actorId: viewerId,
					conversationId: input.conversationId,
					preview: input.content,
					recipientId: peer.id,
				}),
			]);

			return message;
		}),
};
