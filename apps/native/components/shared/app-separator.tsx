import { cn, Separator } from "heroui-native";
import type { ComponentProps } from "react";

type AppSeparatorProps = ComponentProps<typeof Separator>;

export function AppSeparator({
	className,
	thickness = 1,
	...props
}: AppSeparatorProps) {
	return (
		<Separator
			className={cn("bg-separator", className)}
			thickness={thickness}
			{...props}
		/>
	);
}

export function ListSeparator() {
	return <AppSeparator />;
}
