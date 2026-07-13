import type { NotificationKind } from "@/components/messages/notifications/types";
import type { CommentSort } from "@/components/notes/note-detail/types";
import type { TopicSort } from "@/components/topics/detail/types";

export const nativeQueryKeys = {
	create: {
		mentionUsers: (keyword: string) =>
			["create", "mention-users", keyword] as const,
	},
	home: {
		discover: (audienceId: string) => ["home", "discover", audienceId] as const,
	},
	note: {
		comments: (noteId: string, sort: CommentSort) =>
			["note", noteId, "comments", sort] as const,
		mentionUsers: (keyword: string) =>
			["note-detail", "mention-users", keyword] as const,
	},
	notifications: {
		list: (kind: NotificationKind) => ["notifications", kind] as const,
	},
	search: {
		notes: (keyword: string) => ["search", "notes", keyword] as const,
		topics: (keyword: string) => ["search", "topics", keyword] as const,
		users: (keyword: string) => ["search", "users", keyword] as const,
		recommendations: () => ["search", "recommendations"] as const,
	},
	topic: {
		detail: (topicId: string, sort: TopicSort) =>
			["topic", topicId, sort] as const,
	},
};
