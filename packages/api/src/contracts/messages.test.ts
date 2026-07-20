import { describe, expect, test } from "bun:test";

import { deleteForMeInput, sendMessageInput } from "./messages";

test("deleteForMeInput requires both the chat and message", () => {
	expect(
		deleteForMeInput.parse({ conversationId: "chat-1", messageId: "msg-1" }),
	).toEqual({ conversationId: "chat-1", messageId: "msg-1" });
	expect(deleteForMeInput.safeParse({ conversationId: "chat-1" }).success).toBe(
		false,
	);
});

describe("sendMessageInput", () => {
	test("accepts exactly one chat target", () => {
		expect(
			sendMessageInput.parse({
				clientMessageId: "local-1",
				conversationId: "chat-1",
				content: " hello ",
			}),
		).toEqual({
			clientMessageId: "local-1",
			conversationId: "chat-1",
			content: "hello",
		});
		expect(
			sendMessageInput.parse({
				clientMessageId: "local-2",
				userId: "user-1",
				content: " hello ",
			}),
		).toEqual({
			clientMessageId: "local-2",
			userId: "user-1",
			content: "hello",
		});
		expect(
			sendMessageInput.safeParse({
				clientMessageId: "local-3",
				content: "hello",
			}).success,
		).toBe(false);
		expect(
			sendMessageInput.safeParse({
				clientMessageId: "local-4",
				conversationId: "chat-1",
				userId: "user-1",
				content: "hello",
			}).success,
		).toBe(false);
		expect(
			sendMessageInput.safeParse({
				conversationId: "chat-1",
				content: "hello",
			}).success,
		).toBe(false);
	});
});
