import { describe, expect, test } from "@jest/globals";
import type { ProfilesOutputs } from "@youni/api/contracts/profiles";
import { createProfileMediaSubmission } from "../profile-media-submission-flow";

const profile = {
	image: "new-avatar",
} as ProfilesOutputs["updateProfileMedia"]["profile"];

describe("profile media submission", () => {
	test("stops when picking is canceled", async () => {
		const calls: string[] = [];
		const submit = createProfileMediaSubmission({
			bind: async () => {
				calls.push("bind");
				return { previousKey: null, profile };
			},
			cleanup: async () => calls.push("cleanup"),
			pickAndUpload: async () => null,
			refresh: async () => calls.push("refresh"),
		});

		expect(await submit("avatar")).toBeNull();
		expect(calls).toEqual([]);
	});

	test("reclaims a new upload when binding fails", async () => {
		const cleaned: string[] = [];
		const failure = { code: "BAD_REQUEST" };
		const submit = createProfileMediaSubmission({
			bind: async () => {
				throw failure;
			},
			cleanup: async (key) => cleaned.push(key),
			pickAndUpload: async () => ({ key: "new-key" }),
			refresh: async () => {},
		});

		await expect(submit("avatar")).rejects.toBe(failure);
		expect(cleaned).toEqual(["new-key"]);
	});

	test("keeps a new upload when the binding result is unknown", async () => {
		const cleaned: string[] = [];
		const failure = new Error("timeout");
		const submit = createProfileMediaSubmission({
			bind: async () => {
				throw failure;
			},
			cleanup: async (key) => {
				cleaned.push(key);
			},
			pickAndUpload: async () => ({ key: "new-key" }),
			refresh: async () => {},
		});

		await expect(submit("avatar")).rejects.toBe(failure);
		expect(cleaned).toEqual([]);
	});

	test("binds new media, reclaims the replaced file, and refreshes", async () => {
		const calls: string[] = [];
		const submit = createProfileMediaSubmission({
			bind: async () => {
				calls.push("bind");
				return { previousKey: "old-key", profile };
			},
			cleanup: async (key) => calls.push(`cleanup:${key}`),
			pickAndUpload: async () => {
				calls.push("upload");
				return { key: "new-key" };
			},
			refresh: async () => calls.push("refresh"),
		});

		expect(await submit("avatar")).toBe(profile);
		expect(calls).toEqual(["upload", "bind", "cleanup:old-key", "refresh"]);
	});
});
