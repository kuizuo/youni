import { Hono } from "hono";
import { controlStatus, runScheduledAction, updateControl } from "./actions";

export type AgentEnv = {
	AI: Ai<CreatorAiModels>;
	AGENT_INTERNAL_SECRET: string;
	AGENT_STATE: KVNamespace;
	DB: D1Database;
	PUBLIC_SERVER_URL: string;
	YOUNI_BUCKET: R2Bucket;
};

export type CreatorAiModels = {
	"@cf/leonardo/lucid-origin": {
		inputs: {
			height?: number;
			num_steps?: number;
			prompt: string;
			width?: number;
		};
		postProcessedOutputs: { image: string };
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
};

function secureEqual(left: string, right: string) {
	const encoder = new TextEncoder();
	const leftBytes = encoder.encode(left);
	const rightBytes = encoder.encode(right);
	if (leftBytes.length !== rightBytes.length) return false;
	let difference = 0;
	for (let index = 0; index < leftBytes.length; index += 1) {
		difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
	}
	return difference === 0;
}

const app = new Hono<{ Bindings: AgentEnv }>();
app.get("/", (context) => context.json({ ok: true }));
app.use("/internal/*", async (context, next) => {
	const authorization = context.req.header("authorization") ?? "";
	if (
		!secureEqual(authorization, `Bearer ${context.env.AGENT_INTERNAL_SECRET}`)
	)
		return context.json({ error: "unauthorized" }, 401);
	await next();
});
app.get("/internal/control", async (context) =>
	context.json(await controlStatus(context.env)),
);
app.put("/internal/control", async (context) =>
	context.json(await updateControl(context.env, await context.req.json())),
);
app.post("/internal/run", async (context) =>
	context.json(await runScheduledAction(context.env)),
);

export default {
	fetch: app.fetch,
	async scheduled(controller, env, context) {
		const executionKey = `execution:${controller.cron}:${controller.scheduledTime}`;
		context.waitUntil(
			(async () => {
				if (await env.AGENT_STATE.get(executionKey)) return;
				await env.AGENT_STATE.put(executionKey, "1", {
					expirationTtl: 86_400,
				});
				await runScheduledAction(env);
			})().catch((error) => {
				console.error(
					JSON.stringify({
						event: "creator_agent_failed",
						message: error instanceof Error ? error.message : "unknown_error",
					}),
				);
			}),
		);
	},
} satisfies ExportedHandler<AgentEnv>;
