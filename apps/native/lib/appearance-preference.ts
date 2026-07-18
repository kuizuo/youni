export const APPEARANCE_PREFERENCES = ["system", "light", "dark"] as const;

export type AppearancePreference = (typeof APPEARANCE_PREFERENCES)[number];

const STORAGE_KEY = "youni.appearance";

export function parseAppearancePreference(
	value: null | string | undefined,
): AppearancePreference {
	return APPEARANCE_PREFERENCES.includes(value as AppearancePreference)
		? (value as AppearancePreference)
		: "system";
}

export async function getAppearancePreference() {
	if (process.env.EXPO_OS === "web") {
		return parseAppearancePreference(
			globalThis.localStorage?.getItem(STORAGE_KEY),
		);
	}

	const SecureStore = await import("expo-secure-store");
	return parseAppearancePreference(await SecureStore.getItemAsync(STORAGE_KEY));
}

export async function setAppearancePreference(value: AppearancePreference) {
	if (process.env.EXPO_OS === "web") {
		globalThis.localStorage?.setItem(STORAGE_KEY, value);
		return;
	}

	const SecureStore = await import("expo-secure-store");
	await SecureStore.setItemAsync(STORAGE_KEY, value);
}
