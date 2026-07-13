import { BottomSheet, cn } from "heroui-native";
import type { ComponentProps } from "react";

type AppBottomSheetContentProps = ComponentProps<typeof BottomSheet.Content>;

export function AppBottomSheetContent({
	contentContainerClassName,
	...props
}: AppBottomSheetContentProps) {
	return (
		<BottomSheet.Content
			contentContainerClassName={cn(
				"p-0 px-4 pt-1 pb-safe-offset-2",
				contentContainerClassName,
			)}
			{...props}
		/>
	);
}
