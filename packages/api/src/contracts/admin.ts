import z from "zod";
import {
	adminUserRoleOptions,
	adminUserStatusOptions,
	manageableUserStatusOptions,
} from "../admin-user-governance";
import { output, procedure } from "./procedure";
import type {
	AdminContentNoteDetail,
	AdminHydratedContentNote,
} from "./shared";

// ====== Input ======

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
	status: z.enum(["audit", "published", "rejected", "hidden"]),
	rejectionReason: z.string().trim().max(200).optional(),
});

export const adminTopicInput = z.object({
	id: z.string().min(1).optional(),
	name: z.string().trim().min(1).max(24),
});

export const adminUserListInput = z.object({
	accountType: z.enum(["registered", "anonymous"]).optional(),
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

// ====== Output ======

export type AdminOutputs = {
	me: {
		isAdmin: boolean;
		role: "admin" | "operator" | "user";
		user: {
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			role: string;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		};
	};
	updateCurrentProfile: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		handle: string | null;
		bio: string | null;
		gender: string;
		role: string;
		status: string;
		createdAt: Date;
		updatedAt: Date;
	};
	overview: {
		noteCount: number;
		auditCount: number;
		userCount: number;
		registeredUserCount: number;
		anonymousUserCount: number;
		topicCount: number;
		interactionCount: number;
		recentNotes: {
			id: string;
			title: string;
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			createdAt: Date;
			authorName: string;
		}[];
	};
	notes: {
		items: AdminHydratedContentNote<{
			id: string;
			title: string;
			content: string;
			cover: string | null;
			images: string[];
			imageMetas: { height: number; url: string; width: number }[];
			locationName: string | null;
			visibility: "public" | "followers" | "private";
			components: {
				options?: string[];
				title: string;
				type: "file" | "poll";
				value?: string;
			}[];
			advancedOptions: {
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			};
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			rejectionReason: string | null;
			createdAt: Date;
			publishedAt: Date | null;
			draftSavedAt: Date | null;
			userId: string;
			authorName: string;
			authorEmail: string;
		}>[];
		total: number;
	};
	noteDetail: AdminContentNoteDetail;
	updateNoteStatus:
		| {
				title: string;
				images: string[];
				id: string;
				status: "draft" | "audit" | "published" | "rejected" | "hidden";
				createdAt: Date;
				updatedAt: Date;
				userId: string;
				content: string;
				imageMetas: { height: number; url: string; width: number }[];
				cover: string | null;
				locationName: string | null;
				visibility: "public" | "followers" | "private";
				components: {
					options?: string[];
					title: string;
					type: "file" | "poll";
					value?: string;
				}[];
				advancedOptions: {
					allowComment: boolean;
					allowShare: boolean;
					contentDisclosure?: string | null;
					isOriginal: boolean;
				};
				rejectionReason: string | null;
				publishedAt: Date | null;
				draftSavedAt: Date | null;
		  }
		| undefined;
	deleteNote: { ok: boolean };
	topics: {
		items: { noteCount: number; id: string; name: string; createdAt: Date }[];
		total: number;
	};
	topicDetail: {
		topic: {
			noteCount: number;
			id: string;
			name: string;
			createdAt: Date;
			updatedAt: Date;
		};
		notes: AdminHydratedContentNote<{
			id: string;
			title: string;
			content: string;
			cover: string | null;
			images: string[];
			imageMetas: { height: number; url: string; width: number }[];
			locationName: string | null;
			visibility: "public" | "followers" | "private";
			components: {
				options?: string[];
				title: string;
				type: "file" | "poll";
				value?: string;
			}[];
			advancedOptions: {
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			};
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			rejectionReason: string | null;
			createdAt: Date;
			publishedAt: Date | null;
			draftSavedAt: Date | null;
			userId: string;
			authorName: string;
			authorEmail: string;
		}>[];
	};
	saveTopic:
		| { name: string; id: string; createdAt: Date; updatedAt: Date }
		| undefined;
	deleteTopic: { ok: boolean };
	users: {
		items: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			isAnonymous: boolean;
			role: string;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		}[];
		total: number;
	};
	userDetail: {
		user: {
			noteCount: number;
			followerCount: number;
			followingCount: number;
			id: string;
			name: string;
			email: string;
			image: string | null;
			handle: string | null;
			bio: string | null;
			gender: string;
			isAnonymous: boolean;
			role: string;
			status: string;
			createdAt: Date;
			updatedAt: Date;
		};
		notes: AdminHydratedContentNote<{
			id: string;
			title: string;
			content: string;
			cover: string | null;
			images: string[];
			imageMetas: { height: number; url: string; width: number }[];
			locationName: string | null;
			visibility: "public" | "followers" | "private";
			components: {
				options?: string[];
				title: string;
				type: "file" | "poll";
				value?: string;
			}[];
			advancedOptions: {
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			};
			status: "draft" | "audit" | "published" | "rejected" | "hidden";
			rejectionReason: string | null;
			createdAt: Date;
			publishedAt: Date | null;
			draftSavedAt: Date | null;
			userId: string;
			authorName: string;
			authorEmail: string;
		}>[];
		followers: {
			userId: string;
			name: string;
			email: string;
			image: string | null;
			createdAt: Date;
		}[];
		following: {
			userId: string;
			name: string;
			email: string;
			image: string | null;
			createdAt: Date;
		}[];
	};
	createUser:
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
	updateUser:
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
	updateUserStatus:
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
	softDeleteUser:
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
	restoreUser:
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
};

// ====== Contract ======

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
