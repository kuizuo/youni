import type { AdminTopicListItem } from "@youni/api/contracts/admin";
import { useMemo } from "react";

import {
	compareCreatedAtDescending,
	createQueryCollection,
	createSingletonQueryCollection,
	useQueryCollection,
} from "@/data/query-collection";
import { client, queryClient } from "@/utils/orpc";

export type TopicsQueryInput = {
	keyword?: string;
	limit: number;
	offset: number;
};

export function useTopicsCollection(input: TopicsQueryInput) {
	const scope = useMemo(
		() =>
			createQueryCollection({
				getKey: (item: AdminTopicListItem) => item.id,
				id: `admin-topics:${JSON.stringify(input)}`,
				queryClient,
				queryFn: ({ signal }) => client.admin.topics(input, { signal }),
				queryKey: ["admin", "topics", input] as const,
				select: (response) => response.items,
			}),
		[input],
	);

	return useQueryCollection(scope, compareCreatedAtDescending);
}

export function useTopicDetailCollection(topicId: string) {
	const scope = useMemo(
		() =>
			createSingletonQueryCollection({
				id: `admin-topic-detail:${topicId}`,
				queryClient,
				queryFn: ({ signal }) =>
					client.admin.topicDetail({ id: topicId }, { signal }),
				queryKey: ["admin", "topic-detail", topicId] as const,
			}),
		[topicId],
	);

	return useQueryCollection(scope);
}
