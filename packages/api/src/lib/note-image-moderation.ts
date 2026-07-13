import { createDb } from "@youni/db";
import { note } from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

const MODEL_NAME = "@cf/moondream/moondream3.1-9B-A2B";
const PASS_CONFIDENCE = 0.85;
const BLOCK_CONFIDENCE = 0.9;
const GENERIC_REJECTION_REASON = "内容未通过审核";

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
	categories: z.array(moderationCategorySchema).max(12).default([]),
	confidence: z.number().min(0).max(1),
	decision: z.enum(["pass", "review", "block"]),
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
	serverUrl = env.BETTER_AUTH_URL,
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

const MODERATION_QUESTION = `你是面向中国大陆图文社区的图片初审员。只判断图片本身，并严格输出一行 JSON，不要解释：
{"decision":"pass|review|block","categories":[],"confidence":0.0}

判定规则：
1. 只有明确出现露骨色情或裸露、未成年人性内容、严重血腥伤害、毒品或枪支售卖与制作、赌博诈骗招揽、恐怖极端宣传时，才输出 block。
2. 涉及政治人物或公共事件、大量中文文字、二维码或联系方式、身份证件等隐私、难以辨认或你不确定时，输出 review。
3. 普通人物、风景、美食、宠物、日常用品和正常商品展示输出 pass。
4. categories 只能从 sexual、graphic_violence、self_harm、weapons、drugs、gambling、fraud、extremism、political、privacy、qr_or_contact、dense_text、other 中选择；安全图片必须为空数组。
5. confidence 是 0 到 1 的数字。宁可 review，不要猜测。`;

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

	const parsed = modelDecisionSchema.safeParse(value);
	if (!parsed.success) {
		return reviewResult("invalid_response");
	}

	const result = parsed.data;
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

function readModelAnswer(output: unknown) {
	if (
		typeof output === "object" &&
		output !== null &&
		"answer" in output &&
		typeof output.answer === "string"
	) {
		return output.answer;
	}

	return undefined;
}

export async function moderateImage(
	image: string,
	ai: ImageModerationAi,
): Promise<ImageModerationResult> {
	try {
		const output = await ai.run(MODEL_NAME, {
			image,
			max_tokens: 220,
			question: MODERATION_QUESTION,
			reasoning: false,
			stream: false,
			task: "query",
			temperature: 0,
		});

		return parseImageModerationAnswer(readModelAnswer(output));
	} catch {
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
		.select({ images: note.images, status: note.status })
		.from(note)
		.where(and(eq(note.id, job.noteId), eq(note.userId, job.userId)))
		.limit(1);

	if (
		!current ||
		current.status !== "audit" ||
		!imageListsMatch(current.images, job.images)
	) {
		return "stale" as const;
	}

	const ai = env.AI as unknown as ImageModerationAi | undefined;
	if (!ai || typeof ai.run !== "function") {
		return "review" as const;
	}

	const results = await Promise.all(
		job.images.map((image) => moderateImage(image, ai)),
	);
	const decision = combineImageModerationResults(results);
	if (decision === "review") {
		return "review" as const;
	}

	const [updated] = await db
		.update(note)
		.set({
			publishedAt: decision === "pass" ? new Date() : null,
			rejectionReason: decision === "block" ? GENERIC_REJECTION_REASON : null,
			status: decision === "pass" ? "published" : "rejected",
		})
		.where(
			and(
				eq(note.id, job.noteId),
				eq(note.userId, job.userId),
				eq(note.status, "audit"),
				eq(note.images, job.images),
			),
		)
		.returning({ id: note.id });

	return updated ? decision : ("stale" as const);
}

export async function enqueueNoteModeration(job: NoteModerationJob) {
	const queue = env.NOTE_MODERATION_QUEUE;
	if (!queue || typeof queue.send !== "function") {
		return false;
	}

	try {
		await queue.send(job);
		return true;
	} catch {
		return false;
	}
}
