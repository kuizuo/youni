import {
	type QueryCollectionConfig,
	type QueryCollectionUtils,
	queryCollectionOptions,
} from "@tanstack/query-db-collection";
import {
	type Collection,
	createCollection,
	useLiveQuery,
} from "@tanstack/react-db";
import {
	type QueryClient,
	type QueryFunctionContext,
	type QueryKey,
	useQuery,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

export const QUERY_COLLECTION_SYNC_INTERVAL = 2_000;

export type QueryCollectionScope<
	TItem extends object,
	TResponse,
	TQueryKey extends QueryKey,
	TItemKey extends string | number,
> = {
	collection: Collection<
		TItem,
		TItemKey,
		QueryCollectionUtils<TItem, TItemKey, TItem, Error>,
		never,
		TItem
	>;
	queryFn: (context: QueryFunctionContext<TQueryKey>) => Promise<TResponse>;
	queryKey: TQueryKey;
};

export function createQueryCollection<
	TItem extends object,
	TResponse,
	TQueryKey extends QueryKey,
	TItemKey extends string | number,
>({
	getKey,
	id,
	queryClient,
	queryFn,
	queryKey,
	select,
	syncInterval = QUERY_COLLECTION_SYNC_INTERVAL,
}: {
	getKey: (item: TItem) => TItemKey;
	id: string;
	queryClient: QueryClient;
	queryFn: (context: QueryFunctionContext<TQueryKey>) => Promise<TResponse>;
	queryKey: TQueryKey;
	select: (response: TResponse) => TItem[];
	syncInterval?: number | false;
}): QueryCollectionScope<TItem, TResponse, TQueryKey, TItemKey> {
	const options = {
		gcTime: 0,
		getKey,
		id,
		queryClient,
		queryFn,
		queryKey,
		refetchInterval: syncInterval,
		retry: 1,
		retryDelay: 500,
		select,
		staleTime: 0,
	} as QueryCollectionConfig<
		TItem,
		typeof queryFn,
		Error,
		TQueryKey,
		TItemKey,
		never,
		TResponse
	> & {
		schema?: never;
		select: (response: TResponse) => TItem[];
	};
	const collection = createCollection(
		queryCollectionOptions<
			TItem,
			typeof queryFn,
			Error,
			TQueryKey,
			TItemKey,
			TResponse
		>(options),
	);

	return { collection, queryFn, queryKey };
}

export function createSingletonQueryCollection<
	TResponse extends object,
	TQueryKey extends QueryKey,
>({
	id,
	queryClient,
	queryFn,
	queryKey,
	syncInterval,
}: {
	id: string;
	queryClient: QueryClient;
	queryFn: (context: QueryFunctionContext<TQueryKey>) => Promise<TResponse>;
	queryKey: TQueryKey;
	syncInterval?: number | false;
}) {
	return createQueryCollection({
		getKey: () => id,
		id,
		queryClient,
		queryFn,
		queryKey,
		select: (response: TResponse) => [response],
		syncInterval,
	});
}

export function useQueryCollection<
	TItem extends object,
	TResponse,
	TQueryKey extends QueryKey,
	TItemKey extends string | number,
>(
	scope: QueryCollectionScope<TItem, TResponse, TQueryKey, TItemKey>,
	compareItems?: (left: TItem, right: TItem) => number,
) {
	useEffect(
		() => () => {
			void scope.collection.cleanup();
		},
		[scope.collection],
	);

	const live = useLiveQuery(() => scope.collection, [scope.collection]);
	const query = useQuery({
		gcTime: 0,
		queryFn: scope.queryFn,
		queryKey: scope.queryKey,
		refetchOnMount: "always",
		refetchOnReconnect: "always",
		refetchOnWindowFocus: "always",
		retry: 1,
		retryDelay: 500,
		staleTime: 0,
	});
	const items = useMemo(() => {
		const current = live.data ?? [];
		return compareItems ? [...current].sort(compareItems) : current;
	}, [compareItems, live.data]);
	const refetch = useCallback(
		(throwOnError = true) => scope.collection.utils.refetch({ throwOnError }),
		[scope.collection],
	);

	return {
		dataUpdatedAt: query.dataUpdatedAt,
		error: query.error,
		isError: query.isError,
		isInitialLoading:
			!query.isError && !query.data && (query.isPending || !live.isReady),
		isSyncing: Boolean(query.data) && query.isFetching,
		items,
		refetch,
		response: query.data,
	};
}

export function compareCreatedAtDescending<
	TItem extends { createdAt: Date | string },
>(left: TItem, right: TItem) {
	return (
		new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
	);
}
