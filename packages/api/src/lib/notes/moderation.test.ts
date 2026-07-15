import { describe, expect, test } from "bun:test";
import type { ImageModerationResult } from "../moderation/image";
import {
	combineContentModerationDecision,
	createTextModerationDetails,
	deriveContentModerationReason,
	deriveContentModerationStatus,
	isOwnedNoteImageUrl,
	prepareNoteImageForReview,
} from "./moderation";

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

describe("note image review adapter", () => {
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

	test("loads an uploaded image from note storage", async () => {
		let requestedKey = "";
		const image = await prepareNoteImageForReview(
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

	test("maps image decisions to content review state", () => {
		expect(
			deriveContentModerationReason("review", [
				{ ...result("review"), reason: "service_unavailable" },
			]),
		).toBe("service_unavailable");
		expect(deriveContentModerationReason("review", [result("review")])).toBe(
			"low_confidence",
		);
		expect(deriveContentModerationReason("block", [result("block")])).toBe(
			"policy_violation",
		);
		expect(deriveContentModerationStatus("review", "low_confidence")).toBe(
			"needs_review",
		);
		expect(deriveContentModerationStatus("review", "service_unavailable")).toBe(
			"failed",
		);
		expect(deriveContentModerationStatus("pass", null)).toBe("passed");
	});

	test("blocks content when text matches even if every image passes", () => {
		expect(combineContentModerationDecision("pass", [])).toBe("pass");
		expect(
			combineContentModerationDecision("pass", [
				{ field: "title", terms: ["出售枪支"] },
			]),
		).toBe("block");
	});

	test("stores the matched terms and their visible text locations", () => {
		expect(
			createTextModerationDetails([
				{ field: "title", terms: ["出售枪支"] },
				{ field: "content", terms: ["兼职刷单", "代办假证"] },
			]),
		).toEqual([
			{
				categories: ["prohibited_text"],
				confidence: 1,
				decision: "block",
				field: "title",
				reason: "text_rule",
				source: "text",
				terms: ["出售枪支"],
			},
			{
				categories: ["prohibited_text"],
				confidence: 1,
				decision: "block",
				field: "content",
				reason: "text_rule",
				source: "text",
				terms: ["兼职刷单", "代办假证"],
			},
		]);
	});
});
