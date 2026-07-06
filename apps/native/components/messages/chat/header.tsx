import { Avatar, useThemeColor } from "heroui-native";

import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";

import type { ChatPeer } from "./types";

export function ChatHeader({
	peer,
	topInset,
	onBack,
	onOpenSettings,
}: {
	peer?: ChatPeer;
	topInset: number;
	onBack: () => void;
	onOpenSettings: () => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");

	return (
		<AppHeader
			variant="leading"
			title={peer?.name ?? "私信"}
			subtitle={peer?.handle ? `@${peer.handle}` : "实时同步中"}
			topInset={topInset}
			showSeparator
			left={
				<AppHeaderIconButton
					accessibilityLabel="返回"
					color={mutedColor}
					icon="chevron-back"
					onPress={onBack}
				/>
			}
			beforeTitle={
				peer ? (
					<Avatar size="sm" alt={peer.name}>
						{peer.image ? <Avatar.Image source={{ uri: peer.image }} /> : null}
						<Avatar.Fallback>{peer.name.slice(0, 1)}</Avatar.Fallback>
					</Avatar>
				) : null
			}
			right={
				peer ? (
					<AppHeaderIconButton
						accessibilityLabel="更多"
						color={foregroundColor}
						icon="ellipsis-horizontal"
						onPress={onOpenSettings}
					/>
				) : null
			}
		/>
	);
}
