import { Ionicons } from "@expo/vector-icons";
import { Button, Typography } from "heroui-native";
import type { ComponentProps, ReactNode } from "react";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

export const APP_HEADER_HEIGHT = 64;
export const APP_HEADER_ICON_BUTTON_SIZE = 44;
export const APP_HEADER_ICON_SIZE = 26;
export const APP_HEADER_TITLE_FONT_SIZE = 18;

type AppHeaderProps = {
	after?: ReactNode;
	beforeTitle?: ReactNode;
	center?: ReactNode;
	className?: string;
	contentClassName?: string;
	left?: ReactNode;
	right?: ReactNode;
	showSeparator?: boolean;
	subtitle?: string;
	title?: string;
	topInset: number;
	variant?: "centered" | "leading";
};

export function AppHeader({
	after,
	beforeTitle,
	center,
	className,
	contentClassName,
	left,
	right,
	showSeparator,
	subtitle,
	title,
	topInset,
	variant = "centered",
}: AppHeaderProps) {
	return (
		<View
			className={className ?? "bg-background"}
			style={{ paddingTop: topInset }}
		>
			<View
				className={`mx-auto w-full max-w-xl flex-row items-center px-4 ${
					variant === "centered" ? "justify-between" : "gap-3"
				} ${contentClassName ?? ""}`}
				style={{ height: APP_HEADER_HEIGHT }}
			>
				{variant === "centered" ? (
					<>
						<View
							className="items-start"
							style={{ width: APP_HEADER_ICON_BUTTON_SIZE }}
						>
							{left}
						</View>
						<View className="min-w-0 flex-1 items-center px-3">
							{center ?? <AppHeaderTitle align="center" title={title} />}
						</View>
						<View
							className="items-end"
							style={{ width: APP_HEADER_ICON_BUTTON_SIZE }}
						>
							{right}
						</View>
					</>
				) : (
					<>
						{left}
						{beforeTitle}
						<View className="min-w-0 flex-1">
							{center ?? <AppHeaderTitle subtitle={subtitle} title={title} />}
						</View>
						{right}
					</>
				)}
			</View>
			{after}
			{showSeparator ? (
				<AppSeparator className="mx-auto w-full max-w-xl" />
			) : null}
		</View>
	);
}

export function AppHeaderTitle({
	align,
	subtitle,
	title,
}: {
	align?: "center" | "start";
	subtitle?: string;
	title?: string;
}) {
	if (!title) return null;

	return (
		<>
			<Typography.Paragraph
				weight="bold"
				numberOfLines={1}
				className="text-foreground"
				align={align}
				style={{ fontSize: APP_HEADER_TITLE_FONT_SIZE }}
			>
				{title}
			</Typography.Paragraph>
			{subtitle ? (
				<Typography.Paragraph
					type="body-xs"
					color="muted"
					numberOfLines={1}
					align={align}
				>
					{subtitle}
				</Typography.Paragraph>
			) : null}
		</>
	);
}

type AppHeaderIconButtonProps = Omit<
	ComponentProps<typeof Button>,
	"animation" | "children" | "feedbackVariant" | "isIconOnly"
> & {
	color: string;
	icon: keyof typeof Ionicons.glyphMap;
	iconSize?: number;
};

export function AppHeaderIconButton({
	className,
	color,
	icon,
	iconSize = APP_HEADER_ICON_SIZE,
	variant = "ghost",
	...props
}: AppHeaderIconButtonProps) {
	return (
		<Button
			isIconOnly
			variant={variant}
			className={`h-11 w-11 rounded-full ${className ?? ""}`}
			feedbackVariant="scale-ripple"
			{...props}
		>
			<Ionicons name={icon} size={iconSize} color={color} />
		</Button>
	);
}
