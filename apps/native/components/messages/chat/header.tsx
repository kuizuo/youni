import type { ChatPeer } from "@youni/api/contracts/messages";
import { Avatar, PressableFeedback, useThemeColor } from "heroui-native";

import {
	AppHeader,
	AppHeaderIconButton,
	AppHeaderTitle,
} from "@/components/shared/app-header";

export function ChatHeader({
	peer,
	topInset,
	onBack,
	onOpenProfile,
	onOpenSettings,
}: {
	peer?: ChatPeer;
	topInset: number;
	onBack: () => void;
	onOpenProfile?: () => void;
	onOpenSettings?: () => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");

	return (
		<AppHeader
			variant="leading"
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
					<PressableFeedback
						accessibilityRole="button"
						accessibilityLabel={`打开${peer.name}的个人主页`}
						isDisabled={!onOpenProfile}
						onPress={onOpenProfile}
					>
						<Avatar size="sm" alt={peer.name}>
							{peer.image ? (
								<Avatar.Image source={{ uri: peer.image }} />
							) : null}
							<Avatar.Fallback>{peer.name.slice(0, 1)}</Avatar.Fallback>
						</Avatar>
					</PressableFeedback>
				) : null
			}
			center={
				peer ? (
					<PressableFeedback
						accessibilityRole="button"
						accessibilityLabel={`打开${peer.name}的个人主页`}
						className="min-w-0 justify-center"
						isDisabled={!onOpenProfile}
						onPress={onOpenProfile}
					>
						<AppHeaderTitle
							title={peer.name}
							subtitle={peer.handle ? `@${peer.handle}` : "查看个人主页"}
						/>
					</PressableFeedback>
				) : (
					<AppHeaderTitle title="私信" subtitle="正在加载资料" />
				)
			}
			right={
				onOpenSettings ? (
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
