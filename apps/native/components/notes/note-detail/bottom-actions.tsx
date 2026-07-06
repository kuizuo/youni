import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback, Spinner, Text, useThemeColor } from "heroui-native";

export function BottomIconAction({
	active,
	activeColor,
	count,
	icon,
	isLoading,
	label,
	onPress,
}: {
	active: boolean;
	activeColor: string;
	count: number;
	icon: keyof typeof Ionicons.glyphMap;
	isLoading: boolean;
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
			{isLoading ? (
				<Spinner size="sm" />
			) : (
				<Ionicons
					name={icon}
					size={22}
					color={active ? activeColor : mutedColor}
				/>
			)}
			<Text.Paragraph
				type="body-sm"
				weight={active ? "semibold" : undefined}
				style={{ color: active ? activeColor : mutedColor }}
			>
				{count}
			</Text.Paragraph>
		</PressableFeedback>
	);
}
