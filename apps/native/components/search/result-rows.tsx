import { Ionicons } from "@expo/vector-icons";
import type { ProfileUser } from "@youni/api/contracts/profiles";
import type { TopicSearchItem } from "@youni/api/contracts/topics";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

import { FollowButton } from "@/components/users/follow-button";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { formatCount } from "@/utils/format";

export function UserResultRow({
	currentUserId,
	item,
	onToggleFollow,
}: {
	currentUserId?: string;
	item: ProfileUser;
	onToggleFollow: (item: ProfileUser) => void;
}) {
	const router = useRouter();
	const socialNavigation = useSocialNavigation();
	const isSelf = currentUserId === item.id;

	const openProfile = () => {
		socialNavigation.goTo({ type: "user", id: item.id });
	};

	return (
		<View className="flex-row items-start gap-3 px-4 py-4">
			<PressableFeedback
				accessibilityRole="button"
				accessibilityLabel={`查看 ${item.name} 的主页`}
				className="min-w-0 flex-1 flex-row items-start gap-3"
				onPress={openProfile}
			>
				<Avatar size="md" alt={item.name}>
					{item.image ? <Avatar.Image source={{ uri: item.image }} /> : null}
					<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
				</Avatar>

				<View className="min-w-0 flex-1 gap-1">
					<Typography.Paragraph
						weight="semibold"
						numberOfLines={1}
						className="text-foreground"
					>
						{item.name}
					</Typography.Paragraph>

					{item.bio ? (
						<Typography.Paragraph
							type="body-sm"
							numberOfLines={2}
							className="text-foreground leading-5"
						>
							{item.bio}
						</Typography.Paragraph>
					) : null}

					<View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
						<UserMetric label="作品" value={item.noteCount} />
						<UserMetric label="粉丝" value={item.followerCount} />
					</View>
				</View>
			</PressableFeedback>

			{isSelf ? (
				<Button
					size="sm"
					variant="secondary"
					className="rounded-full px-3"
					feedbackVariant="scale-ripple"
					onPress={() => router.push("/me" as Href)}
				>
					<Button.Label>我</Button.Label>
				</Button>
			) : (
				<FollowButton
					size="sm"
					className="rounded-full px-4"
					isFollowing={item.isFollowing}
					onPress={() => onToggleFollow(item)}
				/>
			)}
		</View>
	);
}

export function TopicResultRow({
	item,
	onPress,
}: {
	item: TopicSearchItem;
	onPress: (topicId: string) => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`查看话题 ${item.name}`}
			className="flex-row items-center gap-3 px-4 py-4"
			onPress={() => onPress(item.id)}
		>
			<View className="size-12 items-center justify-center rounded-full bg-content2">
				<Ionicons name="pricetag-outline" size={22} color={mutedColor} />
			</View>
			<View className="min-w-0 flex-1 gap-1">
				<Typography.Paragraph
					weight="semibold"
					numberOfLines={1}
					className="text-foreground"
				>
					#{item.name}
				</Typography.Paragraph>
				<Typography.Paragraph type="body-sm" color="muted">
					{formatCount(item.noteCount)} 篇图文
					{item.discussionCount > 0
						? ` · ${formatCount(item.discussionCount)} 条讨论`
						: ""}
				</Typography.Paragraph>
			</View>
			<Ionicons name="chevron-forward" size={18} color={mutedColor} />
		</PressableFeedback>
	);
}

function UserMetric({ label, value }: { label: string; value: number }) {
	return (
		<Typography.Paragraph type="body-xs" color="muted">
			{formatCount(value)} {label}
		</Typography.Paragraph>
	);
}
