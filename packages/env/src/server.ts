/// <reference types="@cloudflare/workers-types" />
/// <reference path="../env.d.ts" />
import { env as localEnv } from "./cloudflare-local";

let workerEnv: Env | undefined;

try {
	workerEnv = (await import("cloudflare:workers")).env;
} catch {
	workerEnv = undefined;
}

export const env = workerEnv ?? localEnv;
