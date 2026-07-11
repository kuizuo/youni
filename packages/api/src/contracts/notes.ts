import z from "zod";
import type { CommentListRow } from "./comments";
import { output, procedure } from "./procedure";
import type { ContentNoteRow, HydratedContentNote } from "./shared";
import { idInput, listInput, paginatedListInput } from "./shared";

// ====== Input ======

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
	.extend({ id: z.string().min(1) })
	.omit({ submitMode: true });

export const noteVisibilityUpdateInput = z.object({
	id: z.string().min(1),
	visibility: z.enum(["public", "followers", "private"]),
});

// ====== Output ======

export type NotesOutputs = {
	feed: HydratedContentNote[];
	followingFeed: HydratedContentNote[];
	searchNotes: {
		items: HydratedContentNote[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	byId: ContentNoteRow & {
		topics: string[];
		likedCount: number;
		collectedCount: number;
		commentCount: number;
		liked: boolean;
		collected: boolean;
		author: {
			id: string;
			name: string;
			image: string | null;
			handle: string | null;
			isFollowing: boolean;
		};
	} & { comments: CommentListRow[]; commentsNextOffset: number | null };
	drafts: HydratedContentNote[];
	draftById: HydratedContentNote | undefined;
	editById: HydratedContentNote | undefined;
	updateDraft: { id: string; status: string };
	updateNote: { id: string; status: "audit" };
	updateNoteVisibility: {
		id: string;
		visibility: "public" | "followers" | "private";
	};
	deleteMyNote: { ok: boolean };
	creatorStats: {
		total: number;
		published: number;
		draft: number;
		audit: number;
		rejected: number;
		hidden: number;
		liked: number;
		collected: number;
		comments: number;
	};
	viewHistory: { note: HydratedContentNote; viewedAt: Date }[];
	deleteViewHistory: { ok: boolean };
	clearViewHistory: { ok: boolean };
	create: { id: string; status: string };
	toggleLike: { liked: boolean; likedCount: number };
	toggleCollect: { collected: boolean; collectedCount: number };
};

// ====== Contract ======

export const notesContract = {
	feed: procedure.input(listInput).output(output<NotesOutputs["feed"]>()),
	followingFeed: procedure
		.input(listInput)
		.output(output<NotesOutputs["followingFeed"]>()),
	searchNotes: procedure
		.input(paginatedListInput)
		.output(output<NotesOutputs["searchNotes"]>()),
	byId: procedure.input(idInput).output(output<NotesOutputs["byId"]>()),
	drafts: procedure.output(output<NotesOutputs["drafts"]>()),
	draftById: procedure
		.input(idInput)
		.output(output<NotesOutputs["draftById"]>()),
	editById: procedure.input(idInput).output(output<NotesOutputs["editById"]>()),
	updateDraft: procedure
		.input(draftUpdateInput)
		.output(output<NotesOutputs["updateDraft"]>()),
	updateNote: procedure
		.input(noteEditInput)
		.output(output<NotesOutputs["updateNote"]>()),
	updateNoteVisibility: procedure
		.input(noteVisibilityUpdateInput)
		.output(output<NotesOutputs["updateNoteVisibility"]>()),
	deleteMyNote: procedure
		.input(idInput)
		.output(output<NotesOutputs["deleteMyNote"]>()),
	creatorStats: procedure.output(output<NotesOutputs["creatorStats"]>()),
	viewHistory: procedure
		.input(listInput)
		.output(output<NotesOutputs["viewHistory"]>()),
	deleteViewHistory: procedure
		.input(idInput)
		.output(output<NotesOutputs["deleteViewHistory"]>()),
	clearViewHistory: procedure.output(
		output<NotesOutputs["clearViewHistory"]>(),
	),
	create: procedure
		.input(noteCreateInput)
		.output(output<NotesOutputs["create"]>()),
	toggleLike: procedure
		.input(idInput)
		.output(output<NotesOutputs["toggleLike"]>()),
	toggleCollect: procedure
		.input(idInput)
		.output(output<NotesOutputs["toggleCollect"]>()),
};
