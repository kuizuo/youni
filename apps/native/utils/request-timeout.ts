import { showRequestTimeoutToast } from "@/utils/request-toast";

export const API_REQUEST_TIMEOUT_MS = 15_000;
export const REQUEST_TIMEOUT_MESSAGE = "请求超时，请检查网络后重试";

export class RequestTimeoutError extends Error {
	constructor() {
		super(REQUEST_TIMEOUT_MESSAGE);
		this.name = "RequestTimeoutError";
	}
}

export function isRequestTimeoutError(error: unknown): boolean {
	if (error instanceof RequestTimeoutError) return true;
	if (!error || typeof error !== "object") return false;

	const candidate = error as {
		cause?: unknown;
		error?: unknown;
		message?: unknown;
		name?: unknown;
	};

	return (
		candidate.name === "RequestTimeoutError" ||
		candidate.message === REQUEST_TIMEOUT_MESSAGE ||
		isRequestTimeoutError(candidate.cause) ||
		isRequestTimeoutError(candidate.error)
	);
}

export async function fetchWithTimeout(
	input: Parameters<typeof fetch>[0],
	init: Parameters<typeof fetch>[1] = {},
	timeoutMs = API_REQUEST_TIMEOUT_MS,
	{ showTimeoutToast = true }: { showTimeoutToast?: boolean } = {},
) {
	const controller = new AbortController();
	const sourceSignals = [
		init?.signal,
		input instanceof Request ? input.signal : undefined,
	].filter((signal): signal is AbortSignal => Boolean(signal));
	let didTimeout = false;

	const abortFromSource = () => {
		controller.abort();
	};

	for (const signal of sourceSignals) {
		if (signal.aborted) {
			controller.abort();
			break;
		}
		signal.addEventListener("abort", abortFromSource, { once: true });
	}

	const timeoutId = setTimeout(() => {
		didTimeout = true;
		controller.abort();
	}, timeoutMs);

	try {
		return await fetch(input, {
			...init,
			signal: controller.signal,
		});
	} catch (error) {
		if (didTimeout) {
			if (showTimeoutToast) showRequestTimeoutToast();
			throw new RequestTimeoutError();
		}
		throw error;
	} finally {
		clearTimeout(timeoutId);
		for (const signal of sourceSignals) {
			signal.removeEventListener("abort", abortFromSource);
		}
	}
}
