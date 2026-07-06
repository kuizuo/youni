import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import { View } from "react-native";

export function ProfileTopBar({ onBack }: { onBack: () => void }) {
	return (
		<View className="h-11 flex-1 flex-row items-center justify-between">
			<Button
				isIconOnly
				size="sm"
				variant="ghost"
				className="rounded-full bg-white/15"
				feedbackVariant="scale-ripple"
				accessibilityLabel="返回"
				onPress={onBack}
			>
				<Ionicons name="chevron-back" size={24} color="#ffffff" />
			</Button>
			<View className="h-11 w-11" />
		</View>
	);
}
