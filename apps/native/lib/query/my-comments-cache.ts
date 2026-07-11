import type { MyCommentRow } from "@youni/api/contracts/comments";

export function removeMyComment(
	comments: MyCommentRow[] | undefined,
	commentId: string,
) {
	return comments?.filter((comment) => comment.id !== commentId);
}
