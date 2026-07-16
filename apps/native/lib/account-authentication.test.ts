import { describe, expect, test } from "bun:test";
import { runAccountAuthentication } from "./account-authentication";

describe("account authentication", () => {
	test("waits for the new session to be stored before leaving login", async () => {
		let sessionStored = false;
		let sessionWasReadyOnNavigation = false;

		await runAccountAuthentication({
			authenticate: async () => {
				await Promise.resolve();
				sessionStored = true;
				return { error: null };
			},
			onAuthenticated: () => {
				sessionWasReadyOnNavigation = sessionStored;
			},
		});

		expect(sessionWasReadyOnNavigation).toBe(true);
	});
});
