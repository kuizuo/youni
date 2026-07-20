import alchemy from "alchemy";
import {
	Ai,
	type Binding,
	D1Database,
	KVNamespace,
	Queue,
	R2Bucket,
	RateLimit,
	Vite,
	Website,
	Worker,
} from "alchemy/cloudflare";
import { RandomString } from "alchemy/random";
import { config } from "dotenv";

const appEnvFile =
	process.env.NODE_ENV === "production" ? ".env.production" : ".env";

config({ path: "./.env" });
config({ path: `../../apps/native/${appEnvFile}` });
config({ path: "../../apps/web/.env" });
config({ path: `../../apps/server/${appEnvFile}` });
config({ path: `../../apps/agent/${appEnvFile}` });

const app = await alchemy("youni");

type ContentReviewJob = {
	contentId: string;
	images: string[];
	userId: string;
};

type MoondreamInput = {
	image: string;
	max_tokens?: number;
	question: string;
	reasoning?: boolean;
	stream?: boolean;
	task: "query";
	temperature?: number;
};

type MoondreamAnswer = {
	answer?: string | null;
};

type MoondreamOutput =
	| MoondreamAnswer
	| { result: MoondreamAnswer; usage?: unknown };

type YouniAiModels = {
	"@cf/moondream/moondream3.1-9B-A2B": {
		inputs: MoondreamInput;
		postProcessedOutputs: MoondreamOutput;
	};
	"@cf/zai-org/glm-4.7-flash": {
		inputs: {
			max_tokens?: number;
			messages: Array<{
				content: string;
				role: "assistant" | "system" | "user";
			}>;
			response_format?: { type: "json_object" };
			temperature?: number;
		};
		postProcessedOutputs: { response?: string };
	};
	"@cf/leonardo/lucid-origin": {
		inputs: {
			height?: number;
			num_steps?: number;
			prompt: string;
			width?: number;
		};
		postProcessedOutputs: { image: string };
	};
};

function requiredEnv<T>(value: T | undefined, name: string) {
	if (!value) {
		throw new Error(`${name} is required`);
	}
	return value;
}

const alchemyEnv = alchemy.env as unknown as Record<string, string | undefined>;
const alchemySecretEnv = alchemy.secret.env as unknown as Record<
	string,
	Binding | undefined
>;

function optionalEnv(name: string) {
	return process.env[name] ? (alchemyEnv[name] ?? "") : "";
}

function optionalSecretEnv(name: string): Binding {
	return process.env[name] ? (alchemySecretEnv[name] ?? "") : "";
}

const nativeDomain = "youni.kuizuo.me";
const adminDomain = "youni-admin.kuizuo.me";
const apiDomain = "youni-api.kuizuo.me";
const agentDomain = "youni-agent.kuizuo.me";
const deployedNativeUrl = `https://${nativeDomain}`;
const deployedAdminUrl = `https://${adminDomain}`;
const deployedApiUrl = `https://${apiDomain}`;
const deployedAgentUrl = `https://${agentDomain}`;
const storageName = app.local ? "youni-local" : "youni-production";
const googleWebClientId = requiredEnv(
	alchemy.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
	"EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
);

const publicServerUrl = app.local
	? requiredEnv(alchemy.env.VITE_SERVER_URL, "VITE_SERVER_URL")
	: deployedApiUrl;
const publicCorsOrigins = app.local
	? requiredEnv(alchemy.env.CORS_ORIGIN, "CORS_ORIGIN")
	: [deployedNativeUrl, deployedAdminUrl].join(",");
const spaAssetScript = `
export default {
	async fetch(request, env) {
		return env.ASSETS.fetch(request);
	},
};
`;
const nativeAssetHeaders = `
/*
	Cross-Origin-Embedder-Policy: credentialless
	Cross-Origin-Opener-Policy: same-origin

/_expo/static/*
	Cache-Control: public, max-age=31536000, immutable

/assets/*
	Cache-Control: public, max-age=31536000, immutable
`;
const adminAssetHeaders = `
/assets/*
	Cache-Control: public, max-age=31536000, immutable
`;

process.env.VITE_SERVER_URL = publicServerUrl;
process.env.EXPO_PUBLIC_SERVER_URL = publicServerUrl;
process.env.BETTER_AUTH_URL = publicServerUrl;
process.env.CORS_ORIGIN = publicCorsOrigins;

export const native = await Website("native", {
	cwd: "../../apps/native",
	assets: {
		directory: "dist",
		_headers: nativeAssetHeaders,
		not_found_handling: "single-page-application",
	},
	script: spaAssetScript,
	build: {
		command: "bun expo export --platform web",
		env: {
			EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: googleWebClientId,
			EXPO_PUBLIC_SERVER_URL: publicServerUrl,
		},
	},
	bindings: {
		EXPO_PUBLIC_SERVER_URL: publicServerUrl,
	},
	domains: app.local
		? undefined
		: [
				{
					domainName: nativeDomain,
					adopt: true,
				},
			],
});

export const web = await Vite("web", {
	cwd: "../../apps/web",
	assets: {
		directory: "dist",
		_headers: adminAssetHeaders,
		not_found_handling: "single-page-application",
	},
	script: spaAssetScript,
	bindings: {
		VITE_SERVER_URL: publicServerUrl,
	},
	domains: app.local
		? undefined
		: [
				{
					domainName: adminDomain,
					adopt: true,
				},
			],
});

export const youniBucket = await R2Bucket("youni", {
	adopt: true,
	name: storageName,
});

export const youniDatabase = await D1Database("youni-db", {
	adopt: true,
	name: storageName,
	primaryLocationHint: "apac",
	readReplication: {
		mode: "disabled",
	},
	migrationsDir: "../../packages/db/src/migrations",
});

const searchRateLimit = RateLimit({
	namespace_id: 12_001,
	simple: {
		limit: 30,
		period: 60,
	},
});
export const contentReviewQueue =
	await Queue<ContentReviewJob>("note-moderation");
const workersAi = Ai<YouniAiModels>();

export const server = await Worker("server", {
	cwd: "../../apps/server",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		AI: workersAi,
		DB: youniDatabase,
		CORS_ORIGIN: publicCorsOrigins,
		BETTER_AUTH_SECRET: requiredEnv(
			alchemy.secret.env.BETTER_AUTH_SECRET,
			"BETTER_AUTH_SECRET",
		),
		BETTER_AUTH_URL: publicServerUrl,
		GOOGLE_GENERATIVE_AI_API_KEY: optionalSecretEnv(
			"GOOGLE_GENERATIVE_AI_API_KEY",
		),
		GOOGLE_WEB_CLIENT_ID: optionalEnv("GOOGLE_WEB_CLIENT_ID"),
		GOOGLE_IOS_CLIENT_ID: optionalEnv("GOOGLE_IOS_CLIENT_ID"),
		GOOGLE_ANDROID_CLIENT_ID: optionalEnv("GOOGLE_ANDROID_CLIENT_ID"),
		GOOGLE_CLIENT_SECRET: optionalSecretEnv("GOOGLE_CLIENT_SECRET"),
		RESEND_API_KEY: optionalSecretEnv("RESEND_API_KEY"),
		RESEND_FROM_EMAIL: optionalEnv("RESEND_FROM_EMAIL"),
		SEARCH_RATE_LIMIT: searchRateLimit,
		CONTENT_REVIEW_QUEUE: contentReviewQueue,
		YOUNI_BUCKET: youniBucket,
	},
	crons: ["0 17 * * *", "0 */12 * * *"],
	eventSources: [
		{
			queue: contentReviewQueue,
			settings: {
				batchSize: 1,
				maxConcurrency: 2,
				maxRetries: 3,
				maxWaitTimeMs: 1_000,
				retryDelay: 30,
			},
		},
	],
	dev: {
		port: 3000,
	},
	domains: app.local
		? undefined
		: [
				{
					domainName: apiDomain,
					adopt: true,
				},
			],
});

export const agentState = await KVNamespace("agent-state");

const agentInternalSecret = await RandomString("agent-internal-secret", {
	length: 32,
});

export const agent = await Worker("agent", {
	cwd: "../../apps/agent",
	entrypoint: "src/index.ts",
	compatibility: "node",
	bindings: {
		AI: workersAi,
		AGENT_INTERNAL_SECRET: agentInternalSecret.value,
		AGENT_STATE: agentState,
		DB: youniDatabase,
		PUBLIC_SERVER_URL: publicServerUrl,
		YOUNI_BUCKET: youniBucket,
	},
	crons: ["0 */6 * * *"],
	dev: {
		port: 3002,
	},
	domains: app.local
		? undefined
		: [
				{
					domainName: agentDomain,
					adopt: true,
				},
			],
});

console.log(`Native -> ${app.local ? native.url : deployedNativeUrl}`);
console.log(`Admin  -> ${app.local ? web.url : deployedAdminUrl}`);
console.log(`API    -> ${app.local ? server.url : deployedApiUrl}`);
console.log(`Agent  -> ${app.local ? agent.url : deployedAgentUrl}`);

await app.finalize();
