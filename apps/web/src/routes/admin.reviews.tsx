import { useLiveQuery } from "@tanstack/react-db";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { moderationQueueBuckets } from "@youni/api/contracts/admin";
import type {
	AdminHydratedContentNote,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { useEffect, useMemo, useRef, useState } from "react";
import z from "zod";

import { AdminPage } from "@/components/admin-shell";
import {
	createReviewQueueCollection,
	type ReviewQueueBucket,
	type ReviewQueueResponse,
	reconcileReviewQueueVisibleIds,
	reviewQueueQueryInput,
} from "@/data/review-collection";
import {
	parseAdminListSearch,
	parseAdminSearchOption,
} from "@/lib/admin-list-search";
import { ProhibitedTermsSettings } from "@/routes/-admin-reviews/prohibited-terms-settings";
import { ReviewQueue } from "@/routes/-admin-reviews/review-queue";
import { client, orpc, queryClient } from "@/utils/orpc";

const EMPTY_SUMMARY: ReviewQueueResponse["summary"] = {
	all: 0,
	attention: 0,
	blocked: 0,
	failed: 0,
	passed: 0,
};

const reviewSearchDefaults = {
	bucket: "attention" as ReviewQueueBucket,
	page: 1,
	q: "",
};

function validateReviewSearch(search: Record<string, unknown>) {
	const common = parseAdminListSearch(search, ["createdAt"] as const);
	return {
		bucket:
			parseAdminSearchOption(search.bucket, moderationQueueBuckets) ||
			reviewSearchDefaults.bucket,
		page: common.page,
		q: common.q,
	};
}

const reviewSearchSchema = z
	.object({
		bucket: z.unknown().optional(),
		page: z.unknown().optional(),
		q: z.unknown().optional(),
	})
	.transform(validateReviewSearch);

export const Route = createFileRoute("/admin/reviews")({
	component: AdminReviewsRoute,
	search: {
		middlewares: [stripSearchParams(reviewSearchDefaults)],
	},
	validateSearch: reviewSearchSchema,
});

function sameQueueItems(
	left: AdminHydratedContentNote[],
	right: AdminHydratedContentNote[],
) {
	if (left.length !== right.length) return false;
	const leftById = new Map(left.map((item) => [item.id, item]));
	return right.every((rightItem) => {
		const leftItem = leftById.get(rightItem.id);
		if (!leftItem) return false;
		return (
			leftItem.title === rightItem.title &&
			leftItem.content === rightItem.content &&
			leftItem.status === rightItem.status &&
			leftItem.moderationStatus === rightItem.moderationStatus &&
			leftItem.moderationReason === rightItem.moderationReason &&
			leftItem.rejectionReason === rightItem.rejectionReason &&
			String(leftItem.moderatedAt ?? "") ===
				String(rightItem.moderatedAt ?? "") &&
			JSON.stringify(leftItem.images) === JSON.stringify(rightItem.images) &&
			JSON.stringify(leftItem.moderationDetails) ===
				JSON.stringify(rightItem.moderationDetails)
		);
	});
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

function AdminReviewsRoute() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const [keyword, setKeyword] = useState(search.q);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isBlockingRefresh, setIsBlockingRefresh] = useState(false);
	const [loadedScopeKey, setLoadedScopeKey] = useState<string | null>(null);
	const [visibleItemIds, setVisibleItemIds] = useState<string[]>([]);
	const [displaySummary, setDisplaySummary] =
		useState<ReviewQueueResponse["summary"]>(EMPTY_SUMMARY);
	const [displayTotal, setDisplayTotal] = useState(0);

	useEffect(() => {
		setKeyword(search.q);
	}, [search.q]);

	const queryInput = useMemo(
		() =>
			reviewQueueQueryInput({
				bucket: search.bucket,
				keyword: search.q,
				page: search.page - 1,
			}),
		[search.bucket, search.page, search.q],
	);
	const scopeKey = JSON.stringify(queryInput);
	const scope = useMemo(
		() =>
			createReviewQueueCollection({
				fetchQueue: (input, options) =>
					client.admin.moderationQueue(input, options),
				input: queryInput,
				queryClient,
			}),
		[queryInput],
	);
	const activeScopeRef = useRef(scope);
	activeScopeRef.current = scope;

	const liveQueue = useLiveQuery(
		{
			gcTime: 0,
			query: (query) =>
				query
					.from({ note: scope.collection })
					.orderBy(({ note }) => note.createdAt, "desc"),
		},
		[scope.collection],
	);
	const queue = useQuery({
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
	const reviewMutation = useMutation(
		orpc.admin.updateNoteStatus.mutationOptions(),
	);
	const liveItems = liveQueue.data ?? [];

	useEffect(() => {
		if (
			queue.isFetching ||
			!queue.isSuccess ||
			!liveQueue.isReady ||
			!sameQueueItems(liveItems, queue.data.items)
		) {
			return;
		}
		setLoadedScopeKey(scopeKey);
		setDisplaySummary(queue.data.summary);
		setDisplayTotal(queue.data.total);
		setVisibleItemIds((currentIds) =>
			reconcileReviewQueueVisibleIds({
				allowNewItems: search.bucket === "attention" && search.page === 1,
				currentIds,
				nextItems: liveItems,
				replace: loadedScopeKey !== scopeKey || isBlockingRefresh,
			}),
		);
	}, [
		isBlockingRefresh,
		liveItems,
		liveQueue.isReady,
		loadedScopeKey,
		queue.data,
		queue.isFetching,
		queue.isSuccess,
		search.bucket,
		search.page,
		scopeKey,
	]);

	const hasLoadedCurrentScope = loadedScopeKey === scopeKey;
	const hasInitialError =
		!hasLoadedCurrentScope && queue.isError && !queue.isFetching;
	const isContentLoading =
		isBlockingRefresh || (!hasLoadedCurrentScope && !hasInitialError);
	const visibleItems = useMemo(() => {
		const liveById = new Map(liveItems.map((item) => [item.id, item]));
		return visibleItemIds.flatMap((id) => {
			const item = liveById.get(id);
			return item ? [item] : [];
		});
	}, [liveItems, visibleItemIds]);
	const displayedItems =
		hasLoadedCurrentScope && !isBlockingRefresh ? visibleItems : [];

	useEffect(() => {
		if (!hasLoadedCurrentScope) return;
		const pageCount = Math.max(Math.ceil(displayTotal / 20), 1);
		if (search.page <= pageCount) return;
		void navigate({
			replace: true,
			resetScroll: false,
			search: (current) => ({ ...current, page: pageCount }),
		});
	}, [displayTotal, hasLoadedCurrentScope, navigate, search.page]);

	const clearMessages = () => {
		setErrorMessage(null);
		setSuccessMessage(null);
	};

	const updateBucket = (nextBucket: ReviewQueueBucket) => {
		void navigate({
			resetScroll: false,
			search: (current) => ({ ...current, bucket: nextBucket, page: 1 }),
		});
		clearMessages();
	};

	const updateKeyword = (value: string) => {
		setKeyword(value);
		clearMessages();
	};
	const submitKeyword = (value: string) => {
		const normalized = value.trim();
		setKeyword(normalized);
		if (normalized === search.q) return;
		void navigate({
			replace: true,
			resetScroll: false,
			search: (current) => ({ ...current, page: 1, q: normalized }),
		});
		clearMessages();
	};
	const clearKeyword = () => {
		setKeyword("");
		if (!search.q) return;
		void navigate({
			replace: true,
			resetScroll: false,
			search: (current) => ({ ...current, page: 1, q: "" }),
		});
		clearMessages();
	};

	const updatePage = (nextPage: number) => {
		void navigate({
			resetScroll: false,
			search: (current) => ({ ...current, page: nextPage + 1 }),
		});
		clearMessages();
	};

	const refreshCurrentScope = async () => {
		setIsBlockingRefresh(true);
		try {
			await activeScopeRef.current.collection.utils.refetch({
				throwOnError: true,
			});
			await waitForNextPaint();
		} finally {
			setIsBlockingRefresh(false);
		}
	};

	const retryQueue = async () => {
		setErrorMessage(null);
		try {
			await refreshCurrentScope();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "审核队列加载失败",
			);
		}
	};

	const reviewNote = async (
		note: AdminHydratedContentNote,
		status: Extract<ContentNoteStatus, "published" | "rejected">,
		reason?: string,
	) => {
		clearMessages();
		try {
			await reviewMutation.mutateAsync({
				id: note.id,
				rejectionReason: status === "rejected" ? reason : undefined,
				status,
			});
			setSuccessMessage(
				status === "published"
					? `已通过「${note.title}」`
					: `已拒绝「${note.title}」并保存理由`,
			);
			await refreshCurrentScope();
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : "审核处理失败");
		}
	};

	return (
		<AdminPage
			title="审核队列"
			description="查看自动审核结果和判断原因，处理需要人工复核的图文。"
			actions={<ProhibitedTermsSettings />}
		>
			<ReviewQueue
				bucket={search.bucket}
				contentErrorMessage={
					hasInitialError
						? queue.error instanceof Error
							? queue.error.message
							: "审核队列加载失败"
						: null
				}
				errorMessage={errorMessage}
				isContentLoading={isContentLoading}
				isMutating={reviewMutation.isPending}
				isSyncing={hasLoadedCurrentScope && queue.isFetching}
				items={displayedItems}
				keyword={keyword}
				lastSyncedAt={
					hasLoadedCurrentScope && queue.dataUpdatedAt > 0
						? queue.dataUpdatedAt
						: null
				}
				page={search.page - 1}
				successMessage={successMessage}
				summary={displaySummary}
				syncErrorMessage={
					hasLoadedCurrentScope && queue.isError
						? "自动同步暂时中断，系统会继续重试。"
						: null
				}
				total={hasLoadedCurrentScope ? displayTotal : 0}
				onBucketChange={updateBucket}
				onClearKeyword={clearKeyword}
				onKeywordChange={updateKeyword}
				onKeywordSubmit={submitKeyword}
				onPageChange={updatePage}
				onRetry={retryQueue}
				onReview={reviewNote}
			/>
		</AdminPage>
	);
}
