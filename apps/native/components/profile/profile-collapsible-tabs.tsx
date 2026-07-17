import {
	Children,
	type ReactNode,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	RefreshControl,
	type ScrollView,
	type StyleProp,
	useWindowDimensions,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	runOnJS,
	type SharedValue,
	useAnimatedReaction,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { useTabReselect } from "@/lib/navigation/use-tab-reselect";

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
	onEndReached,
	onTabChange,
	refreshColor,
	refreshOnTabReselect = false,
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
	onEndReached?: () => void;
	onTabChange: (tab: Key) => void;
	refreshColor: string;
	refreshOnTabReselect?: boolean;
	refreshing: boolean;
	renderHeader: (scrollY: SharedValue<number>) => ReactNode;
	renderStickyHeader: (
		style: StyleProp<ViewStyle>,
		miniProfileStyle: StyleProp<ViewStyle>,
		isSticky: boolean,
	) => ReactNode;
	renderTabBar: (options: {
		elevated: boolean;
		onSelect: (tab: Key) => void;
		pageWidth: number;
		pagerScrollX: SharedValue<number>;
	}) => ReactNode;
	tabBarHeight: number;
	tabs: readonly CollapsibleTab<Key>[];
	topChromeHeight: number;
}) {
	const dimensions = useWindowDimensions();
	const scrollRef = useRef<ScrollView>(null);
	const pagerRef = useRef<ScrollView>(null);
	const pendingProgrammaticTabRef = useRef<null | Key>(null);
	const pendingProgrammaticTimerRef = useRef<null | ReturnType<
		typeof setTimeout
	>>(null);
	const scrollY = useSharedValue(0);
	const pagerScrollX = useSharedValue(0);
	const [isSticky, setIsSticky] = useState(false);
	const [pageWidth, setPageWidth] = useState(dimensions.width);
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
	useTabReselect(() => {
		if (!refreshOnTabReselect) return;
		scrollRef.current?.scrollTo({ animated: true, y: 0 });
		if (!refreshing) onRefresh();
	});

	const onScroll = useAnimatedScrollHandler(
		(event) => {
			scrollY.value = event.contentOffset.y;
			if (
				onEndReached &&
				event.contentSize.height -
					event.layoutMeasurement.height -
					event.contentOffset.y <
					240
			) {
				runOnJS(onEndReached)();
			}
		},
		[onEndReached],
	);
	const onPagerScroll = useAnimatedScrollHandler((event) => {
		pagerScrollX.value = event.contentOffset.x;
	});
	useAnimatedReaction(
		() => scrollY.value >= stickyTrigger,
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
			opacity: interpolate(
				scrollY.value,
				[stickyTrigger - 72, stickyTrigger - 16],
				[0, 1],
				Extrapolation.CLAMP,
			),
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
		opacity: scrollY.value >= stickyTrigger ? 1 : 0,
	}));
	const inlineTabStyle = useAnimatedStyle(() => ({
		opacity: scrollY.value >= stickyTrigger ? 0 : 1,
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
			x: nextIndex * pageWidth,
		});
		pendingProgrammaticTimerRef.current = setTimeout(() => {
			pendingProgrammaticTabRef.current = null;
			pendingProgrammaticTimerRef.current = null;
		}, 450);
	};

	const handlePagerEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		const nextIndex = Math.min(
			tabs.length - 1,
			Math.max(0, Math.round(event.nativeEvent.contentOffset.x / pageWidth)),
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
			x: activeIndex * pageWidth,
		});
		pagerScrollX.value = activeIndex * pageWidth;
	}, [activeIndex, pageWidth, pagerScrollX]);

	useEffect(() => {
		return () => {
			if (pendingProgrammaticTimerRef.current) {
				clearTimeout(pendingProgrammaticTimerRef.current);
			}
		};
	}, []);

	const pages = useMemo(() => Children.toArray(children), [children]);

	return (
		<View
			className="flex-1"
			style={{ backgroundColor }}
			onLayout={(event) => {
				const nextWidth = Math.ceil(event.nativeEvent.layout.width);
				setPageWidth((current) =>
					current === nextWidth ? current : nextWidth,
				);
			}}
		>
			<Animated.ScrollView
				ref={scrollRef}
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
					{renderHeader(scrollY)}
				</View>
				<Animated.View style={[{ backgroundColor }, inlineTabStyle]}>
					{renderTabBar({
						elevated: false,
						onSelect: selectTab,
						pageWidth,
						pagerScrollX,
					})}
				</Animated.View>
				<View
					style={{
						backgroundColor,
						height: activePageHeight,
						overflow: "hidden",
					}}
				>
					<Animated.ScrollView
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
						onScroll={onPagerScroll}
					>
						{tabs.map((tab, index) => (
							<View
								key={tab.key}
								style={{
									backgroundColor,
									minHeight: minTabContentHeight,
									width: pageWidth,
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
					</Animated.ScrollView>
				</View>
			</Animated.ScrollView>

			{renderStickyHeader(
				topChromeStyle as StyleProp<ViewStyle>,
				miniProfileStyle as StyleProp<ViewStyle>,
				isSticky,
			)}
			{refreshing ? (
				<View
					className="absolute right-0 left-0 z-30 items-center"
					pointerEvents="none"
					style={{ top: topChromeHeight + 8 }}
				>
					<View className="size-9 items-center justify-center rounded-full bg-black/45">
						<ActivityIndicator color="#ffffff" size="small" />
					</View>
				</View>
			) : null}
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
				{renderTabBar({
					elevated: true,
					onSelect: selectTab,
					pageWidth,
					pagerScrollX,
				})}
			</Animated.View>
		</View>
	);
}
