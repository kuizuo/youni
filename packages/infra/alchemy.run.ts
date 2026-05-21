import alchemy from "alchemy";
import { Vite, Worker } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const app = await alchemy("youni");

function requiredEnv<T>(value: T | undefined, name: string) {
	if (!value) {
		throw new Error(`${name} is required`);
	}
	return value;
}

export const web = await Vite("web", {
	cwd: "../../apps/web",
	assets: "dist",
	bindings: {
		VITE_SERVER_URL: requiredEnv(
			alchemy.env.VITE_SERVER_URL,
			"VITE_SERVER_URL",
		),
	},
});

export const server = await Worker("server", {
	cwd: "../../apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		DATABASE_URL: requiredEnv(alchemy.secret.env.DATABASE_URL, "DATABASE_URL"),
		CORS_ORIGIN: requiredEnv(alchemy.env.CORS_ORIGIN, "CORS_ORIGIN"),
		BETTER_AUTH_SECRET: requiredEnv(
			alchemy.secret.env.BETTER_AUTH_SECRET,
			"BETTER_AUTH_SECRET",
		),
		BETTER_AUTH_URL: requiredEnv(
			alchemy.env.BETTER_AUTH_URL,
			"BETTER_AUTH_URL",
		),
		GOOGLE_GENERATIVE_AI_API_KEY:
			alchemy.secret.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
		ADMIN_EMAILS: alchemy.env.ADMIN_EMAILS || "admin@youni.local",
	},
	dev: {
		port: 3000,
	},
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

await app.finalize();
