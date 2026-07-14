import type { QueryClient } from "@tanstack/react-query";
import type {
	AdminOutputs,
	ModerationQueueBucket as ReviewQueueBucket,
} from "@youni/api/contracts/admin";
import type { AdminHydratedContentNote } from "@youni/api/contracts/shared";

import {
	createQueryCollection,
	QUERY_COLLECTION_SYNC_INTERVAL,
} from "@/data/query-collection";

export const REVIEW_QUEUE_PAGE_SIZE = 20;
export const REVIEW_QUEUE_SYNC_INTERVAL = QUERY_COLLECTION_SYNC_INTERVAL;

export type { ReviewQueueBucket };

export type ReviewQueueInput = {
	bucket: ReviewQueueBucket;
	keyword?: string;
	limit: number;
	offset: number;
};

export type ReviewQueueResponse = AdminOutputs["moderationQueue"];

type FetchReviewQueue = (
	input: ReviewQueueInput,
	options: { signal?: AbortSignal },
) => Promise<ReviewQueueResponse>;

export function reviewQueueQueryInput({
	bucket,
	keyword,
	page,
}: {
	bucket: ReviewQueueBucket;
	keyword: string;
	page: number;
}): ReviewQueueInput {
	const normalizedKeyword = keyword.trim();
	return {
		bucket,
		keyword: normalizedKeyword || undefined,
		limit: REVIEW_QUEUE_PAGE_SIZE,
		offset: page * REVIEW_QUEUE_PAGE_SIZE,
	};
}

export function reviewQueueQueryKey(input: ReviewQueueInput) {
	return ["admin", "review-queue", input] as const;
}

export function reconcileReviewQueueVisibleIds({
	allowNewItems,
	currentIds,
	nextItems,
	replace,
}: {
	allowNewItems: boolean;
	currentIds: string[];
	nextItems: AdminHydratedContentNote[];
	replace: boolean;
}) {
	const nextIds = nextItems.map((item) => item.id);
	if (replace || allowNewItems) return nextIds;
	const nextIdSet = new Set(nextIds);
	return currentIds.filter((id) => nextIdSet.has(id));
}

export function createReviewQueueCollection({
	fetchQueue,
	input,
	queryClient,
	syncInterval = REVIEW_QUEUE_SYNC_INTERVAL,
}: {
	fetchQueue: FetchReviewQueue;
	input: ReviewQueueInput;
	queryClient: QueryClient;
	syncInterval?: number | false;
}) {
	const queryKey = reviewQueueQueryKey(input);
	const queryFn = ({ signal }: { signal: AbortSignal }) =>
		fetchQueue(input, { signal });
	return createQueryCollection({
		getKey: (item: AdminHydratedContentNote) => item.id,
		id: `review-queue:${JSON.stringify(input)}`,
		queryClient,
		queryFn,
		queryKey,
		select: (response: ReviewQueueResponse) => response.items,
		syncInterval,
	});
}
