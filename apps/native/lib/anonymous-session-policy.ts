import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "youni.anonymous-session-disabled-after-sign-out";
let signedOutThisRun = false;

export async function canCreateAnonymousSession() {
	if (signedOutThisRun) return false;
	const value =
		process.env.EXPO_OS === "web"
			? globalThis.localStorage?.getItem(STORAGE_KEY)
			: await SecureStore.getItemAsync(STORAGE_KEY);
	return value !== "true";
}

export async function markSignedOut() {
	signedOutThisRun = true;
	if (process.env.EXPO_OS === "web") {
		globalThis.localStorage?.setItem(STORAGE_KEY, "true");
		return;
	}
	await SecureStore.setItemAsync(STORAGE_KEY, "true");
}
