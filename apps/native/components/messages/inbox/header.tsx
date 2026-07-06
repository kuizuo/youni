import { Ionicons } from "@expo/vector-icons";
import { Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

import { HEADER_HEIGHT } from "./constants";

export function MessagesHeader({
	isMenuVisible,
	onOpenMenu,
	topInset,
}: {
	isMenuVisible: boolean;
	onOpenMenu: () => void;
	topInset: number;
}) {
	const foregroundColor = useThemeColor("foreground");

	return (
		<View
			className="absolute top-0 right-0 left-0 z-10 bg-background/95"
			style={{ paddingTop: topInset }}
		>
			<View
				className="mx-auto w-full max-w-xl flex-row items-center justify-between px-4"
				style={{ height: HEADER_HEIGHT }}
			>
				<View className="w-11" />
				<View className="items-center">
					<Text.Paragraph
						weight="bold"
						className="text-foreground"
						style={{ fontSize: 18 }}
					>
						消息
					</Text.Paragraph>
				</View>
				<Button
					isIconOnly
					variant={isMenuVisible ? "secondary" : "ghost"}
					accessibilityLabel="新建消息操作"
					className="h-11 w-11 rounded-full"
					feedbackVariant="scale-ripple"
					onPress={onOpenMenu}
				>
					<Ionicons name="add" size={26} color={foregroundColor} />
				</Button>
			</View>
			<AppSeparator />
		</View>
	);
}
