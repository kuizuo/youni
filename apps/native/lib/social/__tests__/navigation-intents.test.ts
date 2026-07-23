import { describe, expect, test } from "@jest/globals";

import { getUserProfileIntent, toSocialHref } from "../navigation-intents";

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

test("carries note author preview into the profile route", () => {
	expect(
		toSocialHref(
			getUserProfileIntent({
				bio: "热爱记录生活",
				handle: "ash",
				id: "user-1",
				image: "https://example.com/avatar.png",
				name: "阿树",
			}),
		),
	).toEqual({
		pathname: "/user/[id]",
		params: {
			bio: "热爱记录生活",
			handle: "ash",
			id: "user-1",
			image: "https://example.com/avatar.png",
			name: "阿树",
		},
	});
});
