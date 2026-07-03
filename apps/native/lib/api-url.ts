import { env } from "@youni/env/native";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { hostFromUrlish, resolveApiBaseUrl } from "@/lib/api-url-resolver";

function getManifestHostUri() {
	const constants = Constants as typeof Constants & {
		expoConfig?: { hostUri?: string };
		manifest?: { debuggerHost?: string; hostUri?: string };
		manifest2?: {
			extra?: {
				expoClient?: {
					hostUri?: string;
				};
			};
		};
	};

	return (
		constants.expoConfig?.hostUri ??
		constants.manifest2?.extra?.expoClient?.hostUri ??
		constants.manifest?.hostUri ??
		constants.manifest?.debuggerHost
	);
}

function getDevServerHost() {
	const host = hostFromUrlish(getManifestHostUri());

	return host;
}

export const apiBaseUrl = resolveApiBaseUrl({
	configuredUrl: env.EXPO_PUBLIC_SERVER_URL,
	devServerHost: getDevServerHost(),
	platform: Platform.OS,
});
