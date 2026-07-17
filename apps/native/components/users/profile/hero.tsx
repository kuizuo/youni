import { Ionicons } from "@expo/vector-icons";
import type {
	ProfileConnectionType,
	ProfileUser,
} from "@youni/api/contracts/profiles";
import { Image } from "expo-image";
import {
	Avatar,
	Button,
	PressableFeedback,
	Skeleton,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

import {
	PROFILE_COVER_FALLBACK_COLOR,
	PROFILE_COVER_GRADIENT,
} from "@/components/profile/profile-tabs";
import { FollowButton } from "@/components/users/follow-button";

type UserProfileHeroData = Pick<ProfileUser, "bio" | "coverImage" | "image"> &
	Partial<Pick<ProfileUser, "followerCount" | "followingCount" | "likedCount">>;

export function UserProfileHero({
	displayHandle,
	displayName,
	isFollowing,
	isIdentityLoading,
	isLoading,
	isSelf,
	onOpenChat,
	onOpenConnections,
	onOpenMe,
	onToggleFollow,
	onMeasuredHeight,
	profile,
	headerHeight,
	scrollY,
	topChromeHeight,
}: {
	displayHandle: string;
	displayName: string;
	isFollowing: boolean;
	isIdentityLoading: boolean;
	isLoading: boolean;
	isSelf: boolean;
	onOpenChat: () => void;
	onOpenConnections: (type: ProfileConnectionType) => void;
	onOpenMe: () => void;
	onToggleFollow: () => void;
	onMeasuredHeight: (height: number) => void;
	profile?: UserProfileHeroData;
	headerHeight: number;
	scrollY: SharedValue<number>;
	topChromeHeight: number;
}) {
	const backgroundColor = useThemeColor("background");
	const foregroundColor = useThemeColor("foreground");
	const coverHeight = topChromeHeight + 48;
	const coverStretchStyle = useAnimatedStyle(() => {
		const pullDistance = Math.max(0, -scrollY.value);

		return {
			transform: [
				{ translateY: -pullDistance / 2 },
				{ scale: 1 + pullDistance / coverHeight },
			],
		};
	}, [coverHeight]);

	return (
		<View
			pointerEvents="box-none"
			style={{ backgroundColor, height: headerHeight }}
		>
			<View
				className="mx-auto w-full max-w-xl"
				onLayout={(event) => {
					onMeasuredHeight(Math.ceil(event.nativeEvent.layout.height));
				}}
			>
				<Animated.View
					className="overflow-hidden"
					style={[
						{
							backgroundColor: PROFILE_COVER_FALLBACK_COLOR,
							experimental_backgroundImage: profile?.coverImage
								? undefined
								: PROFILE_COVER_GRADIENT,
							height: coverHeight,
						},
						coverStretchStyle,
					]}
				>
					{profile?.coverImage ? (
						<Image
							accessibilityLabel={`${displayName}的个人资料背景图`}
							contentFit="cover"
							source={{ uri: profile.coverImage }}
							style={{ height: "100%", width: "100%" }}
						/>
					) : null}
				</Animated.View>

				<View className="gap-2 px-4 pb-3" style={{ backgroundColor }}>
					<View style={{ marginTop: -36 }}>
						<View className="size-18 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-content2">
							{isIdentityLoading || !profile ? (
								<Skeleton className="size-18 rounded-full" />
							) : (
								<Avatar size="lg" alt={displayName} className="size-18">
									{profile.image ? (
										<Avatar.Image source={{ uri: profile.image }} />
									) : null}
									<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
								</Avatar>
							)}
						</View>
					</View>

					<View className="min-w-0 gap-0.5">
						{isIdentityLoading || !profile ? (
							<>
								<Skeleton className="h-6 w-24 rounded-full" />
								<Skeleton className="h-4 w-36 rounded-full" />
							</>
						) : (
							<>
								<Typography.Paragraph
									weight="bold"
									numberOfLines={1}
									className="text-foreground"
									style={{ fontSize: 24, lineHeight: 30 }}
								>
									{displayName}
								</Typography.Paragraph>
								<Typography.Paragraph
									type="body-sm"
									numberOfLines={1}
									className="text-muted"
								>
									{displayHandle}
								</Typography.Paragraph>
							</>
						)}
					</View>

					{profile?.bio ? (
						<Typography.Paragraph
							className="text-foreground leading-5"
							numberOfLines={2}
						>
							{profile.bio}
						</Typography.Paragraph>
					) : isIdentityLoading ? (
						<View className="gap-2">
							<Skeleton className="h-3 w-4/5 rounded-full" />
							<Skeleton className="h-3 w-2/3 rounded-full" />
						</View>
					) : (
						<Typography.Paragraph className="text-muted leading-5">
							这位用户还没有填写简介
						</Typography.Paragraph>
					)}

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
							label="获赞"
							value={profile?.likedCount}
						/>
					</View>

					<View className="flex-row gap-2 pt-1">
						{isSelf ? (
							<Button
								variant="outline"
								className="h-11 flex-1 rounded-full"
								feedbackVariant="scale-ripple"
								isDisabled={isLoading}
								onPress={onOpenMe}
							>
								<Ionicons
									name="person-outline"
									size={16}
									color={foregroundColor}
								/>
								<Button.Label>我的主页</Button.Label>
							</Button>
						) : (
							<>
								<FollowButton
									className="h-11 flex-1 rounded-full"
									iconColor={isFollowing ? undefined : "#ffffff"}
									isDisabled={isLoading}
									isFollowing={isFollowing}
									labelClassName={isFollowing ? undefined : "text-white"}
									showIcon
									size="md"
									onPress={onToggleFollow}
								/>
								<Button
									variant="outline"
									className="h-11 flex-1 rounded-full"
									feedbackVariant="scale-ripple"
									isDisabled={isLoading}
									onPress={onOpenChat}
								>
									<Ionicons
										name="chatbubble-ellipses-outline"
										size={16}
										color={foregroundColor}
									/>
									<Button.Label>私信</Button.Label>
								</Button>
							</>
						)}
					</View>
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
		<View className="flex-row items-center gap-1">
			<View className="h-6 min-w-8 items-center justify-center">
				{isLoading ? (
					<Skeleton className="h-4 w-7 rounded-full" />
				) : (
					<Typography.Paragraph
						weight="bold"
						className="text-foreground"
						style={{ fontVariant: ["tabular-nums"] }}
					>
						{value ?? 0}
					</Typography.Paragraph>
				)}
			</View>
			<Typography.Paragraph type="body-sm" className="text-muted">
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
