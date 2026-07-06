import { Ionicons } from "@expo/vector-icons";
import { Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

export function NotificationListHeader({
	isClearing,
	isMarkingAllRead,
	title,
	topInset,
	onBack,
	onClear,
	onMarkAllRead,
}: {
	isClearing: boolean;
	isMarkingAllRead: boolean;
	title: string;
	topInset: number;
	onBack: () => void;
	onClear: () => void;
	onMarkAllRead: () => void;
}) {
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");

	return (
		<View
			className="bg-background px-4 pb-3"
			style={{ paddingTop: topInset + 8 }}
		>
			<View className="mx-auto h-12 w-full max-w-xl flex-row items-center gap-3">
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="返回"
					onPress={onBack}
				>
					<Ionicons name="chevron-back" size={24} color={mutedColor} />
				</Button>
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold" style={{ fontSize: 18 }}>
						{title}
					</Text.Paragraph>
				</View>
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="全部已读"
					isDisabled={isMarkingAllRead}
					onPress={onMarkAllRead}
				>
					<Ionicons name="checkmark-done" size={22} color={foregroundColor} />
				</Button>
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="清空"
					isDisabled={isClearing}
					onPress={onClear}
				>
					<Ionicons name="trash-outline" size={21} color={mutedColor} />
				</Button>
			</View>
			<AppSeparator className="-mx-4 mt-3" />
		</View>
	);
}
