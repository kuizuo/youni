import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { PressableFeedback, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { NOTIFICATION_SHORTCUTS } from "./constants";
import type { MessageGroupSummary } from "./types";

export function NotificationShortcutsSection({
	messageGroups,
	onOpenAction,
}: {
	messageGroups: MessageGroupSummary[];
	onOpenAction: (href: Href) => void;
}) {
	return (
		<View className="border-border-tertiary border-b bg-background px-4 py-3">
			<View className="gap-2">
				<Text.Paragraph
					type="body-sm"
					weight="semibold"
					className="text-foreground"
				>
					互动消息
				</Text.Paragraph>
				<View className="gap-2">
					{NOTIFICATION_SHORTCUTS.map((item) => {
						const group = messageGroups.find((group) => group.id === item.id);
						return (
							<NotificationShortcut
								key={item.id}
								description={item.description}
								icon={item.icon}
								title={item.title}
								unreadCount={group?.unreadCount ?? 0}
								onPress={() => onOpenAction(item.href)}
							/>
						);
					})}
				</View>
			</View>
		</View>
	);
}

function NotificationShortcut({
	description,
	icon,
	onPress,
	title,
	unreadCount,
}: {
	description: string;
	icon: keyof typeof Ionicons.glyphMap;
	onPress: () => void;
	title: string;
	unreadCount: number;
}) {
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={title}
			className="flex-row items-center gap-3 rounded-2xl bg-content2 px-3 py-3"
			onPress={onPress}
		>
			<View className="size-11 items-center justify-center rounded-full bg-background">
				<Ionicons name={icon} size={22} color={foregroundColor} />
			</View>
			<View className="min-w-0 flex-1">
				<Text.Paragraph weight="semibold" numberOfLines={1}>
					{title}
				</Text.Paragraph>
				<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
					{description}
				</Text.Paragraph>
			</View>
			{unreadCount > 0 ? (
				<View className="min-w-6 items-center rounded-full bg-accent px-2 py-1">
					<Text.Paragraph
						type="body-xs"
						weight="semibold"
						className="text-accent-foreground"
					>
						{unreadCount > 99 ? "99+" : unreadCount}
					</Text.Paragraph>
				</View>
			) : (
				<Ionicons name="chevron-forward" size={18} color={mutedColor} />
			)}
		</PressableFeedback>
	);
}
