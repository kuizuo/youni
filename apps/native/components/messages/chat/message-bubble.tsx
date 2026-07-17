import { Ionicons } from "@expo/vector-icons";
import {
	cn,
	PressableFeedback,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

import { formatTime } from "@/utils/format";
import type { ChatListMessage } from "./message-state";

export function MessageBubble({
	isMine,
	item,
	onRetry,
}: {
	isMine: boolean;
	item: ChatListMessage;
	onRetry?: () => void;
}) {
	const dangerColor = useThemeColor("danger");
	const isFailed = isMine && item.deliveryStatus === "failed";
	const isPending = isMine && item.deliveryStatus === "pending";

	return (
		<View className={cn("gap-1", isMine ? "items-end" : "items-start")}>
			<View className="max-w-full flex-row items-center justify-end gap-2">
				{isFailed ? (
					<PressableFeedback
						accessibilityRole="button"
						accessibilityLabel="发送失败，重新发送"
						accessibilityHint="点击后确认是否重新发送这条消息"
						className="size-8 items-center justify-center rounded-full"
						hitSlop={8}
						onPress={onRetry}
					>
						<Ionicons name="alert-circle" size={20} color={dangerColor} />
					</PressableFeedback>
				) : null}
				<View
					className={cn(
						"max-w-[78%] rounded-3xl px-4 py-2",
						isMine ? "bg-accent" : "bg-content2",
						isPending && "opacity-70",
					)}
				>
					<Typography.Paragraph
						className={isMine ? "text-accent-foreground" : "text-foreground"}
					>
						{item.content}
					</Typography.Paragraph>
				</View>
			</View>
			<Typography.Paragraph
				type="body-xs"
				color={isFailed ? undefined : "muted"}
				className={isFailed ? "text-danger" : undefined}
			>
				{isPending ? "发送中 · " : isFailed ? "发送失败 · " : ""}
				{formatTime(item.createdAt)}
			</Typography.Paragraph>
		</View>
	);
}
