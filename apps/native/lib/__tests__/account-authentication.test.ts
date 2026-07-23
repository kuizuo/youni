import { describe, expect, jest, test } from "@jest/globals";
import { queryClient } from "@/lib/query/query-client";

import { runAccountAuthentication } from "../account-authentication";

jest.mock("@/lib/auth-client", () => ({
	authClient: { $store: { notify: () => {} } },
}));
jest.mock("@/lib/query/query-client", () => ({
	queryClient: { clear: jest.fn() },
}));

const mockClearQueryClient = jest.mocked(queryClient.clear);

describe("account authentication", () => {
	test("clears the previous identity before leaving login", async () => {
		mockClearQueryClient.mockClear();
		let authenticated = false;

		const error = await runAccountAuthentication({
			authenticate: async () => ({ error: null }),
			onAuthenticated: () => {
				authenticated = true;
			},
		});

		expect(error).toBeNull();
		expect(mockClearQueryClient).toHaveBeenCalledTimes(1);
		expect(authenticated).toBe(true);
	});

	test("does not continue after authentication is rejected", async () => {
		mockClearQueryClient.mockClear();
		const authenticationError = { message: "邮箱或密码错误" };
		let authenticated = false;

		const error = await runAccountAuthentication({
			authenticate: async () => ({ error: authenticationError }),
			onAuthenticated: () => {
				authenticated = true;
			},
		});

		expect(error).toBe(authenticationError);
		expect(mockClearQueryClient).not.toHaveBeenCalled();
		expect(authenticated).toBe(false);
	});
});
