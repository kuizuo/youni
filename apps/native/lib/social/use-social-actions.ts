import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { authClient } from "@/lib/auth-client";
import {
	type SocialNavigationIntent,
	toSocialHref,
} from "@/lib/social/navigation-intents";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

type SocialActionError = Error;

export type SocialActionOptions<TResult = unknown> = {
	onError?: (error: SocialActionError) => void;
	onSettled?: () => void;
	onSuccess?: (result: TResult) => Promise<void> | void;
	redirectTo?: string;
	showSuccessToast?: boolean;
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
	id: string;
};

type ToggleCommentLikeResult = {
	liked: boolean;
	likedCount: number;
};

type StartChatResult = {
	id: string;
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

	const showErrorToast = (error: SocialActionError) => {
		if (isRequestTimeoutError(error)) return;
		toast.show({ variant: "danger", label: error.message });
	};

	const likeMutation = useMutation(orpc.social.toggleLike.mutationOptions());
	const collectMutation = useMutation(
		orpc.social.toggleCollect.mutationOptions(),
	);
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions(),
	);
	const commentMutation = useMutation(orpc.social.addComment.mutationOptions());
	const commentLikeMutation = useMutation(
		orpc.social.toggleCommentLike.mutationOptions(),
	);
	const deleteCommentMutation = useMutation(
		orpc.social.deleteComment.mutationOptions(),
	);
	const startChatMutation = useMutation(orpc.messages.start.mutationOptions());

	const toggleLike = (
		input: { id: string },
		options: SocialActionOptions<ToggleLikeResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

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
				await queryClient.refetchQueries();
			},
		});
		return true;
	};

	const toggleCollect = (
		input: { id: string },
		options: SocialActionOptions<ToggleCollectResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

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
				await queryClient.refetchQueries();
				if (options.showSuccessToast !== false) {
					toast.show({ label: result.collected ? "已收藏" : "已取消收藏" });
				}
			},
		});
		return true;
	};

	const toggleFollow = (
		input: { userId: string },
		options: SocialActionOptions<ToggleFollowResult> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

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
				await queryClient.refetchQueries();
				if (options.showSuccessToast !== false) {
					toast.show({ label: result.following ? "已关注" : "已取消关注" });
				}
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
				await queryClient.refetchQueries();
			},
		});
		return true;
	};

	const deleteComment = (
		input: { id: string },
		options: SocialActionOptions<{ ok: boolean }> = {},
	) => {
		if (!navigation.requireLogin(options.redirectTo)) return false;

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
				await queryClient.refetchQueries();
				if (options.showSuccessToast !== false) {
					toast.show({ label: "评论已删除" });
				}
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
				await queryClient.refetchQueries();
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
