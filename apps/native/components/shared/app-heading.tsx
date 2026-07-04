import { Text } from "heroui-native";
import type { ComponentProps } from "react";
import type { StyleProp, TextStyle } from "react-native";

type AppHeadingProps = ComponentProps<typeof Text.Heading>;
type HeadingType = NonNullable<AppHeadingProps["type"]>;

const headingStyles: Record<HeadingType, TextStyle> = {
	h1: { lineHeight: 44, paddingTop: 2 },
	h2: { lineHeight: 38, paddingTop: 2 },
	h3: { lineHeight: 32, paddingTop: 1 },
	h4: { lineHeight: 28, paddingTop: 1 },
	h5: { lineHeight: 26, paddingTop: 1 },
	h6: { lineHeight: 24, paddingTop: 1 },
};

export function AppHeading({
	type = "h1",
	className,
	style,
	...props
}: AppHeadingProps) {
	const mergedStyle: StyleProp<TextStyle> = [headingStyles[type], style];

	return (
		<Text.Heading
			type={type}
			className={["tracking-normal", className].filter(Boolean).join(" ")}
			style={mergedStyle}
			{...props}
		/>
	);
}
