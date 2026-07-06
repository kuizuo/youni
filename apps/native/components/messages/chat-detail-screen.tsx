import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatHeader } from "@/components/messages/chat/header";
import { ChatInputBar } from "@/components/messages/chat/input-bar";
import { ChatMessageList } from "@/components/messages/chat/message-list";
import type { ChatMessage } from "@/components/messages/chat/types";
import { authClient } from "@/lib/auth-client";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";
import { getRouteParam } from "@/utils/route-params";

export default function ChatDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const conversationId = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const socialNavigation = useSocialNavigation();
	const { toast } = useAppToast();
	const [content, setContent] = useState("");
	const chat = useQuery({
		...orpc.messages.byId.queryOptions({
			input: { conversationId: conversationId || "missing", limit: 80 },
		}),
		enabled: Boolean(conversationId && session.data?.user),
		refetchInterval: 2500,
	});
	const sendMutation = useMutation(
		orpc.messages.send.mutationOptions({
			onSuccess: async () => {
				setContent("");
				await Promise.all([chat.refetch(), queryClient.refetchQueries()]);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const messages = useMemo(
		() => (chat.data?.messages ?? []) as ChatMessage[],
		[chat.data?.messages],
	);
	const peer = chat.data?.peer;
	const canSend = content.trim().length > 0 && !sendMutation.isPending;

	const send = () => {
		const nextContent = content.trim();
		if (!nextContent || !conversationId) return;
		sendMutation.mutate({ conversationId, content: nextContent });
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-background"
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ChatHeader
				peer={peer}
				topInset={insets.top}
				onBack={() => router.back()}
				onOpenPeer={(id) => socialNavigation.goTo({ type: "user", id })}
			/>

			<ChatMessageList
				currentUserId={session.data?.user?.id}
				isError={chat.isError}
				isLoading={chat.isLoading}
				messages={messages}
				onRetry={() => chat.refetch()}
			/>

			<ChatInputBar
				bottomInset={insets.bottom}
				canSend={canSend}
				content={content}
				isSending={sendMutation.isPending}
				onChangeContent={setContent}
				onSend={send}
			/>
		</KeyboardAvoidingView>
	);
}
