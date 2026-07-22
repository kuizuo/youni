import type { UserRow } from "@youni/db/schema/auth";
import type { DirectMessageRow } from "@youni/db/schema/chat";
import z from "zod";
import { output, procedure } from "./procedure";

// ====== Input ======

export const conversationInput = z.object({
	conversationId: z.string().min(1),
	limit: z.number().int().min(1).max(80).default(40),
});

export const conversationActionInput = z.object({
	conversationId: z.string().min(1),
});

export const deleteForMeInput = conversationActionInput.extend({
	messageId: z.string().min(1),
});
export type DeleteForMeInput = z.infer<typeof deleteForMeInput>;

export const blockInput = conversationActionInput.extend({
	blocked: z.boolean(),
});

export const openConversationInput = z.object({
	userId: z.string().min(1),
});

const messageContent = z.string().trim().min(1).max(1000);
const clientMessageId = z.string().trim().min(1).max(100);

export const sendMessageInput = z.union([
	z
		.object({
			clientMessageId,
			conversationId: z.string().min(1),
			content: messageContent,
		})
		.strict(),
	z
		.object({
			clientMessageId,
			userId: z.string().min(1),
			content: messageContent,
		})
		.strict(),
]);
export type SendMessageInput = z.infer<typeof sendMessageInput>;

// ====== Output ======

export type ChatPeer = Pick<
	UserRow,
	"id" | "name" | "email" | "image" | "handle" | "bio"
>;

export type ChatMessage = Pick<
	DirectMessageRow,
	"id" | "content" | "senderId" | "createdAt"
>;

export type ConversationItem = {
	id: string;
	peer: ChatPeer;
	lastMessage: ChatMessage | null;
	unreadCount: number;
	updatedAt: Date;
};

export type MessagesOutputs = {
	open: {
		conversationId: string | null;
		peer: ChatPeer;
		hasBlockedPeer: boolean;
		isBlockedByPeer: boolean;
		isFollowing: boolean;
	};
	conversations: ConversationItem[];
	byId: {
		id: string;
		peer: ChatPeer;
		hasBlockedPeer: boolean;
		isBlockedByPeer: boolean;
		messages: ChatMessage[];
	};
	settings: {
		peer: ChatPeer;
		hasBlockedPeer: boolean;
		isBlockedByPeer: boolean;
		isFollowing: boolean;
		id: string;
	};
	setBlocked: { blocked: boolean; isBlockedByPeer: boolean };
	clear: { ok: boolean };
	deleteForMe: { ok: boolean };
	send: { conversationId: string; message: ChatMessage };
};

// ====== Contract ======

export const messagesContract = {
	open: procedure
		.input(openConversationInput)
		.output(output<MessagesOutputs["open"]>()),
	conversations: procedure.output(output<MessagesOutputs["conversations"]>()),
	byId: procedure
		.input(conversationInput)
		.output(output<MessagesOutputs["byId"]>()),
	settings: procedure
		.input(conversationActionInput)
		.output(output<MessagesOutputs["settings"]>()),
	setBlocked: procedure
		.input(blockInput)
		.output(output<MessagesOutputs["setBlocked"]>()),
	clear: procedure
		.input(conversationActionInput)
		.output(output<MessagesOutputs["clear"]>()),
	deleteForMe: procedure
		.input(deleteForMeInput)
		.output(output<MessagesOutputs["deleteForMe"]>()),
	send: procedure
		.input(sendMessageInput)
		.output(output<MessagesOutputs["send"]>()),
};
