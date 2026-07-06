import { useThemeColor } from "heroui-native";

import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";

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
		<AppHeader
			className="absolute top-0 right-0 left-0 z-10 bg-background/95"
			title="消息"
			topInset={topInset}
			right={
				<AppHeaderIconButton
					variant={isMenuVisible ? "secondary" : "ghost"}
					accessibilityLabel="新建消息操作"
					color={foregroundColor}
					icon="add"
					onPress={onOpenMenu}
				/>
			}
		/>
	);
}
