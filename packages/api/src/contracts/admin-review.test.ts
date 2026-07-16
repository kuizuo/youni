import { describe, expect, test } from "bun:test";

import { adminReviewDecisionInput } from "./admin";
import { isPendingManualReview } from "./shared";

const expectedUpdatedAt = "2026-07-16T08:00:00.000Z";

describe("admin manual review", () => {
	test("accepts only an explicit review decision", () => {
		expect(
			adminReviewDecisionInput.parse({
				decision: "approve",
				expectedUpdatedAt,
				id: "note-1",
			}),
		).toEqual({ decision: "approve", expectedUpdatedAt, id: "note-1" });
		expect(() =>
			adminReviewDecisionInput.parse({
				expectedUpdatedAt,
				id: "note-1",
				status: "hidden",
			}),
		).toThrow();
	});

	test("requires and trims a rejection reason", () => {
		expect(
			adminReviewDecisionInput.parse({
				decision: "reject",
				expectedUpdatedAt,
				id: "note-1",
				rejectionReason: "  图片包含联系方式  ",
			}),
		).toMatchObject({ rejectionReason: "图片包含联系方式" });
		expect(() =>
			adminReviewDecisionInput.parse({
				decision: "reject",
				expectedUpdatedAt,
				id: "note-1",
				rejectionReason: "   ",
			}),
		).toThrow();
	});

	test("allows review only while content is still waiting", () => {
		expect(
			isPendingManualReview({
				moderationStatus: "needs_review",
				status: "audit",
			}),
		).toBe(true);
		expect(
			isPendingManualReview({
				moderationStatus: "passed",
				status: "published",
			}),
		).toBe(false);
	});
});
