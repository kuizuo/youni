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
	deletedForMeIds: ReadonlySet<string> = new Set(),
) {
	const serverIds = new Set(serverMessages.map((message) => message.id));
	return [
		...serverMessages,
		...outgoingMessages.filter((message) => !serverIds.has(message.id)),
	].filter((message) => !deletedForMeIds.has(message.id));
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
