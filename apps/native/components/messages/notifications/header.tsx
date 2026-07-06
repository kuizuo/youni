import { useThemeColor } from "heroui-native";

import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";

export function NotificationListHeader({
	title,
	topInset,
	onBack,
}: {
	title: string;
	topInset: number;
	onBack: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<AppHeader
			variant="leading"
			title={title}
			topInset={topInset}
			left={
				<AppHeaderIconButton
					accessibilityLabel="返回"
					color={mutedColor}
					icon="chevron-back"
					onPress={onBack}
				/>
			}
		/>
	);
}
