import type { Tabs } from "expo-router";
import { cn, PressableFeedback, Surface, Typography } from "heroui-native";
import type { ComponentProps } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SingleColorIcon } from "@/components/icons/single-color";
import { TABS } from "@/lib/config/tabs";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export const TAB_BAR_SAFE_OFFSET_ADDON_PX = 12;

type TabsTabBar = NonNullable<ComponentProps<typeof Tabs>["tabBar"]>;
type TabsTabBarProps = Parameters<TabsTabBar>[0];

export function FloatingTabBar({ navigation, state }: TabsTabBarProps) {
	const insets = useSafeAreaInsets();
	const socialNavigation = useSocialNavigation();
	const showActiveLabel = Platform.OS !== "web";

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
						if (
							(config.name === "messages" || config.name === "me") &&
							!socialNavigation.requireLogin(`/${config.name}`)
						) {
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
								isFocused
									? cn(
											"bg-accent shadow-sm",
											showActiveLabel ? "w-20 gap-1.5 px-3" : "w-12",
										)
									: "w-12 bg-transparent",
							)}
						>
							<PressableFeedback.Highlight />
							<SingleColorIcon
								name={isFocused ? config.iconFocusedName : config.iconName}
								size={22}
								colorClassName={
									isFocused ? "text-accent-foreground" : "text-muted"
								}
							/>
							{isFocused && showActiveLabel ? (
								<Typography.Paragraph
									type="body-xs"
									weight="semibold"
									numberOfLines={1}
									className="text-accent-foreground"
								>
									{config.label}
								</Typography.Paragraph>
							) : null}
						</PressableFeedback>
					);
				})}
			</Surface>
		</View>
	);
}
