import z from "zod";

const MODEL_NAME = "@cf/moondream/moondream3.1-9B-A2B";
const PASS_CONFIDENCE = 0.85;
const BLOCK_CONFIDENCE = 0.9;

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

export type ImageModerationDecision = "block" | "pass" | "review";
export type ImageModerationReason =
	| "invalid_response"
	| "model"
	| "service_unavailable";

export type ImageModerationResult = {
	categories: z.infer<typeof moderationCategorySchema>[];
	confidence: number;
	decision: ImageModerationDecision;
	reason: ImageModerationReason;
};

export type ImageModerationEngine = {
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

export function createImageModerationReview(
	reason: Extract<
		ImageModerationReason,
		"invalid_response" | "service_unavailable"
	>,
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
		return createImageModerationReview("invalid_response");
	}

	const json = extractJsonObject(answer);
	if (!json) {
		return createImageModerationReview("invalid_response");
	}

	let value: unknown;
	try {
		value = JSON.parse(json);
	} catch {
		return createImageModerationReview("invalid_response");
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
	if (!parsed.success) {
		return createImageModerationReview("invalid_response");
	}

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
	const result = { ...parsed.data, categories, confidence };
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

	return { ...result, decision: "review", reason: "model" };
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

export async function moderateImage(
	image: string,
	engine: ImageModerationEngine,
	onError?: (error: unknown) => void,
): Promise<ImageModerationResult> {
	try {
		const run = (question: string) =>
			engine.run(MODEL_NAME, {
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
		return createImageModerationReview("service_unavailable");
	}
}

export function combineImageModerationResults(
	results: ImageModerationResult[],
): ImageModerationDecision {
	if (results.some((result) => result.decision === "block")) return "block";
	if (
		results.length > 0 &&
		results.every((result) => result.decision === "pass")
	) {
		return "pass";
	}
	return "review";
}
