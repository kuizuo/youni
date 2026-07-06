import { Ionicons } from "@expo/vector-icons";
import { Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

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
			className="bg-background px-4 pb-3"
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
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold" numberOfLines={1}>
						{title}
					</Text.Paragraph>
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						关注与粉丝
					</Text.Paragraph>
				</View>
			</View>
			<View className="mt-3 flex-row rounded-full bg-content2 p-1">
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
			<AppSeparator className="-mx-4 mt-3" />
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
			className="h-9 flex-1 rounded-full"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
