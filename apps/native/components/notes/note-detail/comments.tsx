import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type {
	CommentSort,
	CommentListRow as NoteComment,
} from "@youni/api/contracts/comments";
import {
	Avatar,
	Button,
	cn,
	PressableFeedback,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { type RefObject, useState } from "react";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { formatRelativeTime } from "@/utils/format";
import { orpc } from "@/utils/orpc";

function commentTreeContains(comment: NoteComment, commentId: string): boolean {
	if (comment.id === commentId) return true;
	return comment.replies.some((reply) => commentTreeContains(reply, commentId));
}

export function CommentSectionHeader({
	commentCount,
	commentsEnabled,
	onSortChange,
	sort,
}: {
	commentCount: number;
	commentsEnabled: boolean;
	onSortChange: (sort: CommentSort) => void;
	sort: CommentSort;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View>
			<AppSeparator />
			<View className="gap-4 px-4 pt-5 pb-4">
				<View className="flex-row items-center justify-between gap-4">
					<View className="min-w-0 flex-1 flex-row items-baseline gap-2">
						<Typography.Paragraph weight="semibold" className="text-foreground">
							评论
						</Typography.Paragraph>
						<Typography.Paragraph type="body-xs" color="muted">
							共 {commentCount} 条
						</Typography.Paragraph>
					</View>
					{commentsEnabled ? (
						<Button
							size="sm"
							variant="ghost"
							className="h-7 px-2"
							feedbackVariant="scale-ripple"
							onPress={() => onSortChange(sort === "hot" ? "latest" : "hot")}
						>
							<Ionicons name="swap-vertical" size={13} color={mutedColor} />
							<Button.Label className="text-xs">
								{sort === "hot" ? "最热" : "最新"}
							</Button.Label>
						</Button>
					) : null}
				</View>
				{commentsEnabled ? null : (
					<Typography.Paragraph type="body-sm" color="muted">
						作者已关闭评论。
					</Typography.Paragraph>
				)}
			</View>
		</View>
	);
}

export function CommentFooter({
	hasItems,
	hasMore,
	isLoading,
}: {
	hasItems: boolean;
	hasMore: boolean;
	isLoading: boolean;
}) {
	if (!hasItems) return null;

	if (isLoading) {
		return (
			<View className="items-center py-5">
				<Spinner size="sm" />
			</View>
		);
	}

	if (!hasMore) {
		return (
			<View className="items-center py-5">
				<Typography.Paragraph type="body-xs" color="muted">
					没有更多了
				</Typography.Paragraph>
			</View>
		);
	}

	return <View className="h-5" />;
}

export function CommentItem({
	anchoredTargetComment,
	comment,
	depth,
	onReply,
	redirectTo,
	targetCommentId,
	targetCommentRef,
	targetRootCommentId,
}: {
	anchoredTargetComment?: NoteComment | null;
	comment: NoteComment;
	depth: number;
	onReply: (comment: NoteComment) => void;
	redirectTo: string;
	targetCommentId?: null | string;
	targetCommentRef?: RefObject<View | null>;
	targetRootCommentId?: null | string;
}) {
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [isExpanded, setIsExpanded] = useState(false);
	const isTarget = comment.id === targetCommentId;
	const shouldFetchReplies =
		isExpanded && comment.replyCount > comment.replies.length;
	const repliesQuery = useQuery({
		...orpc.comments.commentReplies.queryOptions({
			input: { parentId: comment.id, limit: 30 },
		}),
		enabled: shouldFetchReplies,
	});
	const replies = isExpanded
		? (repliesQuery.data?.items ?? comment.replies)
		: comment.replies;
	const shouldRenderAnchoredTarget =
		depth === 0 &&
		anchoredTargetComment &&
		targetRootCommentId === comment.id &&
		anchoredTargetComment.id !== comment.id &&
		!commentTreeContains(comment, anchoredTargetComment.id);
	const visibleReplies = shouldRenderAnchoredTarget
		? [anchoredTargetComment, ...replies]
		: replies;
	const hiddenReplyCount = Math.max(
		0,
		comment.replyCount - comment.replies.length,
	);
	const canExpand = comment.replyCount > comment.replies.length && !isExpanded;

	const toggleLike = () => {
		if (socialActions.pending.commentLike(comment.id)) return;
		socialActions.toggleCommentLike(
			{ id: comment.id },
			{
				redirectTo,
			},
		);
	};

	const deleteComment = () => {
		if (socialActions.pending.deleteComment(comment.id)) return;
		socialActions.deleteComment(
			{ id: comment.id },
			{
				redirectTo,
			},
		);
	};

	return (
		<View
			ref={isTarget ? targetCommentRef : undefined}
			className={cn(
				depth > 0 ? "ml-9 gap-3" : "gap-3",
				isTarget ? "rounded-2xl bg-accent-soft px-3 pt-3" : undefined,
			)}
		>
			<View className="flex-row gap-2.5">
				<Avatar size="sm" alt={comment.authorName} className="size-8">
					{comment.authorImage ? (
						<Avatar.Image source={{ uri: comment.authorImage }} />
					) : null}
					<Avatar.Fallback>{comment.authorName.slice(0, 1)}</Avatar.Fallback>
				</Avatar>
				<View className="min-w-0 flex-1 gap-1 pb-4">
					<View className="flex-row items-center gap-2">
						<Typography.Paragraph
							type="body-sm"
							weight="semibold"
							numberOfLines={1}
							className="min-w-0 flex-1"
						>
							{comment.authorName}
						</Typography.Paragraph>
					</View>
					<Typography.Paragraph
						type="body-sm"
						className="text-foreground leading-5"
					>
						{comment.content}
					</Typography.Paragraph>
					<View className="flex-row items-center justify-between gap-4 pt-1">
						<View className="min-w-0 flex-1 flex-row items-center gap-4">
							<Typography.Paragraph type="body-xs" color="muted">
								{formatRelativeTime(comment.createdAt)}
							</Typography.Paragraph>
							<PressableFeedback
								accessibilityRole="button"
								accessibilityLabel="回复评论"
								onPress={() => onReply(comment)}
							>
								<Typography.Paragraph type="body-xs" color="muted">
									回复
								</Typography.Paragraph>
							</PressableFeedback>
							{comment.canDelete ? (
								<PressableFeedback
									accessibilityRole="button"
									accessibilityLabel="删除评论"
									onPress={deleteComment}
								>
									<Typography.Paragraph
										type="body-xs"
										style={{ color: dangerColor }}
									>
										删除
									</Typography.Paragraph>
								</PressableFeedback>
							) : null}
						</View>
						<PressableFeedback
							accessibilityRole="button"
							accessibilityLabel={comment.liked ? "取消评论点赞" : "评论点赞"}
							className="flex-row items-center gap-1"
							onPress={toggleLike}
						>
							<Ionicons
								name={comment.liked ? "heart" : "heart-outline"}
								size={15}
								color={comment.liked ? dangerColor : mutedColor}
							/>
							<Typography.Paragraph
								type="body-xs"
								style={{ color: comment.liked ? dangerColor : mutedColor }}
							>
								{comment.likedCount || "赞"}
							</Typography.Paragraph>
						</PressableFeedback>
					</View>
				</View>
			</View>
			{visibleReplies.length > 0 ? (
				<View className="gap-3">
					{visibleReplies.map((reply) => (
						<CommentItem
							key={reply.id}
							anchoredTargetComment={anchoredTargetComment}
							comment={reply}
							depth={depth + 1}
							onReply={onReply}
							redirectTo={redirectTo}
							targetCommentId={targetCommentId}
							targetCommentRef={targetCommentRef}
							targetRootCommentId={targetRootCommentId}
						/>
					))}
				</View>
			) : null}
			{canExpand ? (
				<Button
					size="sm"
					variant="ghost"
					className="ml-10 self-start rounded-full"
					feedbackVariant="scale-ripple"
					onPress={() => setIsExpanded(true)}
				>
					{repliesQuery.isLoading ? <Spinner size="sm" /> : null}
					<Button.Label>展开 {hiddenReplyCount} 条回复</Button.Label>
				</Button>
			) : null}
		</View>
	);
}
