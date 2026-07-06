import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Text, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppSeparator } from "@/components/shared/app-separator";

export function ProfilePageHeader({
	action,
	subtitle,
	title,
}: {
	action?: ReactNode;
	subtitle?: string;
	title: string;
}) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");

	return (
		<View
			className="bg-background px-4 pb-3"
			style={{ paddingTop: insets.top + 8 }}
		>
			<View className="h-12 flex-row items-center gap-3">
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="返回"
					onPress={() => router.back()}
				>
					<Ionicons name="chevron-back" size={24} color={mutedColor} />
				</Button>
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold" numberOfLines={1}>
						{title}
					</Text.Paragraph>
					{subtitle ? (
						<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
							{subtitle}
						</Text.Paragraph>
					) : null}
				</View>
				{action}
			</View>
			<AppSeparator className="-mx-4 mt-3" />
		</View>
	);
}
