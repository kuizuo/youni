import { PressableFeedback, Text } from "heroui-native";
import { View } from "react-native";

import {
	APP_HEADER_HEIGHT,
	APP_HEADER_TITLE_FONT_SIZE,
	AppHeader,
} from "@/components/shared/app-header";

import { HOME_TABS, type HomeTab } from "./types";

export function HomeTopBar({
	activeTab,
	topInset,
	onTabChange,
}: {
	activeTab: HomeTab;
	topInset: number;
	onTabChange: (tab: HomeTab) => void;
}) {
	return (
		<AppHeader
			topInset={topInset}
			center={
				<View className="flex-row items-center gap-9">
					{HOME_TABS.map((item) => (
						<HomeTabButton
							key={item.id}
							isActive={item.id === activeTab}
							label={item.label}
							onPress={() => onTabChange(item.id)}
						/>
					))}
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
			className="items-center justify-center px-1"
			style={{ height: APP_HEADER_HEIGHT }}
			onPress={onPress}
		>
			<Text.Paragraph
				weight={isActive ? "bold" : "normal"}
				className={isActive ? "text-foreground" : "text-muted"}
				style={{ fontSize: APP_HEADER_TITLE_FONT_SIZE }}
			>
				{label}
			</Text.Paragraph>
			<View
				className={
					isActive
						? "mt-1 h-1 w-8 rounded-full bg-accent"
						: "mt-1 h-1 w-8 rounded-full bg-transparent"
				}
			/>
		</PressableFeedback>
	);
}
