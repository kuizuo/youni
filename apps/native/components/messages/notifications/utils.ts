import type { NotificationKind } from "./types";

export function getNotificationKind(value?: string): NotificationKind {
	if (value === "followers" || value === "comments" || value === "reactions") {
		return value;
	}
	return "reactions";
}
