import type { UserRow } from "@youni/db/schema/auth";
import type {
	NoteRow,
	ProhibitedTermRow,
	TopicRow,
} from "@youni/db/schema/content";
import { noteStatuses } from "@youni/db/schema/content-values";
import z from "zod";
import {
	type AdminUserRole,
	adminUserRoleOptions,
	adminUserStatusOptions,
	manageableUserStatusOptions,
} from "../admin-user-governance";
import { output, procedure } from "./procedure";
import {
	type AdminContentNoteDetail,
	type AdminHydratedContentNote,
	type AdminUserReference,
	type ContentNoteStatus,
	userGenders,
} from "./shared";

// ====== Input ======

const adminUserRoleInput = z.enum(adminUserRoleOptions);
const adminUserStatusInput = z.enum(adminUserStatusOptions);
const manageableAdminUserStatusInput = z.enum(manageableUserStatusOptions);
const adminSortDirectionInput = z.enum(["asc", "desc"]);

export const adminListInput = z.object({
	keyword: z.string().trim().optional(),
	status: z.enum(noteStatuses).optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
	sortBy: z
		.enum(["title", "author", "status", "createdAt"])
		.default("createdAt"),
	sortDirection: adminSortDirectionInput.default("desc"),
});

export const moderationQueueBuckets = [
	"attention",
	"passed",
	"blocked",
	"failed",
	"all",
] as const;

export type ModerationQueueBucket = (typeof moderationQueueBuckets)[number];

export const adminModerationQueueInput = z.object({
	bucket: z.enum(moderationQueueBuckets).default("attention"),
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(100).default(20),
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
	sortBy: z.enum(["name", "role", "status", "createdAt"]).default("createdAt"),
	sortDirection: adminSortDirectionInput.default("desc"),
});

export const adminTopicListInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(200).default(10),
	offset: z.number().int().min(0).default(0),
	sortBy: z.enum(["name", "noteCount", "createdAt"]).default("createdAt"),
	sortDirection: adminSortDirectionInput.default("desc"),
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
	gender: z.enum(userGenders).default("unknown"),
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
	gender: z.enum(userGenders).default("unknown"),
});

export const adminUserRestoreInput = z.object({
	id: z.string().min(1),
	status: manageableAdminUserStatusInput.default("active"),
});

const analyticsDayInput = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const adminAnalyticsInput = z.object({
	from: analyticsDayInput,
	to: analyticsDayInput,
});

export const adminSearchKeywordControlInput = z.object({
	excluded: z.boolean(),
	keyword: z.string().trim().min(1).max(50),
});

export const adminProhibitedTermInput = z.object({
	term: z.string().trim().min(1).max(50),
});

// ====== Output ======

export type AdminUserListItem = Pick<
	UserRow,
	| "id"
	| "name"
	| "email"
	| "image"
	| "handle"
	| "bio"
	| "gender"
	| "isAnonymous"
	| "role"
	| "status"
	| "createdAt"
	| "updatedAt"
> & {
	noteCount: number;
	followerCount: number;
	followingCount: number;
};

export type AdminTopicListItem = Pick<TopicRow, "id" | "name" | "createdAt"> & {
	noteCount: number;
};

type AdminAccount = Pick<
	UserRow,
	| "id"
	| "name"
	| "email"
	| "image"
	| "handle"
	| "bio"
	| "gender"
	| "role"
	| "status"
	| "createdAt"
	| "updatedAt"
>;

export type AdminOutputs = {
	me: {
		isAdmin: boolean;
		role: AdminUserRole;
		user: AdminAccount;
	};
	updateCurrentProfile: AdminAccount;
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
			status: ContentNoteStatus;
			createdAt: Date;
			authorName: string;
		}[];
	};
	analytics: {
		from: string;
		to: string;
		discovery: {
			totals: {
				blockAuthorCount: number;
				collectCount: number;
				impressionCount: number;
				likeCount: number;
				notInterestedCount: number;
				openCount: number;
			};
			series: {
				blockAuthorCount: number;
				collectCount: number;
				day: string;
				impressionCount: number;
				likeCount: number;
				notInterestedCount: number;
				openCount: number;
			}[];
		};
		search: {
			summary: {
				externalCount: number;
				historyCount: number;
				recommendedCount: number;
				successfulCount: number;
				totalCount: number;
				typedCount: number;
				uniqueKeywordCount: number;
			};
			series: { day: string; successfulCount: number; totalCount: number }[];
			keywords: {
				displayKeyword: string;
				excluded: boolean;
				externalCount: number;
				historyCount: number;
				keyword: string;
				previousCount: number;
				recommendedCount: number;
				successfulCount: number;
				totalCount: number;
				typedCount: number;
			}[];
		};
	};
	setSearchKeywordExcluded: { excluded: boolean; keyword: string };
	notes: {
		items: AdminHydratedContentNote[];
		total: number;
	};
	moderationQueue: {
		items: AdminHydratedContentNote[];
		summary: {
			all: number;
			attention: number;
			blocked: number;
			failed: number;
			passed: number;
		};
		total: number;
	};
	prohibitedTerms: ProhibitedTermRow[];
	addProhibitedTerm: { created: boolean };
	deleteProhibitedTerm: { deleted: boolean };
	noteDetail: AdminContentNoteDetail;
	updateNoteStatus: NoteRow | undefined;
	deleteNote: { ok: boolean };
	topics: {
		items: AdminTopicListItem[];
		total: number;
	};
	topicDetail: {
		topic: AdminTopicListItem & Pick<TopicRow, "updatedAt">;
		notes: AdminHydratedContentNote[];
	};
	saveTopic: TopicRow | undefined;
	deleteTopic: { ok: boolean };
	users: {
		items: AdminUserListItem[];
		total: number;
	};
	userDetail: {
		user: AdminUserListItem;
		notes: AdminHydratedContentNote[];
		followers: AdminUserReference[];
		following: AdminUserReference[];
	};
	createUser: UserRow | undefined;
	updateUser: UserRow | undefined;
	updateUserStatus: UserRow | undefined;
	softDeleteUser: UserRow | undefined;
	restoreUser: UserRow | undefined;
};

// ====== Contract ======

export const adminContract = {
	me: procedure.output(output<AdminOutputs["me"]>()),
	updateCurrentProfile: procedure
		.input(adminCurrentProfileInput)
		.output(output<AdminOutputs["updateCurrentProfile"]>()),
	overview: procedure.output(output<AdminOutputs["overview"]>()),
	analytics: procedure
		.input(adminAnalyticsInput)
		.output(output<AdminOutputs["analytics"]>()),
	setSearchKeywordExcluded: procedure
		.input(adminSearchKeywordControlInput)
		.output(output<AdminOutputs["setSearchKeywordExcluded"]>()),
	notes: procedure
		.input(adminListInput)
		.output(output<AdminOutputs["notes"]>()),
	moderationQueue: procedure
		.input(adminModerationQueueInput)
		.output(output<AdminOutputs["moderationQueue"]>()),
	prohibitedTerms: procedure.output(output<AdminOutputs["prohibitedTerms"]>()),
	addProhibitedTerm: procedure
		.input(adminProhibitedTermInput)
		.output(output<AdminOutputs["addProhibitedTerm"]>()),
	deleteProhibitedTerm: procedure
		.input(adminProhibitedTermInput)
		.output(output<AdminOutputs["deleteProhibitedTerm"]>()),
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
