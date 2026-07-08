type RequestToastOptions = {
	id?: string;
	label: string;
	variant?: "danger" | "default" | "success" | "warning";
};

type RequestToastHandler = (options: RequestToastOptions) => unknown;

let requestToastHandler: RequestToastHandler | null = null;
let lastTimeoutToastAt = 0;

export function setRequestToastHandler(handler: RequestToastHandler | null) {
	requestToastHandler = handler;

	return () => {
		if (requestToastHandler === handler) {
			requestToastHandler = null;
		}
	};
}

export function showRequestTimeoutToast() {
	const now = Date.now();
	if (now - lastTimeoutToastAt < 1500) return;

	lastTimeoutToastAt = now;
	requestToastHandler?.({
		id: "request-timeout",
		variant: "danger",
		label: "请求超时，请检查网络后重试",
	});
}
