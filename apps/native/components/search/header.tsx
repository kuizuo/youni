import {
	Button,
	PressableFeedback,
	SearchField,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { Platform, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import {
	SEARCH_TABS,
	type SearchTabKey,
} from "@/components/search/search-utils";
import { APP_HEADER_HEIGHT } from "@/components/shared/app-header";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export function SearchHeader({
	activeTab,
	canSubmitKeyword,
	hasActiveSearch,
	keyword,
	onChangeKeyword,
	onChangeTab,
	onClearSearch,
	onSubmitSearch,
	pageWidth,
	pagerScrollX,
	topInset,
}: {
	activeTab: SearchTabKey;
	canSubmitKeyword: boolean;
	hasActiveSearch: boolean;
	keyword: string;
	onChangeKeyword: (value: string) => void;
	onChangeTab: (tab: SearchTabKey) => void;
	onClearSearch: () => void;
	onSubmitSearch: () => void;
	pageWidth: number;
	pagerScrollX: SharedValue<number>;
	topInset: number;
}) {
	const mutedColor = useThemeColor("muted");
	const isNative = Platform.OS !== "web";

	return (
		<View
			className="mx-auto w-full max-w-xl bg-background px-4"
			style={{ paddingTop: topInset }}
		>
			<View
				className="flex-row items-center gap-2"
				style={{ height: APP_HEADER_HEIGHT }}
			>
				<SearchField
					value={keyword}
					onChange={onChangeKeyword}
					className="min-w-0 flex-1"
				>
					<SearchField.Group
						className={
							isNative
								? "h-11 overflow-hidden rounded-full android:bg-default bg-content2"
								: undefined
						}
					>
						<SearchField.SearchIcon
							className={
								isNative
									? "relative left-0 w-10 shrink-0 items-center"
									: undefined
							}
							iconProps={{ color: mutedColor }}
						/>
						<SearchField.Input
							style={
								isNative
									? {
											backgroundColor: "transparent",
											borderColor: "transparent",
											borderWidth: 0,
											boxShadow: "none",
											elevation: 0,
											outlineColor: "transparent",
											outlineWidth: 0,
											shadowOpacity: 0,
										}
									: undefined
							}
							autoFocus
							placeholder="搜索图文、用户和话题"
							placeholderTextColor={mutedColor}
							returnKeyType="search"
							className={
								isNative
									? "h-11 rounded-full bg-transparent pl-0 shadow-none android:focus:border-transparent ios:focus:outline-none"
									: "h-11 rounded-full bg-content2"
							}
							onSubmitEditing={onSubmitSearch}
						/>
						<SearchField.ClearButton
							accessibilityLabel="清空搜索"
							iconProps={{ color: mutedColor }}
							onPress={onClearSearch}
						/>
					</SearchField.Group>
				</SearchField>

				<Button
					size="sm"
					variant={canSubmitKeyword ? "primary" : "ghost"}
					className="h-11 rounded-full px-4"
					feedbackVariant="scale-ripple"
					accessibilityLabel="执行搜索"
					isDisabled={!canSubmitKeyword}
					onPress={onSubmitSearch}
				>
					<Button.Label>搜索</Button.Label>
				</Button>
			</View>

			{hasActiveSearch ? (
				<SearchTabs
					activeTab={activeTab}
					pageWidth={pageWidth}
					pagerScrollX={pagerScrollX}
					onChange={onChangeTab}
				/>
			) : null}
		</View>
	);
}

function SearchTabs({
	activeTab,
	onChange,
	pageWidth,
	pagerScrollX,
}: {
	activeTab: SearchTabKey;
	onChange: (tab: SearchTabKey) => void;
	pageWidth: number;
	pagerScrollX: SharedValue<number>;
}) {
	const [barWidth, setBarWidth] = useState(0);
	const tabWidth = barWidth / SEARCH_TABS.length;
	const indicatorWidth = Math.min(56, tabWidth * 0.72);
	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX:
					(pageWidth ? pagerScrollX.value / pageWidth : 0) * tabWidth +
					(tabWidth - indicatorWidth) / 2,
			},
		],
	}));

	return (
		<View
			className="relative h-11 flex-row items-center"
			onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
		>
			{SEARCH_TABS.map((item) => {
				const active = item.key === activeTab;
				return (
					<PressableFeedback
						key={item.key}
						accessibilityRole="tab"
						accessibilityState={active ? { selected: true } : undefined}
						className="h-full flex-1 items-center justify-center"
						onPress={() => {
							fireHaptic();
							onChange(item.key);
						}}
					>
						<Typography.Paragraph
							weight="semibold"
							className={active ? "text-foreground" : "text-muted"}
						>
							{item.label}
						</Typography.Paragraph>
					</PressableFeedback>
				);
			})}
			{barWidth ? (
				<Animated.View
					pointerEvents="none"
					className="absolute bottom-0 left-0 h-1 rounded-full bg-accent"
					style={[{ width: indicatorWidth }, indicatorStyle]}
				/>
			) : null}
		</View>
	);
}
