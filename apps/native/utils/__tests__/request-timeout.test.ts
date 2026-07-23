import { afterAll, beforeEach, expect, jest, test } from "@jest/globals";
import { showRequestTimeoutToast } from "@/utils/request-toast";

import {
	fetchWithTimeout,
	isNetworkRequestError,
	isRequestTimeoutError,
} from "../request-timeout";

const originalFetchDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	"fetch",
);

jest.mock("@/utils/request-toast", () => ({
	showRequestTimeoutToast: jest.fn(),
}));

const mockShowRequestTimeoutToast = jest.mocked(showRequestTimeoutToast);

beforeEach(() => {
	mockShowRequestTimeoutToast.mockClear();
	globalThis.fetch = jest.fn(
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
	if (originalFetchDescriptor) {
		Object.defineProperty(globalThis, "fetch", originalFetchDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, "fetch");
	}
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
	expect(mockShowRequestTimeoutToast).not.toHaveBeenCalled();
});

test("keeps showing a toast for normal requests", async () => {
	try {
		await fetchWithTimeout("https://example.test", {}, 5);
	} catch {}

	expect(mockShowRequestTimeoutToast).toHaveBeenCalledTimes(1);
});

test("recognizes browser network failures even when wrapped", () => {
	const networkError = new TypeError("Failed to fetch");

	expect(isNetworkRequestError(networkError)).toBe(true);
	expect(isNetworkRequestError({ cause: networkError })).toBe(true);
	expect(isNetworkRequestError(new Error("请求失败"))).toBe(false);
});
