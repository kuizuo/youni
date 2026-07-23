import { describe, expect, jest, test } from "@jest/globals";
import * as SecureStore from "expo-secure-store";

process.env.EXPO_OS = "ios";
jest.mock("expo-secure-store", () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
}));

import {
	canCreateAnonymousSession,
	markSignedOut,
} from "../anonymous-session-policy";

describe("anonymous session policy", () => {
	test("disables anonymous identity after an explicit sign-out", async () => {
		const values = new Map<string, string>();
		jest
			.mocked(SecureStore.getItemAsync)
			.mockImplementation(async (key) => values.get(key) ?? null);
		jest
			.mocked(SecureStore.setItemAsync)
			.mockImplementation(async (key, value) => {
				values.set(key, value);
			});

		expect(await canCreateAnonymousSession()).toBe(true);
		await markSignedOut();
		expect(await canCreateAnonymousSession()).toBe(false);
		expect([...values.values()]).toEqual(["true"]);
	});
});
