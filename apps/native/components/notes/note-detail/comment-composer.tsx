import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { ProfileUser } from "@youni/api/contracts/profiles";
import {
	Avatar,
	Button,
	PressableFeedback,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
	Keyboard,
	type KeyboardEvent,
	Text as NativeText,
	Platform,
	TextInput,
	type TextStyle,
	View,
} from "react-native";
import { EmojiKeyboard, type EmojiType } from "rn-emoji-keyboard";

import { nativeQueryKeys } from "@/lib/query/query-keys";
import type { TextSelection } from "@/lib/types/text-input";
import { client } from "@/utils/orpc";
import {
	type CommentReplyTarget,
	createCommentComposerSessionState,
	transitionCommentComposerSession,
} from "./comment-composer-session";
import type { CommentInputRef, MentionTrigger } from "./types";
import { clampCursor } from "./utils";

const COMMENT_INPUT_STYLE: TextStyle = {
	fontSize: 16,
	includeFontPadding: false,
	lineHeight: 22,
	padding: 0,
	textAlignVertical: "top",
};
const COMMENT_INPUT_LINE_HEIGHT = 22;
const COMMENT_INPUT_MIN_HEIGHT = COMMENT_INPUT_LINE_HEIGHT * 2;
const COMMENT_INPUT_MAX_HEIGHT = COMMENT_INPUT_LINE_HEIGHT * 4;

export function useCommentComposerSession({
	bottomInset,
	canComment,
	isSending,
	onSubmit,
}: {
	bottomInset: number;
	canComment: boolean;
	isSending: boolean;
	onSubmit: (input: { content: string; parentId?: string }) => Promise<boolean>;
}) {
	const mutedColor = useThemeColor("muted");
	const inputRef = useRef<TextInput>(null);
	const [state, dispatch] = useReducer(
		transitionCommentComposerSession,
		createCommentComposerSessionState(),
	);
	const stateRef = useRef(state);
	stateRef.current = state;

	const apply = useCallback(
		(event: Parameters<typeof transitionCommentComposerSession>[1]) => {
			stateRef.current = transitionCommentComposerSession(
				stateRef.current,
				event,
			);
			dispatch(event);
		},
		[],
	);
	const focusInput = useCallback(() => {
		setTimeout(() => inputRef.current?.focus(), 80);
	}, []);
	const open = useCallback(
		(replyTarget?: CommentReplyTarget | null) => {
			apply({ replyTarget, type: "open" });
			focusInput();
		},
		[apply, focusInput],
	);

	useEffect(() => {
		const showSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(event) => {
				if (Platform.OS === "ios") Keyboard.scheduleLayoutAnimation(event);
				apply({ height: event.endCoordinates.height, type: "keyboardShown" });
			},
		);
		const hideSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			(event?: KeyboardEvent) => {
				if (Platform.OS === "ios" && event) {
					Keyboard.scheduleLayoutAnimation(event);
				}
				apply({ type: "keyboardHidden" });
			},
		);

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, [apply]);

	const send = async () => {
		const current = stateRef.current;
		const content = current.text.trim();
		if (
			!canComment ||
			isSending ||
			current.isSubmitting ||
			content.length === 0
		) {
			return;
		}

		const draft = { content, replyTarget: current.replyTarget };
		apply({ type: "submissionStarted" });
		inputRef.current?.blur();
		Keyboard.dismiss();

		let succeeded = false;
		try {
			succeeded = await onSubmit({
				content,
				...(draft.replyTarget ? { parentId: draft.replyTarget.id } : {}),
			});
		} catch {
			succeeded = false;
		}

		if (succeeded) {
			apply({ type: "submissionSucceeded" });
			return;
		}
		apply({ draft, type: "submissionFailed" });
		focusInput();
	};

	const canSend =
		canComment &&
		!isSending &&
		!state.isSubmitting &&
		state.text.trim().length > 0;
	const hasVisibleKeyboard =
		state.isEmojiKeyboardOpen || state.isSystemKeyboardVisible;

	return {
		bottomPadding: state.isOpen
			? hasVisibleKeyboard
				? 8
				: Math.max(bottomInset, 2)
			: bottomInset + 10,
		closeKeyboardFromContent: () => apply({ type: "closeEmoji" }),
		isOpen: state.isOpen,
		keyboardAvoidingBehavior:
			Platform.OS === "ios" && !state.isEmojiKeyboardOpen
				? ("padding" as const)
				: undefined,
		open,
		panelProps: {
			canSend,
			emojiPanelHeight: state.emojiPanelHeight,
			inputRef,
			isEmojiInputLocked: state.isEmojiInputLocked,
			isEmojiPickerOpen: state.isEmojiKeyboardOpen,
			mentionTrigger: state.mentionTrigger,
			mutedColor,
			onChangeText: (text: string) => apply({ text, type: "textChanged" }),
			onEmojiPress: () => {
				const wasOpen = stateRef.current.isEmojiKeyboardOpen;
				apply({ type: "toggleEmoji" });
				if (wasOpen) {
					focusInput();
					return;
				}
				inputRef.current?.blur();
				Keyboard.dismiss();
			},
			onEmojiSelect: (emoji: EmojiType) => {
				apply({ text: emoji.emoji, type: "insertText" });
				focusInput();
			},
			onFocusInput: () => apply({ type: "inputFocused" }),
			onMentionPress: () => {
				apply({ type: "openMention" });
				focusInput();
			},
			onMentionSelect: (handle: string) => {
				apply({ handle, type: "insertMention" });
				focusInput();
			},
			onSelectionChange: (selection: TextSelection) =>
				apply({ selection, type: "selectionChanged" }),
			onSend: () => void send(),
			placeholder: state.replyTarget
				? `回复 @${state.replyTarget.authorName}`
				: "说点什么...",
			value: state.text,
		},
	};
}

export function CommentComposerPanel({
	canSend,
	emojiPanelHeight,
	inputRef,
	isEmojiInputLocked,
	isEmojiPickerOpen,
	mentionTrigger,
	mutedColor,
	onChangeText,
	onEmojiPress,
	onEmojiSelect,
	onFocusInput,
	onMentionPress,
	onMentionSelect,
	onSelectionChange,
	onSend,
	placeholder,
	value,
}: {
	canSend: boolean;
	emojiPanelHeight: number;
	inputRef: CommentInputRef;
	isEmojiInputLocked: boolean;
	isEmojiPickerOpen: boolean;
	mentionTrigger: MentionTrigger | null;
	mutedColor: string;
	onChangeText: (value: string) => void;
	onEmojiPress: () => void;
	onEmojiSelect: (emoji: EmojiType) => void;
	onFocusInput: () => void;
	onMentionPress: () => void;
	onMentionSelect: (handle: string) => void;
	onSelectionChange: (selection: TextSelection) => void;
	onSend: () => void;
	placeholder: string;
	value: string;
}) {
	return (
		<View className="mx-auto w-full max-w-xl">
			{mentionTrigger ? (
				<View className="mb-1">
					<CommentMentionPicker
						trigger={mentionTrigger}
						onSelect={onMentionSelect}
					/>
				</View>
			) : null}
			<View className="mb-1">
				<CommentComposerInput
					inputRef={inputRef}
					isEmojiInputLocked={isEmojiInputLocked}
					value={value}
					onChangeText={onChangeText}
					onFocus={onFocusInput}
					onSelectionChange={onSelectionChange}
					placeholder={placeholder}
				/>
			</View>
			<View className="mb-1 h-9 flex-row items-center justify-between">
				<View className="flex-row items-center gap-2">
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						feedbackVariant="scale-ripple"
						accessibilityLabel="选择表情"
						onPress={onEmojiPress}
					>
						<Ionicons name="happy-outline" size={24} color={mutedColor} />
					</Button>
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						feedbackVariant="scale-ripple"
						accessibilityLabel="提及用户"
						onPress={onMentionPress}
					>
						<Ionicons name="at-outline" size={25} color={mutedColor} />
					</Button>
				</View>
				<Button
					size="sm"
					variant="primary"
					className="h-8 rounded-full px-5"
					feedbackVariant="scale-ripple"
					isDisabled={!canSend}
					onPress={onSend}
				>
					<Button.Label>发送</Button.Label>
				</Button>
			</View>
			{isEmojiPickerOpen ? (
				<View
					className="overflow-hidden rounded-2xl bg-content2"
					style={{ height: emojiPanelHeight }}
				>
					<EmojiKeyboard
						onEmojiSelected={onEmojiSelect}
						categoryPosition="bottom"
						disableSafeArea
						enableSearchBar={false}
						allowMultipleSelections
					/>
				</View>
			) : null}
		</View>
	);
}

function CommentComposerInput({
	inputRef,
	isEmojiInputLocked,
	onChangeText,
	onFocus,
	onSelectionChange,
	placeholder,
	value,
}: {
	inputRef: CommentInputRef;
	isEmojiInputLocked: boolean;
	onChangeText: (value: string) => void;
	onFocus: () => void;
	onSelectionChange: (selection: TextSelection) => void;
	placeholder: string;
	value: string;
}) {
	const foregroundColor = useThemeColor("foreground");
	const linkColor = useThemeColor("link");
	const mutedColor = useThemeColor("muted");
	const [inputHeight, setInputHeight] = useState(COMMENT_INPUT_MIN_HEIGHT);
	const [scrollY, setScrollY] = useState(0);

	return (
		<View
			className="relative rounded-2xl bg-content2 px-4 py-3"
			style={{ minHeight: COMMENT_INPUT_MIN_HEIGHT + 24 }}
		>
			<View
				pointerEvents="none"
				style={{
					height: inputHeight,
					left: 16,
					overflow: "hidden",
					position: "absolute",
					right: 16,
					top: 12,
				}}
			>
				<NativeText
					style={[
						COMMENT_INPUT_STYLE,
						{
							color: foregroundColor,
							transform: [{ translateY: -scrollY }],
						},
					]}
				>
					{renderCommentInputValue(value, linkColor)}
				</NativeText>
			</View>
			<TextInput
				ref={inputRef}
				value={value}
				onChangeText={onChangeText}
				onFocus={onFocus}
				onContentSizeChange={(event) => {
					const nextHeight = clampCursor(
						Math.ceil(event.nativeEvent.contentSize.height),
						COMMENT_INPUT_MAX_HEIGHT,
					);
					setInputHeight(Math.max(COMMENT_INPUT_MIN_HEIGHT, nextHeight));
				}}
				onScroll={(event) => {
					setScrollY(event.nativeEvent.contentOffset?.y ?? 0);
				}}
				onSelectionChange={(event) =>
					onSelectionChange(event.nativeEvent.selection)
				}
				placeholder={placeholder}
				placeholderTextColor={mutedColor}
				multiline
				showSoftInputOnFocus={!isEmojiInputLocked}
				scrollEnabled={inputHeight >= COMMENT_INPUT_MAX_HEIGHT}
				maxLength={500}
				returnKeyType="default"
				selectionColor={foregroundColor}
				cursorColor={foregroundColor}
				style={[
					COMMENT_INPUT_STYLE,
					{
						color: value ? "transparent" : foregroundColor,
						height: inputHeight,
						maxHeight: COMMENT_INPUT_MAX_HEIGHT,
						minHeight: COMMENT_INPUT_MIN_HEIGHT,
					},
				]}
			/>
		</View>
	);
}

function renderCommentInputValue(value: string, linkColor: string) {
	if (!value) return null;

	const parts = value.split(/(@[A-Za-z0-9_][A-Za-z0-9_]*)/g);
	let offset = 0;
	return parts.map((part) => {
		if (!part) return null;
		const key = `${offset}-${part}`;
		offset += part.length;
		const isMention = /^@[A-Za-z0-9_]+$/.test(part);
		return (
			<NativeText
				key={key}
				style={isMention ? { color: linkColor } : undefined}
			>
				{part}
			</NativeText>
		);
	});
}

function CommentMentionPicker({
	onSelect,
	trigger,
}: {
	onSelect: (handle: string) => void;
	trigger: MentionTrigger | null;
}) {
	const mutedColor = useThemeColor("muted");
	const keyword = trigger?.query.trim().replace(/^@/, "") ?? "";
	const users = useQuery({
		queryKey: nativeQueryKeys.note.mentionUsers(keyword),
		queryFn: () =>
			client.profiles.searchUsers({
				keyword,
				limit: 8,
			}),
		enabled: Boolean(trigger && keyword),
	});
	const items: ProfileUser[] = users.data ?? [];

	if (!trigger) return null;

	return (
		<View className="gap-2 rounded-2xl bg-content2 px-3 py-3">
			<View className="flex-row items-center gap-2">
				<Ionicons name="at-outline" size={16} color={mutedColor} />
				<Typography.Paragraph type="body-xs" color="muted">
					选择用户
				</Typography.Paragraph>
			</View>
			{keyword ? (
				users.isLoading ? (
					<View className="items-center py-3">
						<Spinner size="sm" />
					</View>
				) : items.length > 0 ? (
					<View className="gap-1">
						{items.map((item) => (
							<PressableFeedback
								key={item.id}
								accessibilityLabel={`提及 ${item.name}`}
								accessibilityRole="button"
								className="flex-row items-center gap-3 rounded-xl px-1 py-2"
								onPress={() => onSelect(item.handle ?? item.name)}
							>
								<Avatar size="sm" alt={item.name} className="size-8">
									{item.image ? (
										<Avatar.Image source={{ uri: item.image }} />
									) : null}
									<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
								</Avatar>
								<View className="min-w-0 flex-1">
									<Typography.Paragraph weight="semibold" numberOfLines={1}>
										{item.name}
									</Typography.Paragraph>
									<Typography.Paragraph
										type="body-xs"
										color="muted"
										numberOfLines={1}
									>
										@{item.handle ?? item.name}
									</Typography.Paragraph>
								</View>
							</PressableFeedback>
						))}
					</View>
				) : (
					<Typography.Paragraph type="body-sm" color="muted" className="py-2">
						没有匹配的用户，换个关键词试试。
					</Typography.Paragraph>
				)
			) : (
				<Typography.Paragraph type="body-sm" color="muted" className="py-2">
					输入用户名搜索。
				</Typography.Paragraph>
			)}
		</View>
	);
}
