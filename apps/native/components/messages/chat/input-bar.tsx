import { Ionicons } from "@expo/vector-icons";
import { Button, Typography, useThemeColor } from "heroui-native";
import type { RefObject } from "react";
import { TextInput, View } from "react-native";
import type { EmojiType } from "rn-emoji-keyboard";

import { AppSeparator } from "@/components/shared/app-separator";
import { ThemedEmojiKeyboard } from "@/components/shared/themed-emoji-keyboard";

const INPUT_ACCESSORY_GAP = 12;

export function ChatInputBar({
	bottomInset,
	canSend,
	content,
	disabledReason,
	emojiPanelHeight,
	isEmojiInputLocked,
	inputRef,
	isEmojiPickerOpen,
	isSystemKeyboardVisible,
	onChangeContent,
	onEmojiPress,
	onEmojiSelect,
	onFocusInput,
	onSelectionChange,
	onSend,
}: {
	bottomInset: number;
	canSend: boolean;
	content: string;
	disabledReason?: string;
	emojiPanelHeight: number;
	isEmojiInputLocked: boolean;
	inputRef: RefObject<TextInput | null>;
	isEmojiPickerOpen: boolean;
	isSystemKeyboardVisible: boolean;
	onChangeContent: (value: string) => void;
	onEmojiPress: () => void;
	onEmojiSelect: (emoji: EmojiType) => void;
	onFocusInput: () => void;
	onSelectionChange: (selection: { end: number; start: number }) => void;
	onSend: () => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const fieldForegroundColor = useThemeColor("field-foreground");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const isInputDisabled = Boolean(disabledReason);

	return (
		<View className="bg-background">
			<AppSeparator />
			{disabledReason ? (
				<Typography.Paragraph
					type="body-xs"
					color="muted"
					className="px-4 pt-3 text-center"
				>
					{disabledReason}
				</Typography.Paragraph>
			) : null}
			<View
				className="flex-row items-end gap-2 px-3 pt-3"
				style={{
					paddingBottom:
						isEmojiPickerOpen || isSystemKeyboardVisible
							? INPUT_ACCESSORY_GAP
							: bottomInset + 10,
				}}
			>
				<View className="min-h-11 flex-1 flex-row items-center rounded-3xl bg-content2 py-1 pr-1 pl-4">
					<TextInput
						ref={inputRef}
						value={content}
						onChangeText={onChangeContent}
						onFocus={onFocusInput}
						onSelectionChange={(event) =>
							onSelectionChange(event.nativeEvent.selection)
						}
						showSoftInputOnFocus={!isEmojiInputLocked}
						editable={!isInputDisabled}
						placeholder={disabledReason ?? "发送私信"}
						placeholderTextColor={mutedColor}
						multiline
						maxLength={1000}
						style={{
							color: fieldForegroundColor,
							flex: 1,
							fontSize: 16,
							includeFontPadding: false,
							lineHeight: 22,
							maxHeight: 120,
							minHeight: 36,
							paddingHorizontal: 0,
							paddingVertical: 7,
							textAlignVertical: "top",
						}}
					/>
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="h-9 w-9 rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="选择表情"
						isDisabled={isInputDisabled}
						onPress={onEmojiPress}
					>
						<Ionicons name="happy-outline" size={22} color={mutedColor} />
					</Button>
				</View>
				<Button
					isIconOnly
					variant={canSend ? "primary" : "secondary"}
					className="h-11 w-11 rounded-full"
					feedbackVariant="scale-ripple"
					isDisabled={!canSend}
					accessibilityLabel="发送"
					onPress={onSend}
				>
					<Ionicons
						name="send"
						size={18}
						color={canSend ? accentForegroundColor : foregroundColor}
					/>
				</Button>
			</View>
			{isEmojiPickerOpen ? (
				<View
					className="mx-3 overflow-hidden rounded-2xl bg-content2"
					style={{ height: emojiPanelHeight }}
				>
					<ThemedEmojiKeyboard
						onEmojiSelected={onEmojiSelect}
						disableSafeArea
					/>
				</View>
			) : null}
		</View>
	);
}
