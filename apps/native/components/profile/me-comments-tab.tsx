import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { MyCommentRow } from "@youni/api/contracts/comments";
import * as Clipboard from "expo-clipboard";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	BottomSheet,
	ListGroup,
	Skeleton,
	Text,
	useThemeColor,
} from "heroui-native";
import { useRef, useState } from "react";
import { Alert, Platform, Pressable, View } from "react-native";

import { ListDivider } from "@/components/create/create-ui";
import { EmptyState, ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { formatRelativeTime } from "@/utils/format";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

export function MeCommentsTab({
	authorImage,
	authorName,
	comments,
	isError,
	isLoading,
	onDeleted,
	onRetry,
	width,
}: {
	authorImage?: null | string;
	authorName: string;
	comments: MyCommentRow[];
	isError: boolean;
	isLoading: boolean;
	onDeleted: () => Promise<unknown>;
	onRetry: () => void;
	width: number;
}) {
	const router = useRouter();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [selectedComment, setSelectedComment] = useState<MyCommentRow | null>(
		null,
	);
	const suppressPressRef = useRef(false);
	const deleteComment = useMutation(
		orpc.deleteComment.mutationOptions({
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "评论删除失败",
				});
			},
			onSuccess: async () => {
				await onDeleted();
				toast.show({ variant: "success", label: "评论已删除" });
			},
		}),
	);

	const openComment = (comment: MyCommentRow) => {
		if (!comment.canOpenNote || suppressPressRef.current) return;
		fireHaptic();
		router.push({
			pathname: "/note/[id]",
			params: { id: comment.noteId, commentId: comment.id },
		} as unknown as Href);
	};

	const openActions = (comment: MyCommentRow) => {
		suppressPressRef.current = true;
		setTimeout(() => {
			suppressPressRef.current = false;
		}, 600);
		fireHaptic();
		setSelectedComment(comment);
	};

	const copySelectedComment = async () => {
		if (!selectedComment) return;
		const content = selectedComment.content;
		setSelectedComment(null);
		try {
			await Clipboard.setStringAsync(content);
			toast.show({ variant: "success", label: "评论已复制" });
		} catch {
			toast.show({ variant: "danger", label: "复制失败，请稍后重试" });
		}
	};

	const confirmDeleteSelectedComment = () => {
		if (!selectedComment || deleteComment.isPending) return;
		const comment = selectedComment;
		setSelectedComment(null);
		setTimeout(() => {
			Alert.alert("删除评论", "删除后无法恢复，相关回复也会一并删除。", [
				{ text: "取消", style: "cancel" },
				{
					text: "删除",
					style: "destructive",
					onPress: () => deleteComment.mutate({ id: comment.id }),
				},
			]);
		}, 180);
	};

	return (
		<View style={{ width }}>
			<View
				className="pt-1"
				style={{ paddingBottom: Platform.OS === "ios" ? 40 : 132 }}
			>
				{isLoading ? (
					<CommentsSkeleton />
				) : isError ? (
					<ErrorState
						description="评论记录暂时没有加载出来，请稍后重试。"
						onRetry={onRetry}
					/>
				) : comments.length > 0 ? (
					comments.map((comment) => (
						<View key={comment.id}>
							<Pressable
								accessibilityHint={
									comment.canOpenNote
										? "点击查看原图文，长按可复制或删除评论"
										: "原图文已不可见，长按可复制或删除评论"
								}
								accessibilityLabel={comment.content}
								accessibilityRole={comment.canOpenNote ? "button" : undefined}
								className="flex-row items-start gap-3 px-4 py-3.5 active:bg-content2"
								delayLongPress={350}
								onLongPress={() => openActions(comment)}
								onPress={
									comment.canOpenNote ? () => openComment(comment) : undefined
								}
							>
								<Avatar alt={authorName} size="sm" className="mt-0.5 size-9">
									{authorImage ? (
										<Avatar.Image source={{ uri: authorImage }} />
									) : null}
									<Avatar.Fallback>{authorName.slice(0, 1)}</Avatar.Fallback>
								</Avatar>
								<View className="min-w-0 flex-1 gap-2">
									<Text.Paragraph
										numberOfLines={1}
										type="body-sm"
										weight="semibold"
									>
										{authorName}
									</Text.Paragraph>
									<Text.Paragraph
										numberOfLines={2}
										className="text-foreground leading-5"
									>
										{comment.content}
									</Text.Paragraph>
									{comment.parentId ? (
										<View className="gap-1 border-border-secondary border-l-2 pl-2.5">
											{comment.replyToComment ? (
												<>
													<Text.Paragraph type="body-xs" color="muted">
														{comment.replyToComment.authorName}
													</Text.Paragraph>
													<Text.Paragraph
														numberOfLines={2}
														type="body-sm"
														color="muted"
													>
														{comment.replyToComment.content}
													</Text.Paragraph>
												</>
											) : (
												<Text.Paragraph type="body-xs" color="muted">
													原评论已删除
												</Text.Paragraph>
											)}
										</View>
									) : null}
									{comment.canOpenNote && comment.notePreview ? (
										<View className="min-w-0 flex-row items-center gap-1.5">
											<Text.Paragraph type="body-xs" color="muted">
												来自图文 ·
											</Text.Paragraph>
											<Text.Paragraph
												numberOfLines={1}
												type="body-xs"
												className="min-w-0 flex-1"
											>
												{comment.notePreview.title}
											</Text.Paragraph>
										</View>
									) : (
										<Text.Paragraph type="body-xs" color="muted">
											来自图文 · 原图文已不可见
										</Text.Paragraph>
									)}
									<Text.Paragraph type="body-xs" color="muted">
										{formatRelativeTime(comment.createdAt, "刚刚")}
									</Text.Paragraph>
								</View>
							</Pressable>
						</View>
					))
				) : (
					<EmptyState
						icon="chatbubble-ellipses-outline"
						title="还没有评论"
						description="发表过的评论和回复会出现在这里。"
					/>
				)}
			</View>

			<BottomSheet
				isOpen={Boolean(selectedComment)}
				onOpenChange={(isOpen) => {
					if (!isOpen) setSelectedComment(null);
				}}
			>
				<BottomSheet.Portal disableFullWindowOverlay>
					<BottomSheet.Overlay />
					<BottomSheet.Content>
						<View className="gap-3 px-3 pb-3">
							<BottomSheet.Title>评论操作</BottomSheet.Title>
							<ListGroup
								variant="secondary"
								className="overflow-hidden rounded-xl"
							>
								<ListGroup.Item
									accessibilityLabel="复制评论"
									onPress={() => void copySelectedComment()}
									className="gap-2.5 px-3.5 py-3"
								>
									<ListGroup.ItemPrefix>
										<Ionicons
											name="copy-outline"
											size={21}
											color={mutedColor}
										/>
									</ListGroup.ItemPrefix>
									<ListGroup.ItemContent>
										<ListGroup.ItemTitle className="text-sm">
											复制评论
										</ListGroup.ItemTitle>
									</ListGroup.ItemContent>
									<ListGroup.ItemSuffix>
										<View />
									</ListGroup.ItemSuffix>
								</ListGroup.Item>
								<ListDivider />
								<ListGroup.Item
									accessibilityLabel="删除评论"
									disabled={deleteComment.isPending}
									onPress={confirmDeleteSelectedComment}
									className="gap-2.5 px-3.5 py-3"
								>
									<ListGroup.ItemPrefix>
										<Ionicons
											name="trash-outline"
											size={21}
											color={dangerColor}
										/>
									</ListGroup.ItemPrefix>
									<ListGroup.ItemContent>
										<ListGroup.ItemTitle className="text-danger text-sm">
											删除评论
										</ListGroup.ItemTitle>
									</ListGroup.ItemContent>
									<ListGroup.ItemSuffix>
										<View />
									</ListGroup.ItemSuffix>
								</ListGroup.Item>
							</ListGroup>
						</View>
					</BottomSheet.Content>
				</BottomSheet.Portal>
			</BottomSheet>
		</View>
	);
}

function CommentsSkeleton() {
	return (
		<View>
			{[0, 1, 2].map((item) => (
				<View key={item}>
					<View className="flex-row items-start gap-3 px-4 py-3.5">
						<Skeleton className="size-9 rounded-full" />
						<View className="flex-1 gap-2">
							<Skeleton className="h-3 w-20 rounded-full" />
							<Skeleton className="h-4 w-full rounded-full" />
							<Skeleton className="h-4 w-2/3 rounded-full" />
							<Skeleton className="h-3 w-4/5 rounded-full" />
							<Skeleton className="h-3 w-24 rounded-full" />
						</View>
					</View>
				</View>
			))}
		</View>
	);
}
