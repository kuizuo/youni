const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

type ResolveApiBaseUrlOptions = {
	configuredUrl: string;
	devServerHost?: string;
	platform: string;
};

export function hostFromUrlish(value: unknown) {
	if (typeof value !== "string" || !value.trim()) {
		return undefined;
	}

	const candidate = value.trim();

	try {
		return new URL(candidate).hostname;
	} catch {
		try {
			return new URL(`http://${candidate}`).hostname;
		} catch {
			return undefined;
		}
	}
}

function normalizeBaseUrl(value: string) {
	return value.replace(/\/+$/, "");
}

export function resolveApiBaseUrl({
	configuredUrl,
	devServerHost,
	platform,
}: ResolveApiBaseUrlOptions) {
	const url = new URL(configuredUrl);

	if (platform === "web" || !LOCAL_HOSTS.has(url.hostname)) {
		return normalizeBaseUrl(url.toString());
	}

	const reachableHost = hostFromUrlish(devServerHost);
	if (reachableHost && !LOCAL_HOSTS.has(reachableHost)) {
		url.hostname = reachableHost;
		return normalizeBaseUrl(url.toString());
	}

	if (platform === "android") {
		url.hostname = "10.0.2.2";
	}

	return normalizeBaseUrl(url.toString());
}

export function resolveStoredNoteImageUrl(
	imageUrl: string,
	apiBaseUrl: string,
) {
	try {
		const image = new URL(imageUrl);
		if (!image.pathname.startsWith("/uploads/note-images/")) {
			return imageUrl;
		}

		const api = new URL(apiBaseUrl);
		image.protocol = api.protocol;
		image.host = api.host;
		return image.toString();
	} catch {
		return imageUrl;
	}
}
