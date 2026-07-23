import type { RefObject } from "react";
import { Text, TextInput, type TextStyle, View } from "react-native";
import type { TextSelection } from "@/lib/types/text-input";
import { LinkedComposerInput } from "./linked-composer-input";

const TITLE_INPUT_STYLE: TextStyle = {
	fontSize: 24,
	fontWeight: "500",
	height: 38,
	includeFontPadding: false,
	lineHeight: 32,
	padding: 0,
	textAlignVertical: "center",
};

export function ContentEditor({
	content,
	contentError,
	contentInputRef,
	foregroundColor,
	isEmojiInputLocked,
	mutedColor,
	title,
	titleError,
	titleInputRef,
	onContentBlur,
	onContentChange,
	onContentFocus,
	onContentSelectionChange,
	onTitleChange,
	onTitleBlur,
	onTitleFocus,
	onTitleSelectionChange,
}: {
	content: string;
	contentError?: string;
	contentInputRef: RefObject<TextInput | null>;
	foregroundColor: string;
	isEmojiInputLocked: boolean;
	mutedColor: string;
	title: string;
	titleError?: string;
	titleInputRef: RefObject<TextInput | null>;
	onContentBlur: () => void;
	onContentChange: (value: string) => void;
	onContentFocus: () => void;
	onContentSelectionChange: (selection: TextSelection) => void;
	onTitleChange: (value: string) => void;
	onTitleBlur: () => void;
	onTitleFocus: () => void;
	onTitleSelectionChange: (selection: TextSelection) => void;
}) {
	return (
		<View className="gap-2">
			<View className="gap-1">
				<TextInput
					ref={titleInputRef}
					value={title}
					onBlur={onTitleBlur}
					onChangeText={onTitleChange}
					onFocus={onTitleFocus}
					onSelectionChange={(event) =>
						onTitleSelectionChange(event.nativeEvent.selection)
					}
					placeholder="添加标题"
					placeholderTextColor={mutedColor}
					maxLength={80}
					returnKeyType="done"
					scrollEnabled={false}
					showSoftInputOnFocus={!isEmojiInputLocked}
					selectionColor={foregroundColor}
					cursorColor={foregroundColor}
					style={[TITLE_INPUT_STYLE, { color: foregroundColor }]}
				/>
				{titleError ? (
					<Text
						accessibilityRole="alert"
						selectable
						className="text-danger text-sm"
					>
						{titleError}
					</Text>
				) : null}
			</View>
			<View className="gap-1">
				<LinkedComposerInput
					inputRef={contentInputRef}
					value={content}
					onBlur={onContentBlur}
					onChangeText={onContentChange}
					onFocus={onContentFocus}
					onSelectionChange={onContentSelectionChange}
					placeholder="添加正文"
					placeholderTextColor={mutedColor}
					maxLength={2000}
					showSoftInputOnFocus={!isEmojiInputLocked}
				/>
				{contentError ? (
					<Text
						accessibilityRole="alert"
						selectable
						className="text-danger text-sm"
					>
						{contentError}
					</Text>
				) : null}
			</View>
		</View>
	);
}
