import { Alert, Platform } from "react-native";

type ConfirmActionOptions = {
	cancelText: string;
	confirmText: string;
	isDestructive?: boolean;
	message: string;
	onConfirm: () => void;
	title: string;
};

export function confirmAction({
	cancelText,
	confirmText,
	isDestructive = true,
	message,
	onConfirm,
	title,
}: ConfirmActionOptions) {
	if (Platform.OS === "web") {
		if (globalThis.confirm(`${title}\n\n${message}`)) onConfirm();
		return;
	}

	Alert.alert(title, message, [
		{ style: "cancel", text: cancelText },
		{
			onPress: onConfirm,
			style: isDestructive ? "destructive" : "default",
			text: confirmText,
		},
	]);
}
