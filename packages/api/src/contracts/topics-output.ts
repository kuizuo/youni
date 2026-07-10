import type { HydratedContentNote } from "./content-note-types";

export type TopicsOutputs = {
	topics: { noteCount: number; id: string; name: string; createdAt: Date }[];
	searchTopics: {
		items: {
			discussionCount: number;
			noteCount: number;
			id: string;
			name: string;
			createdAt: Date;
		}[];
		hasMore: boolean;
		nextOffset: number | null;
	};
	topicDetail: {
		topic: {
			discussionCount: number;
			noteCount: number;
			id: string;
			name: string;
			createdAt: Date;
		};
		notes: {
			items: HydratedContentNote[];
			hasMore: boolean;
			nextOffset: number | null;
		};
	};
	topicByName: { id: string; name: string; createdAt: Date };
};
