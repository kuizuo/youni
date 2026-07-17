import { useMutation, useQuery } from "@tanstack/react-query";
import type { ChatMessage, ChatPeer } from "@youni/api/contracts/messages";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	type KeyboardEvent,
	Platform,
	type TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EmojiType } from "rn-emoji-keyboard";

import { ChatHeader } from "@/components/messages/chat/header";
import { ChatInputBar } from "@/components/messages/chat/input-bar";
import { ChatMessageList } from "@/components/messages/chat/message-list";
import {
	type ChatListMessage,
	mergeChatMessages,
} from "@/components/messages/chat/message-state";
import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import { refreshActiveQueries } from "@/lib/query/optimistic-cache";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { useAppToast } from "@/utils/app-toast";
import { confirmAction } from "@/utils/confirm-action";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";
import { getRouteParam } from "@/utils/route-params";

const DEFAULT_EMOJI_PANEL_HEIGHT = 304;

export default function ChatDetailScreen() {
	const params = useLocalSearchParams<{
		handle?: string | string[];
		id?: string | string[];
		image?: string | string[];
		name?: string | string[];
		userId?: string | string[];
	}>();
	const routeConversationId = getRouteParam(params.id) ?? "";
	const draftUserId = getRouteParam(params.userId) ?? "";
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const socialNavigation = useSocialNavigation();
	const { toast } = useAppToast();
	const inputRef = useRef<TextInput>(null);
	const contentRef = useRef("");
	const messageSequenceRef = useRef(0);
	const isEmojiKeyboardOpenRef = useRef(false);
	const isEmojiInputLockedRef = useRef(false);
	const isSystemKeyboardVisibleRef = useRef(false);
	const isSwitchingToSystemKeyboardRef = useRef(false);
	const [content, setContent] = useState("");
	const [emojiPanelHeight, setEmojiPanelHeight] = useState(
		DEFAULT_EMOJI_PANEL_HEIGHT,
	);
	const [isEmojiInputLocked, setIsEmojiInputLocked] = useState(false);
	const [isEmojiKeyboardOpen, setIsEmojiKeyboardOpen] = useState(false);
	const [isSystemKeyboardVisible, setIsSystemKeyboardVisible] = useState(false);
	const [startedConversationId, setStartedConversationId] = useState("");
	const [outgoingMessages, setOutgoingMessages] = useState<ChatListMessage[]>(
		[],
	);
	const [selection, setSelection] = useState({ end: 0, start: 0 });
	const isAuthenticated = isRegisteredUser(session.data?.user);
	contentRef.current = content;
	isEmojiInputLockedRef.current = isEmojiInputLocked;
	isEmojiKeyboardOpenRef.current = isEmojiKeyboardOpen;
	const previewPeer: ChatPeer | undefined = draftUserId
		? {
				bio: null,
				email: "",
				handle: getRouteParam(params.handle) ?? null,
				id: draftUserId,
				image: getRouteParam(params.image) ?? null,
				name: getRouteParam(params.name) ?? "用户",
			}
		: undefined;
	const openedChat = useQuery({
		...orpc.messages.open.queryOptions({
			input: { userId: draftUserId || "missing" },
		}),
		enabled: Boolean(draftUserId && isAuthenticated),
		staleTime: 30_000,
	});
	const conversationId =
		routeConversationId ||
		startedConversationId ||
		openedChat.data?.conversationId ||
		"";
	const chat = useQuery({
		...orpc.messages.byId.queryOptions({
			input: { conversationId: conversationId || "missing", limit: 80 },
		}),
		enabled: Boolean(conversationId && isAuthenticated),
		refetchInterval: 2500,
	});
	const sendMutation = useMutation(orpc.messages.send.mutationOptions());
	const serverMessages: ChatMessage[] = chat.data?.messages ?? [];
	const messages = mergeChatMessages(serverMessages, outgoingMessages);
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
	const canSend = Boolean(
		(conversationId || draftUserId) &&
			isAuthenticated &&
			!disabledReason &&
			!sendMutation.isPending &&
			content.trim().length > 0,
	);

	useEffect(() => {
		const updateKeyboardHeight = (event: KeyboardEvent) => {
			const height = Math.round(event.endCoordinates.height);
			if (height > 0) {
				setEmojiPanelHeight(Math.max(260, height));
			}
		};
		const showSubscription = Keyboard.addListener(
			"keyboardDidShow",
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
		const hideSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			(event) => {
				if (Platform.OS === "ios") {
					Keyboard.scheduleLayoutAnimation(event);
				}
				isSystemKeyboardVisibleRef.current = false;
				setIsSystemKeyboardVisible(false);
				isSwitchingToSystemKeyboardRef.current = false;
			},
		);

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	const focusInput = () => {
		requestAnimationFrame(() => {
			inputRef.current?.focus();
		});
	};

	const changeContent = (value: string) => {
		const previousValue = contentRef.current;
		const cursor = Math.min(
			value.length,
			Math.max(0, selection.start + value.length - previousValue.length),
		);

		contentRef.current = value;
		setContent(value);
		setSelection({ end: cursor, start: cursor });
	};

	const insertEmoji = (emoji: EmojiType) => {
		const currentValue = contentRef.current;
		const start = Math.min(selection.start, selection.end);
		const end = Math.max(selection.start, selection.end);
		const nextValue = `${currentValue.slice(0, start)}${emoji.emoji}${currentValue.slice(end)}`;
		const cursor = start + emoji.emoji.length;

		contentRef.current = nextValue;
		setContent(nextValue);
		setSelection({ end: cursor, start: cursor });
	};

	const toggleEmojiKeyboard = () => {
		const nextValue = !isEmojiKeyboardOpenRef.current;
		if (!nextValue) {
			isSwitchingToSystemKeyboardRef.current = true;
			isEmojiInputLockedRef.current = false;
			setIsEmojiInputLocked(false);
			focusInput();
			return;
		}
		isSwitchingToSystemKeyboardRef.current = false;
		isEmojiInputLockedRef.current = true;
		setIsEmojiInputLocked(true);
		isEmojiKeyboardOpenRef.current = true;
		setIsEmojiKeyboardOpen(true);
		inputRef.current?.blur();
		Keyboard.dismiss();
	};

	const closeEmojiKeyboard = () => {
		isSwitchingToSystemKeyboardRef.current = false;
		isEmojiInputLockedRef.current = false;
		setIsEmojiInputLocked(false);
		if (!isEmojiKeyboardOpenRef.current) return;
		isEmojiKeyboardOpenRef.current = false;
		setIsEmojiKeyboardOpen(false);
	};

	const dismissInputPanel = () => {
		closeEmojiKeyboard();
		Keyboard.dismiss();
	};

	const handleFocusInput = () => {
		if (isEmojiInputLockedRef.current) return;
		isSystemKeyboardVisibleRef.current = true;
		setIsSystemKeyboardVisible(true);
		if (isSwitchingToSystemKeyboardRef.current) return;
		closeEmojiKeyboard();
	};

	const updateOutgoingMessage = (
		id: string,
		update: (message: ChatListMessage) => ChatListMessage,
	) => {
		setOutgoingMessages((current) =>
			current.map((message) => (message.id === id ? update(message) : message)),
		);
	};

	const sendOutgoingMessage = (message: ChatListMessage) => {
		const callbacks = {
			onError: (error: Error) => {
				updateOutgoingMessage(message.id, (current) => ({
					...current,
					deliveryStatus: "failed",
				}));
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger" as const, label: error.message });
			},
			onSuccess: (result: { conversationId: string; message: ChatMessage }) => {
				updateOutgoingMessage(message.id, () => result.message);
				setStartedConversationId(result.conversationId);
				void refreshActiveQueries();
			},
		};

		sendMutation.mutate(
			conversationId
				? {
						clientMessageId: message.id,
						conversationId,
						content: message.content,
					}
				: {
						clientMessageId: message.id,
						userId: draftUserId,
						content: message.content,
					},
			callbacks,
		);
	};

	const send = () => {
		const nextContent = content.trim();
		const senderId = session.data?.user?.id;
		if (
			!nextContent ||
			!senderId ||
			!isAuthenticated ||
			(!conversationId && !draftUserId) ||
			sendMutation.isPending
		)
			return;
		closeEmojiKeyboard();
		Keyboard.dismiss();
		contentRef.current = "";
		setContent("");
		messageSequenceRef.current += 1;
		const message: ChatListMessage = {
			content: nextContent,
			createdAt: new Date(),
			deliveryStatus: "pending",
			id: `local-${senderId}-${Date.now().toString(36)}-${messageSequenceRef.current.toString(36)}`,
			senderId,
		};
		setOutgoingMessages((current) => [...current, message]);
		sendOutgoingMessage(message);
	};

	const confirmRetryMessage = (message: ChatListMessage) => {
		confirmAction({
			cancelText: "取消",
			confirmText: "重新发送",
			isDestructive: false,
			message: "确认后会再次发送这条私信。",
			onConfirm: () => {
				if (sendMutation.isPending) return;
				const pendingMessage: ChatListMessage = {
					...message,
					deliveryStatus: "pending",
				};
				updateOutgoingMessage(message.id, () => pendingMessage);
				sendOutgoingMessage(pendingMessage);
			},
			title: "重新发送这条消息？",
		});
	};

	return (
		<KeyboardAvoidingView
			className="flex-1 bg-background"
			behavior={
				Platform.OS === "ios" && !isEmojiKeyboardOpen ? "padding" : undefined
			}
		>
			<ChatHeader
				peer={peer}
				topInset={insets.top}
				onBack={() => router.back()}
				onOpenProfile={
					peer
						? () => socialNavigation.goTo({ type: "user", id: peer.id })
						: undefined
				}
				onOpenSettings={
					peer
						? () =>
								socialNavigation.goTo({
									type: "chatSettings",
									...(conversationId
										? { conversationId }
										: { userId: peer.id }),
								})
						: undefined
				}
			/>

			<ChatMessageList
				currentUserId={isAuthenticated ? session.data?.user?.id : undefined}
				isError={openedChat.isError || chat.isError}
				isLoading={
					openedChat.isLoading || (Boolean(conversationId) && chat.isLoading)
				}
				messages={messages}
				onDismissInputPanel={dismissInputPanel}
				onRetry={() => {
					if (openedChat.isError) void openedChat.refetch();
					if (chat.isError) void chat.refetch();
				}}
				onRetryMessage={confirmRetryMessage}
			/>

			<ChatInputBar
				bottomInset={insets.bottom}
				canSend={canSend}
				content={content}
				emojiPanelHeight={emojiPanelHeight}
				disabledReason={disabledReason}
				isEmojiInputLocked={isEmojiInputLocked}
				inputRef={inputRef}
				isEmojiPickerOpen={isEmojiKeyboardOpen}
				isSystemKeyboardVisible={isSystemKeyboardVisible}
				onChangeContent={changeContent}
				onEmojiPress={toggleEmojiKeyboard}
				onEmojiSelect={insertEmoji}
				onFocusInput={handleFocusInput}
				onSelectionChange={setSelection}
				onSend={send}
			/>
		</KeyboardAvoidingView>
	);
}
