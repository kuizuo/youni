import z from "zod";

import { listInput, paginatedListInput } from "./common-inputs";
import { output, procedure } from "./procedure";
import type { TopicsOutputs } from "./topics-output";

export const topicDetailInput = z.object({
	id: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(20),
	offset: z.number().int().min(0).default(0),
	sort: z.enum(["hot", "latest"]).default("hot"),
});

export const topicNameInput = z.object({
	name: z.string().trim().min(1).max(24),
});

export const topicsContract = {
	topics: procedure.input(listInput).output(output<TopicsOutputs["topics"]>()),
	searchTopics: procedure
		.input(paginatedListInput)
		.output(output<TopicsOutputs["searchTopics"]>()),
	topicDetail: procedure
		.input(topicDetailInput)
		.output(output<TopicsOutputs["topicDetail"]>()),
	topicByName: procedure
		.input(topicNameInput)
		.output(output<TopicsOutputs["topicByName"]>()),
};
