import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ScreenProps extends ViewProps {
	children: ReactNode;
	withTabBarSpacing?: boolean;
}

const TAB_BAR_CLEARANCE_PX = 96;

export function Screen({
	children,
	style,
	withTabBarSpacing = false,
	...rest
}: ScreenProps) {
	const insets = useSafeAreaInsets();

	return (
		<View
			{...rest}
			className="flex-1 bg-background"
			style={[
				{
					paddingTop: insets.top,
					paddingBottom: withTabBarSpacing
						? insets.bottom + TAB_BAR_CLEARANCE_PX
						: insets.bottom,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}
