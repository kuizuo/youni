import { Ionicons } from "@expo/vector-icons";
import {
	BottomSheet,
	Button,
	ListGroup,
	Surface,
	useThemeColor,
} from "heroui-native";
import { Modal, Pressable, View } from "react-native";

import { ListDivider } from "@/components/create/create-ui";

export type NoteVisibility = "followers" | "private" | "public";

const VISIBILITY_OPTIONS: Array<{
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: NoteVisibility;
}> = [
	{ icon: "lock-open-outline", label: "公开可见", value: "public" },
	{ icon: "people-outline", label: "仅关注者可见", value: "followers" },
	{ icon: "lock-closed-outline", label: "仅自己可见", value: "private" },
];

export function NoteActionMenu({
	isVisible,
	onClose,
	onDelete,
	onEdit,
	onOpenVisibility,
	topInset,
}: {
	isVisible: boolean;
	onClose: () => void;
	onDelete: () => void;
	onEdit: () => void;
	onOpenVisibility: () => void;
	topInset: number;
}) {
	return (
		<Modal
			transparent
			animationType="fade"
			visible={isVisible}
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-overlay-backdrop">
				<Pressable
					accessibilityLabel="关闭菜单"
					accessibilityRole="button"
					className="absolute inset-0"
					onPress={onClose}
				/>
				<View
					pointerEvents="box-none"
					className="mx-auto w-full max-w-xl items-end px-4"
					style={{ paddingTop: topInset + 58 }}
				>
					<Surface className="w-44 gap-1 rounded-2xl p-2">
						<ActionButton icon="create-outline" label="编辑" onPress={onEdit} />
						<ActionButton
							icon="lock-open-outline"
							label="权限设置"
							onPress={onOpenVisibility}
						/>
						<ActionButton
							danger
							icon="trash-outline"
							label="删除"
							onPress={onDelete}
						/>
					</Surface>
				</View>
			</View>
		</Modal>
	);
}

export function NoteVisibilitySheet({
	isOpen,
	isSaving,
	onOpenChange,
	onSelect,
	value,
}: {
	isOpen: boolean;
	isSaving: boolean;
	onOpenChange: (value: boolean) => void;
	onSelect: (value: NoteVisibility) => void;
	value: NoteVisibility;
}) {
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");

	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<BottomSheet.Content
					snapPoints={["38%"]}
					enableDynamicSizing={false}
					enableOverDrag={false}
					contentContainerClassName="h-full"
				>
					<View className="gap-3 px-3 pb-3">
						<BottomSheet.Title>权限设置</BottomSheet.Title>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							{VISIBILITY_OPTIONS.map((item, index) => {
								const selected = item.value === value;
								return (
									<View key={item.value}>
										<ListGroup.Item
											accessibilityLabel={item.label}
											accessibilityRole="button"
											accessibilityState={{ selected }}
											disabled={isSaving}
											onPress={() => onSelect(item.value)}
											className="gap-2.5 px-3.5 py-3"
										>
											<ListGroup.ItemPrefix>
												<Ionicons
													name={item.icon}
													size={21}
													color={selected ? accentColor : foregroundColor}
												/>
											</ListGroup.ItemPrefix>
											<ListGroup.ItemContent>
												<ListGroup.ItemTitle className="text-sm">
													{item.label}
												</ListGroup.ItemTitle>
											</ListGroup.ItemContent>
											<ListGroup.ItemSuffix>
												{selected ? (
													<Ionicons
														name="checkmark"
														size={22}
														color={accentColor}
													/>
												) : (
													<View className="size-5" />
												)}
											</ListGroup.ItemSuffix>
										</ListGroup.Item>
										{index < VISIBILITY_OPTIONS.length - 1 ? (
											<ListDivider />
										) : null}
									</View>
								);
							})}
						</ListGroup>
					</View>
				</BottomSheet.Content>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function ActionButton({
	danger,
	icon,
	label,
	onPress,
}: {
	danger?: boolean;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");

	return (
		<Button
			variant="ghost"
			className="h-12 justify-start rounded-xl px-3"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons
				name={icon}
				size={20}
				color={danger ? dangerColor : mutedColor}
			/>
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
