import z from "zod";

import {
	adminUserRoleOptions,
	adminUserStatusOptions,
	manageableUserStatusOptions,
} from "../admin-user-governance";
import type { AdminOutputs } from "./admin-output";
import { output, procedure } from "./procedure";

const adminUserRoleInput = z.enum(adminUserRoleOptions);
const adminUserStatusInput = z.enum(adminUserStatusOptions);
const manageableAdminUserStatusInput = z.enum(manageableUserStatusOptions);

export const adminListInput = z.object({
	keyword: z.string().trim().optional(),
	status: z
		.enum(["draft", "audit", "published", "rejected", "hidden"])
		.optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
});

export const adminIdInput = z.object({ id: z.string().min(1) });

export const adminNoteStatusInput = z.object({
	id: z.string().min(1),
	status: z.enum(["draft", "audit", "published", "rejected", "hidden"]),
	rejectionReason: z.string().trim().max(200).optional(),
});

export const adminTopicInput = z.object({
	id: z.string().min(1).optional(),
	name: z.string().trim().min(1).max(24),
});

export const adminUserListInput = z.object({
	keyword: z.string().trim().optional(),
	status: adminUserStatusInput.optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
});

export const adminTopicListInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
});

export const adminUserStatusChangeInput = z.object({
	id: z.string().min(1),
	status: adminUserStatusInput,
});

export const adminUserCreateInput = z.object({
	name: z.string().trim().min(1).max(50),
	email: z.string().trim().toLowerCase().email(),
	password: z.string().min(8).max(128),
	role: adminUserRoleInput.default("user"),
	status: manageableAdminUserStatusInput.default("active"),
	image: z.string().trim().url().optional().or(z.literal("")),
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
});

export const adminUserUpdateInput = adminUserCreateInput
	.omit({ password: true })
	.extend({
		id: z.string().min(1),
		status: adminUserStatusInput,
		password: z.string().min(8).max(128).optional().or(z.literal("")),
	});

export const adminCurrentProfileInput = z.object({
	name: z.string().trim().min(1).max(50),
	image: z.string().trim().url().optional().or(z.literal("")),
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
});

export const adminUserRestoreInput = z.object({
	id: z.string().min(1),
	status: manageableAdminUserStatusInput.default("active"),
});

export const adminContract = {
	me: procedure.output(output<AdminOutputs["me"]>()),
	updateCurrentProfile: procedure
		.input(adminCurrentProfileInput)
		.output(output<AdminOutputs["updateCurrentProfile"]>()),
	overview: procedure.output(output<AdminOutputs["overview"]>()),
	notes: procedure
		.input(adminListInput)
		.output(output<AdminOutputs["notes"]>()),
	noteDetail: procedure
		.input(adminIdInput)
		.output(output<AdminOutputs["noteDetail"]>()),
	updateNoteStatus: procedure
		.input(adminNoteStatusInput)
		.output(output<AdminOutputs["updateNoteStatus"]>()),
	deleteNote: procedure
		.input(adminIdInput)
		.output(output<AdminOutputs["deleteNote"]>()),
	topics: procedure
		.input(adminTopicListInput)
		.output(output<AdminOutputs["topics"]>()),
	topicDetail: procedure
		.input(adminIdInput)
		.output(output<AdminOutputs["topicDetail"]>()),
	saveTopic: procedure
		.input(adminTopicInput)
		.output(output<AdminOutputs["saveTopic"]>()),
	deleteTopic: procedure
		.input(adminIdInput)
		.output(output<AdminOutputs["deleteTopic"]>()),
	users: procedure
		.input(adminUserListInput)
		.output(output<AdminOutputs["users"]>()),
	userDetail: procedure
		.input(adminIdInput)
		.output(output<AdminOutputs["userDetail"]>()),
	createUser: procedure
		.input(adminUserCreateInput)
		.output(output<AdminOutputs["createUser"]>()),
	updateUser: procedure
		.input(adminUserUpdateInput)
		.output(output<AdminOutputs["updateUser"]>()),
	updateUserStatus: procedure
		.input(adminUserStatusChangeInput)
		.output(output<AdminOutputs["updateUserStatus"]>()),
	softDeleteUser: procedure
		.input(adminIdInput)
		.output(output<AdminOutputs["softDeleteUser"]>()),
	restoreUser: procedure
		.input(adminUserRestoreInput)
		.output(output<AdminOutputs["restoreUser"]>()),
};
