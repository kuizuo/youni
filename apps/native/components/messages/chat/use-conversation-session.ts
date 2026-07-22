import { useQuery } from "@tanstack/react-query";
import type {
	ChatMessage,
	ChatPeer,
	ConversationItem,
} from "@youni/api/contracts/messages";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import { useAppToast } from "@/utils/app-toast";
import { client, orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

import {
	type ConversationTransport,
	createConversationSession,
} from "./conversation-session";

function createConversationTransport(
	draftUserId: string,
): ConversationTransport {
	return {
		deleteForMe: (input) => client.messages.deleteForMe(input),
		refresh: async (conversationId) => {
			const refreshes = [
				queryClient.invalidateQueries({
					queryKey: orpc.messages.conversations.queryOptions().queryKey,
				}),
				queryClient.invalidateQueries({
					queryKey: orpc.messages.byId.queryOptions({
						input: { conversationId, limit: 80 },
					}).queryKey,
				}),
			];
			if (draftUserId) {
				refreshes.push(
					queryClient.invalidateQueries({
						queryKey: orpc.messages.open.queryOptions({
							input: { userId: draftUserId },
						}).queryKey,
					}),
				);
			}
			await Promise.all(refreshes);
		},
		send: (input) => client.messages.send(input),
	};
}

export function useConversationSession({
	currentUserId,
	draftUserId,
	isAuthenticated,
	previewPeer,
	routeConversationId,
}: {
	currentUserId?: string;
	draftUserId: string;
	isAuthenticated: boolean;
	previewPeer?: ChatPeer;
	routeConversationId: string;
}) {
	const { toast } = useAppToast();
	const onErrorRef = useRef(
		(_error: unknown, _action: "delete" | "send") => undefined,
	);
	onErrorRef.current = (error, action) => {
		if (action === "send" && isRequestTimeoutError(error)) return;
		toast.show({
			variant: "danger",
			label:
				error instanceof Error && error.message
					? error.message
					: action === "delete"
						? "删除失败"
						: "发送失败",
		});
	};

	const session = useMemo(
		() =>
			createConversationSession({
				draftUserId,
				initialConversationId: routeConversationId,
				onError: (error, action) => onErrorRef.current(error, action),
				senderId: currentUserId ?? "",
				transport: createConversationTransport(draftUserId),
			}),
		[currentUserId, draftUserId, routeConversationId],
	);
	const localState = useSyncExternalStore(
		session.subscribe,
		session.getState,
		session.getState,
	);
	const openedChat = useQuery({
		...orpc.messages.open.queryOptions({
			input: { userId: draftUserId || "missing" },
		}),
		enabled: Boolean(draftUserId && isAuthenticated),
		staleTime: 30_000,
	});
	const conversationId =
		routeConversationId ||
		localState.conversationId ||
		openedChat.data?.conversationId ||
		"";
	const chat = useQuery({
		...orpc.messages.byId.queryOptions({
			input: { conversationId: conversationId || "missing", limit: 80 },
		}),
		enabled: Boolean(conversationId && isAuthenticated),
		refetchInterval: 2500,
		refetchOnMount: "always",
	});

	useEffect(() => {
		session.connect(conversationId);
	}, [conversationId, session]);

	useEffect(() => {
		if (!conversationId || !chat.isFetchedAfterMount || !chat.isSuccess) return;

		const conversationsQuery = orpc.messages.conversations.queryOptions();
		queryClient.setQueryData<ConversationItem[]>(
			conversationsQuery.queryKey,
			(current) =>
				current
					? current.map((conversation) =>
							conversation.id === conversationId
								? { ...conversation, unreadCount: 0 }
								: conversation,
						)
					: current,
		);
	}, [chat.isFetchedAfterMount, chat.isSuccess, conversationId]);

	const peer = chat.data?.peer ?? openedChat.data?.peer ?? previewPeer;
	const hasBlockedPeer =
		chat.data?.hasBlockedPeer ?? openedChat.data?.hasBlockedPeer;
	const isBlockedByPeer =
		chat.data?.isBlockedByPeer ?? openedChat.data?.isBlockedByPeer;
	const disabledReason = isBlockedByPeer
		? "对方已将你加入黑名单，暂时不能发送私信"
		: hasBlockedPeer
			? "你已将对方加入黑名单，解除后才能发送私信"
			: undefined;
	const serverMessages: ChatMessage[] = chat.data?.messages ?? [];
	const canSend = (content: string) =>
		Boolean(
			(conversationId || draftUserId) &&
				isAuthenticated &&
				!disabledReason &&
				!localState.isSending &&
				content.trim().length > 0,
		);

	return {
		canSend,
		conversationId,
		deleteMessage: session.deleteMessage,
		disabledReason,
		isError: openedChat.isError || chat.isError,
		isLoading:
			openedChat.isLoading || (Boolean(conversationId) && chat.isLoading),
		messages: session.getMessages(serverMessages),
		peer,
		retryLoading() {
			if (openedChat.isError) void openedChat.refetch();
			if (chat.isError) void chat.refetch();
		},
		retryMessage: session.retryMessage,
		send(content: string) {
			return canSend(content) && session.send(content);
		},
	};
}
