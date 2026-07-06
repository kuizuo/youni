import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";

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
		<AppHeader
			variant="leading"
			title={title}
			subtitle={subtitle}
			topInset={insets.top}
			showSeparator
			left={
				<AppHeaderIconButton
					accessibilityLabel="返回"
					color={mutedColor}
					icon="chevron-back"
					onPress={() => router.back()}
				/>
			}
			right={action}
		/>
	);
}
