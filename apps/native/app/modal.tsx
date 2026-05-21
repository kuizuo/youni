import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import { Text, View } from "react-native";

import { Container } from "@/components/container";

function Modal() {
	const accentForegroundColor = useThemeColor("accent-foreground");

	function handleClose() {
		router.back();
	}

	return (
		<Container>
			<View className="flex-1 items-center justify-center p-4">
				<Surface variant="secondary" className="w-full max-w-sm rounded-lg p-5">
					<View className="items-center">
						<View className="mb-3 h-12 w-12 items-center justify-center rounded-lg bg-accent">
							<Ionicons
								name="checkmark"
								size={24}
								color={accentForegroundColor}
							/>
						</View>
						<Text className="mb-1 font-medium text-foreground text-lg">
							Modal Screen
						</Text>
						<Text className="mb-4 text-center text-muted text-sm">
							This is an example modal screen for dialogs and confirmations.
						</Text>
					</View>
					<Button onPress={handleClose} className="w-full" size="sm">
						<Button.Label>Close</Button.Label>
					</Button>
				</Surface>
			</View>
		</Container>
	);
}

export default Modal;
