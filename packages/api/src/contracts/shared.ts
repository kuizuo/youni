import z from "zod";

// ====== Input ======

export const idInput = z.object({ id: z.string().min(1) });

export const listInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(60).default(30),
});

export const paginatedListInput = listInput.extend({
	offset: z.number().int().min(0).default(0),
});

// ====== Output ======

export type ContentNoteStatus =
	| "audit"
	| "draft"
	| "published"
	| "rejected"
	| "hidden";

export type ContentNoteRow = {
	id: string;
	title: string;
	content: string;
	images: string[];
	imageMetas: Array<{ height: number; url: string; width: number }>;
	cover: string | null;
	locationName: string | null;
	visibility: "public" | "followers" | "private";
	components: Array<{
		options?: string[];
		title: string;
		type: "file" | "poll";
		value?: string;
	}>;
	advancedOptions: {
		allowComment: boolean;
		allowShare: boolean;
		contentDisclosure?: string | null;
		isOriginal: boolean;
	};
	status: ContentNoteStatus;
	rejectionReason: string | null;
	publishedAt: Date | null;
	draftSavedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
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
		image: string | null;
		handle: string | null;
		isFollowing: boolean;
	};
};

export type AdminContentNoteRow = {
	id: string;
	title: string;
	content: string;
	cover: string | null;
	images: string[];
	imageMetas: Array<{ height: number; url: string; width: number }>;
	locationName: string | null;
	visibility: "public" | "followers" | "private";
	components: Array<{
		options?: string[];
		title: string;
		type: "file" | "poll";
		value?: string;
	}>;
	advancedOptions: {
		allowComment: boolean;
		allowShare: boolean;
		contentDisclosure?: string | null;
		isOriginal: boolean;
	};
	status: ContentNoteStatus;
	rejectionReason: string | null;
	createdAt: Date;
	publishedAt: Date | null;
	draftSavedAt: Date | null;
	userId: string;
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

export type AdminContentNoteDetail = AdminHydratedContentNote<
	AdminContentNoteRow & {
		updatedAt: Date;
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
	likedUsers: Array<{
		userId: string;
		name: string;
		email: string;
		image: string | null;
		createdAt: Date;
	}>;
	collectedUsers: Array<{
		userId: string;
		name: string;
		email: string;
		image: string | null;
		createdAt: Date;
	}>;
};
