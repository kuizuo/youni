import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	Button,
	PressableFeedback,
	Skeleton,
	Text,
} from "heroui-native";
import { type StyleProp, View, type ViewStyle } from "react-native";
import Animated from "react-native-reanimated";

import { PROFILE_HERO_COLOR } from "@/components/profile/profile-tabs";

export function MeProfileHeader({
	avatarInitial,
	displayHandle,
	displayName,
	headerHeight,
	image,
	isAccountLoading,
	isProfileLoading,
	onMeasuredHeight,
	onOpenConnections,
	profile,
	topChromeHeight,
}: {
	avatarInitial: string;
	displayHandle: string;
	displayName: string;
	headerHeight: number;
	image?: null | string;
	isAccountLoading: boolean;
	isProfileLoading: boolean;
	onMeasuredHeight: (height: number) => void;
	onOpenConnections: (type: "followers" | "following") => void;
	profile?: {
		bio?: null | string;
		followerCount?: number;
		followingCount?: number;
		image?: null | string;
	};
	topChromeHeight: number;
}) {
	return (
		<View
			className="overflow-hidden"
			pointerEvents="box-none"
			style={{
				backgroundColor: PROFILE_HERO_COLOR,
				height: headerHeight,
			}}
		>
			<View
				className="mx-auto w-full max-w-xl gap-4 px-4 pb-5"
				style={{ paddingTop: topChromeHeight + 8 }}
				onLayout={(event) => {
					onMeasuredHeight(Math.ceil(event.nativeEvent.layout.height));
				}}
			>
				<View className="flex-row items-center gap-4">
					<View className="size-24 items-center justify-center overflow-hidden rounded-full border border-white/50 bg-black/20">
						{isAccountLoading ? (
							<Skeleton className="size-24 rounded-full" />
						) : (
							<Avatar size="lg" alt={displayName} className="size-24">
								{image ? <Avatar.Image source={{ uri: image }} /> : null}
								<Avatar.Fallback>{avatarInitial}</Avatar.Fallback>
							</Avatar>
						)}
					</View>

					<View className="min-w-0 flex-1 gap-2">
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
									style={{ color: "#ffffff", fontSize: 26 }}
								>
									{displayName}
								</Text.Paragraph>
								<Text.Paragraph
									type="body-sm"
									numberOfLines={1}
									style={{ color: "rgba(255, 255, 255, 0.7)" }}
								>
									{displayHandle}
								</Text.Paragraph>
							</>
						)}
					</View>
				</View>

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

				{profile?.bio ? (
					<Text.Paragraph
						className="leading-6"
						numberOfLines={2}
						style={{ color: "rgba(255, 255, 255, 0.82)" }}
					>
						{profile.bio}
					</Text.Paragraph>
				) : isProfileLoading ? (
					<View className="gap-2">
						<Skeleton className="h-3 w-4/5 rounded-full" />
						<Skeleton className="h-3 w-2/3 rounded-full" />
					</View>
				) : (
					<Text.Paragraph
						className="leading-6"
						style={{ color: "rgba(255, 255, 255, 0.72)" }}
					>
						点击编辑，填写简介
					</Text.Paragraph>
				)}
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
	onEdit: () => void;
	onMenu: () => void;
	onSearch: () => void;
	topChromeHeight: number;
}) {
	return (
		<View
			className="mx-auto w-full max-w-xl flex-row items-center justify-between px-4"
			style={{ paddingTop: topChromeHeight - 54 }}
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
				<Avatar size="sm" alt={displayName} className="border border-white">
					{image ? <Avatar.Image source={{ uri: image }} /> : null}
					<Avatar.Fallback>{avatarInitial}</Avatar.Fallback>
				</Avatar>
				<Text.Paragraph
					weight="bold"
					numberOfLines={1}
					style={{ color: "#ffffff" }}
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
			size="sm"
			variant="ghost"
			className="rounded-full bg-black/20"
			feedbackVariant="scale-ripple"
			accessibilityLabel={accessibilityLabel}
			isDisabled={isDisabled}
			onPress={onPress}
		>
			<Ionicons name={icon} size={23} color="#ffffff" />
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
					style={{ color: "#ffffff", fontVariant: ["tabular-nums"] }}
				>
					{value ?? 0}
				</Text.Paragraph>
			)}
			<Text.Paragraph
				type="body-sm"
				style={{ color: "rgba(255, 255, 255, 0.78)" }}
			>
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
