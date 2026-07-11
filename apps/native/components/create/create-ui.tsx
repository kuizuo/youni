import { Ionicons } from "@expo/vector-icons";
import { ListGroup, PressableFeedback, Typography } from "heroui-native";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export type IoniconName = keyof typeof Ionicons.glyphMap;

export function SuggestionChip({
	label,
	onPress,
}: {
	label: string;
	onPress?: () => void;
}) {
	const content = (
		<View className="rounded-full bg-content2 px-3 py-1.5">
			<Typography.Paragraph type="body-xs" color="muted" numberOfLines={1}>
				{label}
			</Typography.Paragraph>
		</View>
	);

	if (!onPress) {
		return content;
	}

	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
		>
			{content}
		</PressableFeedback>
	);
}

export function SettingsListItem({
	foregroundColor,
	icon,
	label,
	mutedColor,
	onPress,
	value,
}: {
	foregroundColor: string;
	icon: IoniconName;
	label: string;
	mutedColor: string;
	onPress?: () => void;
	value?: string;
}) {
	return (
		<ListGroup.Item
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress ?? (() => fireHaptic())}
			className="gap-2.5 px-3 py-3"
		>
			<ListGroup.ItemPrefix>
				<Ionicons name={icon} size={21} color={foregroundColor} />
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle className="text-sm">{label}</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
			<ListGroup.ItemSuffix className="flex-row items-center gap-2">
				{value ? (
					<Typography.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{value}
					</Typography.Paragraph>
				) : null}
				<Ionicons name="chevron-forward" size={19} color={mutedColor} />
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	);
}

export function ListDivider() {
	return <AppSeparator className="opacity-60" />;
}
