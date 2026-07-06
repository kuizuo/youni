import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
	Avatar,
	Button,
	PressableFeedback,
	Separator,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { useSocialActions } from "@/lib/social/use-social-actions";
import { formatRelativeTime } from "@/utils/format";
import { orpc } from "@/utils/orpc";

import type { CommentSort, NoteComment } from "./types";

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
			<Separator />
			<View className="gap-4 px-4 pt-5 pb-4">
				<View className="flex-row items-center justify-between gap-4">
					<View className="min-w-0 flex-1 flex-row items-baseline gap-2">
						<Text.Paragraph weight="semibold" className="text-foreground">
							评论
						</Text.Paragraph>
						<Text.Paragraph type="body-xs" color="muted">
							共 {commentCount} 条
						</Text.Paragraph>
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
					<Text.Paragraph type="body-sm" color="muted">
						作者已关闭评论。
					</Text.Paragraph>
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
				<Text.Paragraph type="body-xs" color="muted">
					没有更多了
				</Text.Paragraph>
			</View>
		);
	}

	return <View className="h-5" />;
}

export function CommentItem({
	comment,
	depth,
	onChanged,
	onReply,
	redirectTo,
}: {
	comment: NoteComment;
	depth: number;
	onChanged: () => Promise<unknown>;
	onReply: (comment: NoteComment) => void;
	redirectTo: string;
}) {
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [isExpanded, setIsExpanded] = useState(false);
	const shouldFetchReplies =
		isExpanded && comment.replyCount > comment.replies.length;
	const repliesQuery = useQuery({
		...orpc.commentReplies.queryOptions({
			input: { parentId: comment.id, limit: 30 },
		}),
		enabled: shouldFetchReplies,
	});
	const replies = isExpanded
		? ((repliesQuery.data?.items ?? comment.replies) as NoteComment[])
		: comment.replies;
	const hiddenReplyCount = Math.max(
		0,
		comment.replyCount - comment.replies.length,
	);
	const canExpand = comment.replyCount > comment.replies.length && !isExpanded;

	const toggleLike = () => {
		socialActions.toggleCommentLike(
			{ id: comment.id },
			{
				onSuccess: async () => {
					await onChanged();
				},
				redirectTo,
			},
		);
	};

	const deleteComment = () => {
		socialActions.deleteComment(
			{ id: comment.id },
			{
				onSuccess: async () => {
					await onChanged();
				},
				redirectTo,
			},
		);
	};

	return (
		<View className={depth > 0 ? "ml-9 gap-3" : "gap-3"}>
			<View className="flex-row gap-2.5">
				<Avatar size="sm" alt={comment.authorName} className="size-8">
					{comment.authorImage ? (
						<Avatar.Image source={{ uri: comment.authorImage }} />
					) : null}
					<Avatar.Fallback>{comment.authorName.slice(0, 1)}</Avatar.Fallback>
				</Avatar>
				<View className="min-w-0 flex-1 gap-1 pb-4">
					<View className="flex-row items-center gap-2">
						<Text.Paragraph
							type="body-sm"
							weight="semibold"
							numberOfLines={1}
							className="min-w-0 flex-1"
						>
							{comment.authorName}
						</Text.Paragraph>
					</View>
					<Text.Paragraph type="body-sm" className="text-foreground leading-5">
						{comment.content}
					</Text.Paragraph>
					<View className="flex-row items-center justify-between gap-4 pt-1">
						<View className="min-w-0 flex-1 flex-row items-center gap-4">
							<Text.Paragraph type="body-xs" color="muted">
								{formatRelativeTime(comment.createdAt)}
							</Text.Paragraph>
							<PressableFeedback
								accessibilityRole="button"
								accessibilityLabel="回复评论"
								onPress={() => onReply(comment)}
							>
								<Text.Paragraph type="body-xs" color="muted">
									回复
								</Text.Paragraph>
							</PressableFeedback>
							{comment.canDelete ? (
								<PressableFeedback
									accessibilityRole="button"
									accessibilityLabel="删除评论"
									onPress={deleteComment}
								>
									<Text.Paragraph type="body-xs" style={{ color: dangerColor }}>
										删除
									</Text.Paragraph>
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
							<Text.Paragraph
								type="body-xs"
								style={{ color: comment.liked ? dangerColor : mutedColor }}
							>
								{comment.likedCount || "赞"}
							</Text.Paragraph>
						</PressableFeedback>
					</View>
				</View>
			</View>
			{replies.length > 0 ? (
				<View className="gap-3">
					{replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							depth={depth + 1}
							onChanged={onChanged}
							onReply={onReply}
							redirectTo={redirectTo}
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
