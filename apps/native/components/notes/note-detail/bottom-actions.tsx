import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback, Typography, useThemeColor } from "heroui-native";

export function BottomIconAction({
	active,
	activeColor,
	count,
	icon,
	label,
	onPress,
}: {
	active: boolean;
	activeColor: string;
	count: number;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			className="min-h-10 min-w-11 flex-row items-center justify-center gap-1 px-1"
			hitSlop={8}
			onPress={onPress}
		>
			<Ionicons
				name={icon}
				size={22}
				color={active ? activeColor : mutedColor}
			/>
			<Typography.Paragraph
				type="body-sm"
				weight={active ? "semibold" : undefined}
				style={{ color: active ? activeColor : mutedColor }}
			>
				{count}
			</Typography.Paragraph>
		</PressableFeedback>
	);
}
