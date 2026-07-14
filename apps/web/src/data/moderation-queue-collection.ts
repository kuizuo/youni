import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import type {
	QueryClient,
	QueryFunctionContext,
	QueryKey,
} from "@tanstack/react-query";
import type {
	AdminOutputs,
	ModerationQueueBucket,
} from "@youni/api/contracts/admin";
import type { AdminHydratedContentNote } from "@youni/api/contracts/shared";

export const MODERATION_QUEUE_PAGE_SIZE = 20;
export const MODERATION_QUEUE_SYNC_INTERVAL = 2_000;

export type ModerationQueueInput = {
	bucket: ModerationQueueBucket;
	keyword?: string;
	limit: number;
	offset: number;
};

export type ModerationQueueResponse = AdminOutputs["moderationQueue"];

type FetchModerationQueue = (
	input: ModerationQueueInput,
	options: { signal?: AbortSignal },
) => Promise<ModerationQueueResponse>;

export function moderationQueueQueryInput({
	bucket,
	keyword,
	page,
}: {
	bucket: ModerationQueueBucket;
	keyword: string;
	page: number;
}): ModerationQueueInput {
	const normalizedKeyword = keyword.trim();
	return {
		bucket,
		keyword: normalizedKeyword || undefined,
		limit: MODERATION_QUEUE_PAGE_SIZE,
		offset: page * MODERATION_QUEUE_PAGE_SIZE,
	};
}

export function moderationQueueQueryKey(input: ModerationQueueInput) {
	return ["admin", "moderation-queue", input] as const;
}

export function reconcileModerationQueueVisibleIds({
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

export function createModerationQueueCollection({
	fetchQueue,
	input,
	queryClient,
	syncInterval = MODERATION_QUEUE_SYNC_INTERVAL,
}: {
	fetchQueue: FetchModerationQueue;
	input: ModerationQueueInput;
	queryClient: QueryClient;
	syncInterval?: number | false;
}) {
	const queryKey = moderationQueueQueryKey(input);
	const queryFn = ({ signal }: QueryFunctionContext<QueryKey>) =>
		fetchQueue(input, { signal });
	const collection = createCollection(
		queryCollectionOptions<
			AdminHydratedContentNote,
			typeof queryFn,
			Error,
			typeof queryKey,
			string,
			ModerationQueueResponse
		>({
			gcTime: 0,
			getKey: (item) => item.id,
			id: `moderation-queue:${JSON.stringify(input)}`,
			queryClient,
			queryFn,
			queryKey,
			refetchInterval: syncInterval,
			retry: 1,
			retryDelay: 500,
			select: (response) => response.items,
			staleTime: 0,
		}),
	);

	return { collection, queryFn, queryKey };
}
