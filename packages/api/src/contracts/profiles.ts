import z from "zod";

import { listInput, paginatedListInput } from "./common-inputs";
import { output, procedure } from "./procedure";
import type { ProfilesOutputs } from "./profiles-output";

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
