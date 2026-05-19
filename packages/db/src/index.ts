import { env } from "@youni/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

export function createDb() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL || "",
    maxUses: 1,
  });

  return drizzle({ client: pool, schema });
}
