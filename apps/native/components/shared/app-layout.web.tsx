import type { PropsWithChildren } from "react";
import { View } from "react-native";

export function AppLayout({ children }: PropsWithChildren) {
	return (
		<View className="flex-1 bg-content2 md:items-center md:justify-center md:p-4">
			<View className="w-full flex-1 bg-background md:max-w-xl md:overflow-hidden md:rounded-3xl md:border md:border-separator md:shadow-overlay">
				{children}
			</View>
		</View>
	);
}
