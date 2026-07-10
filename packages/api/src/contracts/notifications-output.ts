export type NotificationsOutputs = {
	list: {
		items: {
			id: string;
			kind:
				| "comment"
				| "follow"
				| "system"
				| "like"
				| "collect"
				| "mention"
				| "message"
				| "announcement"
				| "event";
			categoryId: "followers" | "activity" | "system";
			title: string;
			body: string;
			targetType: string | null;
			targetId: string | null;
			noteId: string | null;
			isRead: boolean;
			createdAt: Date;
			previewUrl: string | null;
			actor: { id: string; name: string; image: string | null } | null;
		}[];
		nextOffset: number | null;
	};
	summary: {
		totalUnread: number;
		categories: [
			{ id: string; unreadCount: number; updatedAt: Date | null },
			{ id: string; unreadCount: number; updatedAt: Date | null },
			{ id: string; unreadCount: number; updatedAt: Date | null },
		];
		messageGroups: [
			{ id: string; unreadCount: number; updatedAt: Date | null },
			{ id: string; unreadCount: number; updatedAt: Date | null },
			{ id: string; unreadCount: number; updatedAt: Date | null },
		];
	};
	markRead: { ok: boolean };
	markAllRead: { ok: boolean };
	delete: { ok: boolean };
	deleteAll: { ok: boolean };
	registerPushToken: { id: string | null };
	unregisterPushToken: { ok: boolean };
};
