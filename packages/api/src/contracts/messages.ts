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

export const blockInput = conversationActionInput.extend({
	blocked: z.boolean(),
});

export const startConversationInput = z.object({
	userId: z.string().min(1),
});

export const sendMessageInput = z.object({
	conversationId: z.string().min(1),
	content: z.string().trim().min(1).max(1000),
});

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
	start: {
		id: string;
		peer: ChatPeer;
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
	clear: { clearedAt: Date; ok: boolean };
	send: ChatMessage;
};

// ====== Contract ======

export const messagesContract = {
	start: procedure
		.input(startConversationInput)
		.output(output<MessagesOutputs["start"]>()),
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
	send: procedure
		.input(sendMessageInput)
		.output(output<MessagesOutputs["send"]>()),
};
