import { env } from "@youni/env/server";
import { drizzle } from "drizzle-orm/d1";

import { createD1HttpDatabase, getD1HttpCredentials } from "./d1-http";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
	youniD1HttpDatabase?: D1Database;
};

function isD1Database(value: unknown): value is D1Database {
	return (
		typeof value === "object" &&
		value !== null &&
		"prepare" in value &&
		typeof value.prepare === "function"
	);
}

function getD1Database(database?: D1Database) {
	if (database) return database;

	if (isD1Database(env.DB)) {
		return env.DB;
	}

	const credentials = getD1HttpCredentials();
	if (credentials) {
		globalForDb.youniD1HttpDatabase ??= createD1HttpDatabase(credentials);
		return globalForDb.youniD1HttpDatabase;
	}

	throw new Error(
		"D1 database is not available. Run the server through Alchemy/Cloudflare Workers, or set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_D1_API_TOKEN for scripts.",
	);
}

export function createDb(database?: D1Database) {
	return drizzle(getD1Database(database), { schema });
}

export async function closeDb() {
	globalForDb.youniD1HttpDatabase = undefined;
}
