import { noteVisibilities } from "@youni/db/schema/content-values";
import z from "zod";
import type { CommentListRow } from "./comments";
import { output, procedure } from "./procedure";
import type {
	ContentNoteRow,
	HydratedContentNote,
	NoteVisibility,
} from "./shared";
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
	visibility: z.enum(noteVisibilities).default("public"),
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
});

export const noteEditInput = noteCreateInput.extend({ id: z.string().min(1) });

export const noteVisibilityUpdateInput = z.object({
	id: z.string().min(1),
	visibility: z.enum(noteVisibilities),
});

export const noteFeedInput = z.object({
	limit: z.number().int().min(1).max(30).default(20),
	cursor: z.string().max(16_000).optional(),
});

export const noteFeedEventType = z.enum([
	"impression",
	"open",
	"like",
	"collect",
	"not_interested",
	"block_author",
]);

export type NoteFeedEventType = z.infer<typeof noteFeedEventType>;

export const noteFeedEventsInput = z.object({
	events: z
		.array(
			z.object({
				impressionId: z.string().min(1).max(1_000),
				noteId: z.string().min(1),
				position: z.number().int().min(0).max(300).optional(),
				type: noteFeedEventType,
			}),
		)
		.min(1)
		.max(30),
});

export const noteNotInterestedInput = z.object({
	impressionId: z.string().min(1).max(1_000).optional(),
	noteId: z.string().min(1),
	notInterested: z.boolean(),
});

// ====== Output ======

export type NotesOutputs = {
	feed: {
		items: Array<
			HydratedContentNote & {
				feedContext: {
					impressionId: string;
					position: number;
				};
			}
		>;
		nextCursor: string | null;
	};
	recordFeedEvents: { accepted: number };
	setNoteNotInterested: { notInterested: boolean; noteId: string };
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
	editById: HydratedContentNote | undefined;
	updateNote: { id: string; status: "audit" };
	updateNoteVisibility: {
		id: string;
		visibility: NoteVisibility;
	};
	deleteMyNote: { ok: boolean };
	creatorStats: {
		total: number;
		published: number;
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
	feed: procedure.input(noteFeedInput).output(output<NotesOutputs["feed"]>()),
	recordFeedEvents: procedure
		.input(noteFeedEventsInput)
		.output(output<NotesOutputs["recordFeedEvents"]>()),
	setNoteNotInterested: procedure
		.input(noteNotInterestedInput)
		.output(output<NotesOutputs["setNoteNotInterested"]>()),
	followingFeed: procedure
		.input(listInput)
		.output(output<NotesOutputs["followingFeed"]>()),
	searchNotes: procedure
		.input(paginatedListInput)
		.output(output<NotesOutputs["searchNotes"]>()),
	byId: procedure.input(idInput).output(output<NotesOutputs["byId"]>()),
	editById: procedure.input(idInput).output(output<NotesOutputs["editById"]>()),
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
