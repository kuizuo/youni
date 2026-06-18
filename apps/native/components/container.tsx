import { cn, Surface } from "heroui-native";
import type { PropsWithChildren } from "react";
import {
	ScrollView,
	type ScrollViewProps,
	View,
	type ViewProps,
} from "react-native";
import Animated, { type AnimatedProps } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = AnimatedProps<ViewProps> & {
	className?: string;
	isScrollable?: boolean;
	scrollViewProps?: Omit<ScrollViewProps, "contentContainerStyle">;
};

export function Container({
	children,
	className,
	isScrollable = true,
	scrollViewProps,
	...props
}: PropsWithChildren<Props>) {
	const insets = useSafeAreaInsets();

	return (
		<AnimatedView
			className={cn("flex-1 bg-background", className)}
			style={{
				paddingBottom: insets.bottom,
			}}
			{...props}
		>
			{isScrollable ? (
				<ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					keyboardShouldPersistTaps="handled"
					contentInsetAdjustmentBehavior="automatic"
					{...scrollViewProps}
				>
					{children}
				</ScrollView>
			) : (
				<Surface variant="transparent" className="flex-1 p-0">
					{children}
				</Surface>
			)}
		</AnimatedView>
	);
}
