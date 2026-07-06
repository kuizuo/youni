import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	Button,
	cn,
	PressableFeedback,
	Text,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

import type { ConnectionUser } from "./types";

export function ConnectionRow({
	currentUserId,
	isPending,
	item,
	onOpenUser,
	onToggleFollow,
}: {
	currentUserId?: string;
	isPending: boolean;
	item: ConnectionUser;
	onOpenUser: (id: string) => void;
	onToggleFollow: (item: ConnectionUser) => void;
}) {
	const mutedColor = useThemeColor("muted");
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
					{getConnectionSummary(item)}
				</Text.Paragraph>
			</View>
			{isSelf ? null : (
				<Button
					size="sm"
					variant={item.isFollowing ? "secondary" : "primary"}
					className={cn("rounded-full px-4", isPending && "opacity-70")}
					feedbackVariant="scale-ripple"
					isDisabled={isPending}
					onPress={toggleFollow}
				>
					<Ionicons
						name={item.isFollowing ? "checkmark-outline" : "person-add-outline"}
						size={15}
						color={mutedColor}
					/>
					<Button.Label>{item.isFollowing ? "已关注" : "关注"}</Button.Label>
				</Button>
			)}
		</PressableFeedback>
	);
}

function getConnectionSummary(item: ConnectionUser) {
	const stats = [
		item.noteCount ? `笔记 ${item.noteCount}` : null,
		item.followerCount ? `粉丝 ${item.followerCount}` : null,
	]
		.filter(Boolean)
		.join(" · ");

	return stats || item.bio || (item.handle ? `@${item.handle}` : item.email);
}
