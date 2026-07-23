import { describe, expect, test } from "@jest/globals";

import { createAnonymousSessionManager } from "../anonymous-session-manager";

describe("anonymous session manager", () => {
	test("coalesces anonymous sign-in across development reloads", async () => {
		let createCount = 0;
		const dependencies = {
			createAnonymousSession: async () => {
				createCount += 1;
				await Promise.resolve();
				return {};
			},
			getSession: async () => ({ data: null }),
		};
		const beforeReload = createAnonymousSessionManager(dependencies);
		const afterReload = createAnonymousSessionManager(dependencies);

		await Promise.all([beforeReload.ensure(), afterReload.ensure()]);

		expect(createCount).toBe(1);
	});
});
