import { Ionicons } from "@expo/vector-icons";
import { BottomSheet, ListGroup, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { ListDivider } from "@/components/create/create-ui";
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export function UserProfileActionsSheet({
	isBlockPending,
	isOpen,
	isSelf,
	onBlock,
	onCopyLink,
	onMessage,
	onOpenChange,
}: {
	isBlockPending: boolean;
	isOpen: boolean;
	isSelf: boolean;
	onBlock: () => void;
	onCopyLink: () => void;
	onMessage: () => void;
	onOpenChange: (isOpen: boolean) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent enableOverDrag={false}>
					<View className="gap-2">
						<BottomSheet.Title>更多操作</BottomSheet.Title>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							<ActionItem
								icon="link-outline"
								iconColor={mutedColor}
								label="复制链接"
								onPress={onCopyLink}
							/>
							{isSelf ? null : (
								<>
									<ListDivider />
									<ActionItem
										icon="chatbubble-ellipses-outline"
										iconColor={mutedColor}
										label="私信"
										onPress={onMessage}
									/>
									<ListDivider />
									<ActionItem
										danger
										disabled={isBlockPending}
										icon="ban-outline"
										iconColor={dangerColor}
										label={isBlockPending ? "正在拉黑" : "拉黑"}
										onPress={onBlock}
									/>
								</>
							)}
						</ListGroup>
					</View>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function ActionItem({
	danger,
	disabled = false,
	icon,
	iconColor,
	label,
	onPress,
}: {
	danger?: boolean;
	disabled?: boolean;
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	label: string;
	onPress: () => void;
}) {
	return (
		<ListGroup.Item
			accessibilityLabel={label}
			disabled={disabled}
			className="gap-2.5 px-3 py-3"
			onPress={() => {
				fireHaptic();
				onPress();
			}}
		>
			<ListGroup.ItemPrefix>
				<Ionicons name={icon} size={21} color={iconColor} />
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle
					className={danger ? "text-danger text-sm" : "text-sm"}
				>
					{label}
				</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
		</ListGroup.Item>
	);
}
