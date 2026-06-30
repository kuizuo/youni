import {
	Children,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	RefreshControl,
	ScrollView,
	type StyleProp,
	useWindowDimensions,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	runOnJS,
	useAnimatedReaction,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";

type CollapsibleTab<Key extends string> = {
	key: Key;
};

export function ProfileCollapsibleTabs<Key extends string>({
	activeTab,
	backgroundColor,
	children,
	contentWidth,
	headerColor,
	headerHeight,
	minTabContentHeight,
	onRefresh,
	onTabChange,
	refreshColor,
	refreshing,
	renderHeader,
	renderStickyHeader,
	renderTabBar,
	tabBarHeight,
	tabs,
	topChromeHeight,
}: {
	activeTab: Key;
	backgroundColor: string;
	children: ReactNode;
	contentWidth: number;
	headerColor: string;
	headerHeight: number;
	minTabContentHeight: number;
	onRefresh: () => void;
	onTabChange: (tab: Key) => void;
	refreshColor: string;
	refreshing: boolean;
	renderHeader: () => ReactNode;
	renderStickyHeader: (
		style: StyleProp<ViewStyle>,
		miniProfileStyle: StyleProp<ViewStyle>,
	) => ReactNode;
	renderTabBar: (options: {
		elevated: boolean;
		onSelect: (tab: Key) => void;
	}) => ReactNode;
	tabBarHeight: number;
	tabs: readonly CollapsibleTab<Key>[];
	topChromeHeight: number;
}) {
	const dimensions = useWindowDimensions();
	const pagerRef = useRef<ScrollView>(null);
	const pendingProgrammaticTabRef = useRef<null | Key>(null);
	const pendingProgrammaticTimerRef = useRef<null | ReturnType<
		typeof setTimeout
	>>(null);
	const scrollY = useSharedValue(0);
	const [isSticky, setIsSticky] = useState(false);
	const [pageHeights, setPageHeights] = useState<Partial<Record<Key, number>>>(
		{},
	);
	const activeIndex = Math.max(
		0,
		tabs.findIndex((tab) => tab.key === activeTab),
	);
	const stickyTrigger = Math.max(0, headerHeight - topChromeHeight);
	const activePageHeight = Math.max(
		minTabContentHeight,
		pageHeights[activeTab] ?? 0,
	);

	const onScroll = useAnimatedScrollHandler((event) => {
		scrollY.value = event.contentOffset.y;
	});
	useAnimatedReaction(
		() => scrollY.value >= stickyTrigger - 1,
		(current, previous) => {
			if (current !== previous) {
				runOnJS(setIsSticky)(current);
			}
		},
		[stickyTrigger],
	);

	const topChromeStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: headerColor,
			opacity: 1,
		};
	});
	const miniProfileStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollY.value,
			[stickyTrigger - 72, stickyTrigger - 16],
			[0, 1],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				scale: interpolate(
					scrollY.value,
					[stickyTrigger - 72, stickyTrigger - 16],
					[0.86, 1],
					Extrapolation.CLAMP,
				),
			},
		],
	}));
	const stickyTabStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollY.value,
			[stickyTrigger - 8, stickyTrigger + 8],
			[0, 1],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				translateY: interpolate(
					scrollY.value,
					[stickyTrigger - 8, stickyTrigger + 8],
					[8, 0],
					Extrapolation.CLAMP,
				),
			},
		],
	}));

	const selectTab = (tab: Key) => {
		const nextIndex = tabs.findIndex((item) => item.key === tab);
		if (nextIndex < 0) return;
		if (pendingProgrammaticTimerRef.current) {
			clearTimeout(pendingProgrammaticTimerRef.current);
		}
		pendingProgrammaticTabRef.current = tab;
		onTabChange(tab);
		pagerRef.current?.scrollTo({
			animated: true,
			x: nextIndex * dimensions.width,
		});
		pendingProgrammaticTimerRef.current = setTimeout(() => {
			pendingProgrammaticTabRef.current = null;
			pendingProgrammaticTimerRef.current = null;
		}, 450);
	};

	const handlePagerEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const nextIndex = Math.min(
			tabs.length - 1,
			Math.max(
				0,
				Math.round(event.nativeEvent.contentOffset.x / dimensions.width),
			),
		);
		const nextTab = tabs[nextIndex];
		const pendingTab = pendingProgrammaticTabRef.current;
		if (pendingTab) {
			if (nextTab?.key !== pendingTab) return;
			pendingProgrammaticTabRef.current = null;
			if (pendingProgrammaticTimerRef.current) {
				clearTimeout(pendingProgrammaticTimerRef.current);
				pendingProgrammaticTimerRef.current = null;
			}
		}
		if (nextTab && nextTab.key !== activeTab) {
			onTabChange(nextTab.key);
		}
	};

	useEffect(() => {
		pagerRef.current?.scrollTo({
			animated: false,
			x: activeIndex * dimensions.width,
		});
	}, [activeIndex, dimensions.width]);

	useEffect(() => {
		return () => {
			if (pendingProgrammaticTimerRef.current) {
				clearTimeout(pendingProgrammaticTimerRef.current);
			}
		};
	}, []);

	const pages = useMemo(() => Children.toArray(children), [children]);

	return (
		<View className="flex-1" style={{ backgroundColor: headerColor }}>
			<Animated.ScrollView
				className="flex-1"
				onScroll={onScroll}
				refreshControl={
					<RefreshControl
						colors={[refreshColor]}
						progressBackgroundColor={backgroundColor}
						progressViewOffset={topChromeHeight + tabBarHeight + 8}
						refreshing={refreshing}
						tintColor={refreshColor}
						onRefresh={onRefresh}
					/>
				}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: headerColor }}
			>
				<View style={{ backgroundColor: headerColor, height: headerHeight }}>
					{renderHeader()}
				</View>
				<View style={{ backgroundColor }}>
					{renderTabBar({ elevated: false, onSelect: selectTab })}
				</View>
				<View
					style={{
						backgroundColor,
						height: activePageHeight,
						overflow: "hidden",
					}}
				>
					<ScrollView
						ref={pagerRef}
						horizontal
						bounces={false}
						decelerationRate="fast"
						disableIntervalMomentum
						nestedScrollEnabled
						pagingEnabled
						scrollEventThrottle={16}
						showsHorizontalScrollIndicator={false}
						onMomentumScrollEnd={handlePagerEnd}
					>
						{tabs.map((tab, index) => (
							<View
								key={tab.key}
								style={{
									backgroundColor,
									minHeight: minTabContentHeight,
									width: dimensions.width,
								}}
							>
								<View
									style={{
										alignSelf: "center",
										width: contentWidth,
									}}
									onLayout={(event) => {
										const nextHeight = Math.max(
											minTabContentHeight,
											Math.ceil(event.nativeEvent.layout.height),
										);
										setPageHeights((current) =>
											current[tab.key] === nextHeight
												? current
												: { ...current, [tab.key]: nextHeight },
										);
									}}
								>
									{pages[index]}
								</View>
							</View>
						))}
					</ScrollView>
				</View>
			</Animated.ScrollView>

			{renderStickyHeader(
				topChromeStyle as StyleProp<ViewStyle>,
				miniProfileStyle as StyleProp<ViewStyle>,
			)}
			<Animated.View
				className="absolute right-0 left-0"
				pointerEvents={isSticky ? "box-none" : "none"}
				style={[
					{
						backgroundColor,
						height: tabBarHeight,
						top: topChromeHeight,
						zIndex: 18,
					},
					stickyTabStyle,
				]}
			>
				{renderTabBar({ elevated: true, onSelect: selectTab })}
			</Animated.View>
		</View>
	);
}
