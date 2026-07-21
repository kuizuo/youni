import { Ionicons } from "@expo/vector-icons";
import { Button } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import type { EmojiType } from "rn-emoji-keyboard";

import { ThemedEmojiKeyboard } from "@/components/shared/themed-emoji-keyboard";

export type CreateInputField = "content" | "title";

export function CreateKeyboardPanel({
	children,
	emojiPanelHeight,
	isEmojiPickerOpen,
	mutedColor,
	onDone,
	onEmojiPress,
	onEmojiSelect,
	onMentionPress,
	onTopicPress,
}: {
	children?: ReactNode;
	emojiPanelHeight: number;
	isEmojiPickerOpen: boolean;
	mutedColor: string;
	onDone: () => void;
	onEmojiPress: () => void;
	onEmojiSelect: (emoji: EmojiType) => void;
	onMentionPress: () => void;
	onTopicPress: () => void;
}) {
	return (
		<View className="border-border border-t bg-background px-4 pt-1 pb-1">
			<View className="mx-auto w-full max-w-xl">
				{children ? <View className="pb-2">{children}</View> : null}
				<View className="h-10 flex-row items-center justify-between">
					<View className="flex-row items-center gap-1">
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							accessibilityLabel="插入话题"
							onPress={onTopicPress}
						>
							<Ionicons name="pricetag-outline" size={22} color={mutedColor} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							accessibilityLabel="提及用户"
							onPress={onMentionPress}
						>
							<Ionicons name="at-outline" size={23} color={mutedColor} />
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant={isEmojiPickerOpen ? "secondary" : "ghost"}
							accessibilityLabel="选择表情"
							onPress={onEmojiPress}
						>
							<Ionicons name="happy-outline" size={23} color={mutedColor} />
						</Button>
					</View>
					<Button
						size="sm"
						variant="ghost"
						className="rounded-full px-3"
						onPress={onDone}
					>
						<Button.Label>完成</Button.Label>
					</Button>
				</View>
				{isEmojiPickerOpen ? (
					<View
						className="overflow-hidden rounded-2xl bg-content2"
						style={{ height: emojiPanelHeight }}
					>
						<ThemedEmojiKeyboard onEmojiSelected={onEmojiSelect} />
					</View>
				) : null}
			</View>
		</View>
	);
}
