import type {
	ChatMessage,
	ConversationItem,
} from "@youni/api/contracts/messages";

export type ChatMessageDeliveryStatus = "failed" | "pending";

export type ChatListMessage = ChatMessage & {
	deliveryStatus?: ChatMessageDeliveryStatus;
};

export function mergeChatMessages(
	serverMessages: ChatMessage[],
	outgoingMessages: ChatListMessage[],
) {
	const serverIds = new Set(serverMessages.map((message) => message.id));
	return [
		...serverMessages,
		...outgoingMessages.filter((message) => !serverIds.has(message.id)),
	];
}

export function markConversationRead(
	conversations: ConversationItem[],
	conversationId: string,
) {
	return conversations.map((conversation) =>
		conversation.id === conversationId
			? { ...conversation, unreadCount: 0 }
			: conversation,
	);
}
