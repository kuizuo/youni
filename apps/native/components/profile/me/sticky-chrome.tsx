import Animated, { type AnimatedStyle } from "react-native-reanimated";

import { MeProfileTopChrome } from "@/components/profile/me-profile-header";
import { PROFILE_HERO_COLOR } from "@/components/profile/profile-tabs";

export function MeStickyChrome({
	avatarInitial,
	displayName,
	image,
	isEditDisabled,
	miniProfileStyle,
	style,
	topChromeHeight,
	onAvatarPress,
	onEdit,
	onMenu,
	onSearch,
}: {
	avatarInitial: string;
	displayName: string;
	image?: null | string;
	isEditDisabled: boolean;
	miniProfileStyle: AnimatedStyle;
	style: AnimatedStyle;
	topChromeHeight: number;
	onAvatarPress: () => void;
	onEdit: () => void;
	onMenu: () => void;
	onSearch: () => void;
}) {
	return (
		<Animated.View
			className="absolute top-0 right-0 left-0"
			pointerEvents="box-none"
			style={[
				{
					backgroundColor: PROFILE_HERO_COLOR,
					height: topChromeHeight,
					zIndex: 20,
				},
				style,
			]}
		>
			<MeProfileTopChrome
				avatarInitial={avatarInitial}
				displayName={displayName}
				image={image}
				isEditDisabled={isEditDisabled}
				miniProfileStyle={miniProfileStyle}
				topChromeHeight={topChromeHeight}
				onAvatarPress={onAvatarPress}
				onEdit={onEdit}
				onMenu={onMenu}
				onSearch={onSearch}
			/>
		</Animated.View>
	);
}
