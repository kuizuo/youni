import { Ionicons } from "@expo/vector-icons";
import { Text } from "heroui-native";
import { Pressable, View } from "react-native";

export function ScanBottomAction({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			className="items-center gap-3"
			onPress={onPress}
		>
			<View className="size-16 items-center justify-center rounded-full bg-white/20">
				<Ionicons name={icon} size={30} color="#ffffff" />
			</View>
			<Text.Paragraph weight="semibold" style={{ color: "#ffffff" }}>
				{label}
			</Text.Paragraph>
		</Pressable>
	);
}
