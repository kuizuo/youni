import { Ionicons } from "@expo/vector-icons";
import { Avatar, Button } from "heroui-native";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { PROFILE_HERO_COLOR } from "@/components/profile/profile-tabs";
import { FollowButton } from "@/components/users/follow-button";
import {
	ProfileTopBar,
	ProfileTopBarIconButton,
} from "@/components/users/profile/top-bar";

export function UserProfileStickyChrome({
	displayName,
	image,
	isFollowing,
	isLoading,
	isSelf,
	isSticky,
	miniProfileStyle,
	onBack,
	onMore,
	onOpenMe,
	onToggleFollow,
	style,
	topChromeHeight,
}: {
	displayName: string;
	image?: null | string;
	isFollowing: boolean;
	isLoading: boolean;
	isSelf: boolean;
	isSticky: boolean;
	miniProfileStyle: StyleProp<ViewStyle>;
	onBack: () => void;
	onMore: () => void;
	onOpenMe: () => void;
	onToggleFollow: () => void;
	style: StyleProp<ViewStyle>;
	topChromeHeight: number;
}) {
	return (
		<Animated.View
			className="absolute top-0 right-0 left-0"
			pointerEvents="box-none"
			style={{ height: topChromeHeight, zIndex: 20 }}
		>
			<Animated.View
				className="absolute inset-0"
				pointerEvents="none"
				style={[{ backgroundColor: PROFILE_HERO_COLOR }, style]}
			/>

			<View
				className="mx-auto w-full max-w-xl px-4"
				style={{ paddingTop: topChromeHeight - 50 }}
			>
				<ProfileTopBar
					center={
						<Animated.View style={miniProfileStyle}>
							<Avatar
								size="sm"
								alt={displayName}
								className="size-7 border border-white"
							>
								{image ? <Avatar.Image source={{ uri: image }} /> : null}
								<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
							</Avatar>
						</Animated.View>
					}
					right={
						<View className="flex-row items-center gap-2">
							<Animated.View
								pointerEvents={isSticky ? "auto" : "none"}
								style={miniProfileStyle}
							>
								{isSelf ? (
									<Button
										size="sm"
										variant="secondary"
										className="h-9 rounded-full bg-white/15"
										feedbackVariant="scale-ripple"
										onPress={onOpenMe}
									>
										<Ionicons name="person-outline" size={15} color="#ffffff" />
										<Button.Label className="text-white">我的主页</Button.Label>
									</Button>
								) : (
									<FollowButton
										className="h-9 rounded-full px-5"
										isDisabled={isLoading}
										isFollowing={isFollowing}
										size="sm"
										tone="hero"
										onPress={onToggleFollow}
									/>
								)}
							</Animated.View>
							<ProfileTopBarIconButton
								accessibilityLabel="更多操作"
								icon="ellipsis-horizontal"
								onPress={onMore}
							/>
						</View>
					}
					onBack={onBack}
				/>
			</View>
		</Animated.View>
	);
}
