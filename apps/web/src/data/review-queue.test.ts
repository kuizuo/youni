import { describe, expect, test } from "bun:test";
import type { AdminHydratedContentNote } from "@youni/api/contracts/shared";

process.env.VITE_SERVER_URL ??= "http://localhost:3000";

const {
	reconcileReviewQueueResponse,
	reviewQueueQueryInput,
}: typeof import("./review-queue") = await import("./review-queue");
type ReviewQueueResponse = import("./review-queue").ReviewQueueResponse;

function createNote(
	id: string,
	createdAt: Date,
	title = `标题 ${id}`,
): AdminHydratedContentNote {
	return {
		advancedOptions: {
			allowComment: true,
			allowShare: true,
			isOriginal: true,
		},
		authorEmail: `${id}@example.com`,
		authorName: id,
		collectedCount: 0,
		commentCount: 0,
		components: [],
		content: `正文 ${id}`,
		cover: null,
		createdAt,
		draftSavedAt: null,
		id,
		imageMetas: [],
		images: [],
		likedCount: 0,
		locationName: null,
		moderatedAt: null,
		moderationDetails: [],
		moderationReason: null,
		moderationStatus: "pending",
		publishedAt: null,
		rejectionReason: null,
		status: "audit",
		title,
		topicDetails: [],
		topics: [],
		updatedAt: createdAt,
		userId: `user-${id}`,
		visibility: "public",
	};
}

function createResponse(
	items: AdminHydratedContentNote[],
	total = items.length,
): ReviewQueueResponse {
	return {
		items,
		summary: {
			all: total,
			attention: items.length,
			blocked: 0,
			failed: 0,
			passed: 0,
		},
		total,
	};
}

describe("review queue", () => {
	test("normalizes search text and pagination", () => {
		expect(
			reviewQueueQueryInput({
				bucket: "attention",
				keyword: "  测试内容  ",
				page: 2,
			}),
		).toEqual({
			bucket: "attention",
			keyword: "测试内容",
			limit: 20,
			offset: 40,
		});
	});

	test("keeps a stable page while updating records and summary", () => {
		const first = createNote("first", new Date("2026-07-14T10:00:00Z"));
		const second = createNote("second", new Date("2026-07-14T11:00:00Z"));
		const added = createNote("added", new Date("2026-07-14T12:00:00Z"));
		const updatedFirst = createNote(
			"first",
			new Date("2026-07-14T10:00:00Z"),
			"已更新",
		);

		const result = reconcileReviewQueueResponse({
			allowNewItems: false,
			current: createResponse([first, second], 2),
			next: createResponse([added, updatedFirst], 3),
			replace: false,
		});

		expect(result.items.map(({ id, title }) => ({ id, title }))).toEqual([
			{ id: "first", title: "已更新" },
		]);
		expect(result.total).toBe(3);
		expect(result.summary.all).toBe(3);
	});

	test("shows new records on the first attention page and after manual refresh", () => {
		const first = createNote("first", new Date("2026-07-14T10:00:00Z"));
		const added = createNote("added", new Date("2026-07-14T11:00:00Z"));
		const current = createResponse([first]);
		const next = createResponse([added, first]);

		expect(
			reconcileReviewQueueResponse({
				allowNewItems: true,
				current,
				next,
				replace: false,
			}).items.map((item) => item.id),
		).toEqual(["added", "first"]);
		expect(
			reconcileReviewQueueResponse({
				allowNewItems: false,
				current,
				next,
				replace: true,
			}).items.map((item) => item.id),
		).toEqual(["added", "first"]);
	});
});
