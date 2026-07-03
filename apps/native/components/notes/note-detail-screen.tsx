import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Input,
	PressableFeedback,
	Skeleton,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/social-states";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { orpc } from "@/utils/orpc";

type NoteComment = {
	authorImage: null | string;
	authorName: string;
	canDelete: boolean;
	content: string;
	createdAt: Date | string;
	id: string;
	liked: boolean;
	likedCount: number;
	noteId: string;
	parentId: null | string;
	replies: NoteComment[];
	replyCount: number;
	userId: string;
};

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

function formatCommentTime(value: Date | string) {
	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (Number.isNaN(date.getTime())) return "";
	if (diff < minute) return "刚刚";
	if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
	if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
	if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function NoteDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const pageWidth = Math.min(width, 560);
	const imageHeight = Math.min(620, Math.max(420, pageWidth * 1.14));
	const [commentText, setCommentText] = useState("");
	const [replyTarget, setReplyTarget] = useState<null | {
		authorName: string;
		id: string;
	}>(null);

	const note = useQuery({
		...orpc.byId.queryOptions({ input: { id: id || "missing" } }),
		enabled: Boolean(id),
	});
	const authorId = note.data?.author.id ?? "";
	const authorProfile = useQuery({
		...orpc.profile.queryOptions({ input: { userId: authorId } }),
		enabled: Boolean(authorId),
	});

	const images = useMemo(() => note.data?.images ?? [], [note.data?.images]);
	const isSelf = socialActions.currentUserId === authorId;
	const isFollowing = Boolean(authorProfile.data?.profile.isFollowing);
	const commentsEnabled = note.data?.advancedOptions.allowComment ?? true;
	const canSendComment = commentsEnabled && commentText.trim().length > 0;

	const toggleLike = () => {
		if (!note.data) return;
		socialActions.toggleLike(
			{ id: note.data.id },
			{
				onSuccess: async () => {
					await note.refetch();
				},
				redirectTo: `/note/${id}`,
			},
		);
	};

	const toggleFollow = () => {
		if (!authorId || isSelf) return;
		socialActions.toggleFollow(
			{ userId: authorId },
			{
				onSuccess: async () => {
					await authorProfile.refetch();
				},
				redirectTo: `/note/${id}`,
			},
		);
	};

	const sendComment = () => {
		if (
			!note.data ||
			!canSendComment ||
			socialActions.mutations.comment.isPending
		) {
			return;
		}
		socialActions.addComment(
			{
				noteId: note.data.id,
				content: commentText.trim(),
				parentId: replyTarget?.id,
			},
			{
				onSuccess: async () => {
					setCommentText("");
					setReplyTarget(null);
					await note.refetch();
				},
				redirectTo: `/note/${id}`,
			},
		);
	};

	if (note.isLoading) {
		return (
			<NoteDetailSkeleton
				imageHeight={imageHeight}
				onBack={() => router.back()}
				pageWidth={pageWidth}
			/>
		);
	}

	if (note.isError || !note.data) {
		return (
			<View className="flex-1 bg-background pt-6">
				<DetailTopBar onBack={() => router.back()} />
				<ErrorState
					title="图文没有打开"
					description="内容可能已下架，或者网络暂时不可用。"
					onRetry={() => note.refetch()}
				/>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-background"
		>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="items-center bg-background pb-32"
			>
				<View className="w-full max-w-xl">
					<DetailTopBar onBack={() => router.back()} />

					<ScrollView
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						className="bg-content2"
						style={{ width: pageWidth }}
					>
						{images.length > 0 ? (
							images.map((image) => (
								<Image
									key={image}
									source={{ uri: image }}
									resizeMode="cover"
									style={{ width: pageWidth, height: imageHeight }}
								/>
							))
						) : (
							<View
								className="items-center justify-center bg-content2"
								style={{ width: pageWidth, height: imageHeight }}
							>
								<Ionicons
									name="document-text-outline"
									size={34}
									color={mutedColor}
								/>
								<Text.Paragraph type="body-sm" color="muted">
									暂无封面
								</Text.Paragraph>
							</View>
						)}
					</ScrollView>

					<View className="gap-5 px-4 py-5">
						<View className="flex-row items-center gap-3">
							<PressableFeedback
								onPress={() =>
									socialActions.goTo({
										type: "user",
										id: authorId,
									})
								}
								className="min-w-0 flex-1 flex-row items-center gap-3"
							>
								<Avatar size="md" alt={note.data.author.name}>
									{note.data.author.image ? (
										<Avatar.Image source={{ uri: note.data.author.image }} />
									) : null}
									<Avatar.Fallback>
										{note.data.author.name.slice(0, 1)}
									</Avatar.Fallback>
								</Avatar>
								<View className="min-w-0 flex-1">
									<Text.Paragraph weight="semibold" numberOfLines={1}>
										{note.data.author.name}
									</Text.Paragraph>
									<Text.Paragraph
										type="body-xs"
										color="muted"
										numberOfLines={1}
									>
										{note.data.author.handle
											? `@${note.data.author.handle}`
											: "Youni 用户"}
									</Text.Paragraph>
								</View>
							</PressableFeedback>
							{isSelf ? null : (
								<Button
									size="sm"
									variant={isFollowing ? "secondary" : "primary"}
									feedbackVariant="scale-ripple"
									isDisabled={socialActions.mutations.follow.isPending}
									onPress={toggleFollow}
								>
									<Button.Label>{isFollowing ? "已关注" : "关注"}</Button.Label>
								</Button>
							)}
						</View>

						<View className="gap-3">
							<Text.Heading type="h2" className="text-foreground">
								{note.data.title}
							</Text.Heading>
							<Text.Paragraph className="text-foreground leading-6">
								{note.data.content}
							</Text.Paragraph>
							{note.data.topics.length > 0 ? (
								<View className="flex-row flex-wrap gap-2">
									{note.data.topics.map((topic) => (
										<Text.Paragraph
											key={topic}
											type="body-sm"
											weight="semibold"
											className="text-accent"
										>
											#{topic}
										</Text.Paragraph>
									))}
								</View>
							) : null}
						</View>

						<View className="gap-4 border-border-tertiary border-t pt-5">
							<View className="flex-row items-center justify-between">
								<Text.Paragraph weight="semibold" className="text-foreground">
									评论
								</Text.Paragraph>
								<Text.Paragraph type="body-xs" color="muted">
									{note.data.commentCount} 条
								</Text.Paragraph>
							</View>
							{commentsEnabled ? null : (
								<Text.Paragraph type="body-sm" color="muted">
									作者已关闭评论。
								</Text.Paragraph>
							)}
							{commentsEnabled && note.data.comments.length > 0 ? (
								<View className="gap-4">
									{(note.data.comments as NoteComment[]).map((comment) => (
										<CommentItem
											key={comment.id}
											comment={comment}
											depth={0}
											onChanged={() => note.refetch()}
											onReply={(nextComment) => {
												setReplyTarget({
													id: nextComment.id,
													authorName: nextComment.authorName,
												});
											}}
											redirectTo={`/note/${id}`}
										/>
									))}
								</View>
							) : commentsEnabled ? (
								<Text.Paragraph type="body-sm" color="muted">
									还没有评论，来写第一条。
								</Text.Paragraph>
							) : null}
						</View>
					</View>
				</View>
			</ScrollView>

			<View
				className="border-border-tertiary border-t bg-background px-4 pt-3"
				style={{ paddingBottom: insets.bottom + 10 }}
			>
				<View className="mx-auto w-full max-w-xl flex-row items-center gap-2">
					<PressableFeedback
						accessibilityLabel={note.data.liked ? "取消点赞" : "点赞"}
						accessibilityRole="button"
						className="min-h-10 flex-row items-center gap-1.5 px-1"
						hitSlop={8}
						onPress={toggleLike}
					>
						{socialActions.mutations.like.isPending ? (
							<Spinner size="sm" />
						) : (
							<Ionicons
								name={note.data.liked ? "heart" : "heart-outline"}
								size={22}
								color={note.data.liked ? dangerColor : mutedColor}
							/>
						)}
						<Text.Paragraph
							type="body-sm"
							weight={note.data.liked ? "semibold" : undefined}
							style={{ color: note.data.liked ? dangerColor : mutedColor }}
						>
							{note.data.likedCount}
						</Text.Paragraph>
					</PressableFeedback>

					{socialActions.session.data?.user ? (
						commentsEnabled ? (
							<>
								<View className="min-w-0 flex-1">
									{replyTarget ? (
										<View className="mb-2 flex-row items-center gap-2 rounded-2xl bg-content2 px-3 py-2">
											<Text.Paragraph
												type="body-xs"
												color="muted"
												className="min-w-0 flex-1"
												numberOfLines={1}
											>
												回复 {replyTarget.authorName}
											</Text.Paragraph>
											<PressableFeedback
												accessibilityLabel="取消回复"
												accessibilityRole="button"
												hitSlop={8}
												onPress={() => setReplyTarget(null)}
											>
												<Ionicons name="close" size={16} color={mutedColor} />
											</PressableFeedback>
										</View>
									) : null}
									<Input
										value={commentText}
										onChangeText={setCommentText}
										placeholder={
											replyTarget
												? `回复 ${replyTarget.authorName}`
												: "说点什么..."
										}
										placeholderTextColor={mutedColor}
										returnKeyType="send"
										onSubmitEditing={sendComment}
										className="h-10 rounded-full bg-content2 px-4"
										maxLength={500}
									/>
								</View>
								<Button
									isIconOnly
									size="sm"
									variant="primary"
									feedbackVariant="scale-ripple"
									isDisabled={
										!canSendComment || socialActions.mutations.comment.isPending
									}
									onPress={sendComment}
								>
									{socialActions.mutations.comment.isPending ? (
										<Spinner size="sm" />
									) : (
										<Ionicons
											name="send"
											size={16}
											color={accentForegroundColor}
										/>
									)}
								</Button>
							</>
						) : (
							<Button
								variant="secondary"
								className="min-w-0 flex-1 justify-start rounded-full px-4"
								isDisabled
							>
								<Button.Label className="text-muted">
									作者已关闭评论
								</Button.Label>
							</Button>
						)
					) : (
						<Button
							variant="secondary"
							className="min-w-0 flex-1 justify-start rounded-full px-4"
							feedbackVariant="scale-ripple"
							onPress={() =>
								socialActions.goTo({
									type: "login",
									redirectTo: `/note/${id}`,
								})
							}
						>
							<Button.Label className="text-muted">登录后参与评论</Button.Label>
						</Button>
					)}
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

function NoteDetailSkeleton({
	imageHeight,
	onBack,
	pageWidth,
}: {
	imageHeight: number;
	onBack: () => void;
	pageWidth: number;
}) {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-background">
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="items-center bg-background pb-32"
			>
				<View className="w-full max-w-xl">
					<DetailTopBar onBack={onBack} />
					<Skeleton
						className="bg-content2"
						style={{ width: pageWidth, height: imageHeight }}
					/>

					<View className="gap-6 px-4 py-5">
						<View className="flex-row items-center gap-3">
							<Skeleton className="size-11 rounded-full" />
							<View className="min-w-0 flex-1 gap-2">
								<Skeleton className="h-4 w-32 rounded-md" />
								<Skeleton className="h-3 w-24 rounded-md" />
							</View>
							<Skeleton className="h-8 w-16 rounded-full" />
						</View>

						<View className="gap-3">
							<Skeleton className="h-7 w-4/5 rounded-md" />
							<Skeleton className="h-4 w-full rounded-md" />
							<Skeleton className="h-4 w-full rounded-md" />
							<Skeleton className="h-4 w-3/5 rounded-md" />
						</View>

						<View className="gap-4 border-border-tertiary border-t pt-5">
							<View className="flex-row items-center justify-between">
								<Skeleton className="h-5 w-16 rounded-md" />
								<Skeleton className="h-3 w-10 rounded-md" />
							</View>
							<View className="flex-row gap-3">
								<Skeleton className="size-9 rounded-full" />
								<View className="min-w-0 flex-1 gap-2">
									<Skeleton className="h-4 w-24 rounded-md" />
									<Skeleton className="h-4 w-full rounded-md" />
									<Skeleton className="h-4 w-2/3 rounded-md" />
								</View>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
			<View
				className="border-border-tertiary border-t bg-background px-4 pt-3"
				style={{ paddingBottom: insets.bottom + 10 }}
			>
				<View className="mx-auto w-full max-w-xl flex-row items-center gap-2">
					<Skeleton className="h-10 w-14 rounded-full" />
					<Skeleton className="h-10 min-w-0 flex-1 rounded-full" />
					<Skeleton className="size-9 rounded-full" />
				</View>
			</View>
		</View>
	);
}

function DetailTopBar({ onBack }: { onBack: () => void }) {
	const mutedColor = useThemeColor("muted");

	return (
		<View className="flex-row items-center justify-between px-3 py-3">
			<PressableFeedback
				accessibilityLabel="返回"
				accessibilityRole="button"
				hitSlop={8}
				onPress={onBack}
				className="size-10 items-center justify-center"
			>
				<Ionicons name="chevron-back" size={24} color={mutedColor} />
			</PressableFeedback>
			<Text.Paragraph type="body-sm" color="muted">
				图文详情
			</Text.Paragraph>
			<View className="size-10" />
		</View>
	);
}

function CommentItem({
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
		<View className={depth > 0 ? "ml-10 gap-3" : "gap-3"}>
			<View className="flex-row gap-3">
				<Avatar size="sm" alt={comment.authorName}>
					{comment.authorImage ? (
						<Avatar.Image source={{ uri: comment.authorImage }} />
					) : null}
					<Avatar.Fallback>{comment.authorName.slice(0, 1)}</Avatar.Fallback>
				</Avatar>
				<View className="min-w-0 flex-1 gap-1 border-border-tertiary border-b pb-4">
					<View className="flex-row items-center gap-2">
						<Text.Paragraph
							type="body-sm"
							weight="semibold"
							numberOfLines={1}
							className="min-w-0 flex-1"
						>
							{comment.authorName}
						</Text.Paragraph>
						<Text.Paragraph type="body-xs" color="muted">
							{formatCommentTime(comment.createdAt)}
						</Text.Paragraph>
					</View>
					<Text.Paragraph type="body-sm" className="text-foreground leading-5">
						{comment.content}
					</Text.Paragraph>
					<View className="flex-row items-center gap-4 pt-1">
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
