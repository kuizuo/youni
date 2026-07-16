import { useQuery } from "@tanstack/react-query";
import type {
	AdminOutputs,
	ModerationQueueBucket as ReviewQueueBucket,
} from "@youni/api/contracts/admin";
import { useCallback, useEffect, useMemo, useState } from "react";

import { client } from "@/utils/orpc";

const REVIEW_QUEUE_PAGE_SIZE = 20;
const REVIEW_QUEUE_SYNC_INTERVAL = 2_000;

export type { ReviewQueueBucket };

export type ReviewQueueInput = {
	bucket: ReviewQueueBucket;
	keyword?: string;
	limit: number;
	offset: number;
};

export type ReviewQueueResponse = AdminOutputs["moderationQueue"];

const EMPTY_REVIEW_QUEUE_RESPONSE: ReviewQueueResponse = {
	items: [],
	summary: {
		all: 0,
		attention: 0,
		blocked: 0,
		failed: 0,
		passed: 0,
	},
	total: 0,
};

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

export function reconcileReviewQueueResponse({
	allowNewItems,
	current,
	next,
	replace,
}: {
	allowNewItems: boolean;
	current: ReviewQueueResponse | null;
	next: ReviewQueueResponse;
	replace: boolean;
}) {
	if (!current || replace || allowNewItems) return next;

	const nextById = new Map(next.items.map((item) => [item.id, item]));
	return {
		...next,
		items: current.items.flatMap((item) => {
			const updated = nextById.get(item.id);
			return updated ? [updated] : [];
		}),
	};
}

function waitForNextPaint() {
	return new Promise<void>((resolve) => {
		if (typeof requestAnimationFrame === "function") {
			requestAnimationFrame(() => resolve());
			return;
		}
		setTimeout(resolve, 0);
	});
}

export function useReviewQueue({
	bucket,
	keyword,
	page,
}: {
	bucket: ReviewQueueBucket;
	keyword: string;
	page: number;
}) {
	const input = useMemo(
		() =>
			reviewQueueQueryInput({
				bucket,
				keyword,
				page: page - 1,
			}),
		[bucket, keyword, page],
	);
	const scopeKey = JSON.stringify(input);
	const query = useQuery({
		gcTime: 0,
		queryFn: ({ signal }) => client.admin.moderationQueue(input, { signal }),
		queryKey: ["admin", "review-queue", input] as const,
		refetchInterval: REVIEW_QUEUE_SYNC_INTERVAL,
		refetchOnMount: "always",
		refetchOnReconnect: "always",
		refetchOnWindowFocus: "always",
		retry: 1,
		retryDelay: 500,
		staleTime: 0,
	});
	const [snapshot, setSnapshot] = useState<null | {
		response: ReviewQueueResponse;
		scopeKey: string;
	}>(null);
	const [isBlockingRefresh, setIsBlockingRefresh] = useState(false);
	const allowNewItems = bucket === "attention" && page === 1;

	useEffect(() => {
		if (isBlockingRefresh || query.isFetching || !query.isSuccess) return;

		setSnapshot((current) => ({
			response: reconcileReviewQueueResponse({
				allowNewItems,
				current: current?.scopeKey === scopeKey ? current.response : null,
				next: query.data,
				replace: current?.scopeKey !== scopeKey,
			}),
			scopeKey,
		}));
	}, [
		allowNewItems,
		isBlockingRefresh,
		query.data,
		query.isFetching,
		query.isSuccess,
		scopeKey,
	]);

	const refresh = useCallback(async () => {
		setIsBlockingRefresh(true);
		try {
			const result = await query.refetch({ throwOnError: true });
			if (result.data) {
				setSnapshot({ response: result.data, scopeKey });
			}
			await waitForNextPaint();
		} finally {
			setIsBlockingRefresh(false);
		}
	}, [query.refetch, scopeKey]);

	const hasLoadedCurrentScope = snapshot?.scopeKey === scopeKey;
	const response = hasLoadedCurrentScope
		? snapshot.response
		: EMPTY_REVIEW_QUEUE_RESPONSE;
	const hasInitialError =
		!hasLoadedCurrentScope && query.isError && !query.isFetching;
	const pageCount = Math.max(
		Math.ceil(response.total / REVIEW_QUEUE_PAGE_SIZE),
		1,
	);

	return {
		contentErrorMessage: hasInitialError
			? query.error instanceof Error
				? query.error.message
				: "审核队列加载失败"
			: null,
		isContentLoading:
			isBlockingRefresh || (!hasLoadedCurrentScope && !hasInitialError),
		isSyncing: hasLoadedCurrentScope && query.isFetching,
		items: hasLoadedCurrentScope && !isBlockingRefresh ? response.items : [],
		lastSyncedAt:
			hasLoadedCurrentScope && query.dataUpdatedAt > 0
				? query.dataUpdatedAt
				: null,
		pageCorrection:
			hasLoadedCurrentScope && page > pageCount ? pageCount : null,
		refresh,
		summary: response.summary,
		syncErrorMessage:
			hasLoadedCurrentScope && query.isError
				? "自动同步暂时中断，系统会继续重试。"
				: null,
		total: response.total,
	};
}
