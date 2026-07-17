import { PressableFeedback, Typography } from "heroui-native";
import { View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

import {
	APP_HEADER_HEIGHT,
	APP_HEADER_TITLE_FONT_SIZE,
	AppHeader,
} from "@/components/shared/app-header";

import { HOME_TABS, type HomeTab } from "./types";

const HOME_TAB_WIDTH = 68;
const HOME_TAB_INDICATOR_WIDTH = 32;

export function HomeTopBar({
	activeTab,
	pageWidth,
	pagerScrollX,
	topInset,
	onTabChange,
}: {
	activeTab: HomeTab;
	pageWidth: number;
	pagerScrollX: SharedValue<number>;
	topInset: number;
	onTabChange: (tab: HomeTab) => void;
}) {
	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX:
					(pageWidth ? pagerScrollX.value / pageWidth : 0) * HOME_TAB_WIDTH,
			},
		],
	}));

	return (
		<AppHeader
			topInset={topInset}
			center={
				<View className="relative flex-row items-center">
					{HOME_TABS.map((item) => (
						<HomeTabButton
							key={item.id}
							isActive={item.id === activeTab}
							label={item.label}
							onPress={() => onTabChange(item.id)}
						/>
					))}
					<Animated.View
						pointerEvents="none"
						className="absolute bottom-4 left-0 h-1 rounded-full bg-accent"
						style={[
							{
								marginLeft: (HOME_TAB_WIDTH - HOME_TAB_INDICATOR_WIDTH) / 2,
								width: HOME_TAB_INDICATOR_WIDTH,
							},
							indicatorStyle,
						]}
					/>
				</View>
			}
		/>
	);
}

function HomeTabButton({
	isActive,
	label,
	onPress,
}: {
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityRole="tab"
			accessibilityState={isActive ? { selected: true } : undefined}
			className="items-center justify-center"
			style={{ height: APP_HEADER_HEIGHT, width: HOME_TAB_WIDTH }}
			onPress={onPress}
		>
			<Typography.Paragraph
				weight={isActive ? "bold" : "normal"}
				className={isActive ? "text-foreground" : "text-muted"}
				style={{ fontSize: APP_HEADER_TITLE_FONT_SIZE }}
			>
				{label}
			</Typography.Paragraph>
		</PressableFeedback>
	);
}
