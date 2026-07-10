import z from "zod";

import { idInput, listInput, paginatedListInput } from "./common-inputs";
import type { NotesOutputs } from "./notes-output";
import { output, procedure } from "./procedure";

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
