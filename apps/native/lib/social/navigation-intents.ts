import type { Href } from "expo-router";

import { getLoginHref } from "@/lib/auth-navigation";

export type SocialNavigationIntent =
	| { type: "chat"; id: string }
	| { redirectTo?: string; type: "login" }
	| { type: "messages" }
	| { type: "note"; id: string }
	| { type: "publish" }
	| { type: "search" }
	| { type: "topic"; id: string }
	| {
			title?: string;
			type: "userConnections";
			userId: string;
			view: "followers" | "following";
	  }
	| { type: "user"; id: string };

type NotificationData = {
	noteId?: unknown;
	targetId?: unknown;
	targetType?: unknown;
};

function getString(value: unknown) {
	return typeof value === "string" && value.length > 0 ? value : null;
}

export function toSocialHref(intent: SocialNavigationIntent): Href {
	switch (intent.type) {
		case "chat":
			return {
				pathname: "/chat/[id]",
				params: { id: intent.id },
			} as unknown as Href;
		case "login":
			return getLoginHref(intent.redirectTo);
		case "messages":
			return "/messages" as Href;
		case "note":
			return {
				pathname: "/note/[id]",
				params: { id: intent.id },
			} as unknown as Href;
		case "publish":
			return "/publish" as Href;
		case "search":
			return "/search" as Href;
		case "topic":
			return {
				pathname: "/topic/[id]",
				params: { id: intent.id },
			} as unknown as Href;
		case "user":
			return {
				pathname: "/user/[id]",
				params: { id: intent.id },
			} as unknown as Href;
		case "userConnections":
			return {
				pathname: "/user-connections",
				params: {
					type: intent.view,
					userId: intent.userId,
					title: intent.title ?? "用户",
				},
			} as unknown as Href;
	}
}

export function getNotificationIntent(
	data: NotificationData,
): SocialNavigationIntent {
	const targetType = getString(data.targetType);
	const targetId = getString(data.targetId);
	const noteId = getString(data.noteId);

	if (targetType === "note" && (noteId || targetId)) {
		return { type: "note", id: noteId ?? targetId ?? "" };
	}

	if (targetType === "user" && targetId) {
		return { type: "user", id: targetId };
	}

	if (targetType === "chat" && targetId) {
		return { type: "chat", id: targetId };
	}

	return { type: "messages" };
}
