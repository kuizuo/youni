import { expoClient } from "@better-auth/expo/client";
import { lastLoginMethodClient } from "@better-auth/expo/plugins";
import { anonymousClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { apiBaseUrl } from "@/lib/api-url";
import { fetchWithTimeout } from "@/utils/request-timeout";

const storagePrefix = Constants.expoConfig?.scheme as string;
const authStorage =
	Platform.OS === "web"
		? {
				deleteItemAsync: (key: string) => localStorage.removeItem(key),
				getItem: (key: string) => localStorage.getItem(key),
				setItem: (key: string, value: string) =>
					localStorage.setItem(key, value),
			}
		: SecureStore;

export const authClient = createAuthClient({
	baseURL: apiBaseUrl,
	fetchOptions: {
		customFetchImpl: fetchWithTimeout,
	},
	plugins: [
		anonymousClient(),
		emailOTPClient(),
		expoClient({
			scheme: storagePrefix,
			storagePrefix,
			storage: authStorage,
		}),
		lastLoginMethodClient({
			storage: authStorage,
			storagePrefix,
			customResolveMethod(url) {
				const pathname = new URL(url.toString()).pathname;
				if (pathname.endsWith("/sign-in/email")) return "email";
				if (pathname.endsWith("/sign-up/email")) return "email";
				if (pathname.endsWith("/sign-in/social")) return "google";
				if (pathname.includes("/callback/")) return pathname.split("/").pop();
				return null;
			},
		}),
	],
});

export type AuthSession = typeof authClient.$Infer.Session;
export type AuthUser = AuthSession["user"];
