import z from "zod";

import type { CommentsOutputs } from "./comments-output";
import { idInput } from "./common-inputs";
import { output, procedure } from "./procedure";

export const commentInput = z.object({
	noteId: z.string().min(1),
	content: z.string().trim().min(1).max(500),
	parentId: z.string().min(1).optional(),
});

export const noteCommentsInput = z.object({
	noteId: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(20),
	offset: z.number().int().min(0).default(0),
	sort: z.enum(["hot", "latest"]).default("hot"),
});

export const commentRepliesInput = z.object({
	parentId: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(30),
	offset: z.number().int().min(0).default(0),
});

export const myCommentsInput = z.object({
	limit: z.number().int().min(1).max(60).default(30),
});

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
