import { createDb } from "@youni/db";
import type { ContentModerationDetail } from "@youni/db/schema/content";
import type { ContentModerationReason } from "@youni/db/schema/content-values";
import { note, noteTopic, topic } from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import {
	combineImageModerationResults,
	createImageModerationReview,
	type ImageModerationDecision,
	type ImageModerationEngine,
	type ImageModerationResult,
	moderateImage,
} from "../moderation/image";
import {
	type ContentTextModerationMatch,
	findBlockedContentText,
} from "../moderation/text";

const GENERIC_REJECTION_REASON = "内容未通过审核";
const NOTE_IMAGE_PREFIX = "note-images/";
const NOTE_IMAGE_CONTENT_TYPES = new Map([
	["gif", "image/gif"],
	["jpg", "image/jpeg"],
	["png", "image/png"],
	["webp", "image/webp"],
]);

const contentReviewJobSchema = z
	.object({
		contentId: z.string().min(1).optional(),
		images: z.array(z.string().url()).min(1).max(9),
		noteId: z.string().min(1).optional(),
		userId: z.string().min(1),
	})
	.refine((job) => Boolean(job.contentId || job.noteId))
	.transform((job) => ({
		contentId: job.contentId ?? job.noteId ?? "",
		images: job.images,
		userId: job.userId,
	}));

export type ContentReviewJob = z.output<typeof contentReviewJobSchema>;

type StoredImageObject = {
	body: ReadableStream | null;
	writeHttpMetadata: (headers: Headers) => void;
};

type ImageBucket = {
	get: (key: string) => Promise<StoredImageObject | null>;
};

export function isOwnedNoteImageUrl(
	image: string,
	userId: string,
	serverUrl: string,
) {
	try {
		const actual = new URL(image);
		const expectedOrigin = new URL(serverUrl).origin;
		const expectedPrefix = `/uploads/note-images/${encodeURIComponent(userId)}/`;
		const fileName = actual.pathname.slice(expectedPrefix.length);

		return (
			actual.origin === expectedOrigin &&
			actual.pathname.startsWith(expectedPrefix) &&
			/^[a-f0-9-]{36}\.(?:jpg|png|webp|gif)$/.test(fileName)
		);
	} catch {
		return false;
	}
}

function getNoteImageStorageLocation(image: string, userId: string) {
	const url = new URL(image);
	const publicPrefix = `/uploads/note-images/${encodeURIComponent(userId)}/`;
	if (!url.pathname.startsWith(publicPrefix)) {
		throw new Error("Note image path does not belong to the author");
	}

	const fileName = url.pathname.slice(publicPrefix.length);
	const match = fileName.match(/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/);
	if (!match?.[1]) throw new Error("Note image path is invalid");

	return {
		contentType: NOTE_IMAGE_CONTENT_TYPES.get(match[1]) ?? "image/jpeg",
		key: `${NOTE_IMAGE_PREFIX}${userId}/${fileName}`,
	};
}

function encodeBase64(bytes: Uint8Array) {
	let binary = "";
	const chunkSize = 32_768;
	for (let offset = 0; offset < bytes.length; offset += chunkSize) {
		binary += String.fromCharCode(
			...bytes.subarray(offset, offset + chunkSize),
		);
	}
	return btoa(binary);
}

export async function prepareNoteImageForReview(
	image: string,
	userId: string,
	bucket: ImageBucket,
) {
	const location = getNoteImageStorageLocation(image, userId);
	const object = await bucket.get(location.key);
	if (!object?.body) throw new Error("Note image is missing from storage");

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	const storedContentType = headers.get("content-type")?.toLowerCase();
	const contentType =
		storedContentType &&
		Array.from(NOTE_IMAGE_CONTENT_TYPES.values()).includes(storedContentType)
			? storedContentType
			: location.contentType;
	const bytes = new Uint8Array(await new Response(object.body).arrayBuffer());
	if (bytes.length === 0) throw new Error("Note image is empty");

	return `data:${contentType};base64,${encodeBase64(bytes)}`;
}

export function deriveContentModerationReason(
	decision: ImageModerationDecision,
	results: ImageModerationResult[],
): ContentModerationReason | null {
	if (decision === "block") return "policy_violation";
	if (decision === "pass") return null;
	if (results.some((result) => result.reason === "service_unavailable")) {
		return "service_unavailable";
	}
	if (results.some((result) => result.reason === "invalid_response")) {
		return "invalid_response";
	}
	return "low_confidence";
}

export function deriveContentModerationStatus(
	decision: ImageModerationDecision,
	reason: ContentModerationReason | null,
) {
	if (decision === "pass") return "passed" as const;
	if (decision === "block") return "blocked" as const;
	return reason === "low_confidence"
		? ("needs_review" as const)
		: ("failed" as const);
}

export function combineContentModerationDecision(
	imageDecision: ImageModerationDecision,
	textMatches: ContentTextModerationMatch[],
): ImageModerationDecision {
	return textMatches.length > 0 ? "block" : imageDecision;
}

export function createTextModerationDetails(
	matches: ContentTextModerationMatch[],
): ContentModerationDetail[] {
	return matches.map((match) => ({
		categories: ["prohibited_text"],
		confidence: 1,
		decision: "block",
		field: match.field,
		reason: "text_rule",
		source: "text",
		terms: match.terms,
	}));
}

function imageListsMatch(left: string[], right: string[]) {
	return (
		left.length === right.length &&
		left.every((image, index) => image === right[index])
	);
}

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

export async function processContentReviewJob(body: unknown) {
	const parsedJob = contentReviewJobSchema.safeParse(body);
	if (!parsedJob.success) return "invalid" as const;

	const job = parsedJob.data;
	const db = createDb();
	const [current] = await db
		.select({
			advancedOptions: note.advancedOptions,
			components: note.components,
			content: note.content,
			images: note.images,
			locationName: note.locationName,
			moderationStatus: note.moderationStatus,
			status: note.status,
			title: note.title,
		})
		.from(note)
		.where(and(eq(note.id, job.contentId), eq(note.userId, job.userId)))
		.limit(1);

	if (
		!current ||
		current.status !== "audit" ||
		(current.moderationStatus !== "pending" &&
			current.moderationStatus !== "processing") ||
		!imageListsMatch(current.images, job.images)
	) {
		return "stale" as const;
	}

	if (current.moderationStatus === "pending") {
		const [claimed] = await db
			.update(note)
			.set({ moderationReason: null, moderationStatus: "processing" })
			.where(
				and(
					eq(note.id, job.contentId),
					eq(note.userId, job.userId),
					eq(note.status, "audit"),
					eq(note.moderationStatus, "pending"),
					eq(note.images, job.images),
				),
			)
			.returning({ id: note.id });
		if (!claimed) return "stale" as const;
	}

	try {
		const topicRows = await db
			.select({ name: topic.name })
			.from(noteTopic)
			.innerJoin(topic, eq(noteTopic.topicId, topic.id))
			.where(eq(noteTopic.noteId, job.contentId));
		const textMatches = findBlockedContentText({
			advancedOptions: current.advancedOptions,
			components: current.components,
			content: current.content,
			locationName: current.locationName ?? undefined,
			title: current.title,
			topics: topicRows.map((row) => row.name),
		});
		const engine = env.AI as unknown as ImageModerationEngine | undefined;
		const bucket = env.YOUNI_BUCKET as unknown as ImageBucket | undefined;
		const canReviewImages = Boolean(
			engine && typeof engine.run === "function" && bucket,
		);
		if (!canReviewImages) {
			console.error("content review dependency unavailable", {
				contentId: job.contentId,
				hasBucket: Boolean(bucket),
				hasEngine: Boolean(engine && typeof engine.run === "function"),
			});
		}

		const results: ImageModerationResult[] = [];
		for (const [imageIndex, image] of job.images.entries()) {
			if (!canReviewImages || !bucket || !engine) {
				results.push(createImageModerationReview("service_unavailable"));
				continue;
			}

			let imageInput: string;
			try {
				imageInput = await prepareNoteImageForReview(image, job.userId, bucket);
			} catch (error) {
				console.error("content review image load failed", {
					contentId: job.contentId,
					errorMessage: errorMessage(error),
					imageIndex,
				});
				results.push(createImageModerationReview("service_unavailable"));
				continue;
			}

			results.push(
				await moderateImage(imageInput, engine, (error) => {
					console.error("content review inference failed", {
						contentId: job.contentId,
						errorMessage: errorMessage(error),
						imageIndex,
					});
				}),
			);
		}

		const imageDecision = combineImageModerationResults(results);
		const decision = combineContentModerationDecision(
			imageDecision,
			textMatches,
		);
		const moderationDetails: ContentModerationDetail[] = [
			...createTextModerationDetails(textMatches),
			...results.map((result, index) => ({
				...result,
				image: job.images[index] ?? "",
				source: "image" as const,
			})),
		];
		const moderationReason = deriveContentModerationReason(decision, results);
		if (decision === "review") {
			await db
				.update(note)
				.set({
					moderatedAt: new Date(),
					moderationDetails,
					moderationReason,
					moderationStatus: deriveContentModerationStatus(
						decision,
						moderationReason,
					),
				})
				.where(
					and(
						eq(note.id, job.contentId),
						eq(note.userId, job.userId),
						eq(note.status, "audit"),
						eq(note.moderationStatus, "processing"),
					),
				);
			return "review" as const;
		}

		const [updated] = await db
			.update(note)
			.set({
				moderatedAt: new Date(),
				moderationDetails,
				moderationReason,
				moderationStatus: deriveContentModerationStatus(
					decision,
					moderationReason,
				),
				publishedAt: decision === "pass" ? new Date() : null,
				rejectionReason: decision === "block" ? GENERIC_REJECTION_REASON : null,
				status: decision === "pass" ? "published" : "rejected",
			})
			.where(
				and(
					eq(note.id, job.contentId),
					eq(note.userId, job.userId),
					eq(note.status, "audit"),
					eq(note.moderationStatus, "processing"),
					eq(note.images, job.images),
				),
			)
			.returning({ id: note.id });

		return updated ? decision : ("stale" as const);
	} catch {
		await markContentReviewWriteFailed(job);
		return "review" as const;
	}
}

export async function enqueueContentReview(job: ContentReviewJob) {
	const queue = env.CONTENT_REVIEW_QUEUE;
	if (!queue || typeof queue.send !== "function") {
		await markContentReviewQueueUnavailable(job);
		return false;
	}

	try {
		await queue.send(job);
		return true;
	} catch {
		await markContentReviewQueueUnavailable(job);
		return false;
	}
}

async function markContentReviewWriteFailed(job: ContentReviewJob) {
	await createDb()
		.update(note)
		.set({
			moderatedAt: new Date(),
			moderationDetails: [],
			moderationReason: "result_write_failed",
			moderationStatus: "failed",
		})
		.where(
			and(
				eq(note.id, job.contentId),
				eq(note.userId, job.userId),
				eq(note.status, "audit"),
				eq(note.moderationStatus, "processing"),
				eq(note.images, job.images),
			),
		);
}

async function markContentReviewQueueUnavailable(job: ContentReviewJob) {
	try {
		await createDb()
			.update(note)
			.set({
				moderatedAt: new Date(),
				moderationReason: "queue_unavailable",
				moderationStatus: "failed",
			})
			.where(
				and(
					eq(note.id, job.contentId),
					eq(note.userId, job.userId),
					eq(note.status, "audit"),
					eq(note.moderationStatus, "pending"),
					eq(note.images, job.images),
				),
			);
	} catch {
		// Publishing should still succeed and leave the content available for review.
	}
}
