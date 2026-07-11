import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
	Avatar,
	Button,
	PressableFeedback,
	Skeleton,
	Text,
} from "heroui-native";
import { Platform, type StyleProp, View, type ViewStyle } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

import {
	PROFILE_COVER_FALLBACK_COLOR,
	PROFILE_COVER_GRADIENT,
} from "@/components/profile/profile-tabs";

const ME_HEADER_ICON_SIZE = 18;

export function MeProfileHeader({
	avatarInitial,
	backgroundColor,
	coverImage,
	displayHandle,
	displayName,
	headerHeight,
	image,
	isAccountLoading,
	isChangingCover,
	isProfileLoading,
	onMeasuredHeight,
	onAvatarPress,
	onCoverPress,
	onOpenConnections,
	profile,
	scrollY,
	topChromeHeight,
}: {
	avatarInitial: string;
	backgroundColor: string;
	coverImage?: null | string;
	displayHandle: string;
	displayName: string;
	headerHeight: number;
	image?: null | string;
	isAccountLoading: boolean;
	isChangingCover: boolean;
	isProfileLoading: boolean;
	onMeasuredHeight: (height: number) => void;
	onAvatarPress: () => void;
	onCoverPress: () => void;
	onOpenConnections: (type: "followers" | "following") => void;
	profile?: {
		bio?: null | string;
		followerCount?: number;
		followingCount?: number;
		image?: null | string;
	};
	scrollY: SharedValue<number>;
	topChromeHeight: number;
}) {
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
			style={{
				backgroundColor,
				height: headerHeight,
			}}
		>
			<View
				className="mx-auto w-full max-w-xl"
				onLayout={(event) => {
					onMeasuredHeight(Math.ceil(event.nativeEvent.layout.height));
				}}
			>
				<Animated.View style={[{ height: coverHeight }, coverStretchStyle]}>
					<PressableFeedback
						accessibilityLabel={
							coverImage ? "查看个人资料背景图" : "选择个人资料背景图"
						}
						accessibilityRole="button"
						accessibilityState={{ disabled: isChangingCover }}
						isDisabled={isChangingCover}
						onPress={onCoverPress}
						className="relative flex-1 overflow-hidden"
						style={{
							backgroundColor: PROFILE_COVER_FALLBACK_COLOR,
							experimental_backgroundImage: coverImage
								? undefined
								: PROFILE_COVER_GRADIENT,
						}}
					>
						{coverImage ? (
							<Image
								source={{ uri: coverImage }}
								contentFit="cover"
								style={{ height: "100%", width: "100%" }}
							/>
						) : null}
						<PressableFeedback.Highlight className="bg-black/10" />
					</PressableFeedback>
				</Animated.View>

				<View className="gap-2 px-4 pb-3" style={{ backgroundColor }}>
					<View className="flex-row items-end" style={{ marginTop: -36 }}>
						<Button
							isIconOnly
							variant="ghost"
							className="size-18 rounded-full p-0"
							accessibilityLabel="查看头像"
							feedbackVariant={Platform.OS === "web" ? "scale" : "scale-ripple"}
							isDisabled={isAccountLoading}
							onPress={onAvatarPress}
						>
							<View className="size-18 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-content2">
								{isAccountLoading ? (
									<Skeleton className="size-18 rounded-full" />
								) : (
									<Avatar size="lg" alt={displayName} className="size-18">
										{image ? <Avatar.Image source={{ uri: image }} /> : null}
										<Avatar.Fallback>{avatarInitial}</Avatar.Fallback>
									</Avatar>
								)}
							</View>
						</Button>
					</View>

					<View className="gap-0.5">
						{isAccountLoading ? (
							<>
								<Skeleton className="h-6 w-24 rounded-full" />
								<Skeleton className="h-4 w-36 rounded-full" />
							</>
						) : (
							<>
								<Text.Paragraph
									weight="bold"
									numberOfLines={1}
									className="text-foreground"
									style={{ fontSize: 24, lineHeight: 30 }}
								>
									{displayName}
								</Text.Paragraph>
								<Text.Paragraph
									type="body-sm"
									numberOfLines={1}
									className="text-muted"
								>
									{displayHandle}
								</Text.Paragraph>
							</>
						)}
					</View>

					{profile?.bio ? (
						<Text.Paragraph
							className="text-foreground leading-5"
							numberOfLines={2}
						>
							{profile.bio}
						</Text.Paragraph>
					) : isProfileLoading ? (
						<View className="gap-2">
							<Skeleton className="h-3 w-4/5 rounded-full" />
							<Skeleton className="h-3 w-2/3 rounded-full" />
						</View>
					) : (
						<Text.Paragraph className="text-muted leading-5">
							点击编辑，填写简介
						</Text.Paragraph>
					)}

					<View className="flex-row items-center gap-6">
						<HeroStat
							isLoading={isProfileLoading}
							label="关注"
							onPress={() => onOpenConnections("following")}
							value={profile?.followingCount}
						/>
						<HeroStat
							isLoading={isProfileLoading}
							label="粉丝"
							onPress={() => onOpenConnections("followers")}
							value={profile?.followerCount}
						/>
					</View>
				</View>
			</View>
		</View>
	);
}

export function MeProfileTopChrome({
	avatarInitial,
	displayName,
	image,
	isEditDisabled,
	miniProfileStyle,
	onAvatarPress,
	onEdit,
	onMenu,
	onSearch,
	topChromeHeight,
}: {
	avatarInitial: string;
	displayName: string;
	image?: null | string;
	isEditDisabled: boolean;
	miniProfileStyle: StyleProp<ViewStyle>;
	onAvatarPress: () => void;
	onEdit: () => void;
	onMenu: () => void;
	onSearch: () => void;
	topChromeHeight: number;
}) {
	return (
		<View
			className="mx-auto w-full max-w-xl flex-row items-center justify-between px-4"
			style={{ paddingTop: topChromeHeight - 50 }}
		>
			<HeaderIconButton
				accessibilityLabel="打开更多菜单"
				icon="menu-outline"
				onPress={onMenu}
			/>

			<Animated.View
				className="min-w-0 flex-1 flex-row items-center justify-center gap-2 px-3"
				style={miniProfileStyle}
			>
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="size-7 rounded-full p-0"
					accessibilityLabel="查看头像"
					feedbackVariant="scale-ripple"
					onPress={onAvatarPress}
				>
					<Avatar
						size="sm"
						alt={displayName}
						className="size-7 border border-white"
					>
						{image ? <Avatar.Image source={{ uri: image }} /> : null}
						<Avatar.Fallback>{avatarInitial}</Avatar.Fallback>
					</Avatar>
				</Button>
				<Text.Paragraph
					weight="bold"
					numberOfLines={1}
					style={{ color: "#ffffff", lineHeight: 22 }}
				>
					{displayName}
				</Text.Paragraph>
			</Animated.View>

			<View className="flex-row items-center gap-2">
				<HeaderIconButton
					accessibilityLabel="搜索"
					icon="search-outline"
					onPress={onSearch}
				/>
				<HeaderIconButton
					accessibilityLabel="编辑资料"
					icon="pencil-outline"
					isDisabled={isEditDisabled}
					onPress={onEdit}
				/>
			</View>
		</View>
	);
}

function HeaderIconButton({
	accessibilityLabel,
	icon,
	isDisabled,
	onPress,
}: {
	accessibilityLabel: string;
	icon: keyof typeof Ionicons.glyphMap;
	isDisabled?: boolean;
	onPress: () => void;
}) {
	return (
		<Button
			isIconOnly
			variant="ghost"
			className="size-9 rounded-full bg-black/20"
			feedbackVariant="scale-ripple"
			accessibilityLabel={accessibilityLabel}
			isDisabled={isDisabled}
			onPress={onPress}
		>
			<Ionicons name={icon} size={ME_HEADER_ICON_SIZE} color="#ffffff" />
		</Button>
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
				<Text.Paragraph
					weight="bold"
					className="text-foreground"
					style={{ fontVariant: ["tabular-nums"] }}
				>
					{value ?? 0}
				</Text.Paragraph>
			)}
			<Text.Paragraph type="body-sm" className="text-muted">
				{label}
			</Text.Paragraph>
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
