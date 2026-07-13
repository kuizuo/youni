import z from "zod";

import { output, procedure } from "./procedure";

export const searchSourceInput = z.enum([
	"typed",
	"history",
	"recommended",
	"external",
]);
export type SearchSource = z.infer<typeof searchSourceInput>;

export const recordSearchInput = z.object({
	keyword: z.string().trim().min(1).max(80),
	source: searchSourceInput,
});

export const recommendedSearchesInput = z.object({
	limit: z.number().int().min(1).max(12).default(12),
});

export type SearchDiscoveryOutputs = {
	recommendations: { items: string[]; generatedAt: Date };
	record: { accepted: boolean; hasResults: boolean };
};

export const searchDiscoveryContract = {
	recommendations: procedure
		.input(recommendedSearchesInput)
		.output(output<SearchDiscoveryOutputs["recommendations"]>()),
	record: procedure
		.input(recordSearchInput)
		.output(output<SearchDiscoveryOutputs["record"]>()),
};
