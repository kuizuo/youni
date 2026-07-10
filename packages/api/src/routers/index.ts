import { publicProcedure } from "../index";
import { implementationRouter } from "./implementation";

export const appRouter = publicProcedure.router(implementationRouter);
export type AppRouter = typeof appRouter;
export type { AppRouterClient } from "../contracts";
