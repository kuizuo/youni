import z from "zod";

export const idInput = z.object({ id: z.string().min(1) });
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
export const listInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(60).default(30),
});
export const paginatedListInput = listInput.extend({
	offset: z.number().int().min(0).default(0),
});
export const topicDetailInput = z.object({
	id: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(20),
	offset: z.number().int().min(0).default(0),
	sort: z.enum(["hot", "latest"]).default("hot"),
});
export const topicNameInput = z.object({
	name: z.string().trim().min(1).max(24),
});

export const noteCreateInput = z.object({
	title: z.string().trim().max(100).default(""),
	content: z.string().trim().max(5000).default(""),
	images: z.array(z.string().trim().url()).max(9).default([]),
	imageMetas: z
		.array(
			z.object({
				url: z.string().trim().url(),
				width: z.number().int().positive(),
				height: z.number().int().positive(),
			}),
		)
		.max(9)
		.default([]),
	topics: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
	locationName: z.string().trim().min(1).max(80).optional(),
	visibility: z.enum(["public", "followers", "private"]).default("public"),
	components: z
		.array(
			z.object({
				type: z.enum(["file", "poll"]),
				title: z.string().trim().min(1).max(80),
				value: z.string().trim().max(300).optional(),
				options: z.array(z.string().trim().min(1).max(80)).max(8).optional(),
			}),
		)
		.max(5)
		.default([]),
	advancedOptions: z
		.object({
			allowComment: z.boolean().default(true),
			allowShare: z.boolean().default(true),
			isOriginal: z.boolean().default(true),
			contentDisclosure: z.string().trim().max(120).optional(),
		})
		.default({
			allowComment: true,
			allowShare: true,
			isOriginal: true,
		}),
	submitMode: z.enum(["draft", "publish"]).default("publish"),
});
export const draftUpdateInput = noteCreateInput.extend({
	id: z.string().min(1),
});
export const noteEditInput = noteCreateInput
	.extend({
		id: z.string().min(1),
	})
	.omit({ submitMode: true });
export const noteVisibilityUpdateInput = z.object({
	id: z.string().min(1),
	visibility: z.enum(["public", "followers", "private"]),
});

export const commentInput = z.object({
	noteId: z.string().min(1),
	content: z.string().trim().min(1).max(500),
	parentId: z.string().min(1).optional(),
});
export const noteCommentsInput = z.object({
	noteId: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(20),
	offset: z.number().int().min(0).default(0),
	sort: z.enum(["hot", "latest"]).default("hot"),
});
export const commentRepliesInput = z.object({
	parentId: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(30),
	offset: z.number().int().min(0).default(0),
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
