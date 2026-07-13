import type { TopicRow } from "@youni/db/schema/content";
import z from "zod";
import { output, procedure } from "./procedure";
import type { HydratedContentNote } from "./shared";
import { listInput, paginatedListInput } from "./shared";

// ====== Input ======

export const topicSortInput = z.enum(["hot", "latest"]);
export type TopicSort = z.infer<typeof topicSortInput>;

export const topicDetailInput = z.object({
	id: z.string().min(1),
	limit: z.number().int().min(1).max(60).default(20),
	offset: z.number().int().min(0).default(0),
	sort: topicSortInput.default("hot"),
});

export const topicNameInput = z.object({
	name: z.string().trim().min(1).max(24),
});

// ====== Output ======

export type TopicSearchItem = Pick<TopicRow, "id" | "name" | "createdAt"> & {
	discussionCount: number;
	noteCount: number;
};

export type TopicsOutputs = {
	topics: { noteCount: number; id: string; name: string; createdAt: Date }[];
	searchTopics: {
		items: TopicSearchItem[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	topicDetail: {
		topic: TopicSearchItem;
		notes: {
			items: HydratedContentNote[];
			hasMore: boolean;
			nextOffset: number | null;
		};
	};
	topicByName: { id: string; name: string; createdAt: Date };
};

// ====== Contract ======

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
