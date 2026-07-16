import { describe, expect, test } from "bun:test";
import { mergeAnonymousViewHistory } from "./views";

describe("note viewing", () => {
	test("moves anonymous history and keeps the latest duplicate view", () => {
		const firstCreatedAt = new Date("2026-01-01T00:00:00.000Z");
		const olderView = new Date("2026-01-02T00:00:00.000Z");
		const newerView = new Date("2026-01-03T00:00:00.000Z");
		const latestUpdate = new Date("2026-01-04T00:00:00.000Z");
		const result = mergeAnonymousViewHistory(
			[
				{
					createdAt: firstCreatedAt,
					noteId: "note-a",
					updatedAt: olderView,
					userId: "anonymous-user",
					viewedAt: newerView,
				},
				{
					createdAt: olderView,
					noteId: "note-a",
					updatedAt: latestUpdate,
					userId: "registered-user",
					viewedAt: olderView,
				},
				{
					createdAt: newerView,
					noteId: "note-b",
					updatedAt: newerView,
					userId: "anonymous-user",
					viewedAt: newerView,
				},
			],
			"registered-user",
		);

		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			createdAt: firstCreatedAt,
			noteId: "note-a",
			updatedAt: latestUpdate,
			userId: "registered-user",
			viewedAt: newerView,
		});
		expect(result[1]?.userId).toBe("registered-user");
	});
});
