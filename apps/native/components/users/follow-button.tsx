import { Ionicons } from "@expo/vector-icons";
import { Button, cn, useThemeColor } from "heroui-native";
import type { ComponentProps } from "react";

type FollowButtonProps = {
	className?: string;
	iconColor?: string;
	isDisabled?: boolean;
	isFollowing: boolean;
	labelClassName?: string;
	onPress: () => void;
	showIcon?: boolean;
	size?: ComponentProps<typeof Button>["size"];
	tone?: "default" | "hero";
};

export function FollowButton({
	className,
	iconColor,
	isDisabled,
	isFollowing,
	labelClassName,
	onPress,
	showIcon = false,
	size = "sm",
	tone = "default",
}: FollowButtonProps) {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const foregroundColor = useThemeColor("foreground");
	const isHero = tone === "hero";
	const isHeroFollowing = tone === "hero" && isFollowing;
	const resolvedIconColor =
		iconColor ??
		(isHero
			? "#ffffff"
			: isFollowing
				? foregroundColor
				: accentForegroundColor);

	return (
		<Button
			size={size}
			variant={isFollowing ? "outline" : "primary"}
			className={cn(
				isHeroFollowing ? "border border-white/35 bg-white/16" : null,
				className,
			)}
			feedbackVariant="scale-ripple"
			isDisabled={isDisabled}
			onPress={onPress}
		>
			{showIcon ? (
				<Ionicons
					name={isFollowing ? "checkmark-outline" : "person-add-outline"}
					size={16}
					color={resolvedIconColor}
				/>
			) : null}
			<Button.Label
				className={cn(isHero ? "text-white" : null, labelClassName)}
			>
				{isFollowing ? "已关注" : "关注"}
			</Button.Label>
		</Button>
	);
}
