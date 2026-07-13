import z from "zod";
import { output, procedure } from "./procedure";
import { idInput } from "./shared";

// ====== Input ======

export const commentInput = z.object({
	noteId: z.string().min(1),
	content: z.string().trim().min(1).max(500),
	parentId: z.string().min(1).optional(),
});

export const commentSortInput = z.enum(["hot", "latest"]);
export type CommentSort = z.infer<typeof commentSortInput>;

export const noteCommentsInput = z.object({
	noteId: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(20),
	offset: z.number().int().min(0).default(0),
	sort: commentSortInput.default("hot"),
});

export const commentRepliesInput = z.object({
	parentId: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(30),
	offset: z.number().int().min(0).default(0),
});

export const myCommentsInput = z.object({
	limit: z.number().int().min(1).max(60).default(30),
});

// ====== Output ======

export type CommentListRow = {
	authorImage: null | string;
	authorName: string;
	canDelete: boolean;
	content: string;
	createdAt: Date;
	id: string;
	liked: boolean;
	likedCount: number;
	noteId: string;
	parentId: null | string;
	replies: CommentListRow[];
	replyCount: number;
	userId: string;
};

export type MyCommentRow = {
	canOpenNote: boolean;
	content: string;
	createdAt: Date;
	id: string;
	noteId: string;
	notePreview: null | {
		cover: null | string;
		title: string;
	};
	parentId: null | string;
	replyToComment: null | {
		authorName: string;
		content: string;
	};
};

export type CommentsOutputs = {
	myComments: MyCommentRow[];
	comments: {
		items: CommentListRow[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	commentReplies: {
		items: CommentListRow[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	commentAnchor: { comment: CommentListRow; rootCommentId: string };
	addComment:
		| {
				id: string;
				createdAt: Date;
				userId: string;
				content: string;
				noteId: string;
				parentId: string | null;
		  }
		| undefined;
	toggleCommentLike: { liked: boolean; likedCount: number };
	deleteComment: { ok: boolean };
};

// ====== Contract ======

export const commentsContract = {
	myComments: procedure
		.input(myCommentsInput)
		.output(output<CommentsOutputs["myComments"]>()),
	comments: procedure
		.input(noteCommentsInput)
		.output(output<CommentsOutputs["comments"]>()),
	commentReplies: procedure
		.input(commentRepliesInput)
		.output(output<CommentsOutputs["commentReplies"]>()),
	commentAnchor: procedure
		.input(idInput)
		.output(output<CommentsOutputs["commentAnchor"]>()),
	addComment: procedure
		.input(commentInput)
		.output(output<CommentsOutputs["addComment"]>()),
	toggleCommentLike: procedure
		.input(idInput)
		.output(output<CommentsOutputs["toggleCommentLike"]>()),
	deleteComment: procedure
		.input(idInput)
		.output(output<CommentsOutputs["deleteComment"]>()),
};
