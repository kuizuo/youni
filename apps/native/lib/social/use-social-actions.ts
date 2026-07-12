import { useMutation, useMutationState } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";

import { authClient } from "@/lib/auth-client";
import {
	applyCommentLikeResult,
	applyCreatedComment,
	applyFollowResult,
	applyNoteReactionResult,
	invalidateComment,
	invalidateConversation,
	invalidateNote,
	invalidateUser,
	optimisticAddComment,
	optimisticDeleteComment,
	optimisticToggleCommentLike,
	optimisticToggleFollow,
	optimisticToggleNoteReaction,
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

type ToggleLikeResult = {
	liked: boolean;
	likedCount: number;
};

type ToggleCollectResult = {
	collected: boolean;
	collectedCount: number;
};

type ToggleFollowResult = {
	followerCount: number;
	following: boolean;
};

type AddCommentResult = {
	content?: string;
	createdAt?: Date | string;
	id: string;
	noteId?: string;
	parentId?: null | string;
	userId?: string;
};

type ToggleCommentLikeResult = {
	liked: boolean;
	likedCount: number;
};

type StartChatResult = {
	id: string;
};

type OptimisticMutationContext = {
	noteId?: string;
	optimisticComment?: {
		id: string;
		value: Parameters<typeof applyCreatedComment>[0]["tempComment"];
	};
	rollback?: () => void;
};

function getError(error: unknown): SocialActionError {
	return error instanceof Error ? error : new Error("操作失败");
}

export function useSocialNavigation() {
	const router = useRouter();
	const session = authClient.useSession();
	const currentUserId = session.data?.user?.id;

	const goTo = (intent: SocialNavigationIntent) => {
		router.push(toSocialHref(intent));
	};

	const replaceWith = (intent: SocialNavigationIntent) => {
		router.replace(toSocialHref(intent));
	};

	const requireLogin = (redirectTo = "/") => {
		if (session.data?.user) return true;
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
	const currentUser = navigation.session.data?.user;

	const showErrorToast = (error: SocialActionError) => {
		if (isRequestTimeoutError(error)) return;
		toast.show({ variant: "danger", label: error.message });
	};

	const likeMutation = useMutation(
		orpc.toggleLike.mutationOptions<OptimisticMutationContext>({
			onError: (_error, _variables, context) => {
				context?.rollback?.();
			},
			onMutate: async (input) => {
				return optimisticToggleNoteReaction({
					countField: "likedCount",
					noteId: input.id,
					stateField: "liked",
				});
			},
			onSettled: (_data, _error, variables) => {
				void invalidateNote(variables.id);
			},
			onSuccess: (result, variables) => {
				applyNoteReactionResult({
					count: result.likedCount,
					countField: "likedCount",
					noteId: variables.id,
					state: result.liked,
					stateField: "liked",
				});
			},
		}),
	);
	const collectMutation = useMutation(
		orpc.toggleCollect.mutationOptions<OptimisticMutationContext>({
			onError: (_error, _variables, context) => {
				context?.rollback?.();
			},
			onMutate: async (input) => {
				return optimisticToggleNoteReaction({
					countField: "collectedCount",
					noteId: input.id,
					stateField: "collected",
				});
			},
			onSettled: (_data, _error, variables) => {
				void invalidateNote(variables.id);
			},
			onSuccess: (result, variables) => {
				applyNoteReactionResult({
					count: result.collectedCount,
					countField: "collectedCount",
					noteId: variables.id,
					state: result.collected,
					stateField: "collected",
				});
			},
		}),
	);
	const followMutation = useMutation(
		orpc.toggleFollow.mutationOptions<OptimisticMutationContext>({
			onError: (_error, _variables, context) => {
				context?.rollback?.();
			},
			onMutate: async (input) => {
				return optimisticToggleFollow(input.userId);
			},
			onSettled: (_data, _error, variables) => {
				void invalidateUser(variables.userId);
			},
			onSuccess: (result, variables) => {
				applyFollowResult({
					followerCount: result.followerCount,
					following: result.following,
					userId: variables.userId,
				});
			},
		}),
	);
	const commentMutation = useMutation(
		orpc.addComment.mutationOptions<OptimisticMutationContext>({
			onError: (_error, _variables, context) => {
				context?.rollback?.();
			},
			onMutate: async (input) => {
				if (!currentUser?.id) return {};
				const context = await optimisticAddComment({
					authorImage: currentUser.image ?? null,
					authorName: currentUser.name ?? "我",
					content: input.content,
					noteId: input.noteId,
					parentId: input.parentId,
					userId: currentUser.id,
				});
				return {
					rollback: context.rollback,
					optimisticComment: {
						id: context.tempId,
						value: context.optimisticComment,
					},
				};
			},
			onSettled: (_data, _error, variables) => {
				void invalidateNote(variables.noteId);
				if (variables.parentId) {
					void invalidateComment(variables.parentId);
				}
			},
			onSuccess: (result, _variables, context) => {
				if (!result || !context?.optimisticComment) return;
				applyCreatedComment({
					commentId: result.id,
					createdAt: result.createdAt,
					tempComment: context.optimisticComment.value,
					tempId: context.optimisticComment.id,
				});
			},
		}),
	);
	const commentLikeMutation = useMutation(
		orpc.toggleCommentLike.mutationOptions<OptimisticMutationContext>({
			onError: (_error, _variables, context) => {
				context?.rollback?.();
			},
			onMutate: async (input) => {
				return optimisticToggleCommentLike(input.id);
			},
			onSettled: (_data, _error, variables) => {
				void invalidateComment(variables.id);
			},
			onSuccess: (result, variables) => {
				applyCommentLikeResult({
					commentId: variables.id,
					liked: result.liked,
					likedCount: result.likedCount,
				});
			},
		}),
	);
	const deleteCommentMutation = useMutation(
		orpc.deleteComment.mutationOptions<OptimisticMutationContext>({
			onError: (_error, _variables, context) => {
				context?.rollback?.();
			},
			onMutate: async (input) => {
				return optimisticDeleteComment(input.id);
			},
			onSettled: (_data, _error, variables, context) => {
				if (context?.noteId) {
					void invalidateNote(context.noteId);
				}
				void invalidateComment(variables.id);
			},
		}),
	);
	const startChatMutation = useMutation(
		orpc.messages.start.mutationOptions({
			onSuccess: (result) => {
				void invalidateConversation(result.id);
			},
		}),
	);

	const pendingLikeIds = useMutationState({
		filters: {
			mutationKey: orpc.toggleLike.mutationKey(),
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as { id: string } | undefined)?.id,
	});
	const pendingCollectIds = useMutationState({
		filters: {
			mutationKey: orpc.toggleCollect.mutationKey(),
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as { id: string } | undefined)?.id,
	});
	const pendingFollowIds = useMutationState({
		filters: {
			mutationKey: orpc.toggleFollow.mutationKey(),
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as { userId: string } | undefined)?.userId,
	});
	const pendingCommentLikeIds = useMutationState({
		filters: {
			mutationKey: orpc.toggleCommentLike.mutationKey(),
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as { id: string } | undefined)?.id,
	});
	const pendingDeleteCommentIds = useMutationState({
		filters: {
			mutationKey: orpc.deleteComment.mutationKey(),
			status: "pending",
		},
		select: (mutation) =>
			(mutation.state.variables as { id: string } | undefined)?.id,
	});
	const pending = useMemo(
		() => ({
			collect: new Set(pendingCollectIds.filter(Boolean)),
			commentLike: new Set(pendingCommentLikeIds.filter(Boolean)),
			deleteComment: new Set(pendingDeleteCommentIds.filter(Boolean)),
			follow: new Set(pendingFollowIds.filter(Boolean)),
			like: new Set(pendingLikeIds.filter(Boolean)),
		}),
		[
			pendingCollectIds,
			pendingCommentLikeIds,
			pendingDeleteCommentIds,
			pendingFollowIds,
			pendingLikeIds,
		],
	);

	const toggleLike = (
		input: { id: string },
		options: SocialActionOptions<ToggleLikeResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;
		if (pending.like.has(input.id)) return false;

		likeMutation.mutate(input, {
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

	const toggleCollect = (
		input: { id: string },
		options: SocialActionOptions<ToggleCollectResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;
		if (pending.collect.has(input.id)) return false;

		collectMutation.mutate(input, {
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

	const toggleFollow = (
		input: { userId: string },
		options: SocialActionOptions<ToggleFollowResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;
		if (pending.follow.has(input.userId)) return false;

		followMutation.mutate(input, {
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

	const addComment = (
		input: { content: string; noteId: string; parentId?: string },
		options: SocialActionOptions<AddCommentResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

		commentMutation.mutate(input, {
			onError: (error) => {
				const actionError = getError(error);
				options.onError?.(actionError);
				showErrorToast(actionError);
			},
			onSettled: () => {
				options.onSettled?.();
			},
			onSuccess: async (result) => {
				if (!result) return;
				await options.onSuccess?.(result);
			},
		});
		return true;
	};

	const toggleCommentLike = (
		input: { id: string },
		options: SocialActionOptions<ToggleCommentLikeResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;
		if (pending.commentLike.has(input.id)) return false;

		commentLikeMutation.mutate(input, {
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

	const deleteComment = (
		input: { id: string },
		options: SocialActionOptions<{ ok: boolean }> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;
		if (pending.deleteComment.has(input.id)) return false;

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
		options: SocialActionOptions<StartChatResult> = {},
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
		pending: {
			collect: (id: string) => pending.collect.has(id),
			commentLike: (id: string) => pending.commentLike.has(id),
			deleteComment: (id: string) => pending.deleteComment.has(id),
			follow: (id: string) => pending.follow.has(id),
			like: (id: string) => pending.like.has(id),
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
