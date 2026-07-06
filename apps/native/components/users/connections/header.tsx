import { Button, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";

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
		<AppHeader
			title={title}
			topInset={topInset}
			left={
				<AppHeaderIconButton
					accessibilityLabel="返回"
					color={mutedColor}
					icon="chevron-back"
					onPress={onBack}
				/>
			}
			after={
				<View className="mx-auto w-full max-w-xl pb-2">
					<View className="w-40 flex-row self-center rounded-full bg-content2 p-0.5">
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
			}
		/>
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
