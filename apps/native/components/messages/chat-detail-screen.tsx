import type { ChatPeer } from "@youni/api/contracts/messages";
import * as Clipboard from "expo-clipboard";
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

import type { ChatListMessage } from "@/components/messages/chat/conversation-session";
import { ChatHeader } from "@/components/messages/chat/header";
import { ChatInputBar } from "@/components/messages/chat/input-bar";
import { ChatMessageList } from "@/components/messages/chat/message-list";
import { useConversationSession } from "@/components/messages/chat/use-conversation-session";
import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { confirmAction } from "@/utils/confirm-action";
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
	const conversation = useConversationSession({
		currentUserId: session.data?.user?.id,
		draftUserId,
		isAuthenticated,
		previewPeer,
		routeConversationId,
	});
	const peer = conversation.peer;

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

	const copyMessage = (message: ChatListMessage) => {
		void Clipboard.setStringAsync(message.content).catch(() => undefined);
	};

	const send = () => {
		if (!conversation.send(content)) return;
		closeEmojiKeyboard();
		Keyboard.dismiss();
		contentRef.current = "";
		setContent("");
	};

	const confirmRetryMessage = (message: ChatListMessage) => {
		confirmAction({
			cancelText: "取消",
			confirmText: "重新发送",
			isDestructive: false,
			message: "确认后会再次发送这条私信。",
			onConfirm: () => conversation.retryMessage(message),
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
									...(conversation.conversationId
										? { conversationId: conversation.conversationId }
										: { userId: peer.id }),
								})
						: undefined
				}
			/>

			<ChatMessageList
				currentUserId={isAuthenticated ? session.data?.user?.id : undefined}
				isError={conversation.isError}
				isLoading={conversation.isLoading}
				messages={conversation.messages}
				onDismissInputPanel={dismissInputPanel}
				onCopyMessage={copyMessage}
				onDeleteMessage={conversation.deleteMessage}
				onRetry={conversation.retryLoading}
				onRetryMessage={confirmRetryMessage}
			/>

			<ChatInputBar
				bottomInset={insets.bottom}
				canSend={conversation.canSend(content)}
				content={content}
				emojiPanelHeight={emojiPanelHeight}
				disabledReason={conversation.disabledReason}
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
