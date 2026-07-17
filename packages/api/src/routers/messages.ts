import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	directConversation,
	directConversationParticipant,
	directMessage,
	follow,
	user,
	userBlock,
} from "@youni/db/schema/index";
import { and, count, desc, eq, exists, gt, ne } from "drizzle-orm";
import { activeUserProcedure, protectedProcedure } from "../index";
import { notifyMessage } from "../lib/notifications";
import { hasMessagingBlock, setUserBlocked } from "../lib/users/blocks";

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
			clearedAt: directConversationParticipant.clearedAt,
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

function getVisibleMessageWhere(
	conversationId: string,
	clearedAt: Date | null,
) {
	const conversationWhere = eq(directMessage.conversationId, conversationId);
	if (!clearedAt) return conversationWhere;
	return and(conversationWhere, gt(directMessage.createdAt, clearedAt));
}

function getLatestDate(...dates: Array<Date | null>) {
	return dates.reduce<Date | null>((latest, date) => {
		if (!date) return latest;
		if (!latest || date.getTime() > latest.getTime()) return date;
		return latest;
	}, null);
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

async function getPeerByUserId(viewerId: string, peerId: string) {
	if (viewerId === peerId) {
		throw new ORPCError("BAD_REQUEST", {
			message: "不能给自己发私信",
		});
	}

	const [peer] = await createDb()
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			handle: user.handle,
			bio: user.bio,
		})
		.from(user)
		.where(
			and(
				eq(user.id, peerId),
				eq(user.status, "active"),
				eq(user.isAnonymous, false),
			),
		)
		.limit(1);

	if (!peer) {
		throw new ORPCError("NOT_FOUND");
	}

	return peer;
}

async function ensureConversation(viewerId: string, peerId: string) {
	const db = createDb();
	const peer = await getPeerByUserId(viewerId, peerId);
	if (await hasMessagingBlock(viewerId, peer.id)) {
		throw new ORPCError("FORBIDDEN", {
			message: "拉黑状态下不能发送私信",
		});
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

	return { conversationId: conversation.id, peer };
}

async function getBlockState(viewerId: string, peerId: string) {
	const db = createDb();
	const [hasBlockedPeer, isBlockedByPeer] = await Promise.all([
		db
			.select({ blockedId: userBlock.blockedId })
			.from(userBlock)
			.where(
				and(eq(userBlock.blockerId, viewerId), eq(userBlock.blockedId, peerId)),
			)
			.limit(1),
		db
			.select({ blockerId: userBlock.blockerId })
			.from(userBlock)
			.where(
				and(eq(userBlock.blockerId, peerId), eq(userBlock.blockedId, viewerId)),
			)
			.limit(1),
	]);

	return {
		hasBlockedPeer: hasBlockedPeer.length > 0,
		isBlockedByPeer: isBlockedByPeer.length > 0,
	};
}

async function getConversationState(conversationId: string, viewerId: string) {
	const peer = await getPeer(conversationId, viewerId);
	const db = createDb();
	const [following, blockState] = await Promise.all([
		db
			.select({ followingId: follow.followingId })
			.from(follow)
			.where(
				and(eq(follow.followerId, viewerId), eq(follow.followingId, peer.id)),
			)
			.limit(1),
		getBlockState(viewerId, peer.id),
	]);

	return {
		peer,
		...blockState,
		isFollowing: following.length > 0,
	};
}

export const messagesRouter = {
	open: protectedProcedure.messages.open.handler(async ({ input, context }) => {
		const viewerId = context.session.user.id;
		const peer = await getPeerByUserId(viewerId, input.userId);
		const memberKey = createMemberKey(viewerId, peer.id);
		const db = createDb();
		const [[conversation], blockState, following] = await Promise.all([
			db
				.select({ id: directConversation.id })
				.from(directConversation)
				.where(
					and(
						eq(directConversation.memberKey, memberKey),
						exists(
							db
								.select({ id: directMessage.id })
								.from(directMessage)
								.where(eq(directMessage.conversationId, directConversation.id)),
						),
					),
				)
				.limit(1),
			getBlockState(viewerId, peer.id),
			db
				.select({ followingId: follow.followingId })
				.from(follow)
				.where(
					and(eq(follow.followerId, viewerId), eq(follow.followingId, peer.id)),
				)
				.limit(1),
		]);

		return {
			conversationId: conversation?.id ?? null,
			peer,
			...blockState,
			isFollowing: following.length > 0,
		};
	}),

	conversations: protectedProcedure.messages.conversations.handler(
		async ({ context }) => {
			const viewerId = context.session.user.id;
			const db = createDb();
			const rows = await db
				.select({
					id: directConversation.id,
					clearedAt: directConversationParticipant.clearedAt,
					updatedAt: directConversation.updatedAt,
					lastReadAt: directConversationParticipant.lastReadAt,
				})
				.from(directConversationParticipant)
				.innerJoin(
					directConversation,
					eq(
						directConversationParticipant.conversationId,
						directConversation.id,
					),
				)
				.where(
					and(
						eq(directConversationParticipant.userId, viewerId),
						exists(
							db
								.select({ id: directMessage.id })
								.from(directMessage)
								.where(eq(directMessage.conversationId, directConversation.id)),
						),
					),
				)
				.orderBy(desc(directConversation.updatedAt))
				.limit(60);

			return Promise.all(
				rows.map(async (row) => {
					const unreadAfter = getLatestDate(row.lastReadAt, row.clearedAt);
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
							.where(getVisibleMessageWhere(row.id, row.clearedAt))
							.orderBy(desc(directMessage.createdAt))
							.limit(1),
						db
							.select({ value: count() })
							.from(directMessage)
							.where(
								unreadAfter
									? and(
											eq(directMessage.conversationId, row.id),
											ne(directMessage.senderId, viewerId),
											gt(directMessage.createdAt, unreadAfter),
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
		},
	),

	byId: protectedProcedure.messages.byId.handler(async ({ input, context }) => {
		const viewerId = context.session.user.id;
		const participant = await assertParticipant(input.conversationId, viewerId);

		const db = createDb();
		const [state, rows] = await Promise.all([
			getConversationState(input.conversationId, viewerId),
			db
				.select({
					id: directMessage.id,
					content: directMessage.content,
					senderId: directMessage.senderId,
					createdAt: directMessage.createdAt,
				})
				.from(directMessage)
				.where(
					getVisibleMessageWhere(input.conversationId, participant.clearedAt),
				)
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
			peer: state.peer,
			hasBlockedPeer: state.hasBlockedPeer,
			isBlockedByPeer: state.isBlockedByPeer,
			messages: rows.reverse(),
		};
	}),

	settings: protectedProcedure.messages.settings.handler(
		async ({ input, context }) => {
			const viewerId = context.session.user.id;
			await assertParticipant(input.conversationId, viewerId);
			const state = await getConversationState(input.conversationId, viewerId);
			return {
				id: input.conversationId,
				...state,
			};
		},
	),

	setBlocked: activeUserProcedure.messages.setBlocked.handler(
		async ({ input, context }) => {
			const viewerId = context.session.user.id;
			await assertParticipant(input.conversationId, viewerId);
			const peer = await getPeer(input.conversationId, viewerId);
			await setUserBlocked({
				blocked: input.blocked,
				blockedId: peer.id,
				blockerId: viewerId,
			});

			const state = await getConversationState(input.conversationId, viewerId);
			return {
				blocked: state.hasBlockedPeer,
				isBlockedByPeer: state.isBlockedByPeer,
			};
		},
	),

	clear: activeUserProcedure.messages.clear.handler(
		async ({ input, context }) => {
			const viewerId = context.session.user.id;
			await assertParticipant(input.conversationId, viewerId);
			const now = new Date();
			await createDb()
				.update(directConversationParticipant)
				.set({ clearedAt: now, lastReadAt: now, updatedAt: now })
				.where(
					and(
						eq(
							directConversationParticipant.conversationId,
							input.conversationId,
						),
						eq(directConversationParticipant.userId, viewerId),
					),
				);

			return { clearedAt: now, ok: true };
		},
	),

	send: activeUserProcedure.messages.send.handler(
		async ({ input, context }) => {
			const viewerId = context.session.user.id;
			let target: Awaited<ReturnType<typeof ensureConversation>>;
			if ("conversationId" in input) {
				await assertParticipant(input.conversationId, viewerId);
				const peer = await getPeer(input.conversationId, viewerId);
				if (await hasMessagingBlock(viewerId, peer.id)) {
					throw new ORPCError("FORBIDDEN", {
						message: "拉黑状态下不能发送私信",
					});
				}
				target = { conversationId: input.conversationId, peer };
			} else {
				target = await ensureConversation(viewerId, input.userId);
			}
			const { conversationId, peer } = target;
			const db = createDb();

			const now = new Date();
			const [createdMessage] = await db
				.insert(directMessage)
				.values({
					id: input.clientMessageId,
					conversationId,
					senderId: viewerId,
					content: input.content,
					createdAt: now,
					updatedAt: now,
				})
				.onConflictDoNothing()
				.returning({
					id: directMessage.id,
					content: directMessage.content,
					senderId: directMessage.senderId,
					createdAt: directMessage.createdAt,
				});

			const message =
				createdMessage ??
				(
					await db
						.select({
							id: directMessage.id,
							content: directMessage.content,
							senderId: directMessage.senderId,
							createdAt: directMessage.createdAt,
						})
						.from(directMessage)
						.where(
							and(
								eq(directMessage.id, input.clientMessageId),
								eq(directMessage.conversationId, conversationId),
								eq(directMessage.senderId, viewerId),
							),
						)
						.limit(1)
				)[0];

			if (!message) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
			if (!createdMessage) return { conversationId, message };

			await Promise.all([
				db
					.update(directConversation)
					.set({ updatedAt: now })
					.where(eq(directConversation.id, conversationId)),
				db
					.update(directConversationParticipant)
					.set({ lastReadAt: now, updatedAt: now })
					.where(
						and(
							eq(directConversationParticipant.conversationId, conversationId),
							eq(directConversationParticipant.userId, viewerId),
						),
					),
				notifyMessage({
					actorId: viewerId,
					conversationId,
					preview: input.content,
					recipientId: peer.id,
				}),
			]);

			return { conversationId, message };
		},
	),
};
