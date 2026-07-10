import z from "zod";

export const idInput = z.object({ id: z.string().min(1) });

export const listInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(60).default(30),
});

export const paginatedListInput = listInput.extend({
	offset: z.number().int().min(0).default(0),
});
