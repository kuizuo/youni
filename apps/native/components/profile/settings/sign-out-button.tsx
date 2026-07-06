import { Ionicons } from "@expo/vector-icons";
import { Button, useThemeColor } from "heroui-native";

export function SignOutButton({ onPress }: { onPress: () => void }) {
	const dangerColor = useThemeColor("danger");
	const defaultForegroundColor = useThemeColor("default-foreground");

	return (
		<Button
			variant="danger-soft"
			className="rounded-full"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons
				name="log-out-outline"
				size={18}
				color={dangerColor || defaultForegroundColor}
			/>
			<Button.Label>退出登录</Button.Label>
		</Button>
	);
}
