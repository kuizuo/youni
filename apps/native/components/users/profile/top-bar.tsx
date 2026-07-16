import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import type { ComponentProps, ReactNode } from "react";
import { View } from "react-native";

const PROFILE_TOP_BAR_ICON_SIZE = 18;

export function ProfileTopBarIconButton({
	accessibilityLabel,
	color = "#ffffff",
	icon,
	onPress,
}: {
	accessibilityLabel: string;
	color?: string;
	icon: ComponentProps<typeof Ionicons>["name"];
	onPress: () => void;
}) {
	return (
		<Button
			isIconOnly
			variant="ghost"
			className="size-9 rounded-full bg-black/20"
			feedbackVariant="scale-ripple"
			accessibilityLabel={accessibilityLabel}
			onPress={onPress}
		>
			<Ionicons name={icon} size={PROFILE_TOP_BAR_ICON_SIZE} color={color} />
		</Button>
	);
}

export function ProfileTopBar({
	center,
	iconColor,
	onBack,
	right,
}: {
	center?: ReactNode;
	iconColor?: string;
	onBack: () => void;
	right?: ReactNode;
}) {
	return (
		<View
			className="h-11 w-full flex-row items-center justify-between"
			pointerEvents="box-none"
		>
			<ProfileTopBarIconButton
				accessibilityLabel="返回"
				color={iconColor}
				icon="chevron-back"
				onPress={onBack}
			/>
			{center ? (
				<View
					className="absolute right-16 left-16 h-11 items-center justify-center"
					pointerEvents="box-none"
				>
					{center}
				</View>
			) : null}
			<View className="h-11 min-w-11 items-end justify-center">{right}</View>
		</View>
	);
}
