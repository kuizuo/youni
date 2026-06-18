import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import Animated, { FadeOut, ZoomIn } from "react-native-reanimated";
import { withUniwind } from "uniwind";

import { useAppTheme } from "@/contexts/app-theme-context";

const StyledIonicons = withUniwind(Ionicons);

export function ThemeToggle() {
	const { toggleTheme, isLight } = useAppTheme();

	return (
		<Button
			isIconOnly
			size="sm"
			variant="ghost"
			feedbackVariant="scale-ripple"
			onPress={toggleTheme}
		>
			{isLight ? (
				<Animated.View key="moon" entering={ZoomIn} exiting={FadeOut}>
					<StyledIonicons name="moon" size={20} className="text-foreground" />
				</Animated.View>
			) : (
				<Animated.View key="sun" entering={ZoomIn} exiting={FadeOut}>
					<StyledIonicons name="sunny" size={20} className="text-foreground" />
				</Animated.View>
			)}
		</Button>
	);
}
