import { createAnonymousSessionManager } from "@/lib/anonymous-session-manager";
import { authClient } from "@/lib/auth-client";

type SessionUser = {
	isAnonymous?: boolean | null;
} | null;

export function isRegisteredUser(user: SessionUser | undefined) {
	return Boolean(user && user.isAnonymous !== true);
}

const anonymousSessionManager = createAnonymousSessionManager({
	createAnonymousSession: () => authClient.signIn.anonymous(),
	getSession: () => authClient.getSession(),
	onPreparationError: (error) => {
		console.warn("Anonymous session preparation failed", error);
	},
});

export function ensureAnonymousSession() {
	return anonymousSessionManager.ensure();
}

export function prepareForAccountAuthentication() {
	return anonymousSessionManager.prepareForAccountAuthentication();
}
