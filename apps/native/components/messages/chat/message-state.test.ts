import { describe, expect, test } from "bun:test";

import { type ChatListMessage, mergeChatMessages } from "./message-state";

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
});

test("first message keeps the current chat screen mounted", async () => {
	const source = await Bun.file(
		new URL("../chat-detail-screen.tsx", import.meta.url),
	).text();

	expect(source).not.toContain("socialNavigation.replaceWith");
});
