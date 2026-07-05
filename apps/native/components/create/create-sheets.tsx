import { BottomSheet, ListGroup, Switch } from "heroui-native";
import { View } from "react-native";

import { ListDivider } from "./create-ui";

const SWITCH_THUMB_ANIMATION = {
	backgroundColor: {
		value: ["#FFFFFF", "#FFFFFF"] as [string, string],
		timingConfig: { duration: 175 },
	},
};

export function AdvancedOptionsSheet({
	allowComment,
	allowShare,
	isOpen,
	onAllowCommentChange,
	onAllowShareChange,
	onOpenChange,
}: {
	allowComment: boolean;
	allowShare: boolean;
	isOpen: boolean;
	onAllowCommentChange: (value: boolean) => void;
	onAllowShareChange: (value: boolean) => void;
	onOpenChange: (value: boolean) => void;
}) {
	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<BottomSheet.Content
					snapPoints={["34%"]}
					enableDynamicSizing={false}
					enableOverDrag={false}
					contentContainerClassName="h-full"
				>
					<View className="gap-3 px-3 pb-3">
						<BottomSheet.Title>高级选项</BottomSheet.Title>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							<SheetSwitchRow
								label="允许评论"
								value={allowComment}
								onValueChange={onAllowCommentChange}
							/>
							<ListDivider />
							<SheetSwitchRow
								label="允许分享"
								value={allowShare}
								onValueChange={onAllowShareChange}
							/>
						</ListGroup>
					</View>
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function SheetSwitchRow({
	label,
	onValueChange,
	value,
}: {
	label: string;
	onValueChange: (value: boolean) => void;
	value: boolean;
}) {
	return (
		<ListGroup.Item
			accessibilityLabel={label}
			accessibilityRole="switch"
			accessibilityState={{ checked: value }}
			onPress={() => onValueChange(!value)}
			className="px-3.5 py-3"
		>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle className="text-sm">{label}</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
			<ListGroup.ItemSuffix>
				<Switch
					isSelected={value}
					onSelectedChange={onValueChange}
					className="h-6 w-12"
				>
					<Switch.Thumb
						animation={SWITCH_THUMB_ANIMATION}
						className="bg-white"
					/>
				</Switch>
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	);
}
