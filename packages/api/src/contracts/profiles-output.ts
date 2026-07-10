import type { HydratedContentNote } from "./content-note-types";

export type ProfilesOutputs = {
	searchUsers: {
		noteCount: number;
		followerCount: number;
		followingCount: number;
		likedCount: number;
		isFollowing: boolean;
		id: string;
		name: string;
		email: string;
		image: string | null;
		handle: string | null;
		bio: string | null;
		gender: string;
		status: string;
		createdAt: Date;
	}[];
	searchUsersPage: {
		items: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			likedCount: number;
			isFollowing: boolean;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			status: string;
			createdAt: Date;
		}[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	connections: {
		noteCount: number;
		followerCount: number;
		followingCount: number;
		likedCount: number;
		isFollowing: boolean;
		id: string;
		name: string;
		email: string;
		image: string | null;
		handle: string | null;
		bio: string | null;
		gender: string;
		status: string;
		createdAt: Date;
	}[];
	profile: {
		profile: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			likedCount: number;
			isFollowing: boolean;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			status: string;
			createdAt: Date;
		};
		notes: HydratedContentNote[];
	};
	profileByHandle: {
		noteCount: number;
		followerCount: number;
		followingCount: number;
		likedCount: number;
		isFollowing: boolean;
		id: string;
		name: string;
		email: string;
		image: string | null;
		handle: string | null;
		bio: string | null;
		gender: string;
		status: string;
		createdAt: Date;
	};
	me: {
		profile: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			likedCount: number;
			isFollowing: boolean;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			status: string;
			createdAt: Date;
		};
		notes: HydratedContentNote[];
		collections: HydratedContentNote[];
		liked: HydratedContentNote[];
	};
	meProfile: {
		noteCount: number;
		followerCount: number;
		followingCount: number;
		likedCount: number;
		isFollowing: boolean;
		id: string;
		name: string;
		email: string;
		image: string | null;
		handle: string | null;
		bio: string | null;
		gender: string;
		status: string;
		createdAt: Date;
	};
	meFeed: HydratedContentNote[];
	updateProfile:
		| {
				name: string;
				email: string;
				id: string;
				emailVerified: boolean;
				image: string | null;
				handle: string | null;
				bio: string | null;
				gender: string;
				role: string;
				status: string;
				banned: boolean;
				banReason: string | null;
				banExpires: Date | null;
				createdAt: Date;
				updatedAt: Date;
		  }
		| undefined;
	toggleFollow: { following: boolean; followerCount: number };
};
