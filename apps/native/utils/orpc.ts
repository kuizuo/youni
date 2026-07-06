import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouterClient } from "@youni/api/routers/index";
import { Platform } from "react-native";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import { fetchWithTimeout } from "@/utils/request-timeout";

export { queryClient } from "@/lib/query/query-client";

export const link = new RPCLink({
	url: `${apiBaseUrl}/rpc`,
	fetch: (request, init) =>
		fetchWithTimeout(request, {
			...init,
			// Better Auth Expo forwards the session cookie manually on native.
			credentials: Platform.OS === "web" ? "include" : "omit",
		}),
	headers() {
		if (Platform.OS === "web") {
			return {};
		}
		const headers = new Map<string, string>();
		const cookies = authClient.getCookie();
		if (cookies) {
			headers.set("Cookie", cookies);
		}
		return Object.fromEntries(headers);
	},
});

export const client: AppRouterClient = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
