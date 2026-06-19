import { env } from "@youni/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
	youniPgPool?: Pool;
};

function getPool() {
	if (!globalForDb.youniPgPool) {
		globalForDb.youniPgPool = new Pool({
			connectionString: env.DATABASE_URL || "",
			max: 10,
			idleTimeoutMillis: 30_000,
			connectionTimeoutMillis: 10_000,
		});
	}

	return globalForDb.youniPgPool;
}

export function createDb() {
	return drizzle({ client: getPool(), schema });
}

export async function closeDb() {
	if (!globalForDb.youniPgPool) return;
	await globalForDb.youniPgPool.end();
	globalForDb.youniPgPool = undefined;
}
