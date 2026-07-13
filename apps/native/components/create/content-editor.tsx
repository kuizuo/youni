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
	contentInputRef,
	contentSelection,
	foregroundColor,
	isEmojiInputLocked,
	mutedColor,
	title,
	titleInputRef,
	titleSelection,
	onContentChange,
	onContentFocus,
	onContentSelectionChange,
	onTitleChange,
	onTitleFocus,
	onTitleSelectionChange,
}: {
	content: string;
	contentInputRef: RefObject<TextInput | null>;
	contentSelection: TextSelection;
	foregroundColor: string;
	isEmojiInputLocked: boolean;
	mutedColor: string;
	title: string;
	titleInputRef: RefObject<TextInput | null>;
	titleSelection: TextSelection;
	onContentChange: (value: string) => void;
	onContentFocus: () => void;
	onContentSelectionChange: (selection: TextSelection) => void;
	onTitleChange: (value: string) => void;
	onTitleFocus: () => void;
	onTitleSelectionChange: (selection: TextSelection) => void;
}) {
	return (
		<View className="gap-2">
			<View className="relative" style={{ height: 38 }}>
				<Text
					pointerEvents="none"
					style={[
						TITLE_INPUT_STYLE,
						{
							color: foregroundColor,
							left: 0,
							position: "absolute",
							right: 0,
							top: 0,
						},
					]}
				>
					{title}
				</Text>
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
					selection={titleSelection}
					showSoftInputOnFocus={!isEmojiInputLocked}
					selectionColor={foregroundColor}
					cursorColor={foregroundColor}
					style={[
						TITLE_INPUT_STYLE,
						{
							color: title ? "transparent" : foregroundColor,
						},
					]}
				/>
			</View>
			<LinkedComposerInput
				inputRef={contentInputRef}
				value={content}
				onChangeText={onContentChange}
				onFocus={onContentFocus}
				onSelectionChange={onContentSelectionChange}
				placeholder="添加正文"
				placeholderTextColor={mutedColor}
				maxLength={2000}
				selection={contentSelection}
				showSoftInputOnFocus={!isEmojiInputLocked}
			/>
		</View>
	);
}
