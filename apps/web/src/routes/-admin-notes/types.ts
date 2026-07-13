import {
	type ContentNoteStatus,
	noteStatuses,
} from "@youni/api/contracts/shared";

export const noteStatusOptions = noteStatuses;

export type MutableNoteStatus = Exclude<ContentNoteStatus, "draft">;

export function toNoteStatus(value: string): ContentNoteStatus {
	return noteStatusOptions.includes(value as ContentNoteStatus)
		? (value as ContentNoteStatus)
		: "draft";
}
