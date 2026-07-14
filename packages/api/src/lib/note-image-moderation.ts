import { createDb } from "@youni/db";
import type { NoteModerationReason } from "@youni/db/schema/content-values";
import { note } from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

const MODEL_NAME = "@cf/moondream/moondream3.1-9B-A2B";
const PASS_CONFIDENCE = 0.85;
const BLOCK_CONFIDENCE = 0.9;
const GENERIC_REJECTION_REASON = "内容未通过审核";
const NOTE_IMAGE_PREFIX = "note-images/";
const NOTE_IMAGE_CONTENT_TYPES = new Map([
	["gif", "image/gif"],
	["jpg", "image/jpeg"],
	["png", "image/png"],
	["webp", "image/webp"],
]);

const moderationCategorySchema = z.enum([
	"sexual",
	"graphic_violence",
	"self_harm",
	"weapons",
	"drugs",
	"gambling",
	"fraud",
	"extremism",
	"political",
	"privacy",
	"qr_or_contact",
	"dense_text",
	"other",
]);

const modelDecisionSchema = z.object({
	categories: z
		.array(z.string())
		.max(moderationCategorySchema.options.length)
		.default([]),
	confidence: z.coerce.number().min(0).max(1),
	decision: z.enum(["pass", "review", "block"]),
});

const riskDecisionSchema = z.object({
	decision: z.enum(["pass", "review", "block"]),
	risk: z.string().nullable(),
	risk_score: z.coerce.number().min(0).max(1),
});

const noteModerationJobSchema = z.object({
	images: z.array(z.string().url()).min(1).max(9),
	noteId: z.string().min(1),
	userId: z.string().min(1),
});

export type NoteModerationJob = z.infer<typeof noteModerationJobSchema>;
export type ImageModerationDecision = "block" | "pass" | "review";

export type ImageModerationResult = {
	categories: z.infer<typeof moderationCategorySchema>[];
	confidence: number;
	decision: ImageModerationDecision;
	reason: "invalid_response" | "model" | "service_unavailable";
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

type ImageModerationAi = {
	run: (
		model: string,
		input: {
			image: string;
			max_tokens: number;
			question: string;
			reasoning: boolean;
			stream: false;
			task: "query";
			temperature: number;
		},
	) => Promise<unknown>;
};

type ModerationImageObject = {
	body: ReadableStream | null;
	writeHttpMetadata: (headers: Headers) => void;
};

type ModerationImageBucket = {
	get: (key: string) => Promise<ModerationImageObject | null>;
};

const MODERATION_QUESTION = `You review images for a mainland China social content app. Judge only what is actually visible in the image. Return exactly one line of JSON and no explanation:
{"decision":"pass|review|block","risk":null,"risk_score":0.0}

Rules:
1. Use block only for clearly visible explicit sexual content or nudity, sexual content involving minors, severe graphic injury, instructions or sales for drugs or firearms, gambling or scam solicitation, or terrorist/extremist propaganda.
2. Use review for a clearly visible political figure or public event, QR code or contact details used for off-platform solicitation, identity documents or private data, unreadable content with concrete risk cues, or genuine uncertainty about a visible risk.
3. Use pass for ordinary people, landscapes, flowers, food, pets, daily objects, and normal product or software displays. Ordinary shopping pages, software subscription plans, price comparisons, currency symbols, prices, discounts, and the word Premium are safe by themselves. The amount of text alone is not a risk.
4. risk must be null for pass. Otherwise it must be only the single most important risk actually visible: sexual, graphic_violence, self_harm, weapons, drugs, gambling, fraud, extremism, political, privacy, qr_or_contact, or other. Never list possible labels or repeat this list.
5. risk_score is the probability that the visible risk is real, where 0 means no visible risk and 1 means certain risk. Use review rather than guessing when a concrete risk cue exists but is unclear.

Safe subscription plan example:
{"decision":"pass","risk":null,"risk_score":0}
Clear gambling solicitation example:
{"decision":"block","risk":"gambling","risk_score":0.98}`;

const MODERATION_RECHECK_QUESTION = `Recheck this image because the previous answer copied the list of possible risks instead of judging the image. Return exactly one line of JSON:
{"decision":"pass|review|block","risk":null,"risk_score":0.0}

Judge only a risk actually visible in the image. Ordinary product pages, software subscription plans, price comparisons, currency symbols, prices, discounts, and text-heavy screenshots are safe unless they visibly solicit gambling, scams, prohibited sales, off-platform contact, or another concrete risk. For pass, use risk null and risk_score near 0. For review or block, give only one primary risk label.`;

function reviewResult(
	reason: ImageModerationResult["reason"],
): ImageModerationResult {
	return {
		categories: [],
		confidence: 0,
		decision: "review",
		reason,
	};
}

function extractJsonObject(value: string) {
	const start = value.indexOf("{");
	const end = value.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	return value.slice(start, end + 1);
}

export function parseImageModerationAnswer(
	answer: unknown,
): ImageModerationResult {
	if (typeof answer !== "string") {
		return reviewResult("invalid_response");
	}

	const json = extractJsonObject(answer);
	if (!json) {
		return reviewResult("invalid_response");
	}

	let value: unknown;
	try {
		value = JSON.parse(json);
	} catch {
		return reviewResult("invalid_response");
	}

	const riskDecision = riskDecisionSchema.safeParse(value);
	if (riskDecision.success) {
		const knownCategory = riskDecision.data.risk
			? moderationCategorySchema.safeParse(riskDecision.data.risk)
			: null;
		const categories: ImageModerationResult["categories"] = riskDecision.data
			.risk
			? [knownCategory?.success ? knownCategory.data : "other"]
			: [];
		const confidence =
			riskDecision.data.decision === "pass"
				? 1 - riskDecision.data.risk_score
				: riskDecision.data.risk_score;
		const result = {
			categories,
			confidence,
			decision: riskDecision.data.decision,
		};

		if (
			result.decision === "block" &&
			result.confidence >= BLOCK_CONFIDENCE &&
			result.categories.length === 1
		) {
			return { ...result, reason: "model" };
		}
		if (
			result.decision === "pass" &&
			result.confidence >= PASS_CONFIDENCE &&
			result.categories.length === 0
		) {
			return { ...result, reason: "model" };
		}

		return { ...result, decision: "review", reason: "model" };
	}

	const parsed = modelDecisionSchema.safeParse(value);
	if (!parsed.success) return reviewResult("invalid_response");

	const categories = Array.from(
		new Set(
			parsed.data.categories.map((category) => {
				const knownCategory = moderationCategorySchema.safeParse(category);
				return knownCategory.success ? knownCategory.data : "other";
			}),
		),
	);
	const confidence =
		parsed.data.decision === "pass" &&
		categories.length === 0 &&
		parsed.data.confidence <= 1 - PASS_CONFIDENCE
			? 1 - parsed.data.confidence
			: parsed.data.confidence;
	const result = {
		...parsed.data,
		categories,
		confidence,
	};
	if (result.decision === "block" && result.confidence >= BLOCK_CONFIDENCE) {
		return { ...result, reason: "model" };
	}
	if (
		result.decision === "pass" &&
		result.confidence >= PASS_CONFIDENCE &&
		result.categories.length === 0
	) {
		return { ...result, reason: "model" };
	}

	return {
		...result,
		decision: "review",
		reason: "model",
	};
}

function echoedEveryRiskCategory(answer: unknown) {
	if (typeof answer !== "string") return false;
	const json = extractJsonObject(answer);
	if (!json) return false;

	try {
		const parsed = modelDecisionSchema.safeParse(JSON.parse(json));
		if (!parsed.success || parsed.data.decision !== "pass") return false;
		const categories = new Set(parsed.data.categories);
		return (
			parsed.data.confidence <= 1 - PASS_CONFIDENCE &&
			moderationCategorySchema.options.every((category) =>
				categories.has(category),
			)
		);
	} catch {
		return false;
	}
}

function readModelAnswer(output: unknown) {
	if (
		typeof output === "object" &&
		output !== null &&
		"answer" in output &&
		typeof output.answer === "string"
	) {
		return output.answer;
	}
	if (
		typeof output === "object" &&
		output !== null &&
		"result" in output &&
		typeof output.result === "object" &&
		output.result !== null &&
		"answer" in output.result &&
		typeof output.result.answer === "string"
	) {
		return output.result.answer;
	}

	return undefined;
}

function getNoteImageStorageLocation(image: string, userId: string) {
	const url = new URL(image);
	const publicPrefix = `/uploads/note-images/${encodeURIComponent(userId)}/`;
	if (!url.pathname.startsWith(publicPrefix)) {
		throw new Error("Note image path does not belong to the author");
	}

	const fileName = url.pathname.slice(publicPrefix.length);
	const match = fileName.match(/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/);
	if (!match?.[1]) {
		throw new Error("Note image path is invalid");
	}

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

export async function prepareNoteImageForModeration(
	image: string,
	userId: string,
	bucket: ModerationImageBucket,
) {
	const location = getNoteImageStorageLocation(image, userId);
	const object = await bucket.get(location.key);
	if (!object?.body) {
		throw new Error("Note image is missing from storage");
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	const storedContentType = headers.get("content-type")?.toLowerCase();
	const contentType =
		storedContentType &&
		Array.from(NOTE_IMAGE_CONTENT_TYPES.values()).includes(storedContentType)
			? storedContentType
			: location.contentType;
	const bytes = new Uint8Array(await new Response(object.body).arrayBuffer());
	if (bytes.length === 0) {
		throw new Error("Note image is empty");
	}

	return `data:${contentType};base64,${encodeBase64(bytes)}`;
}

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : String(error);
}

export async function moderateImage(
	image: string,
	ai: ImageModerationAi,
	onError?: (error: unknown) => void,
): Promise<ImageModerationResult> {
	try {
		const run = (question: string) =>
			ai.run(MODEL_NAME, {
				image,
				max_tokens: 220,
				question,
				reasoning: false,
				stream: false,
				task: "query",
				temperature: 0,
			});
		const output = await run(MODERATION_QUESTION);
		const answer = readModelAnswer(output);
		if (echoedEveryRiskCategory(answer)) {
			const rechecked = await run(MODERATION_RECHECK_QUESTION);
			return parseImageModerationAnswer(readModelAnswer(rechecked));
		}

		return parseImageModerationAnswer(answer);
	} catch (error) {
		onError?.(error);
		return reviewResult("service_unavailable");
	}
}

export function combineImageModerationResults(
	results: ImageModerationResult[],
): ImageModerationDecision {
	if (results.some((result) => result.decision === "block")) {
		return "block";
	}
	if (
		results.length > 0 &&
		results.every((result) => result.decision === "pass")
	) {
		return "pass";
	}
	return "review";
}

export function getNoteModerationReason(
	decision: ImageModerationDecision,
	results: ImageModerationResult[],
): NoteModerationReason | null {
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

export function getNoteModerationStatus(
	decision: ImageModerationDecision,
	reason: NoteModerationReason | null,
) {
	if (decision === "pass") return "passed" as const;
	if (decision === "block") return "blocked" as const;
	return reason === "low_confidence"
		? ("needs_review" as const)
		: ("failed" as const);
}

function imageListsMatch(left: string[], right: string[]) {
	return (
		left.length === right.length &&
		left.every((image, index) => image === right[index])
	);
}

export async function processNoteModerationJob(body: unknown) {
	const parsedJob = noteModerationJobSchema.safeParse(body);
	if (!parsedJob.success) {
		return "invalid" as const;
	}

	const job = parsedJob.data;
	const db = createDb();
	const [current] = await db
		.select({
			images: note.images,
			moderationStatus: note.moderationStatus,
			status: note.status,
		})
		.from(note)
		.where(and(eq(note.id, job.noteId), eq(note.userId, job.userId)))
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
			.set({ moderationStatus: "processing", moderationReason: null })
			.where(
				and(
					eq(note.id, job.noteId),
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
		const ai = env.AI as unknown as ImageModerationAi | undefined;
		const bucket = env.YOUNI_BUCKET as unknown as
			| ModerationImageBucket
			| undefined;
		if (!ai || typeof ai.run !== "function" || !bucket) {
			console.error("note moderation dependency unavailable", {
				hasAi: Boolean(ai && typeof ai.run === "function"),
				hasBucket: Boolean(bucket),
				noteId: job.noteId,
			});
			await db
				.update(note)
				.set({
					moderatedAt: new Date(),
					moderationDetails: [],
					moderationReason: "service_unavailable",
					moderationStatus: "failed",
				})
				.where(
					and(
						eq(note.id, job.noteId),
						eq(note.userId, job.userId),
						eq(note.status, "audit"),
						eq(note.moderationStatus, "processing"),
					),
				);
			return "review" as const;
		}

		const results: ImageModerationResult[] = [];
		for (const [imageIndex, image] of job.images.entries()) {
			let imageInput: string;
			try {
				imageInput = await prepareNoteImageForModeration(
					image,
					job.userId,
					bucket,
				);
			} catch (error) {
				console.error("note moderation image load failed", {
					errorMessage: errorMessage(error),
					imageIndex,
					noteId: job.noteId,
				});
				results.push(reviewResult("service_unavailable"));
				continue;
			}

			results.push(
				await moderateImage(imageInput, ai, (error) => {
					console.error("note moderation inference failed", {
						errorMessage: errorMessage(error),
						imageIndex,
						noteId: job.noteId,
					});
				}),
			);
		}
		const decision = combineImageModerationResults(results);
		const moderationDetails = results.map((result, index) => ({
			...result,
			image: job.images[index] ?? "",
		}));
		const moderationReason = getNoteModerationReason(decision, results);
		if (decision === "review") {
			await db
				.update(note)
				.set({
					moderatedAt: new Date(),
					moderationDetails,
					moderationReason,
					moderationStatus: getNoteModerationStatus(decision, moderationReason),
				})
				.where(
					and(
						eq(note.id, job.noteId),
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
				moderationStatus: getNoteModerationStatus(decision, moderationReason),
				publishedAt: decision === "pass" ? new Date() : null,
				rejectionReason: decision === "block" ? GENERIC_REJECTION_REASON : null,
				status: decision === "pass" ? "published" : "rejected",
			})
			.where(
				and(
					eq(note.id, job.noteId),
					eq(note.userId, job.userId),
					eq(note.status, "audit"),
					eq(note.moderationStatus, "processing"),
					eq(note.images, job.images),
				),
			)
			.returning({ id: note.id });

		return updated ? decision : ("stale" as const);
	} catch {
		await db
			.update(note)
			.set({
				moderatedAt: new Date(),
				moderationDetails: [],
				moderationReason: "result_write_failed",
				moderationStatus: "failed",
			})
			.where(
				and(
					eq(note.id, job.noteId),
					eq(note.userId, job.userId),
					eq(note.status, "audit"),
					eq(note.moderationStatus, "processing"),
					eq(note.images, job.images),
				),
			);
		return "review" as const;
	}
}

export async function enqueueNoteModeration(job: NoteModerationJob) {
	const queue = env.NOTE_MODERATION_QUEUE;
	if (!queue || typeof queue.send !== "function") {
		await markNoteModerationQueueUnavailable(job);
		return false;
	}

	try {
		await queue.send(job);
		return true;
	} catch {
		await markNoteModerationQueueUnavailable(job);
		return false;
	}
}

async function markNoteModerationQueueUnavailable(job: NoteModerationJob) {
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
					eq(note.id, job.noteId),
					eq(note.userId, job.userId),
					eq(note.status, "audit"),
					eq(note.moderationStatus, "pending"),
					eq(note.images, job.images),
				),
			);
	} catch {
		// Publishing should still succeed and leave the note available for review.
	}
}
