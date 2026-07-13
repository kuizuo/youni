import type { ChatMessage } from "@youni/api/contracts/messages";
import { cn, Typography } from "heroui-native";
import { View } from "react-native";

import { formatTime } from "@/utils/format";

export function MessageBubble({
	isMine,
	item,
}: {
	isMine: boolean;
	item: ChatMessage;
}) {
	return (
		<View className={cn("gap-1", isMine ? "items-end" : "items-start")}>
			<View
				className={cn(
					"max-w-[78%] rounded-3xl px-4 py-2",
					isMine ? "bg-accent" : "bg-content2",
				)}
			>
				<Typography.Paragraph
					className={isMine ? "text-accent-foreground" : "text-foreground"}
				>
					{item.content}
				</Typography.Paragraph>
			</View>
			<Typography.Paragraph type="body-xs" color="muted">
				{formatTime(item.createdAt)}
			</Typography.Paragraph>
		</View>
	);
}
