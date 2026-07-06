import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback } from "heroui-native";
import { View } from "react-native";

export function CreateHeader({
	mutedColor,
	onBack,
}: {
	mutedColor: string;
	onBack: () => void;
}) {
	return (
		<View className="h-14 justify-center px-4">
			<PressableFeedback
				accessibilityLabel="返回"
				accessibilityRole="button"
				hitSlop={10}
				onPress={onBack}
				className="size-10 items-center justify-center rounded-full"
			>
				<Ionicons name="chevron-back" size={30} color={mutedColor} />
			</PressableFeedback>
		</View>
	);
}
