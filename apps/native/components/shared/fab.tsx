import { Portal } from "heroui-native/portal";
import {
	Children,
	createContext,
	forwardRef,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	BackHandler,
	Platform,
	Pressable,
	type PressableProps,
	StyleSheet,
	Text,
	type TextProps,
	useWindowDimensions,
	View,
	type ViewProps,
	type ViewStyle,
} from "react-native";
import Animated, {
	cancelAnimation,
	Extrapolation,
	interpolate,
	type SharedValue,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	type WithSpringConfig,
	type WithTimingConfig,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { FullWindowOverlay } from "react-native-screens";
import { scheduleOnRN } from "react-native-worklets";

import {
	type FABAlign,
	type FABAutoAlign,
	type FABAutoPlacement,
	type FABInsets,
	type FABPlacement,
	type FABRectangle,
	type FABTriggerPosition,
	getFABContentPosition,
	resolveFABAlign,
	resolveFABPlacement,
} from "./fab-position";

type AnimationState<T> = boolean | "disabled" | T;
type FABRootAnimation =
	| AnimationState<{
			progress?: {
				config?: WithSpringConfig | WithTimingConfig;
				type?: "spring" | "timing";
			};
			stagger?: { itemWindow?: number };
	  }>
	| "disable-all";
type FABTriggerAnimation = AnimationState<{
	rotate?: { value?: [number, number, number] };
}>;
type FABOverlayAnimation = AnimationState<{
	opacity?: { value?: [number, number, number] };
}>;
type FABItemAnimation = AnimationState<{
	scale?: { value?: [number, number] };
	translate?: { value?: number };
}>;
type FABItemsAppearance = "normal" | "staggered";

type FABContextValue = {
	align: FABAlign;
	contentLayout: FABRectangle | null;
	isAllAnimationsDisabled: boolean;
	isDisabled: boolean;
	isOpen: boolean;
	isVisible: boolean;
	itemsAppearance: FABItemsAppearance;
	nativeID: string;
	onOpenChange: (value: boolean) => void;
	placement: FABPlacement;
	progress: SharedValue<number>;
	setContentLayout: (layout: FABRectangle | null) => void;
	setTriggerPosition: (position: FABTriggerPosition | null) => void;
	staggerItemWindow: number;
	triggerPosition: FABTriggerPosition | null;
};

const FABContext = createContext<FABContextValue | null>(null);
const FABItemContext = createContext({ index: 0, total: 1 });

function useFABContext() {
	const context = useContext(FABContext);
	if (!context) {
		throw new Error("FAB compound components must be rendered inside FAB");
	}
	return context;
}

function isAnimationDisabled(animation: unknown) {
	return animation === false || animation === "disabled";
}

function getAnimationConfig<T>(animation: AnimationState<T> | undefined) {
	return typeof animation === "object" ? animation : undefined;
}

export type FABRootProps = ViewProps & {
	align?: FABAutoAlign;
	animation?: FABRootAnimation;
	isDefaultOpen?: boolean;
	isDisabled?: boolean;
	isOpen?: boolean;
	itemsAppearance?: FABItemsAppearance;
	onOpenChange?: (isOpen: boolean) => void;
	placement?: FABAutoPlacement;
};

const FABRoot = forwardRef<View, FABRootProps>(function FABRoot(
	{
		align: alignProp = "auto",
		animation,
		children,
		className,
		isDefaultOpen = false,
		isDisabled = false,
		isOpen: isOpenProp,
		itemsAppearance = "staggered",
		onOpenChange: onOpenChangeProp,
		placement: placementProp = "auto",
		...props
	},
	ref,
) {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(isDefaultOpen);
	const isOpen = isOpenProp ?? uncontrolledOpen;
	const onOpenChange = useCallback(
		(value: boolean) => {
			if (isOpenProp === undefined) setUncontrolledOpen(value);
			onOpenChangeProp?.(value);
		},
		[isOpenProp, onOpenChangeProp],
	);
	const [triggerPosition, setTriggerPosition] =
		useState<FABTriggerPosition | null>(null);
	const [contentLayout, setContentLayout] = useState<FABRectangle | null>(null);
	const [isVisible, setIsVisible] = useState(isOpen);
	const progress = useSharedValue(isOpen ? 1 : 0);
	const prefersReducedMotion = useReducedMotion();
	const isAllAnimationsDisabled =
		animation === "disable-all" || prefersReducedMotion;
	const rootAnimationDisabled =
		isAllAnimationsDisabled || isAnimationDisabled(animation);
	const animationConfig = getAnimationConfig(animation);
	const progressConfig = animationConfig?.progress;
	const staggerItemWindow = Math.min(
		1,
		Math.max(0.05, animationConfig?.stagger?.itemWindow ?? 0.5),
	);
	const nativeID = useId();
	const screen = useWindowDimensions();
	const placement = resolveFABPlacement(placementProp, triggerPosition, screen);
	const align = resolveFABAlign(alignProp, placement, triggerPosition, screen);
	const isOpenRef = useRef(isOpen);
	isOpenRef.current = isOpen;
	const previousOpen = useRef<boolean | null>(null);

	useEffect(() => {
		if (previousOpen.current === null) {
			previousOpen.current = isOpen;
			progress.set(isOpen ? 1 : 0);
			return;
		}
		if (previousOpen.current === isOpen) return;
		previousOpen.current = isOpen;
		cancelAnimation(progress);

		if (isOpen) {
			setIsVisible(true);
			if (rootAnimationDisabled) {
				progress.set(1);
				return;
			}
			progress.set(0);
			progress.set(
				progressConfig?.type === "timing"
					? withTiming(1, progressConfig.config as WithTimingConfig)
					: withSpring(
							1,
							(progressConfig?.config as WithSpringConfig) ?? {
								damping: 120,
								mass: 4,
								stiffness: 1000,
							},
						),
			);
			return;
		}

		if (rootAnimationDisabled) {
			progress.set(0);
			setIsVisible(false);
			return;
		}

		const hide = () => {
			if (!isOpenRef.current) setIsVisible(false);
		};
		const finished = (didFinish?: boolean) => {
			"worklet";
			if (didFinish) {
				progress.set(0);
				scheduleOnRN(hide);
			}
		};
		progress.set(
			progressConfig?.type === "timing"
				? withTiming(2, progressConfig.config as WithTimingConfig, finished)
				: withSpring(
						2,
						(progressConfig?.config as WithSpringConfig) ?? {
							damping: 120,
							mass: 4,
							stiffness: 1000,
						},
						finished,
					),
		);
	}, [isOpen, progress, progressConfig, rootAnimationDisabled]);

	const context = useMemo<FABContextValue>(
		() => ({
			align,
			contentLayout,
			isAllAnimationsDisabled,
			isDisabled,
			isOpen,
			isVisible,
			itemsAppearance,
			nativeID,
			onOpenChange,
			placement,
			progress,
			setContentLayout,
			setTriggerPosition,
			staggerItemWindow,
			triggerPosition,
		}),
		[
			align,
			contentLayout,
			isAllAnimationsDisabled,
			isDisabled,
			isOpen,
			isVisible,
			itemsAppearance,
			nativeID,
			onOpenChange,
			placement,
			progress,
			staggerItemWindow,
			triggerPosition,
		],
	);

	return (
		<FABContext.Provider value={context}>
			<View ref={ref} className={`self-start ${className ?? ""}`} {...props}>
				{children}
			</View>
		</FABContext.Provider>
	);
});

export type FABTriggerRef = View & { close: () => void; open: () => void };
export type FABTriggerProps = Omit<PressableProps, "children" | "disabled"> & {
	animation?: FABTriggerAnimation;
	children?: ReactNode;
	classNames?: { container?: string; contentContainer?: string };
	isAnimatedStyleActive?: boolean;
	isDisabled?: boolean;
	styles?: { container?: ViewStyle; contentContainer?: ViewStyle };
};

const FABTrigger = forwardRef<FABTriggerRef, FABTriggerProps>(
	function FABTrigger(
		{
			animation,
			children,
			className,
			classNames,
			isAnimatedStyleActive = true,
			isDisabled = false,
			onPress,
			style,
			styles,
			...props
		},
		ref,
	) {
		const context = useFABContext();
		const {
			isAllAnimationsDisabled,
			isDisabled: isDisabledRoot,
			isOpen,
			onOpenChange,
			progress,
			setTriggerPosition,
		} = context;
		const triggerRef = useRef<View>(null);
		const disabled = isDisabled || isDisabledRoot;
		const animationConfig = getAnimationConfig(animation);
		const rotate = animationConfig?.rotate?.value ?? [0, 45, 0];
		const animationDisabled =
			isAllAnimationsDisabled || isAnimationDisabled(animation);
		const animatedStyle = useAnimatedStyle(() => {
			const value = progress.get();
			const degrees = animationDisabled
				? value >= 0.5 && value <= 1.5
					? rotate[1]
					: rotate[0]
				: interpolate(value, [0, 1, 2], rotate, Extrapolation.CLAMP);
			return { transform: [{ rotate: `${degrees}deg` }] };
		}, [animationDisabled, rotate]);
		const measure = useCallback(() => {
			triggerRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
				setTriggerPosition({ height, pageX, pageY, width });
			});
		}, [setTriggerPosition]);

		useImperativeHandle(
			ref,
			() =>
				Object.assign(triggerRef.current as View, {
					close: () => onOpenChange(false),
					open: () => {
						measure();
						onOpenChange(true);
					},
				}),
			[measure, onOpenChange],
		);

		useEffect(() => {
			if (!isOpen) return;
			const timeout = setTimeout(measure, 0);
			return () => clearTimeout(timeout);
		}, [isOpen, measure]);

		return (
			<Pressable
				ref={triggerRef}
				accessibilityRole="button"
				accessibilityState={{ disabled, expanded: isOpen }}
				className={`size-12 items-center justify-center rounded-3xl bg-accent ${
					disabled ? "opacity-disabled" : ""
				} ${classNames?.container ?? ""} ${className ?? ""}`}
				disabled={disabled}
				style={(state) => [
					styles?.container,
					typeof style === "function" ? style(state) : style,
				]}
				onPress={(event) => {
					measure();
					onOpenChange(!isOpen);
					onPress?.(event);
				}}
				{...props}
			>
				<Animated.View
					className={`items-center justify-center ${classNames?.contentContainer ?? ""}`}
					pointerEvents="none"
					style={[
						isAnimatedStyleActive ? animatedStyle : undefined,
						styles?.contentContainer,
					]}
				>
					{children}
				</Animated.View>
			</Pressable>
		);
	},
);

export type FABPortalProps = {
	children: ReactNode;
	className?: string;
	disableFullWindowOverlay?: boolean;
	forceMount?: boolean;
	hostName?: string;
	unstable_accessibilityContainerViewIsModal?: boolean;
};

function FABPortal({
	children,
	className,
	disableFullWindowOverlay = false,
	forceMount,
	hostName,
	unstable_accessibilityContainerViewIsModal = false,
}: FABPortalProps) {
	const context = useFABContext();
	if (!context.triggerPosition || (!forceMount && !context.isVisible))
		return null;

	const content = (
		<View
			accessibilityViewIsModal={unstable_accessibilityContainerViewIsModal}
			className={`absolute inset-0 ${className ?? ""}`}
			pointerEvents="box-none"
		>
			{children}
		</View>
	);

	return (
		<Portal hostName={hostName} name={`${context.nativeID}_portal`}>
			<FABContext.Provider value={context}>
				{Platform.OS === "ios" && !disableFullWindowOverlay ? (
					<FullWindowOverlay>{content}</FullWindowOverlay>
				) : (
					content
				)}
			</FABContext.Provider>
		</Portal>
	);
}

export type FABOverlayProps = PressableProps & {
	animation?: FABOverlayAnimation;
	closeOnPress?: boolean;
	forceMount?: boolean;
	isAnimatedStyleActive?: boolean;
};

const FABOverlay = forwardRef<View, FABOverlayProps>(function FABOverlay(
	{
		animation,
		className,
		closeOnPress = true,
		forceMount,
		isAnimatedStyleActive = true,
		onPress,
		style,
		...props
	},
	ref,
) {
	const context = useFABContext();
	const opacity = getAnimationConfig(animation)?.opacity?.value ?? [0, 1, 0];
	const animationDisabled =
		context.isAllAnimationsDisabled || isAnimationDisabled(animation);
	const animatedStyle = useAnimatedStyle(() => {
		const value = context.progress.get();
		return {
			opacity: animationDisabled
				? value >= 0.5 && value <= 1.5
					? opacity[1]
					: opacity[0]
				: interpolate(value, [0, 1, 2], opacity, Extrapolation.CLAMP),
		};
	}, [animationDisabled, opacity]);

	if (!forceMount && !context.isVisible) return null;

	return (
		<Animated.View
			pointerEvents="box-none"
			style={[StyleSheet.absoluteFill, isAnimatedStyleActive && animatedStyle]}
		>
			<Pressable
				ref={ref}
				className={`flex-1 bg-backdrop ${className ?? ""}`}
				pointerEvents={context.isOpen ? "auto" : "none"}
				style={style}
				onPress={(event) => {
					if (closeOnPress) context.onOpenChange(false);
					onPress?.(event);
				}}
				{...props}
			/>
		</Animated.View>
	);
});

export type FABContentProps = ViewProps & {
	alignOffset?: number;
	avoidCollisions?: boolean;
	disablePositioningStyle?: boolean;
	forceMount?: boolean;
	insets?: FABInsets;
	offset?: number;
};

const FABContent = forwardRef<View, FABContentProps>(function FABContent(
	{
		alignOffset = 0,
		avoidCollisions = true,
		children,
		className,
		disablePositioningStyle,
		forceMount,
		insets = { bottom: 12, left: 12, right: 12, top: 12 },
		offset = 12,
		onLayout,
		style,
		...props
	},
	ref,
) {
	const context = useFABContext();
	const items = Children.toArray(children);
	const screen = useWindowDimensions();
	const position = useMemo(() => {
		if (disablePositioningStyle) return undefined;
		if (!context.triggerPosition || !context.contentLayout) {
			return { opacity: 0, position: "absolute" as const, top: screen.height };
		}
		return getFABContentPosition({
			align: context.align,
			alignOffset,
			avoidCollisions,
			content: context.contentLayout,
			insets,
			offset,
			placement: context.placement,
			screen,
			trigger: context.triggerPosition,
		});
	}, [
		alignOffset,
		avoidCollisions,
		context.align,
		context.contentLayout,
		context.placement,
		context.triggerPosition,
		disablePositioningStyle,
		insets,
		offset,
		screen,
	]);

	const { isOpen, onOpenChange } = context;
	useEffect(() => {
		if (!isOpen) return;
		const handler = BackHandler.addEventListener("hardwareBackPress", () => {
			onOpenChange(false);
			return true;
		});
		return () => handler.remove();
	}, [isOpen, onOpenChange]);

	if (!forceMount && !context.isVisible) return null;

	const itemsAlign =
		context.placement === "left"
			? "items-end"
			: context.placement === "right"
				? "items-start"
				: context.align === "start"
					? "items-start"
					: context.align === "center"
						? "items-center"
						: "items-end";

	return (
		<View
			ref={ref}
			accessibilityRole="menu"
			className={`gap-3 ${itemsAlign} ${className ?? ""}`}
			nativeID={context.nativeID}
			pointerEvents={context.isOpen ? "box-none" : "none"}
			style={[position, style]}
			onLayout={(event) => {
				context.setContentLayout(event.nativeEvent.layout);
				onLayout?.(event);
			}}
			{...props}
		>
			{Children.map(items, (child, index) => (
				<FABItemContext.Provider value={{ index, total: items.length }}>
					{child}
				</FABItemContext.Provider>
			))}
		</View>
	);
});

export type FABItemProps = Omit<PressableProps, "children"> & {
	animation?: FABItemAnimation;
	children?: ReactNode;
	closeOnPress?: boolean;
	isAnimatedStyleActive?: boolean;
};

const FABItem = forwardRef<View, FABItemProps>(function FABItem(
	{
		animation,
		children,
		className,
		closeOnPress = true,
		disabled,
		isAnimatedStyleActive = true,
		onPress,
		style,
		...props
	},
	ref,
) {
	const context = useFABContext();
	const { index, total } = useContext(FABItemContext);
	const config = getAnimationConfig(animation);
	const translate = config?.translate?.value ?? 16;
	const scale = config?.scale?.value ?? [0.9, 1];
	const animationDisabled =
		context.isAllAnimationsDisabled || isAnimationDisabled(animation);
	const window = context.staggerItemWindow;
	const openOrder = context.placement === "top" ? total - 1 - index : index;
	const closeOrder = total - 1 - openOrder;
	const step = total <= 1 ? 0 : (1 - window) / (total - 1);
	const openStart = context.itemsAppearance === "normal" ? 0 : openOrder * step;
	const openEnd = context.itemsAppearance === "normal" ? 1 : openStart + window;
	const closeStart =
		context.itemsAppearance === "normal" ? 0 : closeOrder * step;
	const closeEnd =
		context.itemsAppearance === "normal" ? 1 : closeStart + window;
	const animatedStyle = useAnimatedStyle(() => {
		const progress = context.progress.get();
		if (animationDisabled) {
			return {
				opacity: progress >= 0.5 && progress <= 1.5 ? 1 : 0,
				transform: [],
			};
		}
		const visibility =
			progress <= 1
				? interpolate(
						progress,
						[openStart, openEnd],
						[0, 1],
						Extrapolation.CLAMP,
					)
				: 1 -
					interpolate(
						progress - 1,
						[closeStart, closeEnd],
						[0, 1],
						Extrapolation.CLAMP,
					);
		const distance = (1 - visibility) * translate;
		const translation =
			context.placement === "top"
				? { translateY: distance }
				: context.placement === "bottom"
					? { translateY: -distance }
					: context.placement === "left"
						? { translateX: distance }
						: { translateX: -distance };
		return {
			opacity: visibility,
			transform: [
				translation,
				{ scale: interpolate(visibility, [0, 1], scale) },
			],
		};
	}, [
		animationDisabled,
		closeEnd,
		closeStart,
		context.placement,
		openEnd,
		openStart,
		scale,
		translate,
	]);
	const resolvedChildren =
		typeof children === "string" || typeof children === "number" ? (
			<FABItemLabel>{String(children)}</FABItemLabel>
		) : (
			children
		);

	return (
		<Animated.View style={isAnimatedStyleActive ? animatedStyle : undefined}>
			<Pressable
				ref={ref}
				accessibilityRole="menuitem"
				accessibilityState={{ disabled: Boolean(disabled) }}
				className={`flex-row items-center gap-2.5 rounded-2xl bg-overlay px-4 py-2.5 shadow-overlay ${
					disabled ? "opacity-disabled" : ""
				} ${className ?? ""}`}
				disabled={disabled}
				style={(state) => [
					styles.item,
					typeof style === "function" ? style(state) : style,
				]}
				onPress={(event) => {
					if (closeOnPress) context.onOpenChange(false);
					onPress?.(event);
				}}
				{...props}
			>
				{resolvedChildren}
			</Pressable>
		</Animated.View>
	);
});

export type FABItemLabelProps = TextProps;

const FABItemLabel = forwardRef<Text, FABItemLabelProps>(function FABItemLabel(
	{ className, ...props },
	ref,
) {
	return (
		<Text
			ref={ref}
			className={`font-medium text-foreground text-sm ${className ?? ""}`}
			{...props}
		/>
	);
});

const styles = StyleSheet.create({
	item: { borderCurve: "continuous" },
});

export const FAB = Object.assign(FABRoot, {
	Content: FABContent,
	Item: FABItem,
	ItemLabel: FABItemLabel,
	Overlay: FABOverlay,
	Portal: FABPortal,
	Trigger: FABTrigger,
});

export function useFAB() {
	return useFABContext();
}

export function useFABAnimation() {
	return { progress: useFABContext().progress };
}
