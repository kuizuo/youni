import type {
	ChatMessage,
	DeleteForMeInput,
	MessagesOutputs,
	SendMessageInput,
} from "@youni/api/contracts/messages";

export type ChatListMessage = ChatMessage & {
	deliveryStatus?: "failed" | "pending";
};

export type ConversationTransport = {
	deleteForMe: (
		input: DeleteForMeInput,
	) => Promise<MessagesOutputs["deleteForMe"]>;
	refresh: (conversationId: string) => Promise<void>;
	send: (input: SendMessageInput) => Promise<MessagesOutputs["send"]>;
};

type SessionState = {
	conversationId: string;
	deletedForMeIds: ReadonlySet<string>;
	isSending: boolean;
	outgoingMessages: ChatListMessage[];
};

export function createConversationSession({
	draftUserId,
	initialConversationId,
	onError,
	senderId,
	transport,
}: {
	draftUserId: string;
	initialConversationId: string;
	onError: (error: unknown, action: "delete" | "send") => void;
	senderId: string;
	transport: ConversationTransport;
}) {
	let sequence = 0;
	let state: SessionState = {
		conversationId: initialConversationId,
		deletedForMeIds: new Set(),
		isSending: false,
		outgoingMessages: [],
	};
	const listeners = new Set<() => void>();

	const setState = (update: (current: SessionState) => SessionState) => {
		state = update(state);
		for (const listener of listeners) listener();
	};

	const refresh = (conversationId: string) => {
		void transport.refresh(conversationId).catch(() => undefined);
	};

	const deleteRemote = async (
		conversationId: string,
		message: ChatListMessage,
	) => {
		try {
			await transport.deleteForMe({ conversationId, messageId: message.id });
		} catch (error) {
			setState((current) => {
				const deletedForMeIds = new Set(current.deletedForMeIds);
				deletedForMeIds.delete(message.id);
				return { ...current, deletedForMeIds };
			});
			onError(error, "delete");
			return;
		}

		setState((current) => ({
			...current,
			outgoingMessages: current.outgoingMessages.filter(
				(item) => item.id !== message.id,
			),
		}));
		refresh(conversationId);
	};

	const deliver = async (message: ChatListMessage) => {
		try {
			const result = await transport.send(
				state.conversationId
					? {
							clientMessageId: message.id,
							conversationId: state.conversationId,
							content: message.content,
						}
					: {
							clientMessageId: message.id,
							content: message.content,
							userId: draftUserId,
						},
			);

			setState((current) => ({
				...current,
				conversationId: result.conversationId,
				outgoingMessages: current.outgoingMessages.map((item) =>
					item.id === message.id ? result.message : item,
				),
			}));
			if (state.deletedForMeIds.has(message.id)) {
				void deleteRemote(result.conversationId, result.message);
			} else {
				refresh(result.conversationId);
			}
		} catch (error) {
			if (state.deletedForMeIds.has(message.id)) {
				setState((current) => ({
					...current,
					outgoingMessages: current.outgoingMessages.filter(
						(item) => item.id !== message.id,
					),
				}));
			} else {
				setState((current) => ({
					...current,
					outgoingMessages: current.outgoingMessages.map((item) =>
						item.id === message.id
							? { ...item, deliveryStatus: "failed" }
							: item,
					),
				}));
				onError(error, "send");
			}
		} finally {
			setState((current) => ({ ...current, isSending: false }));
		}
	};

	return {
		connect(conversationId: string) {
			if (!conversationId || conversationId === state.conversationId) return;
			setState((current) => ({ ...current, conversationId }));
		},
		deleteMessage(message: ChatListMessage) {
			setState((current) => ({
				...current,
				deletedForMeIds: new Set(current.deletedForMeIds).add(message.id),
				outgoingMessages:
					message.deliveryStatus === "failed"
						? current.outgoingMessages.filter((item) => item.id !== message.id)
						: current.outgoingMessages,
			}));
			if (
				message.deliveryStatus === "failed" ||
				message.deliveryStatus === "pending" ||
				!state.conversationId
			) {
				return;
			}
			void deleteRemote(state.conversationId, message);
		},
		getMessages(serverMessages: ChatMessage[]) {
			const serverIds = new Set(serverMessages.map((message) => message.id));
			return [
				...serverMessages,
				...state.outgoingMessages.filter(
					(message) => !serverIds.has(message.id),
				),
			].filter((message) => !state.deletedForMeIds.has(message.id));
		},
		getState: () => state,
		retryMessage(message: ChatListMessage) {
			if (state.isSending || message.deliveryStatus !== "failed") return false;
			let pendingMessage: ChatListMessage | undefined;
			setState((current) => ({
				...current,
				isSending: true,
				outgoingMessages: current.outgoingMessages.map((item) => {
					if (item.id !== message.id) return item;
					pendingMessage = { ...item, deliveryStatus: "pending" };
					return pendingMessage;
				}),
			}));
			if (!pendingMessage) {
				setState((current) => ({ ...current, isSending: false }));
				return false;
			}
			void deliver(pendingMessage);
			return true;
		},
		send(content: string) {
			const nextContent = content.trim();
			if (
				!nextContent ||
				!senderId ||
				state.isSending ||
				(!state.conversationId && !draftUserId)
			) {
				return false;
			}

			sequence += 1;
			const message: ChatListMessage = {
				content: nextContent,
				createdAt: new Date(),
				deliveryStatus: "pending",
				id: `local-${senderId}-${Date.now().toString(36)}-${sequence.toString(36)}`,
				senderId,
			};
			setState((current) => ({
				...current,
				isSending: true,
				outgoingMessages: [...current.outgoingMessages, message],
			}));
			void deliver(message);
			return true;
		},
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}
