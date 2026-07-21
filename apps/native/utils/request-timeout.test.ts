import { afterAll, beforeEach, expect, mock, test } from "bun:test";

const showRequestTimeoutToast = mock(() => {});
const originalFetch = globalThis.fetch;

mock.module("@/utils/request-toast", () => ({ showRequestTimeoutToast }));

const { fetchWithTimeout, isNetworkRequestError, isRequestTimeoutError } =
	await import("./request-timeout");

beforeEach(() => {
	showRequestTimeoutToast.mockClear();
	globalThis.fetch = mock(
		(_input: RequestInfo | URL, init?: RequestInit) =>
			new Promise<Response>((_resolve, reject) => {
				init?.signal?.addEventListener(
					"abort",
					() => reject(new Error("aborted")),
					{ once: true },
				);
			}),
	) as typeof fetch;
});

afterAll(() => {
	globalThis.fetch = originalFetch;
});

test("can time out a background request without showing a toast", async () => {
	let error: unknown;
	try {
		await fetchWithTimeout("https://example.test", {}, 5, {
			showTimeoutToast: false,
		});
	} catch (caught) {
		error = caught;
	}

	expect(isRequestTimeoutError(error)).toBe(true);
	expect(showRequestTimeoutToast).not.toHaveBeenCalled();
});

test("keeps showing a toast for normal requests", async () => {
	try {
		await fetchWithTimeout("https://example.test", {}, 5);
	} catch {}

	expect(showRequestTimeoutToast).toHaveBeenCalledTimes(1);
});

test("recognizes browser network failures even when wrapped", () => {
	const networkError = new TypeError("Failed to fetch");

	expect(isNetworkRequestError(networkError)).toBe(true);
	expect(isNetworkRequestError({ cause: networkError })).toBe(true);
	expect(isNetworkRequestError(new Error("请求失败"))).toBe(false);
});
