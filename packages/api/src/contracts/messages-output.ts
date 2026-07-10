export type MessagesOutputs = {
	start: {
		id: string;
		peer: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
		};
	};
	conversations: {
		id: string;
		peer: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
		};
		lastMessage: {
			id: string;
			content: string;
			senderId: string;
			createdAt: Date;
		} | null;
		unreadCount: number;
		updatedAt: Date;
	}[];
	byId: {
		id: string;
		peer: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
		};
		hasBlockedPeer: boolean;
		isBlockedByPeer: boolean;
		messages: {
			id: string;
			content: string;
			senderId: string;
			createdAt: Date;
		}[];
	};
	settings: {
		peer: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
		};
		hasBlockedPeer: boolean;
		isBlockedByPeer: boolean;
		isFollowing: boolean;
		id: string;
	};
	setBlocked: { blocked: boolean; isBlockedByPeer: boolean };
	clear: { clearedAt: Date; ok: boolean };
	send: { id: string; content: string; senderId: string; createdAt: Date };
};
