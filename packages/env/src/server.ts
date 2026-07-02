/// <reference types="@cloudflare/workers-types" />
/// <reference path="../env.d.ts" />

let workerEnv: Env | undefined;

try {
	workerEnv = (await import("cloudflare:workers")).env;
} catch {
	workerEnv = undefined;
}

export const env = workerEnv ?? (await import("./cloudflare-local")).env;
