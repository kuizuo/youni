import { describe, expect, test } from "bun:test";
import {
	combineImageModerationResults,
	type ImageModerationResult,
	isOwnedNoteImageUrl,
	moderateImage,
	parseImageModerationAnswer,
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
});

describe("moderateImage", () => {
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
});
