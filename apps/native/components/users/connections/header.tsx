import { Ionicons } from "@expo/vector-icons";
import { Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

import type { ConnectionType } from "./types";

export function ConnectionsHeader({
	activeType,
	title,
	topInset,
	onBack,
	onTypeChange,
}: {
	activeType: ConnectionType;
	title: string;
	topInset: number;
	onBack: () => void;
	onTypeChange: (type: ConnectionType) => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View
			className="bg-background px-4 pb-2"
			style={{ paddingTop: topInset + 8 }}
		>
			<View className="h-12 flex-row items-center gap-3">
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
				<View className="min-w-0 flex-1 items-center">
					<Text.Paragraph
						weight="bold"
						numberOfLines={1}
						style={{ lineHeight: 22, textAlign: "center" }}
					>
						{title}
					</Text.Paragraph>
				</View>
				<View className="size-9" />
			</View>
			<View className="mt-2 w-40 flex-row self-center rounded-full bg-content2 p-0.5">
				<SegmentButton
					isActive={activeType === "following"}
					label="关注"
					onPress={() => onTypeChange("following")}
				/>
				<SegmentButton
					isActive={activeType === "followers"}
					label="粉丝"
					onPress={() => onTypeChange("followers")}
				/>
			</View>
		</View>
	);
}

function SegmentButton({
	isActive,
	label,
	onPress,
}: {
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant={isActive ? "primary" : "ghost"}
			className="h-7 flex-1 rounded-full px-2"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Button.Label className="text-xs">{label}</Button.Label>
		</Button>
	);
}
