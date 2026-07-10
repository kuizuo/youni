import type { CommentListRow } from "./comments-output";
import type { ContentNoteRow, HydratedContentNote } from "./content-note-types";

export type NotesOutputs = {
	feed: HydratedContentNote[];
	followingFeed: HydratedContentNote[];
	searchNotes: {
		items: HydratedContentNote[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	byId: ContentNoteRow & {
		topics: string[];
		likedCount: number;
		collectedCount: number;
		commentCount: number;
		liked: boolean;
		collected: boolean;
		author: {
			id: string;
			name: string;
			image: string | null;
			handle: string | null;
			isFollowing: boolean;
		};
	} & { comments: CommentListRow[]; commentsNextOffset: number | null };
	drafts: HydratedContentNote[];
	draftById: HydratedContentNote | undefined;
	editById: HydratedContentNote | undefined;
	updateDraft: { id: string; status: string };
	updateNote: { id: string; status: "audit" };
	updateNoteVisibility: {
		id: string;
		visibility: "public" | "followers" | "private";
	};
	deleteMyNote: { ok: boolean };
	creatorStats: {
		total: number;
		published: number;
		draft: number;
		audit: number;
		rejected: number;
		hidden: number;
		liked: number;
		collected: number;
		comments: number;
	};
	viewHistory: { note: HydratedContentNote; viewedAt: Date }[];
	deleteViewHistory: { ok: boolean };
	clearViewHistory: { ok: boolean };
	create: { id: string; status: string };
	toggleLike: { liked: boolean; likedCount: number };
	toggleCollect: { collected: boolean; collectedCount: number };
};
