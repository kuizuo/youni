import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: "../../packages/infra/.env",
});
dotenv.config({
	path: "../../apps/server/.env",
});

export default defineConfig({
	schema: "./src/schema",
	out: "./src/d1-migrations",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
		databaseId:
			process.env.CLOUDFLARE_D1_DATABASE_ID || process.env.D1_DATABASE_ID || "",
		token: process.env.CLOUDFLARE_API_TOKEN || "",
	},
});
