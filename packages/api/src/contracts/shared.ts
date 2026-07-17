import type { UserRow } from "@youni/db/schema/auth";
import { type UserGender, userGenders } from "@youni/db/schema/auth-values";
import type { NoteRow } from "@youni/db/schema/content";
import z from "zod";

// ====== Input ======

export {
	type ContentModerationReason,
	type ContentModerationStatus,
	contentModerationStatuses,
	type NoteStatus as ContentNoteStatus,
	type NoteVisibility,
	noteStatuses,
} from "@youni/db/schema/content-values";
export type { UserGender };
export { userGenders };

export const manualReviewModerationStatuses = [
	"not_started",
	"pending",
	"processing",
	"needs_review",
	"failed",
] as const;

export function isPendingManualReview(
	content: Pick<NoteRow, "moderationStatus" | "status">,
) {
	return (
		content.status === "audit" &&
		manualReviewModerationStatuses.includes(
			content.moderationStatus as (typeof manualReviewModerationStatuses)[number],
		)
	);
}

export const idInput = z.object({ id: z.string().min(1) });

export const listInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(60).default(30),
});

export const paginatedListInput = listInput.extend({
	offset: z.number().int().min(0).default(0),
});

// ====== Output ======

export type ContentNoteRow = Omit<
	NoteRow,
	| "moderatedAt"
	| "moderationDetails"
	| "moderationReason"
	| "moderationStatus"
	| "viewCount"
> & {
	authorBio: string | null;
	authorName: string;
	authorImage: string | null;
	authorHandle: string | null;
};

export type HydratedContentNote = ContentNoteRow & {
	topics: string[];
	likedCount: number;
	collectedCount: number;
	commentCount: number;
	liked: boolean;
	collected: boolean;
	author: {
		id: string;
		name: string;
		bio: string | null;
		image: string | null;
		handle: string | null;
		isFollowing: boolean;
	};
};

export type AdminContentNoteRow = Omit<NoteRow, "viewCount"> & {
	authorName: string;
	authorEmail: string;
};

export type AdminHydratedContentNote<
	T extends { id: string } = AdminContentNoteRow,
> = T & {
	topics: string[];
	topicDetails: { id: string; name: string }[];
	likedCount: number;
	commentCount: number;
	collectedCount: number;
};

export type AdminUserReference = Pick<
	UserRow,
	"name" | "email" | "image" | "createdAt"
> & {
	userId: string;
};

export type AdminContentNoteDetail = AdminHydratedContentNote<
	AdminContentNoteRow & {
		authorImage: string | null;
		authorHandle: string | null;
	}
> & {
	comments: Array<{
		id: string;
		content: string;
		createdAt: Date;
		authorId: string;
		authorName: string;
		authorEmail: string;
		authorImage: string | null;
	}>;
	likedUsers: AdminUserReference[];
	collectedUsers: AdminUserReference[];
};
