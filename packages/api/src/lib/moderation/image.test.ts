import { describe, expect, test } from "bun:test";
import {
	combineImageModerationResults,
	type ImageModerationResult,
	moderateImage,
	parseImageModerationAnswer,
} from "./image";

function result(
	decision: ImageModerationResult["decision"],
): ImageModerationResult {
	return {
		categories: [],
		confidence: 0.99,
		decision,
		reason: "model",
	};
}

describe("parseImageModerationAnswer", () => {
	test("accepts a confident safe decision", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"pass","categories":[],"confidence":0.96}',
			),
		).toMatchObject({ decision: "pass", reason: "model" });
	});

	test("treats a zero score on an explicitly safe image as zero risk", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"pass","risk":null,"risk_score":0}',
			),
		).toMatchObject({ confidence: 1, decision: "pass", reason: "model" });
	});

	test("keeps a clearly visible primary risk blocked", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"block","risk":"gambling","risk_score":0.98}',
			),
		).toMatchObject({
			categories: ["gambling"],
			confidence: 0.98,
			decision: "block",
			reason: "model",
		});
	});

	test("downgrades low confidence and invalid responses to review", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"block","categories":["sexual"],"confidence":0.7}',
			),
		).toMatchObject({ decision: "review" });
		expect(parseImageModerationAnswer("not json")).toMatchObject({
			decision: "review",
			reason: "invalid_response",
		});
	});

	test("requires safe decisions to have no risk categories", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"pass","categories":["dense_text"],"confidence":0.98}',
			),
		).toMatchObject({ decision: "review" });
	});

	test("keeps descriptive labels recognizable", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"pass","categories":["flowers","plants"],"confidence":0.9}',
			),
		).toMatchObject({
			categories: ["other"],
			decision: "review",
			reason: "model",
		});
	});

	test("recognizes every supported risk category", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"pass","categories":["sexual","graphic_violence","self_harm","weapons","drugs","gambling","fraud","extremism","political","privacy","qr_or_contact","dense_text","other"],"confidence":0}',
			),
		).toMatchObject({ decision: "review", reason: "model" });
	});
});

describe("moderateImage", () => {
	test("reads a wrapped engine response", async () => {
		const moderation = await moderateImage("data:image/jpeg;base64,/9j/", {
			run: () =>
				Promise.resolve({
					result: {
						answer: '{"decision":"pass","categories":[],"confidence":0.96}',
					},
				}),
		});

		expect(moderation).toMatchObject({ decision: "pass", reason: "model" });
	});

	test("rechecks a pricing screenshot when the model echoes every category", async () => {
		const answers = [
			'{"decision":"pass","categories":["sexual","graphic_violence","self_harm","weapons","drugs","gambling","fraud","extremism","political","privacy","qr_or_contact","dense_text","other"],"confidence":0}',
			'{"decision":"pass","risk":null,"risk_score":0}',
		];
		const questions: string[] = [];
		const moderation = await moderateImage("data:image/jpeg;base64,/9j/", {
			run: (_model, input) => {
				questions.push(input.question);
				return Promise.resolve({ answer: answers.shift() });
			},
		});

		expect(moderation).toMatchObject({
			categories: [],
			confidence: 1,
			decision: "pass",
			reason: "model",
		});
		expect(questions).toHaveLength(2);
		expect(questions[1]).toContain("subscription plans");
	});

	test("sends engine failures to review", async () => {
		const moderation = await moderateImage("https://example.com/image.jpg", {
			run: () => Promise.reject(new Error("unavailable")),
		});

		expect(moderation).toMatchObject({
			decision: "review",
			reason: "service_unavailable",
		});
	});
});

describe("combineImageModerationResults", () => {
	test("blocks if any image is clearly blocked", () => {
		expect(
			combineImageModerationResults([result("pass"), result("block")]),
		).toBe("block");
	});

	test("passes only when every image passes", () => {
		expect(
			combineImageModerationResults([result("pass"), result("pass")]),
		).toBe("pass");
		expect(
			combineImageModerationResults([result("pass"), result("review")]),
		).toBe("review");
	});
});
