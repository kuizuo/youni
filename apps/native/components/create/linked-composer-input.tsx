import { useThemeColor } from "heroui-native";
import type { RefObject } from "react";
import { TextInput, type TextStyle } from "react-native";
import type { TextSelection } from "@/lib/types/text-input";

const CONTENT_INPUT_STYLE: TextStyle = {
	fontSize: 20,
	includeFontPadding: false,
	lineHeight: 28,
	minHeight: 178,
	padding: 0,
};

type LinkedComposerInputProps = {
	inputRef?: RefObject<TextInput | null>;
	maxLength?: number;
	onBlur?: () => void;
	onChangeText: (value: string) => void;
	onFocus?: () => void;
	onSelectionChange?: (selection: TextSelection) => void;
	placeholder: string;
	placeholderTextColor: string;
	showSoftInputOnFocus?: boolean;
	value: string;
};

export function LinkedComposerInput({
	inputRef,
	maxLength,
	onBlur,
	onChangeText,
	onFocus,
	onSelectionChange,
	placeholder,
	placeholderTextColor,
	showSoftInputOnFocus,
	value,
}: LinkedComposerInputProps) {
	const foregroundColor = useThemeColor("foreground");

	return (
		<TextInput
			ref={inputRef}
			value={value}
			onBlur={onBlur}
			onChangeText={onChangeText}
			onFocus={onFocus}
			onSelectionChange={(event) =>
				onSelectionChange?.(event.nativeEvent.selection)
			}
			placeholder={placeholder}
			placeholderTextColor={placeholderTextColor}
			multiline
			maxLength={maxLength}
			showSoftInputOnFocus={showSoftInputOnFocus}
			textAlignVertical="top"
			selectionColor={foregroundColor}
			cursorColor={foregroundColor}
			style={[CONTENT_INPUT_STYLE, { color: foregroundColor }]}
		/>
	);
}
