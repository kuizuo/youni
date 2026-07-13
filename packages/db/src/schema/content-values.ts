export const noteStatuses = [
	"draft",
	"audit",
	"published",
	"rejected",
	"hidden",
] as const;

export const noteVisibilities = ["public", "followers", "private"] as const;

export type NoteStatus = (typeof noteStatuses)[number];
export type NoteVisibility = (typeof noteVisibilities)[number];
