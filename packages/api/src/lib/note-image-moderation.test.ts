import { describe, expect, test } from "bun:test";
import {
	combineImageModerationResults,
	getNoteModerationReason,
	getNoteModerationStatus,
	type ImageModerationResult,
	isOwnedNoteImageUrl,
	moderateImage,
	parseImageModerationAnswer,
	prepareNoteImageForModeration,
} from "./note-image-moderation";

describe("isOwnedNoteImageUrl", () => {
	test("accepts only images uploaded by the note author", () => {
		const image =
			"https://api.example.com/uploads/note-images/user-1/123e4567-e89b-12d3-a456-426614174000.jpg";

		expect(
			isOwnedNoteImageUrl(image, "user-1", "https://api.example.com"),
		).toBe(true);
		expect(
			isOwnedNoteImageUrl(image, "user-2", "https://api.example.com"),
		).toBe(false);
		expect(
			isOwnedNoteImageUrl(image, "user-1", "https://other.example.com"),
		).toBe(false);
	});
});

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
		).toMatchObject({
			confidence: 1,
			decision: "pass",
			reason: "model",
		});
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

	test("keeps an otherwise valid answer recognizable when it contains descriptive labels", () => {
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

	test("recognizes a response containing every supported risk category", () => {
		expect(
			parseImageModerationAnswer(
				'{"decision":"pass","categories":["sexual","graphic_violence","self_harm","weapons","drugs","gambling","fraud","extremism","political","privacy","qr_or_contact","dense_text","other"],"confidence":0}',
			),
		).toMatchObject({
			decision: "review",
			reason: "model",
		});
	});
});

describe("moderateImage", () => {
	test("loads an uploaded image from storage before moderation", async () => {
		let requestedKey = "";
		const image = await prepareNoteImageForModeration(
			"http://192.168.1.8:3000/uploads/note-images/user-1/123e4567-e89b-12d3-a456-426614174000.jpg",
			"user-1",
			{
				async get(key) {
					requestedKey = key;
					return {
						body: new Blob([new Uint8Array([255, 216, 255])]).stream(),
						writeHttpMetadata(headers) {
							headers.set("content-type", "image/jpeg");
						},
					};
				},
			},
		);

		expect(requestedKey).toBe(
			"note-images/user-1/123e4567-e89b-12d3-a456-426614174000.jpg",
		);
		expect(image).toBe("data:image/jpeg;base64,/9j/");
		expect(image).not.toContain("192.168.1.8");
	});

	test("reads the wrapped response returned by the remote service", async () => {
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

	test("sends service failures to review", async () => {
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

	test("keeps the reason that sent a note to manual review", () => {
		expect(
			getNoteModerationReason("review", [
				{ ...result("review"), reason: "service_unavailable" },
			]),
		).toBe("service_unavailable");
		expect(getNoteModerationReason("review", [result("review")])).toBe(
			"low_confidence",
		);
		expect(getNoteModerationReason("block", [result("block")])).toBe(
			"policy_violation",
		);
	});

	test("distinguishes uncertain content from an automatic review failure", () => {
		expect(getNoteModerationStatus("review", "low_confidence")).toBe(
			"needs_review",
		);
		expect(getNoteModerationStatus("review", "service_unavailable")).toBe(
			"failed",
		);
		expect(getNoteModerationStatus("pass", null)).toBe("passed");
	});
});
