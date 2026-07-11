import z from "zod";
import { output, procedure } from "./procedure";
import type { HydratedContentNote } from "./shared";
import { listInput, paginatedListInput } from "./shared";

// ====== Input ======

export const profileInput = z.object({ userId: z.string().min(1) });

export const profileHandleInput = z.object({
	handle: z.string().trim().min(1).max(30),
});

export const connectionsInput = profileInput.extend({
	type: z.enum(["following", "followers"]),
	limit: z.number().int().min(1).max(60).default(30),
});

export const meFeedInput = z.object({
	tab: z.enum(["notes", "collections", "liked"]),
	limit: z.number().int().min(1).max(60).default(30),
});

export const profileUpdateInput = z.object({
	name: z.string().trim().min(1).max(50),
	handle: z
		.string()
		.trim()
		.min(2)
		.max(30)
		.regex(/^[a-zA-Z0-9_]+$/)
		.optional()
		.or(z.literal("")),
	bio: z.string().trim().max(160).optional(),
	gender: z.enum(["unknown", "male", "female"]).default("unknown"),
	image: z.string().trim().url().optional().or(z.literal("")),
});

// ====== Output ======

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

// ====== Contract ======

export const profilesContract = {
	searchUsers: procedure
		.input(listInput)
		.output(output<ProfilesOutputs["searchUsers"]>()),
	searchUsersPage: procedure
		.input(paginatedListInput)
		.output(output<ProfilesOutputs["searchUsersPage"]>()),
	connections: procedure
		.input(connectionsInput)
		.output(output<ProfilesOutputs["connections"]>()),
	profile: procedure
		.input(profileInput)
		.output(output<ProfilesOutputs["profile"]>()),
	profileByHandle: procedure
		.input(profileHandleInput)
		.output(output<ProfilesOutputs["profileByHandle"]>()),
	me: procedure.output(output<ProfilesOutputs["me"]>()),
	meProfile: procedure.output(output<ProfilesOutputs["meProfile"]>()),
	meFeed: procedure
		.input(meFeedInput)
		.output(output<ProfilesOutputs["meFeed"]>()),
	updateProfile: procedure
		.input(profileUpdateInput)
		.output(output<ProfilesOutputs["updateProfile"]>()),
	toggleFollow: procedure
		.input(profileInput)
		.output(output<ProfilesOutputs["toggleFollow"]>()),
};
