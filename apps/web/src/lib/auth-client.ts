import {
	adminAccessControl,
	adminPermissionRoles,
} from "@youni/auth/permissions";
import { env } from "@youni/env/web";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: env.VITE_SERVER_URL,
	plugins: [
		adminClient({
			ac: adminAccessControl,
			roles: adminPermissionRoles,
		} as never),
	],
});
