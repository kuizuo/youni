import { createAnonymousSessionManager } from "@/lib/anonymous-session-manager";
import { canCreateAnonymousSession } from "@/lib/anonymous-session-policy";
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
});

export async function ensureAnonymousSession() {
	if (!(await canCreateAnonymousSession())) return;
	return anonymousSessionManager.ensure();
}
