import { authClient } from "@/lib/auth-client";
import { unregisterCurrentDevicePushToken } from "@/lib/notifications/push-notifications";
import { queryClient } from "@/utils/orpc";

export async function signOutCurrentUser() {
	try {
		await unregisterCurrentDevicePushToken();
	} catch {
		// Logging out must still work when push cleanup is unavailable.
	}

	await authClient.signOut();
	queryClient.clear();
}
