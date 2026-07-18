import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";

import { FAB } from "./fab";

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
			<FAB>
				<FAB.Trigger
					accessibilityLabel="发布"
					animation={false}
					className="size-12 rounded-full shadow-overlay"
					hitSlop={8}
					onPress={() => {
						fireHaptic();
						socialNavigation.openPublish();
					}}
				>
					<Ionicons name="add" size={26} color="#fff" />
				</FAB.Trigger>
			</FAB>
		</View>
	);
}
