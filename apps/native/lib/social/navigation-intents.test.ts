import { describe, expect, test } from "bun:test";

import { toSocialHref } from "./navigation-intents";

describe("chat settings navigation", () => {
	test("supports chats before and after the first message", () => {
		expect(toSocialHref({ type: "chatSettings", userId: "user-1" })).toEqual({
			pathname: "/chat-settings/[id]",
			params: { id: "user-1", userId: "user-1" },
		});
		expect(
			toSocialHref({
				type: "chatSettings",
				conversationId: "conversation-1",
			}),
		).toEqual({
			pathname: "/chat-settings/[id]",
			params: { id: "conversation-1" },
		});
	});
});
