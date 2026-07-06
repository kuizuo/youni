import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import { View } from "react-native";

export function TopicTopBar({
	foregroundColor,
	onBack,
	onShare,
}: {
	foregroundColor: string;
	onBack: () => void;
	onShare: () => void;
}) {
	return (
		<View className="h-16 flex-row items-center justify-between px-2">
			<Button
				isIconOnly
				variant="ghost"
				className="h-12 w-12 rounded-full"
				feedbackVariant="scale-ripple"
				accessibilityLabel="返回"
				onPress={onBack}
			>
				<Ionicons name="chevron-back" size={28} color={foregroundColor} />
			</Button>
			<View className="flex-row items-center gap-3">
				<Button
					isIconOnly
					variant="ghost"
					className="h-12 w-12 rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="分享"
					onPress={onShare}
				>
					<Ionicons
						name="arrow-redo-outline"
						size={28}
						color={foregroundColor}
					/>
				</Button>
			</View>
		</View>
	);
}
