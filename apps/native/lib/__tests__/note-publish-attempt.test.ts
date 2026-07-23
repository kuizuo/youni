import { describe, expect, test } from "@jest/globals";
import { NotePublishAttempt } from "../note-publish-attempt";

describe("note publish attempt", () => {
	test("reuses preparation after an unknown result and cleans confirmed failures", async () => {
		const attempt = new NotePublishAttempt<{ id: string }>();
		let preparations = 0;
		const cleaned: string[][] = [];
		const prepare = async (id: string) => {
			preparations += 1;
			return { payload: { id }, uploadedKeys: [`image-${preparations}`] };
		};
		const unknown = new Error("timeout");

		await expect(
			attempt.run({
				cleanup: async (keys) => cleaned.push(keys),
				isUnknownResult: (error) => error === unknown,
				key: "same-content",
				prepare,
				submit: async () => {
					throw unknown;
				},
			}),
		).rejects.toBe(unknown);
		const retried = await attempt.run({
			cleanup: async (keys) => cleaned.push(keys),
			isUnknownResult: (error) => error === unknown,
			key: "same-content",
			prepare,
			submit: async (payload) => payload,
		});

		expect(preparations).toBe(1);
		expect(retried.id.startsWith("publish_")).toBe(true);
		expect(cleaned).toEqual([]);

		await expect(
			attempt.run({
				cleanup: async (keys) => cleaned.push(keys),
				isUnknownResult: () => false,
				key: "rejected-content",
				prepare,
				submit: async () => {
					throw new Error("rejected");
				},
			}),
		).rejects.toThrow("rejected");
		expect(cleaned).toEqual([["image-2"]]);
	});
});
