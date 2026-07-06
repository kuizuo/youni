export type ConnectionType = "following" | "followers";

export type ConnectionUser = {
	bio: null | string;
	email: string;
	followerCount: number;
	handle: null | string;
	id: string;
	image: null | string;
	isFollowing: boolean;
	name: string;
	noteCount: number;
};
