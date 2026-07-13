import { Ionicons } from "@expo/vector-icons";
import type { NotificationItem } from "@youni/api/contracts/notifications";
import {
	Avatar,
	PressableFeedback,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";
import ReanimatedSwipeable, {
	type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import { fireHaptic } from "@/lib/utils/fire-haptic";
import { formatRelativeTime } from "@/utils/format";

export function NotificationRow({
	item,
	onDelete,
	onPress,
}: {
	item: NotificationItem;
	onDelete: () => void;
	onPress: () => void;
}) {
	return (
		<ReanimatedSwipeable
			friction={2}
			overshootRight={false}
			rightThreshold={44}
			renderRightActions={(_, __, swipeable) => (
				<SwipeDeleteAction swipeable={swipeable} onDelete={onDelete} />
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
							<Typography.Paragraph
								weight="semibold"
								numberOfLines={1}
								className="min-w-0 flex-1 text-foreground"
							>
								{item.title}
							</Typography.Paragraph>
							<Typography.Paragraph type="body-xs" color="muted">
								{formatRelativeTime(item.createdAt)}
							</Typography.Paragraph>
						</View>
						<Typography.Paragraph
							type="body-sm"
							color="muted"
							numberOfLines={2}
						>
							{item.body}
						</Typography.Paragraph>
					</View>
				</View>
			</PressableFeedback>
		</ReanimatedSwipeable>
	);
}

function SwipeDeleteAction({
	onDelete,
	swipeable,
}: {
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
					<Typography.Paragraph
						type="body-xs"
						weight="semibold"
						style={{ color: dangerForegroundColor }}
					>
						删除
					</Typography.Paragraph>
				</View>
			</PressableFeedback>
		</View>
	);
}
