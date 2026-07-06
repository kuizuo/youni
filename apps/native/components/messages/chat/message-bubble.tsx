import { cn, Text } from "heroui-native";
import { View } from "react-native";

import { formatTime } from "@/utils/format";

import type { ChatMessage } from "./types";

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
				<Text.Paragraph
					className={isMine ? "text-accent-foreground" : "text-foreground"}
				>
					{item.content}
				</Text.Paragraph>
			</View>
			<Text.Paragraph type="body-xs" color="muted">
				{formatTime(item.createdAt)}
			</Text.Paragraph>
		</View>
	);
}
