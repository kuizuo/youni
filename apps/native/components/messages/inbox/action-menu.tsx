import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Button, Surface, useThemeColor } from "heroui-native";
import { Modal, Pressable, View } from "react-native";

export function MessageActionMenu({
	isVisible,
	onClose,
	onOpenAction,
	topInset,
}: {
	isVisible: boolean;
	onClose: () => void;
	onOpenAction: (href: Href) => void;
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
						<ActionButton
							icon="person-add-outline"
							label="添加好友"
							onPress={() => onOpenAction("/add-friend" as Href)}
						/>
						<ActionButton
							icon="scan-outline"
							label="扫一扫"
							onPress={() => onOpenAction("/scan" as Href)}
						/>
					</Surface>
				</View>
			</View>
		</Modal>
	);
}

function ActionButton({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<Button
			variant="ghost"
			className="h-12 justify-start rounded-xl px-3"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons name={icon} size={20} color={mutedColor} />
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
