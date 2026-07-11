import { Spinner, Typography } from "heroui-native";
import { FlatList, View } from "react-native";

import { ErrorState } from "@/components/social-states";

import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "./types";

export function ChatMessageList({
	currentUserId,
	isError,
	isLoading,
	messages,
	onDismissInputPanel,
	onRetry,
}: {
	currentUserId?: string;
	isError: boolean;
	isLoading: boolean;
	messages: ChatMessage[];
	onDismissInputPanel: () => void;
	onRetry: () => void;
}) {
	if (isError) {
		return (
			<View
				className="flex-1 justify-center"
				onTouchStart={onDismissInputPanel}
			>
				<ErrorState
					description="聊天暂时没有加载出来，请稍后重试。"
					onRetry={onRetry}
				/>
			</View>
		);
	}

	return (
		<FlatList
			className="flex-1"
			data={messages}
			keyExtractor={(item) => item.id}
			contentContainerClassName="gap-3 px-4 py-4"
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
			renderItem={({ item }) => (
				<MessageBubble item={item} isMine={item.senderId === currentUserId} />
			)}
			onScrollBeginDrag={onDismissInputPanel}
			onTouchStart={onDismissInputPanel}
			ListEmptyComponent={
				isLoading ? (
					<View className="items-center py-16">
						<Spinner />
					</View>
				) : (
					<View className="items-center py-16">
						<Typography.Paragraph type="body-sm" color="muted">
							还没有消息，先打个招呼。
						</Typography.Paragraph>
					</View>
				)
			}
		/>
	);
}
