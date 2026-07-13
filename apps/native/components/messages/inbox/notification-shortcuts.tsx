import { Ionicons } from "@expo/vector-icons";
import type { NotificationSummaryGroup } from "@youni/api/contracts/notifications";
import type { Href } from "expo-router";
import { PressableFeedback, Typography, useThemeColor } from "heroui-native";
import { View } from "react-native";
import type { NotificationIconColor } from "@/components/messages/notification-colors";
import { NOTIFICATION_SHORTCUTS } from "./constants";

export function NotificationShortcutsSection({
	messageGroups,
	onOpenAction,
}: {
	messageGroups: NotificationSummaryGroup[];
	onOpenAction: (href: Href) => void;
}) {
	return (
		<View className="bg-background">
			<View className="px-2 py-2">
				<View className="flex-row gap-1">
					{NOTIFICATION_SHORTCUTS.map((item) => {
						const group = messageGroups.find((group) => group.id === item.id);
						return (
							<NotificationShortcut
								key={item.id}
								icon={item.icon}
								iconColor={item.iconColor}
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
	icon,
	iconColor,
	onPress,
	title,
	unreadCount,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: NotificationIconColor;
	onPress: () => void;
	title: string;
	unreadCount: number;
}) {
	const resolvedIconColor = useThemeColor(iconColor);

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={title}
			className="min-w-0 flex-1 items-center gap-1 rounded-2xl px-1 py-2"
			onPress={onPress}
		>
			<View className="size-8 items-center justify-center">
				<Ionicons name={icon} size={21} color={resolvedIconColor} />
			</View>
			<Typography.Paragraph
				type="body-sm"
				weight="semibold"
				align="center"
				numberOfLines={1}
				className="text-foreground"
			>
				{title}
			</Typography.Paragraph>
			{unreadCount > 0 ? (
				<View className="absolute top-1 right-4 min-w-5 items-center rounded-full bg-accent px-1.5 py-0.5">
					<Typography.Paragraph
						type="body-xs"
						weight="semibold"
						className="text-accent-foreground"
					>
						{unreadCount > 99 ? "99+" : unreadCount}
					</Typography.Paragraph>
				</View>
			) : null}
		</PressableFeedback>
	);
}
