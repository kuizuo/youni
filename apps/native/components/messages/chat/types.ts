export type ChatMessage = {
	content: string;
	createdAt: Date | string;
	id: string;
	senderId: string;
};

export type ChatPeer = {
	handle?: null | string;
	id: string;
	image?: null | string;
	name: string;
};
