import { createDb } from "@youni/db";
import { todo } from "@youni/db/schema/todo";
import { eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure } from "../index";

export const todoRouter = {
	getAll: publicProcedure.handler(async () => {
		const db = createDb();
		return await db.select().from(todo);
	}),

	create: publicProcedure
		.input(z.object({ text: z.string().min(1) }))
		.handler(async ({ input }) => {
			const db = createDb();
			return await db.insert(todo).values({
				text: input.text,
			});
		}),

	toggle: publicProcedure
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.handler(async ({ input }) => {
			const db = createDb();
			return await db
				.update(todo)
				.set({ completed: input.completed })
				.where(eq(todo.id, input.id));
		}),

	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.handler(async ({ input }) => {
			const db = createDb();
			return await db.delete(todo).where(eq(todo.id, input.id));
		}),
};
