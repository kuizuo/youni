import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	PressableFeedback,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { formatRelativeTime } from "@/utils/format";

import type { ConversationItem } from "./types";

export function ConversationRow({ item }: { item: ConversationItem }) {
	const socialNavigation = useSocialNavigation();
	const mutedColor = useThemeColor("muted");
	const lastMessage = item.lastMessage?.content ?? "尚未开始聊天";

	const openChat = () => {
		fireHaptic();
		socialNavigation.goTo({ type: "chat", id: item.id });
	};

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`打开与 ${item.peer.name} 的聊天`}
			className="flex-row items-center gap-3 px-4 py-4"
			onPress={openChat}
		>
			<Avatar size="lg" alt={item.peer.name}>
				{item.peer.image ? (
					<Avatar.Image source={{ uri: item.peer.image }} />
				) : null}
				<Avatar.Fallback>{item.peer.name.slice(0, 1)}</Avatar.Fallback>
			</Avatar>
			<View className="min-w-0 flex-1 gap-1">
				<View className="flex-row items-center gap-2">
					<Typography.Paragraph
						weight="semibold"
						className="min-w-0 flex-1 text-foreground"
						numberOfLines={1}
					>
						{item.peer.name}
					</Typography.Paragraph>
					<Typography.Paragraph type="body-xs" color="muted">
						{formatRelativeTime(
							item.lastMessage?.createdAt ?? item.updatedAt,
							"暂无",
						)}
					</Typography.Paragraph>
				</View>
				<Typography.Paragraph type="body-sm" color="muted" numberOfLines={1}>
					{lastMessage}
				</Typography.Paragraph>
			</View>
			{item.unreadCount > 0 ? (
				<View className="min-w-6 items-center rounded-full bg-accent px-2 py-1">
					<Typography.Paragraph
						type="body-xs"
						weight="semibold"
						className="text-accent-foreground"
					>
						{item.unreadCount > 99 ? "99+" : item.unreadCount}
					</Typography.Paragraph>
				</View>
			) : (
				<Ionicons name="chevron-forward" size={18} color={mutedColor} />
			)}
		</PressableFeedback>
	);
}
