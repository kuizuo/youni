import { Ionicons } from "@expo/vector-icons";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { TextInput, View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";

export function ChatInputBar({
	bottomInset,
	canSend,
	content,
	isSending,
	onChangeContent,
	onSend,
}: {
	bottomInset: number;
	canSend: boolean;
	content: string;
	isSending: boolean;
	onChangeContent: (value: string) => void;
	onSend: () => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const fieldForegroundColor = useThemeColor("field-foreground");
	const accentForegroundColor = useThemeColor("accent-foreground");

	return (
		<View className="bg-background">
			<AppSeparator />
			<View
				className="flex-row items-end gap-2 px-3 pt-3"
				style={{ paddingBottom: bottomInset + 10 }}
			>
				<View className="min-h-11 flex-1 justify-center rounded-3xl bg-content2 px-4 py-2">
					<TextInput
						value={content}
						onChangeText={onChangeContent}
						placeholder="发送私信"
						placeholderTextColor={mutedColor}
						multiline
						maxLength={1000}
						style={{
							color: fieldForegroundColor,
							fontSize: 16,
							lineHeight: 22,
							maxHeight: 120,
							padding: 0,
						}}
					/>
				</View>
				<Button
					isIconOnly
					variant={canSend ? "primary" : "secondary"}
					className="h-11 w-11 rounded-full"
					feedbackVariant="scale-ripple"
					isDisabled={!canSend}
					accessibilityLabel="发送"
					onPress={onSend}
				>
					{isSending ? (
						<Spinner size="sm" />
					) : (
						<Ionicons
							name="send"
							size={18}
							color={canSend ? accentForegroundColor : foregroundColor}
						/>
					)}
				</Button>
			</View>
		</View>
	);
}
