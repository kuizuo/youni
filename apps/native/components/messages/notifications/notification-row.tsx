import { Ionicons } from "@expo/vector-icons";
import { Avatar, PressableFeedback, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";
import ReanimatedSwipeable, {
	type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { fireHaptic } from "@/lib/utils/fire-haptic";
import { formatRelativeTime } from "@/utils/format";

import type { NotificationItem } from "./types";

export function NotificationRow({
	isDeleting,
	item,
	onDelete,
	onPress,
}: {
	isDeleting: boolean;
	item: NotificationItem;
	onDelete: () => void;
	onPress: () => void;
}) {
	return (
		<ReanimatedSwipeable
			enabled={!isDeleting}
			friction={2}
			overshootRight={false}
			rightThreshold={44}
			renderRightActions={(_, __, swipeable) => (
				<SwipeDeleteAction
					isDeleting={isDeleting}
					swipeable={swipeable}
					onDelete={onDelete}
				/>
			)}
		>
			<PressableFeedback
				accessibilityRole="button"
				accessibilityLabel={item.title}
				className="bg-background px-4 py-4"
				onPress={onPress}
			>
				<View className="flex-row gap-3">
					<Avatar size="md" alt={item.actor?.name ?? "Youni"}>
						{item.actor?.image ? (
							<Avatar.Image source={{ uri: item.actor.image }} />
						) : null}
						<Avatar.Fallback>
							{(item.actor?.name ?? "Youni").slice(0, 1)}
						</Avatar.Fallback>
					</Avatar>
					<View className="min-w-0 flex-1 gap-1">
						<View className="flex-row items-center gap-2">
							{item.isRead ? null : (
								<View className="size-2 rounded-full bg-accent" />
							)}
							<Text.Paragraph
								weight="semibold"
								numberOfLines={1}
								className="min-w-0 flex-1 text-foreground"
							>
								{item.title}
							</Text.Paragraph>
							<Text.Paragraph type="body-xs" color="muted">
								{formatRelativeTime(item.createdAt)}
							</Text.Paragraph>
						</View>
						<Text.Paragraph type="body-sm" color="muted" numberOfLines={2}>
							{item.body}
						</Text.Paragraph>
					</View>
				</View>
			</PressableFeedback>
		</ReanimatedSwipeable>
	);
}

function SwipeDeleteAction({
	isDeleting,
	onDelete,
	swipeable,
}: {
	isDeleting: boolean;
	onDelete: () => void;
	swipeable: SwipeableMethods;
}) {
	const dangerForegroundColor = useThemeColor("danger-foreground");

	return (
		<View className="w-20 items-stretch justify-center">
			<PressableFeedback
				accessibilityRole="button"
				accessibilityLabel="删除"
				className="h-full w-20 items-center justify-center bg-danger"
				onPress={() => {
					if (isDeleting) return;
					swipeable.close();
					fireHaptic();
					onDelete();
				}}
			>
				<View className="items-center gap-1">
					<Ionicons
						name="trash-outline"
						size={21}
						color={dangerForegroundColor}
					/>
					<Text.Paragraph
						type="body-xs"
						weight="semibold"
						style={{ color: dangerForegroundColor }}
					>
						删除
					</Text.Paragraph>
				</View>
			</PressableFeedback>
		</View>
	);
}
