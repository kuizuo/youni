import type { Href } from "expo-router";

const FALLBACK_REDIRECT = "/" as const;

export function getLoginHref(redirectTo: string = FALLBACK_REDIRECT) {
	return {
		pathname: "/login",
		params: { redirectTo: sanitizeAuthRedirect(redirectTo) },
	} as unknown as Href;
}

export function sanitizeAuthRedirect(value: unknown): Href {
	const redirectTo = Array.isArray(value) ? value[0] : value;

	if (
		typeof redirectTo !== "string" ||
		!redirectTo.startsWith("/") ||
		redirectTo.startsWith("//") ||
		redirectTo === "/login"
	) {
		return FALLBACK_REDIRECT;
	}

	return redirectTo as Href;
}
