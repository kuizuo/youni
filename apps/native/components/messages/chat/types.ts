export type ChatMessage = {
	content: string;
	createdAt: Date | string;
	id: string;
	senderId: string;
};

export type ChatPeer = {
	bio?: null | string;
	email?: string;
	handle?: null | string;
	id: string;
	image?: null | string;
	name: string;
};
