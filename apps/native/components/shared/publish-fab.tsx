import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export function PublishFAB() {
	const insets = useSafeAreaInsets();
	const socialNavigation = useSocialNavigation();

	return (
		<View
			pointerEvents="box-none"
			style={{
				bottom: insets.bottom + 76,
				position: "absolute",
				right: 20,
			}}
		>
			<PressableFeedback
				accessibilityLabel="发布"
				accessibilityRole="button"
				className="size-12 items-center justify-center rounded-full bg-accent shadow-overlay"
				hitSlop={8}
				onPress={() => {
					fireHaptic();
					socialNavigation.openPublish();
				}}
			>
				<PressableFeedback.Highlight />
				<Ionicons name="add" size={26} color="#fff" />
			</PressableFeedback>
		</View>
	);
}
