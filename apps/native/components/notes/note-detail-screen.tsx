import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	type KeyboardEvent,
	Platform,
	type TextInput,
	useWindowDimensions,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EmojiType } from "rn-emoji-keyboard";

import { AppSeparator } from "@/components/shared/app-separator";
import { EmptyState, ErrorState } from "@/components/social-states";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, orpc, queryClient } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";
import { BottomIconAction } from "./note-detail/bottom-actions";
import { CommentComposerPanel } from "./note-detail/comment-composer";
import {
	CommentFooter,
	CommentItem,
	CommentSectionHeader,
} from "./note-detail/comments";
import {
	AuthorTopBar,
	ImageCarousel,
	NoteBody,
	SimpleTopBar,
} from "./note-detail/content";
import { NoteDetailSkeleton } from "./note-detail/skeleton";
import type {
	CommentSort,
	MentionTrigger,
	NoteComment,
	TextSelection,
} from "./note-detail/types";
import { clampCursor, findMentionTrigger } from "./note-detail/utils";

const COMMENTS_PAGE_SIZE = 20;
const DEFAULT_EMOJI_PANEL_HEIGHT = 304;
const INPUT_ACCESSORY_GAP = 8;

export default function NoteDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const socialActions = useSocialActions();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const accentColor = useThemeColor("accent");
	const { width } = useWindowDimensions();
	const pageWidth = Math.min(width, 560);
	const imageHeight = Math.min(620, Math.max(380, pageWidth * 1.08));
	const commentInputRef = useRef<TextInput>(null);
	const commentTextRef = useRef("");
	const isCommentComposerOpenRef = useRef(false);
	const isEmojiKeyboardOpenRef = useRef(false);
	const isEmojiInputLockedRef = useRef(false);
	const isSystemKeyboardVisibleRef = useRef(false);
	const isSwitchingToSystemKeyboardRef = useRef(false);
	const keyboardHeightRef = useRef(DEFAULT_EMOJI_PANEL_HEIGHT);
	const [commentText, setCommentText] = useState("");
	const [commentSort, setCommentSort] = useState<CommentSort>("hot");
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [emojiPanelHeight, setEmojiPanelHeight] = useState(
		DEFAULT_EMOJI_PANEL_HEIGHT,
	);
	const [isCommentComposerOpen, setIsCommentComposerOpen] = useState(false);
	const [isEmojiInputLocked, setIsEmojiInputLocked] = useState(false);
	const [isEmojiKeyboardOpen, setIsEmojiKeyboardOpen] = useState(false);
	const [isSystemKeyboardVisible, setIsSystemKeyboardVisible] = useState(false);
	const [commentSelection, setCommentSelection] = useState<TextSelection>({
		end: 0,
		start: 0,
	});
	const [mentionTrigger, setMentionTrigger] = useState<MentionTrigger | null>(
		null,
	);
	const [replyTarget, setReplyTarget] = useState<null | {
		authorName: string;
		id: string;
	}>(null);
	commentTextRef.current = commentText;
	isCommentComposerOpenRef.current = isCommentComposerOpen;
	isEmojiInputLockedRef.current = isEmojiInputLocked;
	isEmojiKeyboardOpenRef.current = isEmojiKeyboardOpen;
	isSystemKeyboardVisibleRef.current = isSystemKeyboardVisible;

	const note = useQuery({
		...orpc.byId.queryOptions({ input: { id: id || "missing" } }),
		enabled: Boolean(id),
	});
	const authorId = note.data?.author.id ?? "";
	const authorProfile = useQuery({
		...orpc.profile.queryOptions({ input: { userId: authorId } }),
		enabled: Boolean(authorId),
	});
	const commentsEnabled = note.data?.advancedOptions.allowComment ?? true;
	const commentsQueryKey = useMemo(
		() => ["note", id, "comments", commentSort] as const,
		[id, commentSort],
	);
	const comments = useInfiniteQuery({
		queryKey: commentsQueryKey,
		queryFn: ({ pageParam }) =>
			client.comments({
				noteId: id || "missing",
				limit: COMMENTS_PAGE_SIZE,
				offset: Number(pageParam ?? 0),
				sort: commentSort,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: Boolean(id && note.data && commentsEnabled),
	});

	const images = useMemo(() => note.data?.images ?? [], [note.data?.images]);
	const rootComments = useMemo(
		() =>
			(comments.data?.pages.flatMap((page) => page.items) ??
				[]) as NoteComment[],
		[comments.data?.pages],
	);
	const isSelf = socialActions.currentUserId === authorId;
	const isFollowing = Boolean(authorProfile.data?.profile.isFollowing);
	const canSendComment = commentsEnabled && commentText.trim().length > 0;
	const isRefreshing =
		note.isRefetching ||
		authorProfile.isRefetching ||
		(comments.isRefetching && !comments.isFetchingNextPage);

	const closeCommentComposer = useCallback(
		({ dismissKeyboard = false }: { dismissKeyboard?: boolean } = {}) => {
			isEmojiKeyboardOpenRef.current = false;
			isCommentComposerOpenRef.current = false;
			isEmojiInputLockedRef.current = false;
			isSwitchingToSystemKeyboardRef.current = false;
			setIsEmojiInputLocked(false);
			setIsEmojiKeyboardOpen(false);
			setIsCommentComposerOpen(false);
			setReplyTarget(null);
			setMentionTrigger(null);

			if (dismissKeyboard) {
				commentInputRef.current?.blur();
				Keyboard.dismiss();
			}
		},
		[],
	);

	const closeEmojiKeyboard = useCallback(() => {
		isSwitchingToSystemKeyboardRef.current = false;
		isEmojiInputLockedRef.current = false;
		setIsEmojiInputLocked(false);
		if (!isEmojiKeyboardOpenRef.current) return;
		isEmojiKeyboardOpenRef.current = false;
		setIsEmojiKeyboardOpen(false);
	}, []);

	useEffect(() => {
		const updateKeyboardHeight = (event: KeyboardEvent) => {
			const height = Math.round(event.endCoordinates.height);
			if (height > 0) {
				const nextHeight = Math.max(260, height);
				keyboardHeightRef.current = nextHeight;
				setEmojiPanelHeight(nextHeight);
			}
		};
		const showSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(event) => {
				if (Platform.OS === "ios") {
					Keyboard.scheduleLayoutAnimation(event);
				}
				isSystemKeyboardVisibleRef.current = true;
				setIsSystemKeyboardVisible(true);
				updateKeyboardHeight(event);
				if (isSwitchingToSystemKeyboardRef.current) {
					isSwitchingToSystemKeyboardRef.current = false;
					isEmojiKeyboardOpenRef.current = false;
					setIsEmojiKeyboardOpen(false);
				}
			},
		);
		const handleKeyboardHide = (event?: KeyboardEvent) => {
			if (Platform.OS === "ios" && event) {
				Keyboard.scheduleLayoutAnimation(event);
			}
			isSystemKeyboardVisibleRef.current = false;
			setIsSystemKeyboardVisible(false);
			isSwitchingToSystemKeyboardRef.current = false;
			if (isEmojiKeyboardOpenRef.current) return;
			if (!isCommentComposerOpenRef.current) return;
			closeCommentComposer();
		};
		const hideSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			handleKeyboardHide,
		);

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, [closeCommentComposer]);

	const focusCommentInput = () => {
		setTimeout(() => {
			commentInputRef.current?.focus();
		}, 80);
	};

	const updateMentionTrigger = (value: string, cursor: number) => {
		setMentionTrigger(findMentionTrigger(value, cursor));
	};

	const openCommentComposer = (
		target?: null | { authorName: string; id: string },
	) => {
		if (!socialActions.session.data?.user) {
			socialActions.goTo({ type: "login", redirectTo: `/note/${id}` });
			return;
		}
		if (!commentsEnabled) return;
		if (target !== undefined) {
			setReplyTarget(target);
		}
		setIsCommentComposerOpen(true);
		focusCommentInput();
	};

	const handleCommentTextChange = (value: string) => {
		const previousValue = commentTextRef.current;
		const cursor = clampCursor(
			commentSelection.start + value.length - previousValue.length,
			value.length,
		);
		commentTextRef.current = value;
		setCommentText(value);
		setCommentSelection({ start: cursor, end: cursor });
		updateMentionTrigger(value, cursor);
	};

	const handleCommentSelectionChange = (selection: TextSelection) => {
		setCommentSelection(selection);
		if (selection.start !== selection.end) {
			setMentionTrigger(null);
			return;
		}
		updateMentionTrigger(commentTextRef.current, selection.start);
	};

	const insertCommentText = (value: string) => {
		if (!value) return;
		const currentValue = commentTextRef.current;
		const start = Math.min(commentSelection.start, commentSelection.end);
		const end = Math.max(commentSelection.start, commentSelection.end);
		const nextValue = `${currentValue.slice(0, start)}${value}${currentValue.slice(end)}`;
		const cursor = start + value.length;

		commentTextRef.current = nextValue;
		setCommentText(nextValue);
		setCommentSelection({ start: cursor, end: cursor });
		updateMentionTrigger(nextValue, cursor);
		focusCommentInput();
	};

	const insertMention = (handle: string) => {
		const cleanHandle = handle.trim().replace(/^@/, "");
		if (!cleanHandle) return;
		const currentValue = commentTextRef.current;
		const trigger = mentionTrigger;
		const start = trigger?.start ?? commentSelection.start;
		const end = trigger?.end ?? commentSelection.end;
		const token = `@${cleanHandle} `;
		const nextValue = `${currentValue.slice(0, start)}${token}${currentValue
			.slice(end)
			.replace(/^\s+/, "")}`;
		const cursor = start + token.length;

		commentTextRef.current = nextValue;
		setCommentText(nextValue);
		setCommentSelection({ start: cursor, end: cursor });
		setMentionTrigger(null);
		focusCommentInput();
	};

	const openMentionInput = () => {
		if (!isCommentComposerOpen) {
			openCommentComposer();
			return;
		}
		closeEmojiKeyboard();
		const cursor = commentSelection.start;
		const currentValue = commentTextRef.current;
		const previousChar = cursor > 0 ? currentValue[cursor - 1] : "";
		const needsSpace = Boolean(previousChar && !/\s/.test(previousChar));
		insertCommentText(`${needsSpace ? " " : ""}@`);
	};

	const handleEmojiSelected = (emoji: EmojiType) => {
		insertCommentText(emoji.emoji);
	};

	const openEmojiKeyboard = () => {
		const nextValue = !isEmojiKeyboardOpenRef.current;
		if (!nextValue) {
			isSwitchingToSystemKeyboardRef.current = true;
			isEmojiInputLockedRef.current = false;
			setIsEmojiInputLocked(false);
			focusCommentInput();
			return;
		}
		isSwitchingToSystemKeyboardRef.current = false;
		isEmojiInputLockedRef.current = true;
		isEmojiKeyboardOpenRef.current = true;
		setEmojiPanelHeight(keyboardHeightRef.current);
		setIsEmojiInputLocked(true);
		setIsEmojiKeyboardOpen(true);
		commentInputRef.current?.blur();
		Keyboard.dismiss();
	};

	const closeEmojiKeyboardFromContent = () => {
		closeEmojiKeyboard();
	};

	const handleCommentInputFocus = () => {
		if (isEmojiInputLockedRef.current) return;
		isSystemKeyboardVisibleRef.current = true;
		setIsSystemKeyboardVisible(true);
		if (isSwitchingToSystemKeyboardRef.current) return;
		closeEmojiKeyboard();
	};

	const goBack = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/" as Href);
	};

	const openMissing = (kind: "topic" | "user", value: string) => {
		router.push({
			pathname: "/missing/[kind]",
			params: { kind, value, returnTo: `/note/${id}` },
		} as unknown as Href);
	};

	const openMention = async (handle: string) => {
		fireHaptic();
		try {
			const profile = await client.profileByHandle({ handle });
			router.push({
				pathname: "/user/[id]",
				params: { id: profile.id },
			} as unknown as Href);
		} catch {
			openMissing("user", handle);
		}
	};

	const openTopic = async (name: string) => {
		fireHaptic();
		try {
			const topic = await client.topicByName({ name });
			router.push({
				pathname: "/topic/[id]",
				params: { id: topic.id },
			} as unknown as Href);
		} catch {
			openMissing("topic", name);
		}
	};

	const refreshAll = async () => {
		await Promise.all([
			note.refetch(),
			authorId ? authorProfile.refetch() : Promise.resolve(),
			queryClient.resetQueries({ queryKey: commentsQueryKey }),
		]);
	};

	const refreshCommentsAndNote = async () => {
		await Promise.all([
			note.refetch(),
			queryClient.resetQueries({ queryKey: commentsQueryKey }),
		]);
	};

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

	const toggleCollect = () => {
		if (!note.data) return;
		socialActions.toggleCollect(
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
		const content = commentText.trim();
		const parentId = replyTarget?.id;
		closeCommentComposer({ dismissKeyboard: true });
		socialActions.addComment(
			{
				noteId: note.data.id,
				content,
				parentId,
			},
			{
				onSuccess: async () => {
					commentTextRef.current = "";
					setCommentText("");
					setReplyTarget(null);
					setMentionTrigger(null);
					setCommentSelection({ start: 0, end: 0 });
					setIsEmojiKeyboardOpen(false);
					setIsCommentComposerOpen(false);
					await refreshCommentsAndNote();
				},
				redirectTo: `/note/${id}`,
			},
		);
	};

	if (note.isLoading) {
		return (
			<NoteDetailSkeleton
				imageHeight={imageHeight}
				onBack={goBack}
				pageWidth={pageWidth}
			/>
		);
	}

	if (note.isError || !note.data) {
		return (
			<View className="flex-1 bg-background">
				<SimpleTopBar onBack={goBack} />
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
			behavior={
				Platform.OS === "ios" && !isEmojiKeyboardOpen ? "padding" : undefined
			}
			className="flex-1 bg-background"
		>
			<FlatList
				className="mx-auto w-full max-w-xl bg-background"
				contentContainerClassName="bg-background pb-32"
				data={rootComments}
				keyExtractor={(item) => item.id}
				refreshing={isRefreshing}
				onRefresh={() => {
					void refreshAll();
				}}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				onScrollBeginDrag={closeEmojiKeyboardFromContent}
				onTouchStart={closeEmojiKeyboardFromContent}
				onEndReached={() => {
					if (
						comments.hasNextPage &&
						!comments.isFetchingNextPage &&
						!comments.isFetching
					) {
						void comments.fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				ListHeaderComponent={
					<View>
						<AuthorTopBar
							author={note.data.author}
							isFollowing={isFollowing}
							isFollowPending={socialActions.mutations.follow.isPending}
							isSelf={isSelf}
							onBack={goBack}
							onFollow={toggleFollow}
							onOpenAuthor={() =>
								socialActions.goTo({ type: "user", id: authorId })
							}
						/>
						<ImageCarousel
							activeIndex={activeImageIndex}
							images={images}
							imageHeight={imageHeight}
							mutedColor={mutedColor}
							pageWidth={pageWidth}
							onIndexChange={setActiveImageIndex}
						/>
						<NoteBody
							content={note.data.content}
							createdAt={note.data.publishedAt ?? note.data.createdAt}
							title={note.data.title}
							topics={note.data.topics}
							onMentionPress={openMention}
							onTopicPress={openTopic}
						/>
						<CommentSectionHeader
							commentCount={note.data.commentCount}
							commentsEnabled={commentsEnabled}
							sort={commentSort}
							onSortChange={setCommentSort}
						/>
					</View>
				}
				renderItem={({ item }) => (
					<View className="px-4 pb-4">
						<CommentItem
							comment={item}
							depth={0}
							onChanged={refreshCommentsAndNote}
							onReply={(nextComment) => {
								openCommentComposer({
									id: nextComment.id,
									authorName: nextComment.authorName,
								});
							}}
							redirectTo={`/note/${id}`}
						/>
					</View>
				)}
				ListEmptyComponent={
					commentsEnabled ? (
						comments.isLoading ? (
							<View className="items-center py-7">
								<Spinner size="sm" />
							</View>
						) : comments.isError ? (
							<ErrorState
								title="评论没有加载出来"
								description="稍后重试，或下拉刷新页面。"
								onRetry={() => comments.refetch()}
							/>
						) : (
							<EmptyState
								icon="chatbubble-ellipses-outline"
								title="还没有评论"
								description="来写第一条评论。"
							/>
						)
					) : null
				}
				ListFooterComponent={
					<CommentFooter
						hasItems={rootComments.length > 0}
						hasMore={Boolean(comments.hasNextPage)}
						isLoading={comments.isFetchingNextPage}
					/>
				}
			/>

			<AppSeparator />
			<View
				className="bg-background px-4 pt-2"
				style={{
					paddingBottom: isCommentComposerOpen
						? isEmojiKeyboardOpen || isSystemKeyboardVisible
							? INPUT_ACCESSORY_GAP
							: Math.max(insets.bottom, 2)
						: insets.bottom + 10,
				}}
			>
				{socialActions.session.data?.user && commentsEnabled ? (
					isCommentComposerOpen ? (
						<CommentComposerPanel
							canSend={canSendComment}
							emojiPanelHeight={emojiPanelHeight}
							inputRef={commentInputRef}
							isEmojiInputLocked={isEmojiInputLocked}
							isEmojiPickerOpen={isEmojiKeyboardOpen}
							isSending={socialActions.mutations.comment.isPending}
							mentionTrigger={mentionTrigger}
							mutedColor={mutedColor}
							placeholder={
								replyTarget ? `回复 @${replyTarget.authorName}` : "说点什么..."
							}
							value={commentText}
							onChangeText={handleCommentTextChange}
							onEmojiPress={openEmojiKeyboard}
							onEmojiSelect={handleEmojiSelected}
							onFocusInput={handleCommentInputFocus}
							onMentionPress={openMentionInput}
							onMentionSelect={insertMention}
							onSelectionChange={handleCommentSelectionChange}
							onSend={sendComment}
						/>
					) : (
						<View className="mx-auto w-full max-w-xl flex-row items-center gap-2">
							<BottomIconAction
								active={note.data.liked}
								activeColor={dangerColor}
								count={note.data.likedCount}
								icon={note.data.liked ? "heart" : "heart-outline"}
								isLoading={socialActions.mutations.like.isPending}
								label={note.data.liked ? "取消点赞" : "点赞"}
								onPress={toggleLike}
							/>
							<BottomIconAction
								active={note.data.collected}
								activeColor={accentColor}
								count={note.data.collectedCount}
								icon={note.data.collected ? "star" : "star-outline"}
								isLoading={socialActions.mutations.collect.isPending}
								label={note.data.collected ? "取消收藏" : "收藏"}
								onPress={toggleCollect}
							/>
							<PressableFeedback
								accessibilityLabel="写评论"
								accessibilityRole="button"
								className="h-10 min-w-0 flex-1 justify-center rounded-full bg-content2 px-4"
								onPress={() => openCommentComposer(null)}
							>
								<Text.Paragraph type="body-sm" color="muted">
									说点什么...
								</Text.Paragraph>
							</PressableFeedback>
						</View>
					)
				) : (
					<View className="mx-auto w-full max-w-xl flex-row items-center gap-2">
						<BottomIconAction
							active={note.data.liked}
							activeColor={dangerColor}
							count={note.data.likedCount}
							icon={note.data.liked ? "heart" : "heart-outline"}
							isLoading={socialActions.mutations.like.isPending}
							label={note.data.liked ? "取消点赞" : "点赞"}
							onPress={toggleLike}
						/>
						<BottomIconAction
							active={note.data.collected}
							activeColor={accentColor}
							count={note.data.collectedCount}
							icon={note.data.collected ? "star" : "star-outline"}
							isLoading={socialActions.mutations.collect.isPending}
							label={note.data.collected ? "取消收藏" : "收藏"}
							onPress={toggleCollect}
						/>
						<Button
							variant="secondary"
							className="min-w-0 flex-1 justify-start rounded-full px-4"
							feedbackVariant="scale-ripple"
							isDisabled={!commentsEnabled}
							onPress={() =>
								commentsEnabled
									? socialActions.goTo({
											type: "login",
											redirectTo: `/note/${id}`,
										})
									: undefined
							}
						>
							<Button.Label className="text-muted">
								{commentsEnabled ? "登录后参与评论" : "作者已关闭评论"}
							</Button.Label>
						</Button>
					</View>
				)}
			</View>
		</KeyboardAvoidingView>
	);
}
