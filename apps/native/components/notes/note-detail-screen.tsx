import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import type {
	CommentSort,
	CommentListRow as NoteComment,
} from "@youni/api/contracts/comments";
import type { NoteVisibility } from "@youni/api/contracts/shared";
import * as Network from "expo-network";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	PressableFeedback,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	AppState,
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
import { nativeQueryKeys } from "@/lib/query/query-keys";
import { useSocialActions } from "@/lib/social/use-social-actions";
import type { TextSelection } from "@/lib/types/text-input";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { client, orpc, queryClient } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";
import { NoteActionMenu, NoteVisibilitySheet } from "./note-detail/action-menu";
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
	NoteModerationNotice,
	SimpleTopBar,
} from "./note-detail/content";
import { NoteDetailSkeleton } from "./note-detail/skeleton";
import type { MentionTrigger } from "./note-detail/types";
import { clampCursor, findMentionTrigger } from "./note-detail/utils";

const COMMENTS_PAGE_SIZE = 20;
const DEFAULT_EMOJI_PANEL_HEIGHT = 304;
const INPUT_ACCESSORY_GAP = 8;

function commentTreeContains(comment: NoteComment, commentId: string): boolean {
	if (comment.id === commentId) return true;
	return comment.replies.some((reply) => commentTreeContains(reply, commentId));
}

function findCommentRootIndex(comments: NoteComment[], commentId: string) {
	return comments.findIndex((comment) =>
		commentTreeContains(comment, commentId),
	);
}

function isNotFoundError(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: unknown }).code === "NOT_FOUND"
	);
}

export default function NoteDetailScreen() {
	const params = useLocalSearchParams<{
		commentId?: string | string[];
		id?: string | string[];
		feedImpressionId?: string | string[];
	}>();
	const id = getRouteParam(params.id) ?? "";
	const feedImpressionId = getRouteParam(params.feedImpressionId);
	const targetCommentId = getRouteParam(params.commentId);
	const targetCommentScrollKey = targetCommentId
		? `${id}:${targetCommentId}`
		: null;
	const router = useRouter();
	const socialActions = useSocialActions();
	const { toast } = useAppToast();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const accentColor = useThemeColor("accent");
	const { width } = useWindowDimensions();
	const pageWidth = Math.min(width, 560);
	const imageHeight = Math.min(620, Math.max(380, pageWidth * 1.08));
	const topBarHeight = insets.top + 64;
	const commentListRef = useRef<FlatList<NoteComment>>(null);
	const recordedViewerIdRef = useRef<string | null>(null);
	const recordingViewerIdRef = useRef<string | null>(null);
	const commentScrollOffsetRef = useRef(0);
	const pendingTargetScrollKeyRef = useRef<null | string>(null);
	const targetCommentRef = useRef<View | null>(null);
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
	const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
	const [isVisibilitySheetOpen, setIsVisibilitySheetOpen] = useState(false);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [scrolledTargetCommentKey, setScrolledTargetCommentKey] = useState<
		null | string
	>(null);
	const [handledMissingTargetCommentKey, setHandledMissingTargetCommentKey] =
		useState<null | string>(null);
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
		...orpc.notes.byId.queryOptions({ input: { id: id || "missing" } }),
		enabled: Boolean(id),
		refetchInterval: (query) =>
			query.state.data?.status === "audit" ? 4_000 : false,
	});
	const viewerId = socialActions.session.data?.user?.id;
	const recordCurrentView = useCallback(async () => {
		if (
			!viewerId ||
			!note.data ||
			recordedViewerIdRef.current === viewerId ||
			recordingViewerIdRef.current === viewerId
		) {
			return;
		}

		recordingViewerIdRef.current = viewerId;
		try {
			const result = await note.refetch();
			if (!result.isError) {
				recordedViewerIdRef.current = viewerId;
			}
		} finally {
			if (recordingViewerIdRef.current === viewerId) {
				recordingViewerIdRef.current = null;
			}
		}
	}, [note.data, note.refetch, viewerId]);
	useEffect(() => {
		void recordCurrentView();
	}, [recordCurrentView]);
	useEffect(() => {
		const appStateSubscription = AppState.addEventListener(
			"change",
			(state) => {
				if (state === "active") {
					void recordCurrentView();
				}
			},
		);
		const networkSubscription = Network.addNetworkStateListener((state) => {
			if (state.isConnected && state.isInternetReachable !== false) {
				void recordCurrentView();
			}
		});

		return () => {
			appStateSubscription.remove();
			networkSubscription.remove();
		};
	}, [recordCurrentView]);
	const authorId = note.data?.author.id ?? "";
	const authorProfile = useQuery({
		...orpc.profiles.profile.queryOptions({ input: { userId: authorId } }),
		enabled: Boolean(authorId),
	});
	const commentsEnabled = note.data?.advancedOptions.allowComment ?? true;
	const commentsQueryKey = useMemo(
		() => nativeQueryKeys.note.comments(id, commentSort),
		[id, commentSort],
	);
	const comments = useInfiniteQuery({
		queryKey: commentsQueryKey,
		queryFn: ({ pageParam }) =>
			client.comments.comments({
				noteId: id || "missing",
				limit: COMMENTS_PAGE_SIZE,
				offset: Number(pageParam ?? 0),
				sort: commentSort,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
		enabled: Boolean(id && note.data && commentsEnabled),
	});
	const targetCommentAnchor = useQuery({
		...orpc.comments.commentAnchor.queryOptions({
			input: { id: targetCommentId || "missing" },
		}),
		enabled: Boolean(targetCommentId),
		retry: (failureCount, error) =>
			isNotFoundError(error) ? false : failureCount < 2,
	});
	const updateVisibilityMutation = useMutation(
		orpc.notes.updateNoteVisibility.mutationOptions({
			onError: (error) => {
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "权限设置失败",
				});
			},
			onSuccess: async () => {
				setIsVisibilitySheetOpen(false);
				await queryClient.invalidateQueries();
			},
		}),
	);
	const deleteNoteMutation = useMutation(
		orpc.notes.deleteMyNote.mutationOptions({
			onError: (error) => {
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "删除失败",
				});
			},
			onSuccess: async () => {
				setIsActionMenuVisible(false);
				await queryClient.invalidateQueries();
				goBack();
			},
		}),
	);

	const images = useMemo(() => note.data?.images ?? [], [note.data?.images]);
	const rootComments = useMemo(
		() => comments.data?.pages.flatMap((page) => page.items) ?? [],
		[comments.data?.pages],
	);
	const anchoredTargetComment = targetCommentAnchor.data?.comment;
	const targetRootCommentId =
		targetCommentAnchor.data?.rootCommentId ?? targetCommentId;
	const targetCommentRootIndex = useMemo(() => {
		if (!targetCommentId) return -1;

		if (targetRootCommentId) {
			const rootIndex = rootComments.findIndex(
				(comment) => comment.id === targetRootCommentId,
			);
			if (rootIndex >= 0) return rootIndex;
		}

		return findCommentRootIndex(rootComments, targetCommentId);
	}, [rootComments, targetCommentId, targetRootCommentId]);
	const isSelf = socialActions.currentUserId === authorId;
	const isFollowing = socialActions.optimistic.follow(
		authorId,
		Boolean(authorProfile.data?.profile.isFollowing),
	).active;
	const likeState = socialActions.optimistic.like(
		id,
		Boolean(note.data?.liked),
		note.data?.likedCount ?? 0,
	);
	const collectState = socialActions.optimistic.collect(
		id,
		Boolean(note.data?.collected),
		note.data?.collectedCount ?? 0,
	);
	const canSendComment = commentsEnabled && commentText.trim().length > 0;
	const hasScrolledToTargetComment =
		targetCommentScrollKey !== null &&
		scrolledTargetCommentKey === targetCommentScrollKey;
	const isTargetCommentMissing =
		targetCommentId !== undefined &&
		targetCommentAnchor.isError &&
		isNotFoundError(targetCommentAnchor.error);
	const scrollToCommentIndex = useCallback((index: number) => {
		requestAnimationFrame(() => {
			commentListRef.current?.scrollToIndex({
				animated: true,
				index,
				viewPosition: 0.22,
			});
		});
	}, []);
	const scrollToCommentSection = useCallback(() => {
		requestAnimationFrame(() => {
			if (rootComments.length > 0) {
				commentListRef.current?.scrollToIndex({
					animated: true,
					index: 0,
					viewPosition: 0.18,
				});
				return;
			}

			commentListRef.current?.scrollToEnd({ animated: true });
		});
	}, [rootComments.length]);
	const scheduleTargetCommentAlignment = useCallback(
		(scrollKey: string) => {
			let attempts = 0;
			const align = () => {
				const targetNode = targetCommentRef.current;
				if (!targetNode) {
					attempts += 1;
					if (attempts <= 8) {
						setTimeout(align, 80);
						return;
					}
					pendingTargetScrollKeyRef.current = null;
					return;
				}

				targetNode.measureInWindow((_x, y) => {
					const desiredY = Math.max(insets.top + 88, 112);
					const delta = y - desiredY;
					if (Math.abs(delta) > 8) {
						commentListRef.current?.scrollToOffset({
							animated: true,
							offset: Math.max(0, commentScrollOffsetRef.current + delta),
						});
					}
					setScrolledTargetCommentKey(scrollKey);
					pendingTargetScrollKeyRef.current = null;
				});
			};

			setTimeout(align, 260);
		},
		[insets.top],
	);
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

	useEffect(() => {
		if (
			!targetCommentId ||
			!targetCommentScrollKey ||
			hasScrolledToTargetComment ||
			isTargetCommentMissing ||
			!note.data ||
			!commentsEnabled ||
			comments.isLoading ||
			(targetCommentAnchor.isLoading && targetCommentRootIndex < 0)
		) {
			return;
		}

		if (targetCommentRootIndex >= 0) {
			if (pendingTargetScrollKeyRef.current === targetCommentScrollKey) {
				return;
			}
			pendingTargetScrollKeyRef.current = targetCommentScrollKey;
			scrollToCommentIndex(targetCommentRootIndex);
			scheduleTargetCommentAlignment(targetCommentScrollKey);
			return;
		}

		if (
			comments.hasNextPage &&
			!comments.isFetching &&
			!comments.isFetchingNextPage
		) {
			void comments.fetchNextPage();
		}
	}, [
		comments.fetchNextPage,
		comments.hasNextPage,
		comments.isFetching,
		comments.isFetchingNextPage,
		comments.isLoading,
		commentsEnabled,
		hasScrolledToTargetComment,
		isTargetCommentMissing,
		note.data,
		scheduleTargetCommentAlignment,
		targetCommentAnchor.isLoading,
		targetCommentScrollKey,
		scrollToCommentIndex,
		targetCommentId,
		targetCommentRootIndex,
	]);

	useEffect(() => {
		if (
			!targetCommentScrollKey ||
			!isTargetCommentMissing ||
			!note.data ||
			(commentsEnabled && comments.isLoading) ||
			handledMissingTargetCommentKey === targetCommentScrollKey
		) {
			return;
		}

		pendingTargetScrollKeyRef.current = null;
		setHandledMissingTargetCommentKey(targetCommentScrollKey);
		setScrolledTargetCommentKey(targetCommentScrollKey);
		scrollToCommentSection();
		setTimeout(() => {
			toast.show({
				variant: "warning",
				label: "评论已被删除",
			});
		}, 360);
	}, [
		comments.isLoading,
		commentsEnabled,
		handledMissingTargetCommentKey,
		isTargetCommentMissing,
		note.data,
		scrollToCommentSection,
		targetCommentScrollKey,
		toast.show,
	]);

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
		if (!socialActions.currentUserId) {
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
			const profile = await client.profiles.profileByHandle({ handle });
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
			const topic = await client.topics.topicByName({ name });
			router.push({
				pathname: "/topic/[id]",
				params: { id: topic.id },
			} as unknown as Href);
		} catch {
			openMissing("topic", name);
		}
	};

	const refreshAll = async () => {
		setIsManuallyRefreshing(true);
		try {
			await Promise.all([
				note.refetch(),
				authorId ? authorProfile.refetch() : Promise.resolve(),
				queryClient.resetQueries({ queryKey: commentsQueryKey }),
			]);
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	const handleScrollToCommentIndexFailed = (info: {
		averageItemLength: number;
		index: number;
	}) => {
		const offset = Math.max(0, info.averageItemLength * info.index);
		commentListRef.current?.scrollToOffset({ animated: true, offset });
		setTimeout(() => {
			scrollToCommentIndex(info.index);
		}, 160);
	};

	const toggleLike = () => {
		if (!note.data) return;
		socialActions.toggleLike(
			{
				active: likeState.active,
				count: likeState.count,
				id: note.data.id,
			},
			{
				redirectTo: `/note/${id}`,
				onSuccess: (result) => {
					if (!result.liked || !feedImpressionId) return;
					void client.notes
						.recordFeedEvents({
							events: [
								{
									impressionId: feedImpressionId,
									noteId: note.data?.id ?? id,
									type: "like",
								},
							],
						})
						.catch(() => undefined);
				},
			},
		);
	};

	const toggleCollect = () => {
		if (!note.data) return;
		socialActions.toggleCollect(
			{
				active: collectState.active,
				count: collectState.count,
				id: note.data.id,
			},
			{
				redirectTo: `/note/${id}`,
				onSuccess: (result) => {
					if (!result.collected || !feedImpressionId) return;
					void client.notes
						.recordFeedEvents({
							events: [
								{
									impressionId: feedImpressionId,
									noteId: note.data?.id ?? id,
									type: "collect",
								},
							],
						})
						.catch(() => undefined);
				},
			},
		);
	};

	const toggleFollow = () => {
		if (!authorId || isSelf) return;
		socialActions.toggleFollow(
			{ active: isFollowing, userId: authorId },
			{
				redirectTo: `/note/${id}`,
			},
		);
	};

	const openActionMenu = () => {
		if (!isSelf) return;
		fireHaptic();
		setIsActionMenuVisible(true);
	};

	const openEditNote = () => {
		if (!note.data) return;
		fireHaptic();
		setIsActionMenuVisible(false);
		router.push({
			pathname: "/publish",
			params: { noteId: note.data.id },
		} as unknown as Href);
	};

	const openVisibilitySettings = () => {
		if (!note.data) return;
		fireHaptic();
		setIsActionMenuVisible(false);
		setIsVisibilitySheetOpen(true);
	};

	const updateVisibility = (visibility: NoteVisibility) => {
		if (!note.data || updateVisibilityMutation.isPending) return;
		fireHaptic();
		if (visibility === note.data.visibility) {
			setIsVisibilitySheetOpen(false);
			return;
		}
		updateVisibilityMutation.mutate({ id: note.data.id, visibility });
	};

	const confirmDeleteNote = () => {
		if (!note.data || deleteNoteMutation.isPending) return;
		fireHaptic();
		setIsActionMenuVisible(false);
		Alert.alert("删除图文", "删除后这篇图文将不再对任何人可见。", [
			{ text: "取消", style: "cancel" },
			{
				text: "删除",
				style: "destructive",
				onPress: () => {
					if (!note.data) return;
					deleteNoteMutation.mutate({ id: note.data.id });
				},
			},
		]);
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
		const target = replyTarget;
		const parentId = target?.id;
		closeCommentComposer({ dismissKeyboard: true });
		socialActions.addComment(
			{
				noteId: note.data.id,
				content,
				parentId,
			},
			{
				onError: () => {
					commentTextRef.current = content;
					setCommentText(content);
					setReplyTarget(target);
					setIsCommentComposerOpen(true);
					focusCommentInput();
				},
				onSuccess: async () => {
					commentTextRef.current = "";
					setCommentText("");
					setReplyTarget(null);
					setMentionTrigger(null);
					setCommentSelection({ start: 0, end: 0 });
					setIsEmojiKeyboardOpen(false);
					setIsCommentComposerOpen(false);
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
					title="图文未能成功打开"
					description="图文可能已下架，请重试。"
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
			<View
				pointerEvents="box-none"
				style={{
					left: 0,
					position: "absolute",
					right: 0,
					top: 0,
					zIndex: 20,
				}}
			>
				<AuthorTopBar
					author={note.data.author}
					isFollowing={isFollowing}
					isMenuVisible={isActionMenuVisible}
					isSelf={isSelf}
					onBack={goBack}
					onFollow={toggleFollow}
					onOpenMenu={openActionMenu}
					onOpenAuthor={() =>
						socialActions.goTo({ type: "user", id: authorId })
					}
				/>
			</View>
			<FlatList
				ref={commentListRef}
				className="mx-auto w-full max-w-xl bg-background"
				contentContainerClassName="bg-background pb-32"
				contentContainerStyle={{ paddingTop: topBarHeight }}
				data={rootComments}
				keyExtractor={(item) => item.id}
				refreshing={isManuallyRefreshing}
				onRefresh={() => {
					void refreshAll();
				}}
				keyboardShouldPersistTaps="handled"
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				onScroll={(event) => {
					commentScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
				}}
				onScrollBeginDrag={closeEmojiKeyboardFromContent}
				onScrollToIndexFailed={handleScrollToCommentIndexFailed}
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
						{isSelf ? (
							<NoteModerationNotice
								rejectionReason={note.data.rejectionReason}
								status={note.data.status}
							/>
						) : null}
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
							anchoredTargetComment={anchoredTargetComment}
							comment={item}
							depth={0}
							onReply={(nextComment) => {
								openCommentComposer({
									id: nextComment.id,
									authorName: nextComment.authorName,
								});
							}}
							redirectTo={`/note/${id}`}
							targetCommentId={targetCommentId}
							targetCommentRef={targetCommentRef}
							targetRootCommentId={targetRootCommentId}
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
								title="评论未能成功加载"
								description="请重试或下拉刷新。"
								onRetry={() => comments.refetch()}
							/>
						) : (
							<EmptyState
								icon="chatbubble-ellipses-outline"
								title="来写第一条评论吧"
								description="说说你对这篇图文的想法。"
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
				{socialActions.currentUserId && commentsEnabled ? (
					isCommentComposerOpen ? (
						<CommentComposerPanel
							canSend={canSendComment}
							emojiPanelHeight={emojiPanelHeight}
							inputRef={commentInputRef}
							isEmojiInputLocked={isEmojiInputLocked}
							isEmojiPickerOpen={isEmojiKeyboardOpen}
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
								active={likeState.active}
								activeColor={dangerColor}
								count={likeState.count ?? note.data.likedCount}
								icon={likeState.active ? "heart" : "heart-outline"}
								label={likeState.active ? "取消点赞" : "点赞"}
								onPress={toggleLike}
							/>
							<BottomIconAction
								active={collectState.active}
								activeColor={accentColor}
								count={collectState.count ?? note.data.collectedCount}
								icon={collectState.active ? "star" : "star-outline"}
								label={collectState.active ? "取消收藏" : "收藏"}
								onPress={toggleCollect}
							/>
							<PressableFeedback
								accessibilityLabel="写评论"
								accessibilityRole="button"
								className="h-10 min-w-0 flex-1 justify-center rounded-full bg-content2 px-4"
								onPress={() => openCommentComposer(null)}
							>
								<Typography.Paragraph type="body-sm" color="muted">
									说点什么...
								</Typography.Paragraph>
							</PressableFeedback>
						</View>
					)
				) : (
					<View className="mx-auto w-full max-w-xl flex-row items-center gap-2">
						<BottomIconAction
							active={likeState.active}
							activeColor={dangerColor}
							count={likeState.count ?? note.data.likedCount}
							icon={likeState.active ? "heart" : "heart-outline"}
							label={likeState.active ? "取消点赞" : "点赞"}
							onPress={toggleLike}
						/>
						<BottomIconAction
							active={collectState.active}
							activeColor={accentColor}
							count={collectState.count ?? note.data.collectedCount}
							icon={collectState.active ? "star" : "star-outline"}
							label={collectState.active ? "取消收藏" : "收藏"}
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
			<NoteActionMenu
				isVisible={isActionMenuVisible}
				topInset={insets.top}
				onClose={() => setIsActionMenuVisible(false)}
				onDelete={confirmDeleteNote}
				onEdit={openEditNote}
				onOpenVisibility={openVisibilitySettings}
			/>
			<NoteVisibilitySheet
				isOpen={isVisibilitySheetOpen}
				isSaving={updateVisibilityMutation.isPending}
				value={note.data.visibility}
				onOpenChange={setIsVisibilitySheetOpen}
				onSelect={updateVisibility}
			/>
		</KeyboardAvoidingView>
	);
}
