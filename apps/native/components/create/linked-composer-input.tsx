import { useThemeColor } from "heroui-native";
import type { RefObject } from "react";
import { Text, TextInput, type TextStyle, View } from "react-native";

export type TextSelection = {
	end: number;
	start: number;
};

const CONTENT_INPUT_STYLE: TextStyle = {
	fontSize: 20,
	lineHeight: 28,
	minHeight: 178,
	padding: 0,
};

type LinkedComposerInputProps = {
	inputRef?: RefObject<TextInput | null>;
	maxLength?: number;
	onChangeText: (value: string) => void;
	onFocus?: () => void;
	onSelectionChange?: (selection: TextSelection) => void;
	placeholder: string;
	placeholderTextColor: string;
	selection?: TextSelection;
	showSoftInputOnFocus?: boolean;
	value: string;
};

export function LinkedComposerInput({
	inputRef,
	maxLength,
	onChangeText,
	onFocus,
	onSelectionChange,
	placeholder,
	placeholderTextColor,
	selection,
	showSoftInputOnFocus,
	value,
}: LinkedComposerInputProps) {
	const foregroundColor = useThemeColor("foreground");
	const linkColor = useThemeColor("link");

	return (
		<View
			className="relative"
			style={{ minHeight: CONTENT_INPUT_STYLE.minHeight }}
		>
			<Text
				pointerEvents="none"
				style={[
					CONTENT_INPUT_STYLE,
					{
						bottom: 0,
						color: foregroundColor,
						left: 0,
						position: "absolute",
						right: 0,
						top: 0,
					},
				]}
			>
				{renderLinkedContent(value, linkColor)}
			</Text>
			<TextInput
				ref={inputRef}
				value={value}
				onChangeText={onChangeText}
				onFocus={onFocus}
				onSelectionChange={(event) =>
					onSelectionChange?.(event.nativeEvent.selection)
				}
				placeholder={placeholder}
				placeholderTextColor={placeholderTextColor}
				multiline
				maxLength={maxLength}
				selection={selection}
				showSoftInputOnFocus={showSoftInputOnFocus}
				textAlignVertical="top"
				selectionColor={foregroundColor}
				cursorColor={foregroundColor}
				style={[
					CONTENT_INPUT_STYLE,
					{
						color: value ? "transparent" : foregroundColor,
					},
				]}
			/>
		</View>
	);
}

function renderLinkedContent(value: string, linkColor: string) {
	if (!value) return null;

	const parts = value.split(/([#@][^\s#@]+)/g);
	let offset = 0;
	return parts.map((part) => {
		if (!part) return null;
		const key = `${offset}-${part}`;
		offset += part.length;
		const isLink = /^([#@][^\s#@]+)$/.test(part);
		return (
			<Text key={key} style={isLink ? { color: linkColor } : undefined}>
				{part}
			</Text>
		);
	});
}
