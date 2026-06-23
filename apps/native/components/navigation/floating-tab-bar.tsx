import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { type Href, router } from "expo-router";
import {
	cn,
	PressableFeedback,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SingleColorIcon } from "@/components/icons/single-color";
import { TABS } from "@/lib/config/tabs";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export const TAB_BAR_SAFE_OFFSET_ADDON_PX = 12;

export function FloatingTabBar({ navigation, state }: BottomTabBarProps) {
	const insets = useSafeAreaInsets();
	const backgroundColor = useThemeColor("background");

	return (
		<View
			style={{
				pointerEvents: "box-none",
				position: "absolute",
				left: 0,
				right: 0,
				bottom: insets.bottom + TAB_BAR_SAFE_OFFSET_ADDON_PX,
				alignItems: "center",
			}}
		>
			<Surface
				variant="default"
				className="flex-row items-center gap-1 rounded-full p-1.5 shadow-overlay"
			>
				{state.routes.map((route, index) => {
					const config = TABS.find((tab) => tab.name === route.name);
					if (!config) {
						return null;
					}

					const isFocused = state.index === index;

					const handlePress = (): void => {
						fireHaptic();
						if (config.isCreateAction) {
							router.push("/publish" as Href);
							return;
						}

						const event = navigation.emit({
							type: "tabPress",
							target: route.key,
							canPreventDefault: true,
						});

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name, route.params);
						}
					};

					const handleLongPress = (): void => {
						navigation.emit({ type: "tabLongPress", target: route.key });
					};

					return (
						<PressableFeedback
							key={route.key}
							accessibilityLabel={config.label}
							accessibilityRole="button"
							accessibilityState={isFocused ? { selected: true } : {}}
							hitSlop={6}
							onLongPress={handleLongPress}
							onPress={handlePress}
							className={cn(
								"h-11 flex-row items-center justify-center rounded-full",
								config.isCreateAction
									? "w-12 bg-foreground shadow-sm"
									: undefined,
								!config.isCreateAction && isFocused
									? "w-20 gap-1.5 bg-accent px-3 shadow-sm"
									: !config.isCreateAction
										? "w-12 bg-transparent"
										: undefined,
							)}
						>
							<PressableFeedback.Highlight />
							<SingleColorIcon
								name={isFocused ? config.iconFocusedName : config.iconName}
								size={22}
								color={config.isCreateAction ? backgroundColor : undefined}
								colorClassName={
									config.isCreateAction
										? "text-background"
										: isFocused
											? "text-accent-foreground"
											: "text-muted"
								}
							/>
							{!config.isCreateAction && isFocused ? (
								<Text.Paragraph
									type="body-xs"
									weight="semibold"
									numberOfLines={1}
									className="text-accent-foreground"
								>
									{config.label}
								</Text.Paragraph>
							) : null}
						</PressableFeedback>
					);
				})}
			</Surface>
		</View>
	);
}
