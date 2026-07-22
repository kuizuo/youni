import { describe, expect, test } from "bun:test";
import type { SendMessageInput } from "@youni/api/contracts/messages";

import {
	type ConversationTransport,
	createConversationSession,
} from "./conversation-session";

const sentAt = new Date("2026-07-17T10:00:00.000Z");
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function createTransport(
	overrides: Partial<ConversationTransport> = {},
): ConversationTransport {
	return {
		deleteForMe: async () => ({ ok: true }),
		refresh: async () => undefined,
		send: async (input) => ({
			conversationId:
				"conversationId" in input ? input.conversationId : "chat-1",
			message: {
				content: input.content,
				createdAt: sentAt,
				id: input.clientMessageId,
				senderId: "me",
			},
		}),
		...overrides,
	};
}

describe("conversation session", () => {
	test("starts a conversation optimistically and keeps the same session", async () => {
		const sent: SendMessageInput[] = [];
		const refreshed: string[] = [];
		const transport = createTransport({
			refresh: async (conversationId) => {
				refreshed.push(conversationId);
			},
			send: async (input) => {
				sent.push(input);
				return {
					conversationId: "chat-1",
					message: {
						content: input.content,
						createdAt: sentAt,
						id: input.clientMessageId,
						senderId: "me",
					},
				};
			},
		});
		const session = createConversationSession({
			draftUserId: "peer-1",
			initialConversationId: "",
			onError: () => undefined,
			senderId: "me",
			transport,
		});

		expect(session.send(" 你好 ")).toBe(true);
		expect(session.getMessages([])[0]).toMatchObject({
			content: "你好",
			deliveryStatus: "pending",
		});
		await flush();

		expect(sent[0]).toMatchObject({ content: "你好", userId: "peer-1" });
		expect(session.getState().conversationId).toBe("chat-1");
		expect(session.getMessages([])[0]?.deliveryStatus).toBeUndefined();
		expect(refreshed).toEqual(["chat-1"]);
	});

	test("deletes a pending message after the server accepts it", async () => {
		let finishSend:
			| ((value: Awaited<ReturnType<ConversationTransport["send"]>>) => void)
			| undefined;
		const deleted: string[] = [];
		const transport = createTransport({
			deleteForMe: async ({ messageId }) => {
				deleted.push(messageId);
				return { ok: true };
			},
			send: (input) =>
				new Promise((resolve) => {
					finishSend = resolve;
					void input;
				}),
		});
		const session = createConversationSession({
			draftUserId: "peer-1",
			initialConversationId: "",
			onError: () => undefined,
			senderId: "me",
			transport,
		});

		session.send("稍后删除");
		const pending = session.getMessages([])[0];
		expect(pending).toBeDefined();
		if (!pending) return;
		session.deleteMessage(pending);
		expect(session.getMessages([])).toEqual([]);

		finishSend?.({
			conversationId: "chat-1",
			message: { ...pending, createdAt: sentAt, deliveryStatus: undefined },
		});
		await flush();

		expect(deleted).toEqual([pending.id]);
		expect(session.getMessages([])).toEqual([]);
	});

	test("restores a server message when deletion fails", async () => {
		const errors: string[] = [];
		const message = {
			content: "不能丢失",
			createdAt: sentAt,
			id: "message-1",
			senderId: "me",
		};
		const session = createConversationSession({
			draftUserId: "",
			initialConversationId: "chat-1",
			onError: (_error, action) => errors.push(action),
			senderId: "me",
			transport: createTransport({
				deleteForMe: async () => {
					throw new Error("删除失败");
				},
			}),
		});

		session.deleteMessage(message);
		expect(session.getMessages([message])).toEqual([]);
		await flush();

		expect(session.getMessages([message])).toEqual([message]);
		expect(errors).toEqual(["delete"]);
	});

	test("retries a failed message with the same identity", async () => {
		const sent: SendMessageInput[] = [];
		const session = createConversationSession({
			draftUserId: "",
			initialConversationId: "chat-1",
			onError: () => undefined,
			senderId: "me",
			transport: createTransport({
				send: async (input) => {
					sent.push(input);
					if (sent.length === 1) throw new Error("发送失败");
					return {
						conversationId: "chat-1",
						message: {
							content: input.content,
							createdAt: sentAt,
							id: input.clientMessageId,
							senderId: "me",
						},
					};
				},
			}),
		});

		session.send("再试一次");
		await flush();
		const failed = session.getMessages([])[0];
		expect(failed?.deliveryStatus).toBe("failed");
		if (!failed) return;

		expect(session.retryMessage(failed)).toBe(true);
		expect(session.getMessages([])[0]?.deliveryStatus).toBe("pending");
		await flush();

		expect(sent[1]?.clientMessageId).toBe(sent[0]?.clientMessageId);
		expect(session.getMessages([])[0]?.deliveryStatus).toBeUndefined();
	});
});
