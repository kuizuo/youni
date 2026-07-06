import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import {
	Avatar,
	Button,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import type { TextStyle } from "react-native";
import { Text as NativeText, TextInput, View } from "react-native";
import { EmojiKeyboard, type EmojiType } from "rn-emoji-keyboard";

import { client } from "@/utils/orpc";

import type {
	CommentInputRef,
	MentionTrigger,
	MentionUser,
	TextSelection,
} from "./types";
import { clampCursor } from "./utils";

const COMMENT_INPUT_STYLE: TextStyle = {
	fontSize: 16,
	lineHeight: 22,
	padding: 0,
	textAlignVertical: "top",
};
const COMMENT_INPUT_LINE_HEIGHT = 22;
const COMMENT_INPUT_MIN_HEIGHT = COMMENT_INPUT_LINE_HEIGHT * 2;
const COMMENT_INPUT_MAX_HEIGHT = COMMENT_INPUT_LINE_HEIGHT * 4;

export function CommentComposerPanel({
	canSend,
	emojiPanelHeight,
	inputRef,
	isEmojiInputLocked,
	isEmojiPickerOpen,
	isSending,
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
	isSending: boolean;
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
					isDisabled={!canSend || isSending}
					onPress={onSend}
				>
					{isSending ? <Spinner size="sm" /> : null}
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
			className="relative rounded-3xl bg-content2 px-4 py-3"
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
		queryKey: ["note-detail", "mention-users", keyword],
		queryFn: () =>
			client.searchUsers({
				keyword,
				limit: 8,
			}),
		enabled: Boolean(trigger && keyword),
	});
	const items = (users.data ?? []) as MentionUser[];

	if (!trigger) return null;

	return (
		<View className="gap-2 rounded-2xl bg-content2 px-3 py-3">
			<View className="flex-row items-center gap-2">
				<Ionicons name="at-outline" size={16} color={mutedColor} />
				<Text.Paragraph type="body-xs" color="muted">
					选择用户
				</Text.Paragraph>
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
									<Text.Paragraph weight="semibold" numberOfLines={1}>
										{item.name}
									</Text.Paragraph>
									<Text.Paragraph
										type="body-xs"
										color="muted"
										numberOfLines={1}
									>
										@{item.handle ?? item.name}
									</Text.Paragraph>
								</View>
							</PressableFeedback>
						))}
					</View>
				) : (
					<Text.Paragraph type="body-sm" color="muted" className="py-2">
						没有找到用户。
					</Text.Paragraph>
				)
			) : (
				<Text.Paragraph type="body-sm" color="muted" className="py-2">
					输入用户名搜索。
				</Text.Paragraph>
			)}
		</View>
	);
}
