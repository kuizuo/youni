export const noteStatuses = [
	"draft",
	"audit",
	"published",
	"rejected",
	"hidden",
] as const;

export const noteVisibilities = ["public", "followers", "private"] as const;

export const noteModerationStatuses = [
	"not_started",
	"pending",
	"processing",
	"passed",
	"needs_review",
	"blocked",
	"failed",
] as const;

export const noteModerationReasons = [
	"invalid_response",
	"low_confidence",
	"policy_violation",
	"queue_unavailable",
	"result_write_failed",
	"service_unavailable",
] as const;

export type NoteStatus = (typeof noteStatuses)[number];
export type NoteVisibility = (typeof noteVisibilities)[number];
export type NoteModerationStatus = (typeof noteModerationStatuses)[number];
export type NoteModerationReason = (typeof noteModerationReasons)[number];
