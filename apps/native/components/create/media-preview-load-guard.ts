const DEFAULT_PREVIEW_TIMEOUT_MS = 4000;

export function initialMediaPreviewStatus(initiallyLoaded: boolean) {
	return initiallyLoaded ? ("loaded" as const) : ("loading" as const);
}

export function resolveMediaPreviewFailure(
	attempt: number,
	candidateCount: number,
) {
	if (attempt + 1 < candidateCount) {
		return { attempt: attempt + 1, status: "loading" as const };
	}
	return { attempt, status: "retry" as const };
}

type LoadGuardOptions = {
	cancel?: (handle: ReturnType<typeof setTimeout>) => void;
	onTimeout: () => void;
	schedule?: (
		callback: () => void,
		delay: number,
	) => ReturnType<typeof setTimeout>;
	timeoutMs?: number;
};

export function createMediaPreviewLoadGuard({
	cancel = clearTimeout,
	onTimeout,
	schedule = setTimeout,
	timeoutMs = DEFAULT_PREVIEW_TIMEOUT_MS,
}: LoadGuardOptions) {
	let handle: null | ReturnType<typeof setTimeout> = null;

	const settle = () => {
		if (handle === null) return;
		cancel(handle);
		handle = null;
	};

	return {
		dispose: settle,
		settle,
		start: () => {
			settle();
			handle = schedule(() => {
				handle = null;
				onTimeout();
			}, timeoutMs);
		},
	};
}
