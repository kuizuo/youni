import { Ionicons } from "@expo/vector-icons";
import { Button, Text } from "heroui-native";
import { View } from "react-native";

export function CameraPermissionState({
	onBack,
	onRequestPermission,
}: {
	onBack: () => void;
	onRequestPermission: () => void;
}) {
	return (
		<View className="flex-1 items-center justify-center gap-4 bg-black px-8">
			<Ionicons name="camera-outline" size={44} color="#ffffff" />
			<Text.Paragraph align="center" style={{ color: "#ffffff" }}>
				需要相机权限才能扫一扫。
			</Text.Paragraph>
			<Button className="rounded-full" onPress={onRequestPermission}>
				<Button.Label>允许相机权限</Button.Label>
			</Button>
			<Button variant="ghost" className="rounded-full" onPress={onBack}>
				<Button.Label className="text-white">返回</Button.Label>
			</Button>
		</View>
	);
}
