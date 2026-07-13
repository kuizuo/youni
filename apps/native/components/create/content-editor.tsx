import type { RefObject } from "react";
import { TextInput, type TextStyle, View } from "react-native";
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
	contentInputRef,
	foregroundColor,
	isEmojiInputLocked,
	mutedColor,
	title,
	titleInputRef,
	onContentChange,
	onContentFocus,
	onContentSelectionChange,
	onTitleChange,
	onTitleFocus,
	onTitleSelectionChange,
}: {
	content: string;
	contentInputRef: RefObject<TextInput | null>;
	foregroundColor: string;
	isEmojiInputLocked: boolean;
	mutedColor: string;
	title: string;
	titleInputRef: RefObject<TextInput | null>;
	onContentChange: (value: string) => void;
	onContentFocus: () => void;
	onContentSelectionChange: (selection: TextSelection) => void;
	onTitleChange: (value: string) => void;
	onTitleFocus: () => void;
	onTitleSelectionChange: (selection: TextSelection) => void;
}) {
	return (
		<View className="gap-2">
			<TextInput
				ref={titleInputRef}
				value={title}
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
			<LinkedComposerInput
				inputRef={contentInputRef}
				value={content}
				onChangeText={onContentChange}
				onFocus={onContentFocus}
				onSelectionChange={onContentSelectionChange}
				placeholder="添加正文"
				placeholderTextColor={mutedColor}
				maxLength={2000}
				showSoftInputOnFocus={!isEmojiInputLocked}
			/>
		</View>
	);
}
