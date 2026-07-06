import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	Button,
	PressableFeedback,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

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
	const mutedColor = useThemeColor("muted");
	const accentColor = useThemeColor("accent");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={item.title}
			className="px-4 py-4"
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
					<View className="mt-2 flex-row items-center justify-between gap-2">
						<Surface className="min-w-0 flex-1 rounded-2xl bg-content2 px-3 py-2">
							<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
								{getKindLabel(item.kind)}
							</Text.Paragraph>
						</Surface>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel="删除"
							isDisabled={isDeleting}
							onPress={(event) => {
								event.stopPropagation();
								fireHaptic();
								onDelete();
							}}
						>
							<Ionicons
								name="close"
								size={18}
								color={mutedColor || accentColor}
							/>
						</Button>
					</View>
				</View>
			</View>
		</PressableFeedback>
	);
}

function getKindLabel(kind: string) {
	if (kind === "collect") return "收藏";
	if (kind === "like") return "赞";
	if (kind === "follow") return "关注";
	return "评论";
}
