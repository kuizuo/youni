import { Avatar, Button, PressableFeedback, Text } from "heroui-native";
import { View } from "react-native";

import type { ConnectionType, ConnectionUser } from "./types";

export function ConnectionRow({
	activeType,
	currentUserId,
	item,
	onOpenUser,
	onToggleFollow,
}: {
	activeType: ConnectionType;
	currentUserId?: string;
	item: ConnectionUser;
	onOpenUser: (id: string) => void;
	onToggleFollow: (item: ConnectionUser) => void;
}) {
	const isSelf = currentUserId === item.id;

	const openUser = () => {
		onOpenUser(item.id);
	};

	const toggleFollow = () => {
		if (isSelf) return;
		onToggleFollow(item);
	};

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`查看 ${item.name} 的主页`}
			className="flex-row items-center gap-3 px-4 py-3"
			onPress={openUser}
		>
			<Avatar size="md" alt={item.name}>
				{item.image ? <Avatar.Image source={{ uri: item.image }} /> : null}
				<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
			</Avatar>
			<View className="min-w-0 flex-1 gap-1">
				<Text.Paragraph
					weight="semibold"
					numberOfLines={1}
					className="text-foreground"
				>
					{item.name}
				</Text.Paragraph>
				<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
					{getConnectionSummary(item, activeType)}
				</Text.Paragraph>
			</View>
			{isSelf ? null : (
				<Button
					size="sm"
					variant={item.isFollowing ? "outline" : "primary"}
					className="rounded-full px-4"
					feedbackVariant="scale-ripple"
					onPress={toggleFollow}
				>
					<Button.Label>{item.isFollowing ? "已关注" : "关注"}</Button.Label>
				</Button>
			)}
		</PressableFeedback>
	);
}

function getConnectionSummary(
	item: ConnectionUser,
	activeType: ConnectionType,
) {
	if (activeType === "following") {
		return item.bio?.trim() || "暂无简介";
	}

	return `笔记 ${item.noteCount} · 粉丝 ${item.followerCount}`;
}
