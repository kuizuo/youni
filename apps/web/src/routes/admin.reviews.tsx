import { useLiveQuery } from "@tanstack/react-db";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type {
	AdminOutputs,
	ModerationQueueBucket,
} from "@youni/api/contracts/admin";
import type {
	AdminHydratedContentNote,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { useEffect, useMemo, useRef, useState } from "react";

import { AdminPage } from "@/components/admin-shell";
import {
	createModerationQueueCollection,
	moderationQueueQueryInput,
	reconcileModerationQueueVisibleIds,
} from "@/data/moderation-queue-collection";
import { ReviewQueue } from "@/routes/-admin-reviews/review-queue";
import { client, orpc, queryClient } from "@/utils/orpc";

const EMPTY_SUMMARY: AdminOutputs["moderationQueue"]["summary"] = {
	all: 0,
	attention: 0,
	blocked: 0,
	failed: 0,
	passed: 0,
};

export const Route = createFileRoute("/admin/reviews")({
	component: AdminReviewsRoute,
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
	const [bucket, setBucket] = useState<ModerationQueueBucket>("attention");
	const [keyword, setKeyword] = useState("");
	const [settledKeyword, setSettledKeyword] = useState("");
	const [page, setPage] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isBlockingRefresh, setIsBlockingRefresh] = useState(false);
	const [loadedScopeKey, setLoadedScopeKey] = useState<string | null>(null);
	const [visibleItemIds, setVisibleItemIds] = useState<string[]>([]);
	const [displaySummary, setDisplaySummary] =
		useState<AdminOutputs["moderationQueue"]["summary"]>(EMPTY_SUMMARY);
	const [displayTotal, setDisplayTotal] = useState(0);

	useEffect(() => {
		const normalizedKeyword = keyword.trim();
		if (normalizedKeyword === settledKeyword) return;
		const timeout = window.setTimeout(() => {
			setSettledKeyword(normalizedKeyword);
		}, 300);
		return () => window.clearTimeout(timeout);
	}, [keyword, settledKeyword]);

	const queryInput = useMemo(
		() =>
			moderationQueueQueryInput({
				bucket,
				keyword: settledKeyword,
				page,
			}),
		[bucket, page, settledKeyword],
	);
	const scopeKey = JSON.stringify(queryInput);
	const scope = useMemo(
		() =>
			createModerationQueueCollection({
				fetchQueue: (input, options) =>
					client.admin.moderationQueue(input, options),
				input: queryInput,
				queryClient,
			}),
		[queryInput],
	);
	const activeScopeRef = useRef(scope);
	activeScopeRef.current = scope;

	useEffect(
		() => () => {
			void scope.collection.cleanup();
		},
		[scope.collection],
	);

	const liveQueue = useLiveQuery(
		(query) =>
			query
				.from({ note: scope.collection })
				.orderBy(({ note }) => note.createdAt, "desc"),
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
	const isSearchSettling = keyword.trim() !== settledKeyword;

	useEffect(() => {
		if (
			isSearchSettling ||
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
			reconcileModerationQueueVisibleIds({
				allowNewItems: bucket === "attention" && page === 0,
				currentIds,
				nextItems: liveItems,
				replace: loadedScopeKey !== scopeKey || isBlockingRefresh,
			}),
		);
	}, [
		bucket,
		isBlockingRefresh,
		isSearchSettling,
		liveItems,
		liveQueue.isReady,
		loadedScopeKey,
		page,
		queue.data,
		queue.isFetching,
		queue.isSuccess,
		scopeKey,
	]);

	const hasLoadedCurrentScope = loadedScopeKey === scopeKey;
	const hasInitialError =
		!hasLoadedCurrentScope && queue.isError && !queue.isFetching;
	const isContentLoading =
		isSearchSettling ||
		isBlockingRefresh ||
		(!hasLoadedCurrentScope && !hasInitialError);
	const visibleItems = useMemo(() => {
		const liveById = new Map(liveItems.map((item) => [item.id, item]));
		return visibleItemIds.flatMap((id) => {
			const item = liveById.get(id);
			return item ? [item] : [];
		});
	}, [liveItems, visibleItemIds]);
	const displayedItems =
		hasLoadedCurrentScope && !isSearchSettling && !isBlockingRefresh
			? visibleItems
			: [];

	const clearMessages = () => {
		setErrorMessage(null);
		setSuccessMessage(null);
	};

	const updateBucket = (nextBucket: ModerationQueueBucket) => {
		setBucket(nextBucket);
		setPage(0);
		clearMessages();
	};

	const updateKeyword = (value: string) => {
		setKeyword(value);
		setPage(0);
		clearMessages();
	};

	const updatePage = (nextPage: number) => {
		setPage(nextPage);
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
		>
			<ReviewQueue
				bucket={bucket}
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
				page={page}
				successMessage={successMessage}
				summary={displaySummary}
				syncErrorMessage={
					hasLoadedCurrentScope && queue.isError
						? "自动同步暂时中断，系统会继续重试。"
						: null
				}
				total={hasLoadedCurrentScope ? displayTotal : 0}
				onBucketChange={updateBucket}
				onKeywordChange={updateKeyword}
				onPageChange={updatePage}
				onRetry={retryQueue}
				onReview={reviewNote}
			/>
		</AdminPage>
	);
}
