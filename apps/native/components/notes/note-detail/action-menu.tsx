import { Ionicons } from "@expo/vector-icons";
import type { NoteVisibility } from "@youni/api/contracts/shared";
import { BottomSheet, ListGroup, useThemeColor } from "heroui-native";
import { View } from "react-native";

import { ListDivider } from "@/components/create/create-ui";
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";

const VISIBILITY_OPTIONS: Array<{
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	value: NoteVisibility;
}> = [
	{ icon: "lock-open-outline", label: "公开可见", value: "public" },
	{ icon: "people-outline", label: "仅关注者可见", value: "followers" },
	{ icon: "lock-closed-outline", label: "仅自己可见", value: "private" },
];

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
				<AppBottomSheetContent enableOverDrag={false}>
					<View className="gap-2">
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
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
