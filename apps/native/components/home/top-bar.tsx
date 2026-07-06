import { Ionicons } from "@expo/vector-icons";
import { Button, PressableFeedback, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { AppHeading } from "@/components/shared/app-heading";

import { HOME_TABS, type HomeTab } from "./types";

export function HomeTopBar({
	activeTab,
	topInset,
	onSearch,
	onTabChange,
}: {
	activeTab: HomeTab;
	topInset: number;
	onSearch: () => void;
	onTabChange: (tab: HomeTab) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	return (
		<View
			className="bg-background px-2 pb-3"
			style={{ paddingTop: Math.max(topInset, 8) }}
		>
			<View className="mx-auto h-14 w-full max-w-xl flex-row items-center justify-between">
				<View className="w-12" />
				<View className="flex-row items-center gap-9">
					{HOME_TABS.map((item) => {
						const active = item.id === activeTab;
						return (
							<PressableFeedback
								key={item.id}
								accessibilityRole="tab"
								accessibilityState={active ? { selected: true } : undefined}
								className="h-14 items-center justify-center px-1"
								onPress={() => onTabChange(item.id)}
							>
								<AppHeading
									type="h4"
									weight={active ? "bold" : "normal"}
									className={active ? "text-foreground" : "text-muted"}
								>
									{item.label}
								</AppHeading>
								<View
									className={
										active
											? "mt-1 h-1 w-8 rounded-full bg-accent"
											: "mt-1 h-1 w-8 rounded-full bg-transparent"
									}
								/>
							</PressableFeedback>
						);
					})}
				</View>
				<Button
					isIconOnly
					variant="ghost"
					className="h-12 w-12 rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="搜索"
					onPress={onSearch}
				>
					<Ionicons
						name="search-outline"
						size={30}
						color={activeTab === "discover" ? foregroundColor : mutedColor}
					/>
				</Button>
			</View>
		</View>
	);
}
