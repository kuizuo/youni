import { describe, expect, mock, test } from "bun:test";

process.env.EXPO_OS = "ios";
const values = new Map<string, string>();
mock.module("expo-secure-store", () => ({
	getItemAsync: async (key: string) => values.get(key) ?? null,
	setItemAsync: async (key: string, value: string) => values.set(key, value),
}));

const { canCreateAnonymousSession, markSignedOut } = await import(
	"./anonymous-session-policy"
);

describe("anonymous session policy", () => {
	test("disables anonymous identity after an explicit sign-out", async () => {
		expect(await canCreateAnonymousSession()).toBe(true);
		await markSignedOut();
		expect(await canCreateAnonymousSession()).toBe(false);
		expect([...values.values()]).toEqual(["true"]);
	});
});
