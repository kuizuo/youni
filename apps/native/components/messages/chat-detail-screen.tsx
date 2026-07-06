import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import type { ChatMessage } from "@/components/messages/chat/types";
import { authClient } from "@/lib/auth-client";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";
import { getRouteParam } from "@/utils/route-params";

const DEFAULT_EMOJI_PANEL_HEIGHT = 304;

export default function ChatDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const conversationId = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const socialNavigation = useSocialNavigation();
	const { toast } = useAppToast();
	const inputRef = useRef<TextInput>(null);
	const contentRef = useRef("");
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
	const [selection, setSelection] = useState({ end: 0, start: 0 });
	contentRef.current = content;
	isEmojiInputLockedRef.current = isEmojiInputLocked;
	isEmojiKeyboardOpenRef.current = isEmojiKeyboardOpen;
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

	const handleFocusInput = () => {
		if (isEmojiInputLockedRef.current) return;
		isSystemKeyboardVisibleRef.current = true;
		setIsSystemKeyboardVisible(true);
		if (isSwitchingToSystemKeyboardRef.current) return;
		closeEmojiKeyboard();
	};

	const send = () => {
		const nextContent = content.trim();
		if (!nextContent || !conversationId) return;
		closeEmojiKeyboard();
		Keyboard.dismiss();
		sendMutation.mutate({ conversationId, content: nextContent });
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
				emojiPanelHeight={emojiPanelHeight}
				isEmojiInputLocked={isEmojiInputLocked}
				inputRef={inputRef}
				isEmojiPickerOpen={isEmojiKeyboardOpen}
				isSending={sendMutation.isPending}
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
