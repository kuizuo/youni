import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import { View } from "react-native";

import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";

export function ProfileTopBar({ onBack }: { onBack: () => void }) {
	return (
		<View className="h-11 flex-1 flex-row items-center justify-between">
			<Button
				isIconOnly
				variant="ghost"
				className="h-11 w-11 rounded-full bg-white/15"
				feedbackVariant="scale-ripple"
				accessibilityLabel="返回"
				onPress={onBack}
			>
				<Ionicons
					name="chevron-back"
					size={APP_HEADER_ICON_SIZE}
					color="#ffffff"
				/>
			</Button>
			<View className="h-11 w-11" />
		</View>
	);
}
