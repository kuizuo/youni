import { Ionicons } from "@expo/vector-icons";
import { ListGroup, PressableFeedback, Separator, Text } from "heroui-native";
import { Image, View } from "react-native";

import { fireHaptic } from "@/lib/utils/fire-haptic";
import type { ComposerImage } from "./use-create-composer";

export type IoniconName = keyof typeof Ionicons.glyphMap;

export function MediaTile({
	image,
	label,
	onPress,
}: {
	image: ComposerImage;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel="移除图片"
			accessibilityRole="button"
			onPress={onPress}
			className="h-22 w-22 overflow-hidden rounded-xl border border-border bg-content2"
		>
			<Image
				accessibilityLabel={label}
				source={{ uri: image.uri }}
				resizeMode="cover"
				className="h-full w-full"
			/>
			<View className="absolute top-1 right-1 size-6 items-center justify-center rounded-full bg-overlay-backdrop">
				<Ionicons name="close" size={14} color="white" />
			</View>
		</PressableFeedback>
	);
}

export function SuggestionChip({
	label,
	onPress,
}: {
	label: string;
	onPress?: () => void;
}) {
	const content = (
		<View className="rounded-full bg-content2 px-3 py-1.5">
			<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
				{label}
			</Text.Paragraph>
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
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{value}
					</Text.Paragraph>
				) : null}
				<Ionicons name="chevron-forward" size={19} color={mutedColor} />
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	);
}

export function ListDivider() {
	return <Separator className="bg-separator opacity-60" thickness={1} />;
}
