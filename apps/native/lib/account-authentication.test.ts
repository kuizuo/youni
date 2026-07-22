import { describe, expect, mock, test } from "bun:test";

const clear = mock(() => {});
mock.module("@/lib/auth-client", () => ({
	authClient: { $store: { notify: () => {} } },
}));
mock.module("@/lib/query/query-client", () => ({ queryClient: { clear } }));

const { runAccountAuthentication } = await import("./account-authentication");

describe("account authentication", () => {
	test("clears the previous identity before leaving login", async () => {
		clear.mockClear();
		let authenticated = false;

		const error = await runAccountAuthentication({
			authenticate: async () => ({ error: null }),
			onAuthenticated: () => {
				authenticated = true;
			},
		});

		expect(error).toBeNull();
		expect(clear).toHaveBeenCalledTimes(1);
		expect(authenticated).toBe(true);
	});

	test("does not continue after authentication is rejected", async () => {
		clear.mockClear();
		const authenticationError = { message: "邮箱或密码错误" };
		let authenticated = false;

		const error = await runAccountAuthentication({
			authenticate: async () => ({ error: authenticationError }),
			onAuthenticated: () => {
				authenticated = true;
			},
		});

		expect(error).toBe(authenticationError);
		expect(clear).not.toHaveBeenCalled();
		expect(authenticated).toBe(false);
	});
});
