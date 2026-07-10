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

export type CommentsOutputs = {
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
