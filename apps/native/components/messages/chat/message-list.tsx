import { Spinner, Typography } from "heroui-native";
import { useRef } from "react";
import { FlatList, View } from "react-native";

import { ErrorState } from "@/components/social-states";

import { MessageBubble } from "./message-bubble";
import type { ChatListMessage } from "./message-state";

export function ChatMessageList({
	currentUserId,
	isError,
	isLoading,
	messages,
	onDismissInputPanel,
	onCopyMessage,
	onDeleteMessage,
	onRetry,
	onRetryMessage,
}: {
	currentUserId?: string;
	isError: boolean;
	isLoading: boolean;
	messages: ChatListMessage[];
	onDismissInputPanel: () => void;
	onCopyMessage: (message: ChatListMessage) => void;
	onDeleteMessage: (message: ChatListMessage) => void;
	onRetry: () => void;
	onRetryMessage: (message: ChatListMessage) => void;
}) {
	const listRef = useRef<FlatList<ChatListMessage>>(null);

	if (isError && messages.length === 0) {
		return (
			<View
				className="flex-1 justify-center"
				onTouchStart={onDismissInputPanel}
			>
				<ErrorState onRetry={onRetry} />
			</View>
		);
	}

	return (
		<FlatList
			ref={listRef}
			className="flex-1"
			data={messages}
			keyExtractor={(item) => item.id}
			contentContainerClassName="gap-3 px-4 py-4"
			keyboardDismissMode="on-drag"
			keyboardShouldPersistTaps="handled"
			renderItem={({ item }) => (
				<MessageBubble
					item={item}
					isMine={item.senderId === currentUserId}
					onCopy={() => onCopyMessage(item)}
					onDelete={() => onDeleteMessage(item)}
					onRetry={
						item.deliveryStatus === "failed"
							? () => onRetryMessage(item)
							: undefined
					}
				/>
			)}
			onContentSizeChange={() =>
				listRef.current?.scrollToEnd({ animated: true })
			}
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
							从一句问候开始吧
						</Typography.Paragraph>
					</View>
				)
			}
		/>
	);
}
