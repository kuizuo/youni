import { Platform, type TextStyle } from "react-native";

export const NATIVE_FORM_CONTROL_VARIANT =
	Platform.OS === "web" ? undefined : "secondary";

export const SINGLE_LINE_INPUT_STYLE: TextStyle = {
	includeFontPadding: false,
	textAlignVertical: "center",
};

export const MULTILINE_INPUT_STYLE: TextStyle = {
	includeFontPadding: false,
	textAlignVertical: "top",
};
