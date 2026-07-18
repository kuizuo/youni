import { Ionicons } from "@expo/vector-icons";
import { Button, Typography } from "heroui-native";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";

export function TopicTopBar({
	foregroundColor,
	onBack,
	titleStyle,
	topicName,
}: {
	foregroundColor: string;
	onBack: () => void;
	titleStyle?: StyleProp<ViewStyle>;
	topicName?: string;
}) {
	return (
		<View className="relative mx-auto h-16 w-full max-w-xl flex-row items-center px-2">
			<Button
				isIconOnly
				variant="ghost"
				className="h-11 w-11 rounded-full"
				feedbackVariant="scale-ripple"
				accessibilityLabel="返回"
				onPress={onBack}
			>
				<Ionicons
					name="chevron-back"
					size={APP_HEADER_ICON_SIZE}
					color={foregroundColor}
				/>
			</Button>
			{topicName ? (
				<Animated.View
					pointerEvents="none"
					className="absolute inset-x-14 items-center"
					style={titleStyle}
				>
					<Typography.Heading
						type="h4"
						weight="semibold"
						numberOfLines={1}
						className="text-foreground"
					>
						# {topicName}
					</Typography.Heading>
				</Animated.View>
			) : null}
		</View>
	);
}
