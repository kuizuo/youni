import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";
import type { AdminHydratedContentNote } from "@youni/api/contracts/shared";

import {
	createReviewQueueCollection,
	type ReviewQueueResponse,
	reconcileReviewQueueVisibleIds,
	reviewQueueQueryInput,
} from "./review-collection";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
	await Promise.all(cleanups.splice(0).map((cleanup) => cleanup()));
});

function createNote(
	id: string,
	createdAt: Date,
	moderationStatus: AdminHydratedContentNote["moderationStatus"] = "pending",
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
		moderationStatus,
		publishedAt: null,
		rejectionReason: null,
		status: moderationStatus === "passed" ? "published" : "audit",
		title: `标题 ${id}`,
		topicDetails: [],
		topics: [],
		userId: `user-${id}`,
		visibility: "public",
	};
}

function createResponse(
	items: AdminHydratedContentNote[],
): ReviewQueueResponse {
	return {
		items,
		summary: {
			all: items.length,
			attention: items.filter((item) => item.status === "audit").length,
			blocked: items.filter((item) => item.moderationStatus === "blocked")
				.length,
			failed: items.filter((item) => item.moderationStatus === "failed").length,
			passed: items.filter((item) => item.moderationStatus === "passed").length,
		},
		total: items.length,
	};
}

describe("review queue collection", () => {
	test("normalizes search text and pagination before building the collection", () => {
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

	test("only inserts background records into the first attention page", () => {
		const first = createNote("first", new Date("2026-07-14T10:00:00Z"));
		const second = createNote("second", new Date("2026-07-14T11:00:00Z"));
		expect(
			reconcileReviewQueueVisibleIds({
				allowNewItems: true,
				currentIds: [first.id],
				nextItems: [second, first],
				replace: false,
			}),
		).toEqual([second.id, first.id]);
		expect(
			reconcileReviewQueueVisibleIds({
				allowNewItems: false,
				currentIds: [first.id],
				nextItems: [second, first],
				replace: false,
			}),
		).toEqual([first.id]);
		expect(
			reconcileReviewQueueVisibleIds({
				allowNewItems: false,
				currentIds: [first.id],
				nextItems: [second],
				replace: false,
			}),
		).toEqual([]);
	});

	test("replaces the current page with the latest synchronized result", async () => {
		const first = createNote("first", new Date("2026-07-14T10:00:00Z"));
		const second = createNote("second", new Date("2026-07-14T11:00:00Z"));
		let response = createResponse([first]);
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const scope = createReviewQueueCollection({
			fetchQueue: async () => response,
			input: reviewQueueQueryInput({
				bucket: "attention",
				keyword: "",
				page: 0,
			}),
			queryClient,
			syncInterval: false,
		});
		cleanups.push(() => scope.collection.cleanup());

		await scope.collection.preload();
		expect(
			Array.from(scope.collection.values()).map((item) => item.id),
		).toEqual(["first"]);

		response = createResponse([second, first]);
		await scope.collection.utils.refetch({ throwOnError: true });
		expect(
			Array.from(scope.collection.values()).map((item) => item.id),
		).toEqual(["first", "second"]);
		expect(queryClient.getQueryData(scope.queryKey)).toEqual(response);

		response = createResponse([second]);
		await scope.collection.utils.refetch({ throwOnError: true });
		expect(
			Array.from(scope.collection.values()).map((item) => item.id),
		).toEqual(["second"]);
	});

	test("uses isolated cache entries and removes them after cleanup", async () => {
		const first = createNote("first", new Date("2026-07-14T10:00:00Z"));
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const attentionScope = createReviewQueueCollection({
			fetchQueue: async () => createResponse([first]),
			input: reviewQueueQueryInput({
				bucket: "attention",
				keyword: "",
				page: 0,
			}),
			queryClient,
			syncInterval: false,
		});
		const passedScope = createReviewQueueCollection({
			fetchQueue: async () => createResponse([]),
			input: reviewQueueQueryInput({
				bucket: "passed",
				keyword: "",
				page: 0,
			}),
			queryClient,
			syncInterval: false,
		});

		await Promise.all([
			attentionScope.collection.preload(),
			passedScope.collection.preload(),
		]);
		expect(attentionScope.queryKey).not.toEqual(passedScope.queryKey);
		expect(queryClient.getQueryData(attentionScope.queryKey)).toBeDefined();
		expect(queryClient.getQueryData(passedScope.queryKey)).toBeDefined();

		await attentionScope.collection.cleanup();
		expect(attentionScope.collection.status).toBe("cleaned-up");
		expect(queryClient.getQueryData(passedScope.queryKey)).toBeDefined();
		await passedScope.collection.cleanup();
	});

	test("keeps synchronized records when a background refresh fails", async () => {
		const consoleError = spyOn(console, "error").mockImplementation(() => {});
		const first = createNote("first", new Date("2026-07-14T10:00:00Z"));
		let shouldFail = false;
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false } },
		});
		const scope = createReviewQueueCollection({
			fetchQueue: async () => {
				if (shouldFail) throw new Error("temporary failure");
				return createResponse([first]);
			},
			input: reviewQueueQueryInput({
				bucket: "attention",
				keyword: "",
				page: 0,
			}),
			queryClient,
			syncInterval: false,
		});
		cleanups.push(() => scope.collection.cleanup());

		await scope.collection.preload();
		shouldFail = true;
		try {
			await expect(
				scope.collection.utils.refetch({ throwOnError: true }),
			).rejects.toThrow("temporary failure");
			expect(
				Array.from(scope.collection.values()).map((item) => item.id),
			).toEqual(["first"]);
		} finally {
			consoleError.mockRestore();
		}
	});
});
