import { Ionicons } from "@expo/vector-icons";
import { ListGroup, PressableFeedback, Spinner, Text } from "heroui-native";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import type { ComposerImage } from "./create-types";

export type IoniconName = keyof typeof Ionicons.glyphMap;

export function MediaTile({
	image,
	label,
	onEdit,
	onRemove,
}: {
	image: ComposerImage;
	label: string;
	onEdit: () => void;
	onRemove: () => void;
}) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (!image.uri) {
			setIsLoading(false);
			setHasError(true);
			return;
		}
		setIsLoading(true);
		setHasError(false);
	}, [image.uri]);

	return (
		<View className="h-22 w-22">
			<PressableFeedback
				accessibilityLabel={`编辑${label}`}
				accessibilityRole="button"
				onPress={onEdit}
				className="h-full w-full overflow-hidden rounded-xl border border-border bg-content2"
			>
				<Image
					accessibilityLabel={label}
					source={{ uri: image.uri }}
					resizeMode="cover"
					onError={() => {
						setHasError(true);
						setIsLoading(false);
					}}
					onLoad={() => {
						setHasError(false);
						setIsLoading(false);
					}}
					onLoadEnd={() => setIsLoading(false)}
					onLoadStart={() => setIsLoading(true)}
					className="h-full w-full"
				/>
				{isLoading ? (
					<View className="absolute inset-0 items-center justify-center bg-content2">
						<Spinner size="sm" />
					</View>
				) : null}
				{hasError ? (
					<View className="absolute inset-0 items-center justify-center bg-content2">
						<Ionicons name="image-outline" size={24} color="#9ca3af" />
					</View>
				) : null}
			</PressableFeedback>
			<PressableFeedback
				accessibilityLabel={`移除${label}`}
				accessibilityRole="button"
				hitSlop={8}
				onPress={onRemove}
				className="absolute top-1 right-1 z-10 size-6 items-center justify-center rounded-full bg-overlay-backdrop"
			>
				<Ionicons name="close" size={14} color="white" />
			</PressableFeedback>
		</View>
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
	return <AppSeparator className="opacity-60" />;
}
