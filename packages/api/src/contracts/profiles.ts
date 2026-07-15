import type { UserRow } from "@youni/db/schema/auth";
import z from "zod";
import { output, procedure } from "./procedure";
import type { HydratedContentNote } from "./shared";
import { listInput, paginatedListInput, userGenders } from "./shared";

// ====== Input ======

export const profileInput = z.object({ userId: z.string().min(1) });

export const profileHandleInput = z.object({
	handle: z.string().trim().min(1).max(30),
});

export const profileConnectionTypes = ["following", "followers"] as const;
export type ProfileConnectionType = (typeof profileConnectionTypes)[number];

export const connectionsInput = profileInput.extend({
	type: z.enum(profileConnectionTypes),
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
	gender: z.enum(userGenders).default("unknown"),
	image: z.string().trim().url().optional().or(z.literal("")),
	coverImage: z.string().trim().url().optional().or(z.literal("")),
});

export const userBlockInput = profileInput.extend({ blocked: z.boolean() });

// ====== Output ======

export type ProfileUser = Pick<
	UserRow,
	| "id"
	| "name"
	| "email"
	| "image"
	| "coverImage"
	| "handle"
	| "bio"
	| "gender"
	| "status"
	| "createdAt"
> & {
	noteCount: number;
	followerCount: number;
	followingCount: number;
	likedCount: number;
	isFollowing: boolean;
};

export type ProfilesOutputs = {
	searchUsers: ProfileUser[];
	searchUsersPage: {
		items: ProfileUser[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	connections: ProfileUser[];
	profile: {
		isBlocked: boolean;
		profile: ProfileUser;
		notes: HydratedContentNote[];
	};
	profileByHandle: ProfileUser;
	me: {
		profile: ProfileUser;
		notes: HydratedContentNote[];
		collections: HydratedContentNote[];
		liked: HydratedContentNote[];
	};
	meProfile: ProfileUser;
	meFeed: Array<HydratedContentNote & { viewCount: number | null }>;
	updateProfile: UserRow | undefined;
	toggleFollow: { following: boolean; followerCount: number };
	blockedUsers: {
		blockedAt: Date;
		id: string;
		image: string | null;
		handle: string | null;
		name: string;
	}[];
	setBlocked: { blocked: boolean; userId: string };
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
	blockedUsers: procedure.output(output<ProfilesOutputs["blockedUsers"]>()),
	setBlocked: procedure
		.input(userBlockInput)
		.output(output<ProfilesOutputs["setBlocked"]>()),
};
