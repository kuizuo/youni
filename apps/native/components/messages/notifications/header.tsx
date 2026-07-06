import { Ionicons } from "@expo/vector-icons";
import { Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

export function NotificationListHeader({
	title,
	topInset,
	onBack,
}: {
	title: string;
	topInset: number;
	onBack: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View className="bg-background px-4" style={{ paddingTop: topInset + 8 }}>
			<View className="mx-auto h-12 w-full max-w-xl flex-row items-center gap-3">
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="返回"
					onPress={onBack}
				>
					<Ionicons name="chevron-back" size={24} color={mutedColor} />
				</Button>
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold" style={{ fontSize: 18 }}>
						{title}
					</Text.Paragraph>
				</View>
			</View>
		</View>
	);
}
