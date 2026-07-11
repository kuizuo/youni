import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	Button,
	PressableFeedback,
	Skeleton,
	Spinner,
	Typography,
} from "heroui-native";
import { View } from "react-native";

import { FollowButton } from "@/components/users/follow-button";

import { PROFILE_HEADER_HEIGHT, PROFILE_HERO_COLOR } from "./constants";
import type { UserProfileData } from "./types";

export function UserProfileHero({
	displayHandle,
	displayName,
	isFollowing,
	isLoading,
	isSelf,
	isStartChatPending,
	onOpenChat,
	onOpenConnections,
	onOpenMe,
	onToggleFollow,
	profile,
	topChromeHeight,
	topInset,
}: {
	displayHandle: string;
	displayName: string;
	isFollowing: boolean;
	isLoading: boolean;
	isSelf: boolean;
	isStartChatPending: boolean;
	onOpenChat: () => void;
	onOpenConnections: (type: "followers" | "following") => void;
	onOpenMe: () => void;
	onToggleFollow: () => void;
	profile?: UserProfileData;
	topChromeHeight: number;
	topInset: number;
}) {
	return (
		<View
			className="overflow-hidden"
			style={{
				backgroundColor: PROFILE_HERO_COLOR,
				minHeight: PROFILE_HEADER_HEIGHT + topInset,
				paddingTop: topChromeHeight,
			}}
		>
			<View className="mx-auto w-full max-w-xl gap-5 px-4 pb-8">
				<View className="flex-row items-center gap-4">
					<View className="size-24 items-center justify-center overflow-hidden rounded-full border border-white/50 bg-black/20">
						{isLoading || !profile ? (
							<Skeleton className="size-24 rounded-full" />
						) : (
							<Avatar size="lg" alt={displayName} className="size-24">
								{profile.image ? (
									<Avatar.Image source={{ uri: profile.image }} />
								) : null}
								<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
							</Avatar>
						)}
					</View>

					<View className="min-w-0 flex-1 gap-2">
						{isLoading || !profile ? (
							<>
								<Skeleton className="h-6 w-24 rounded-full" />
								<Skeleton className="h-4 w-36 rounded-full" />
							</>
						) : (
							<>
								<Typography.Paragraph
									weight="bold"
									numberOfLines={1}
									style={{ color: "#ffffff", fontSize: 26 }}
								>
									{displayName}
								</Typography.Paragraph>
								<Typography.Paragraph
									type="body-sm"
									numberOfLines={1}
									style={{ color: "rgba(255, 255, 255, 0.7)" }}
								>
									{displayHandle}
								</Typography.Paragraph>
							</>
						)}
					</View>
				</View>

				<View className="flex-row items-center gap-6">
					<HeroStat
						isLoading={isLoading}
						label="关注"
						value={profile?.followingCount}
						onPress={() => onOpenConnections("following")}
					/>
					<HeroStat
						isLoading={isLoading}
						label="粉丝"
						value={profile?.followerCount}
						onPress={() => onOpenConnections("followers")}
					/>
					<HeroStat
						isLoading={isLoading}
						label="获赞与收藏"
						value={profile?.likedCount}
					/>
				</View>

				{profile?.bio ? (
					<Typography.Paragraph
						className="leading-6"
						style={{ color: "rgba(255, 255, 255, 0.82)" }}
					>
						{profile.bio}
					</Typography.Paragraph>
				) : isLoading ? (
					<View className="gap-2">
						<Skeleton className="h-3 w-4/5 rounded-full" />
						<Skeleton className="h-3 w-2/3 rounded-full" />
					</View>
				) : null}

				<View className="flex-row gap-2">
					{isSelf ? (
						<Button
							variant="secondary"
							className="flex-1 rounded-full bg-white/15"
							feedbackVariant="scale-ripple"
							onPress={onOpenMe}
						>
							<Ionicons name="person-outline" size={16} color="#ffffff" />
							<Button.Label className="text-white">回到我的主页</Button.Label>
						</Button>
					) : (
						<>
							<FollowButton
								className="h-12 flex-1 rounded-full"
								isFollowing={isFollowing}
								showIcon
								size="md"
								tone="hero"
								onPress={onToggleFollow}
							/>
							<Button
								variant="secondary"
								className="flex-1 rounded-full bg-white/15"
								feedbackVariant="scale-ripple"
								isDisabled={isStartChatPending}
								onPress={onOpenChat}
							>
								{isStartChatPending ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name="chatbubble-ellipses-outline"
										size={16}
										color="#ffffff"
									/>
								)}
								<Button.Label className="text-white">发私信</Button.Label>
							</Button>
						</>
					)}
				</View>
			</View>
		</View>
	);
}

function HeroStat({
	isLoading,
	label,
	onPress,
	value,
}: {
	isLoading: boolean;
	label: string;
	onPress?: () => void;
	value?: number;
}) {
	const content = (
		<View className="flex-row items-baseline gap-1">
			{isLoading ? (
				<Skeleton className="h-5 w-8 rounded-full" />
			) : (
				<Typography.Paragraph
					weight="bold"
					style={{ color: "#ffffff", fontVariant: ["tabular-nums"] }}
				>
					{value ?? 0}
				</Typography.Paragraph>
			)}
			<Typography.Paragraph
				type="body-sm"
				style={{ color: "rgba(255, 255, 255, 0.78)" }}
			>
				{label}
			</Typography.Paragraph>
		</View>
	);

	if (!onPress) return content;

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`查看${label}`}
			onPress={onPress}
		>
			{content}
		</PressableFeedback>
	);
}
