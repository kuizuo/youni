import { describe, expect, test } from "bun:test";

import { createAnonymousSessionManager } from "./anonymous-session-manager";

describe("anonymous session manager", () => {
	test("concurrent startup checks create only one anonymous session", async () => {
		let createCount = 0;
		const manager = createAnonymousSessionManager({
			createAnonymousSession: async () => {
				createCount += 1;
				return {};
			},
			getSession: async () => ({ data: null }),
		});

		await Promise.all([manager.ensure(), manager.ensure(), manager.ensure()]);

		expect(createCount).toBe(1);
	});

	test("an existing session is never replaced", async () => {
		let createCount = 0;
		const manager = createAnonymousSessionManager({
			createAnonymousSession: async () => {
				createCount += 1;
				return {};
			},
			getSession: async () => ({ data: { user: { id: "registered" } } }),
		});

		await manager.ensure();

		expect(createCount).toBe(0);
	});

	test("a failed attempt can be retried after the network recovers", async () => {
		let createCount = 0;
		const manager = createAnonymousSessionManager({
			createAnonymousSession: async () => {
				createCount += 1;
				return createCount === 1 ? { error: { message: "offline" } } : {};
			},
			getSession: async () => ({ data: null }),
		});

		await expect(manager.ensure()).rejects.toThrow("offline");
		await expect(manager.ensure()).resolves.toBeUndefined();
		expect(createCount).toBe(2);
	});

	test("account authentication continues when guest setup is unavailable", async () => {
		let reportedError;
		const manager = createAnonymousSessionManager({
			createAnonymousSession: async () => ({
				error: { message: "offline" },
			}),
			getSession: async () => ({ data: null }),
			onPreparationError: (error) => {
				reportedError = error;
			},
		});

		await expect(
			manager.prepareForAccountAuthentication(),
		).resolves.toBeUndefined();
		expect(reportedError).toBeInstanceOf(Error);
	});
});
