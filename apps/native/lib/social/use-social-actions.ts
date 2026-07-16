import { useMutation, useMutationState } from "@tanstack/react-query";
import type { CommentsOutputs } from "@youni/api/contracts/comments";
import type { MessagesOutputs } from "@youni/api/contracts/messages";
import type { NotesOutputs } from "@youni/api/contracts/notes";
import type { ProfilesOutputs } from "@youni/api/contracts/profiles";
import { useRouter } from "expo-router";

import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import {
	type OptimisticToggleKind,
	refreshActiveQueries,
	useOptimisticToggleQueue,
} from "@/lib/query/optimistic-cache";
import {
	type SocialNavigationIntent,
	toSocialHref,
} from "@/lib/social/navigation-intents";
import { useAppToast } from "@/utils/app-toast";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

type SocialActionError = Error;

export type SocialActionOptions<TResult = unknown> = {
	onError?: (error: SocialActionError) => void;
	onSettled?: () => void;
	onSuccess?: (result: TResult) => Promise<void> | void;
	redirectTo?: string;
};

function getError(error: unknown): SocialActionError {
	return error instanceof Error ? error : new Error("操作失败");
}

export function useSocialNavigation() {
	const router = useRouter();
	const session = authClient.useSession();
	const currentUserId = isRegisteredUser(session.data?.user)
		? session.data?.user.id
		: undefined;

	const goTo = (intent: SocialNavigationIntent) => {
		router.push(toSocialHref(intent));
	};

	const replaceWith = (intent: SocialNavigationIntent) => {
		router.replace(toSocialHref(intent));
	};

	const requireLogin = (redirectTo = "/") => {
		if (isRegisteredUser(session.data?.user)) return true;
		goTo({ type: "login", redirectTo });
		return false;
	};

	const openPublish = () => {
		if (!requireLogin("/publish")) return;
		goTo({ type: "publish" });
	};

	return {
		currentUserId,
		goTo,
		openPublish,
		requireLogin,
		replaceWith,
		session,
	};
}

export function useSocialActions() {
	const navigation = useSocialNavigation();
	const { toast } = useAppToast();
	const optimisticToggles = useOptimisticToggleQueue();

	const showErrorToast = (error: SocialActionError) => {
		if (isRequestTimeoutError(error)) return;
		toast.show({ variant: "danger", label: error.message });
	};

	const likeMutation = useMutation(orpc.notes.toggleLike.mutationOptions());
	const collectMutation = useMutation(
		orpc.notes.toggleCollect.mutationOptions(),
	);
	const followMutation = useMutation(
		orpc.profiles.toggleFollow.mutationOptions(),
	);
	const commentMutation = useMutation(
		orpc.comments.addComment.mutationOptions({
			onSuccess: refreshActiveQueries,
		}),
	);
	const commentLikeMutation = useMutation(
		orpc.comments.toggleCommentLike.mutationOptions(),
	);
	const deleteCommentMutation = useMutation(
		orpc.comments.deleteComment.mutationOptions({
			onSuccess: refreshActiveQueries,
		}),
	);
	const startChatMutation = useMutation(
		orpc.messages.start.mutationOptions({
			onSuccess: refreshActiveQueries,
		}),
	);

	const pendingDeleteCommentIds = useMutationState({
		filters: {
			mutationKey: orpc.comments.deleteComment.mutationKey(),
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as { id: string } | undefined)?.id,
	});
	const pendingDeleteComments = new Set(
		pendingDeleteCommentIds.filter((id): id is string => Boolean(id)),
	);
	const optimistic = {
		collect: (id: string, current: boolean, count?: number) =>
			optimisticToggles.getState("collect", id, current, count),
		commentLike: (id: string, current: boolean, count?: number) =>
			optimisticToggles.getState("commentLike", id, current, count),
		follow: (id: string, current: boolean, count?: number) =>
			optimisticToggles.getState("follow", id, current, count),
		like: (id: string, current: boolean, count?: number) =>
			optimisticToggles.getState("like", id, current, count),
	};
	const runToggle = <TResult>({
		count,
		current,
		execute,
		id,
		kind,
		options,
		select,
	}: {
		count?: number;
		current: boolean;
		execute: () => Promise<TResult>;
		id: string;
		kind: OptimisticToggleKind;
		options: SocialActionOptions<TResult>;
		select: (result: TResult) => { active: boolean; count?: number };
	}) => {
		void optimisticToggles.toggle({
			count,
			current,
			execute,
			id,
			kind,
			onError: (error) => {
				const actionError = getError(error);
				options.onError?.(actionError);
				showErrorToast(actionError);
			},
			onSettled: options.onSettled,
			onSuccess: options.onSuccess,
			select,
		});
	};

	const toggleLike = (
		input: { active: boolean; count?: number; id: string },
		options: SocialActionOptions<NotesOutputs["toggleLike"]> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		runToggle({
			count: input.count,
			current: input.active,
			execute: () => likeMutation.mutateAsync({ id: input.id }),
			id: input.id,
			kind: "like",
			options,
			select: (result) => ({
				active: result.liked,
				count: result.likedCount,
			}),
		});
		return true;
	};

	const toggleCollect = (
		input: { active: boolean; count?: number; id: string },
		options: SocialActionOptions<NotesOutputs["toggleCollect"]> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		runToggle({
			count: input.count,
			current: input.active,
			execute: () => collectMutation.mutateAsync({ id: input.id }),
			id: input.id,
			kind: "collect",
			options,
			select: (result) => ({
				active: result.collected,
				count: result.collectedCount,
			}),
		});
		return true;
	};

	const toggleFollow = (
		input: { active: boolean; count?: number; userId: string },
		options: SocialActionOptions<ProfilesOutputs["toggleFollow"]> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		runToggle({
			count: input.count,
			current: input.active,
			execute: () => followMutation.mutateAsync({ userId: input.userId }),
			id: input.userId,
			kind: "follow",
			options,
			select: (result) => ({
				active: result.following,
				count: result.followerCount,
			}),
		});
		return true;
	};

	const addComment = async (
		input: { content: string; noteId: string; parentId?: string },
		options: SocialActionOptions<
			NonNullable<CommentsOutputs["addComment"]>
		> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		try {
			const result = await commentMutation.mutateAsync(input);
			if (!result) return false;
			await options.onSuccess?.(result);
			return true;
		} catch (error) {
			const actionError = getError(error);
			options.onError?.(actionError);
			showErrorToast(actionError);
			return false;
		} finally {
			options.onSettled?.();
		}
	};

	const toggleCommentLike = (
		input: { active: boolean; count?: number; id: string },
		options: SocialActionOptions<CommentsOutputs["toggleCommentLike"]> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		runToggle({
			count: input.count,
			current: input.active,
			execute: () => commentLikeMutation.mutateAsync({ id: input.id }),
			id: input.id,
			kind: "commentLike",
			options,
			select: (result) => ({
				active: result.liked,
				count: result.likedCount,
			}),
		});
		return true;
	};

	const deleteComment = (
		input: { id: string },
		options: SocialActionOptions<CommentsOutputs["deleteComment"]> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;
		if (pendingDeleteComments.has(input.id)) return false;

		deleteCommentMutation.mutate(input, {
			onError: (error) => {
				const actionError = getError(error);
				options.onError?.(actionError);
				showErrorToast(actionError);
			},
			onSettled: () => {
				options.onSettled?.();
			},
			onSuccess: async (result) => {
				await options.onSuccess?.(result);
			},
		});
		return true;
	};

	const startChat = (
		input: { userId: string },
		options: SocialActionOptions<MessagesOutputs["start"]> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		startChatMutation.mutate(input, {
			onError: (error) => {
				const actionError = getError(error);
				options.onError?.(actionError);
				showErrorToast(actionError);
			},
			onSettled: () => {
				options.onSettled?.();
			},
			onSuccess: async (result) => {
				await options.onSuccess?.(result);
				navigation.goTo({ type: "chat", id: result.id });
			},
		});
		return true;
	};

	return {
		addComment,
		currentUserId: navigation.currentUserId,
		goTo: navigation.goTo,
		mutations: {
			collect: collectMutation,
			comment: commentMutation,
			commentLike: commentLikeMutation,
			deleteComment: deleteCommentMutation,
			follow: followMutation,
			like: likeMutation,
			startChat: startChatMutation,
		},
		openPublish: navigation.openPublish,
		optimistic,
		pending: {
			collect: (id: string) => optimisticToggles.isPending("collect", id),
			commentLike: (id: string) =>
				optimisticToggles.isPending("commentLike", id),
			deleteComment: (id: string) => pendingDeleteComments.has(id),
			follow: (id: string) => optimisticToggles.isPending("follow", id),
			like: (id: string) => optimisticToggles.isPending("like", id),
		},
		requireLogin: navigation.requireLogin,
		replaceWith: navigation.replaceWith,
		session: navigation.session,
		startChat,
		deleteComment,
		toggleCommentLike,
		toggleCollect,
		toggleFollow,
		toggleLike,
	};
}
