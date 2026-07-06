import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback } from "heroui-native";
import { View } from "react-native";

import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";

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
				className="h-11 w-11 items-center justify-center rounded-full"
			>
				<Ionicons
					name="chevron-back"
					size={APP_HEADER_ICON_SIZE}
					color={mutedColor}
				/>
			</PressableFeedback>
		</View>
	);
}
