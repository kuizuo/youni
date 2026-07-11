export const noteStatusOptions = [
	"draft",
	"audit",
	"published",
	"rejected",
	"hidden",
] as const;

export type NoteStatus = (typeof noteStatusOptions)[number];
export type MutableNoteStatus = Exclude<NoteStatus, "draft">;

export type AdminNoteListItem = {
	id: string;
	title: string;
	content: string;
	cover?: string | null;
	images: string[];
	locationName?: string | null;
	visibility: string;
	components: unknown[];
	advancedOptions?: {
		allowComment?: boolean;
		allowShare?: boolean;
	} | null;
	status: string;
	rejectionReason?: string | null;
	createdAt: Date | string;
	updatedAt?: Date | string;
	publishedAt?: Date | string | null;
	draftSavedAt?: Date | string | null;
	userId: string;
	authorName: string;
	authorEmail: string;
	authorImage?: string | null;
	authorHandle?: string | null;
	topics: string[];
	topicDetails?: Array<{ id: string; name: string }>;
	likedCount: number;
	collectedCount: number;
	commentCount: number;
};

export type AdminNoteDetail = AdminNoteListItem & {
	comments: Array<{
		id: string;
		content: string;
		createdAt: Date | string;
		authorId: string;
		authorName: string;
		authorEmail: string;
		authorImage?: string | null;
	}>;
	likedUsers: AdminNoteUserAction[];
	collectedUsers: AdminNoteUserAction[];
};

export type AdminNoteUserAction = {
	userId: string;
	name: string;
	email: string;
	image?: string | null;
	createdAt: Date | string;
};

export function toNoteStatus(value: string): NoteStatus {
	return noteStatusOptions.includes(value as NoteStatus)
		? (value as NoteStatus)
		: "draft";
}
