import { expoClient } from "@better-auth/expo/client";
import { anonymousClient, emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { apiBaseUrl } from "@/lib/api-url";
import { fetchWithTimeout } from "@/utils/request-timeout";

export const authClient = createAuthClient({
	baseURL: apiBaseUrl,
	fetchOptions: {
		customFetchImpl: fetchWithTimeout,
	},
	plugins: [
		anonymousClient(),
		emailOTPClient(),
		expoClient({
			scheme: Constants.expoConfig?.scheme as string,
			storagePrefix: Constants.expoConfig?.scheme as string,
			storage: SecureStore,
		}),
	],
});
