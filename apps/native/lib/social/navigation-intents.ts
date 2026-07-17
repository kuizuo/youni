import type { ProfileConnectionType } from "@youni/api/contracts/profiles";
import type { Href } from "expo-router";

import { getLoginHref } from "@/lib/auth-navigation";

export type SocialNavigationIntent =
	| { type: "chat"; id: string }
	| {
			name: string;
			handle?: string;
			image?: string;
			type: "chatDraft";
			userId: string;
	  }
	| { type: "chatSettings"; conversationId: string }
	| { type: "chatSettings"; userId: string }
	| { redirectTo?: string; type: "login" }
	| { type: "messages" }
	| {
			commentId?: string;
			feedImpressionId?: string;
			type: "note";
			id: string;
	  }
	| { type: "publish" }
	| { type: "search" }
	| { type: "topic"; id: string }
	| {
			title?: string;
			type: "userConnections";
			userId: string;
			view: ProfileConnectionType;
	  }
	| {
			bio?: string;
			handle?: string;
			id: string;
			image?: string;
			name?: string;
			type: "user";
	  };

export type NotificationData = {
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
		case "chatDraft":
			return {
				pathname: "/chat/new",
				params: {
					userId: intent.userId,
					name: intent.name,
					...(intent.handle ? { handle: intent.handle } : {}),
					...(intent.image ? { image: intent.image } : {}),
				},
			} as unknown as Href;
		case "chatSettings":
			return {
				pathname: "/chat-settings/[id]",
				params:
					"conversationId" in intent
						? { id: intent.conversationId }
						: { id: intent.userId, userId: intent.userId },
			} as unknown as Href;
		case "login":
			return getLoginHref(intent.redirectTo);
		case "messages":
			return "/messages" as Href;
		case "note":
			return {
				pathname: "/note/[id]",
				params: {
					id: intent.id,
					...(intent.commentId ? { commentId: intent.commentId } : {}),
					...(intent.feedImpressionId
						? { feedImpressionId: intent.feedImpressionId }
						: {}),
				},
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
				params: {
					id: intent.id,
					...(intent.name ? { name: intent.name } : {}),
					...(intent.image ? { image: intent.image } : {}),
					...(intent.handle ? { handle: intent.handle } : {}),
					...(intent.bio ? { bio: intent.bio } : {}),
				},
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

export function getUserProfileIntent(user: {
	bio?: null | string;
	handle?: null | string;
	id: string;
	image?: null | string;
	name: string;
}): SocialNavigationIntent {
	return {
		type: "user",
		id: user.id,
		name: user.name,
		...(user.image ? { image: user.image } : {}),
		...(user.handle ? { handle: user.handle } : {}),
		...(user.bio ? { bio: user.bio } : {}),
	};
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

	if (targetType === "comment" && noteId) {
		return {
			type: "note",
			id: noteId,
			commentId: targetId ?? undefined,
		};
	}

	if (targetType === "user" && targetId) {
		return { type: "user", id: targetId };
	}

	if (targetType === "chat" && targetId) {
		return { type: "chat", id: targetId };
	}

	return { type: "messages" };
}
