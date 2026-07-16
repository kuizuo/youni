import { describe, expect, test } from "bun:test";
import { createDb } from "@youni/db";
import {
	mergeAnonymousViewHistory,
	replaceLinkedNoteViewHistory,
} from "./views";

type BoundStatement = D1PreparedStatement & { boundValues: unknown[] };

function createParameterLimitedDatabase(maxParameters: number) {
	return {
		prepare() {
			return {
				boundValues: [],
				bind(...values: unknown[]) {
					this.boundValues = values;
					return this;
				},
			} as unknown as BoundStatement;
		},
		async batch(statements: BoundStatement[]) {
			if (
				statements.some(
					(statement) => statement.boundValues.length > maxParameters,
				)
			) {
				throw new Error("too many SQL variables: SQLITE_ERROR");
			}
			return statements.map(() => ({ results: [], success: true }));
		},
	} as unknown as D1Database;
}

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

	test("links more view-history rows than one D1 query can bind", async () => {
		const now = new Date("2026-01-01T00:00:00.000Z");
		const rows = Array.from({ length: 21 }, (_, index) => ({
			createdAt: now,
			noteId: `note-${index}`,
			updatedAt: now,
			userId: "registered-user",
			viewedAt: now,
		}));

		await expect(
			replaceLinkedNoteViewHistory(
				createDb(createParameterLimitedDatabase(100)),
				["anonymous-user", "registered-user"],
				rows.slice(0, 20),
			),
		).resolves.toBeUndefined();

		await expect(
			replaceLinkedNoteViewHistory(
				createDb(createParameterLimitedDatabase(100)),
				["anonymous-user", "registered-user"],
				rows,
			),
		).resolves.toBeUndefined();
	});
});
