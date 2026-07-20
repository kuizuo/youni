import { describe, expect, test } from "bun:test";
import type { ConversationItem } from "@youni/api/contracts/messages";

import {
	type ChatListMessage,
	markConversationRead,
	mergeChatMessages,
} from "./message-state";

const sentAt = new Date("2026-07-17T10:00:00.000Z");

describe("mergeChatMessages", () => {
	test("shows local messages immediately and removes the duplicate after sync", () => {
		const local: ChatListMessage = {
			content: "你好",
			createdAt: sentAt,
			deliveryStatus: "pending",
			id: "local-1",
			senderId: "me",
		};

		expect(mergeChatMessages([], [local])).toEqual([local]);
		expect(
			mergeChatMessages([{ ...local, deliveryStatus: undefined }], [local]),
		).toEqual([{ ...local, deliveryStatus: undefined }]);
	});

	test("hides a message immediately and restores it when deletion fails", () => {
		const message: ChatListMessage = {
			content: "需要删除的消息",
			createdAt: sentAt,
			id: "message-1",
			senderId: "me",
		};

		expect(mergeChatMessages([message], [], new Set([message.id]))).toEqual([]);
		expect(mergeChatMessages([message], [], new Set())).toEqual([message]);
	});
});

test("opening a chat clears only that conversation's unread count", () => {
	const conversations: ConversationItem[] = [
		{
			id: "chat-1",
			lastMessage: null,
			peer: {
				bio: null,
				email: "one@example.com",
				handle: null,
				id: "user-1",
				image: null,
				name: "用户一",
			},
			unreadCount: 2,
			updatedAt: sentAt,
		},
		{
			id: "chat-2",
			lastMessage: null,
			peer: {
				bio: null,
				email: "two@example.com",
				handle: null,
				id: "user-2",
				image: null,
				name: "用户二",
			},
			unreadCount: 3,
			updatedAt: sentAt,
		},
	];

	expect(markConversationRead(conversations, "chat-1")).toEqual([
		{ ...conversations[0], unreadCount: 0 },
		conversations[1],
	]);
});

test("first message keeps the current chat screen mounted", async () => {
	const source = await Bun.file(
		new URL("../chat-detail-screen.tsx", import.meta.url),
	).text();

	expect(source).not.toContain("socialNavigation.replaceWith");
});
