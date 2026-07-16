import { useMutation } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { moderationQueueBuckets } from "@youni/api/contracts/admin";
import type { AdminHydratedContentNote } from "@youni/api/contracts/shared";
import { useEffect, useState } from "react";
import z from "zod";

import { AdminPage } from "@/components/admin-shell";
import { type ReviewQueueBucket, useReviewQueue } from "@/data/review-queue";
import {
	parseAdminListSearch,
	parseAdminSearchOption,
} from "@/lib/admin-list-search";
import { ProhibitedTermsSettings } from "@/routes/-admin-reviews/prohibited-terms-settings";
import { ReviewQueue } from "@/routes/-admin-reviews/review-queue";
import { orpc } from "@/utils/orpc";

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

function AdminReviewsRoute() {
	const navigate = Route.useNavigate();
	const search = Route.useSearch();
	const [keyword, setKeyword] = useState(search.q);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		setKeyword(search.q);
	}, [search.q]);

	const queue = useReviewQueue({
		bucket: search.bucket,
		keyword: search.q,
		page: search.page,
	});
	const reviewMutation = useMutation(orpc.admin.reviewNote.mutationOptions());
	useEffect(() => {
		if (!queue.pageCorrection) return;
		void navigate({
			replace: true,
			resetScroll: false,
			search: (current) => ({ ...current, page: queue.pageCorrection ?? 1 }),
		});
	}, [navigate, queue.pageCorrection]);

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

	const retryQueue = async () => {
		setErrorMessage(null);
		try {
			await queue.refresh();
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "审核队列加载失败",
			);
		}
	};

	const reviewNote = async (
		note: AdminHydratedContentNote,
		decision: "approve" | "reject",
		reason?: string,
	) => {
		clearMessages();
		try {
			const expectedUpdatedAt = new Date(note.updatedAt).toISOString();
			await reviewMutation.mutateAsync(
				decision === "approve"
					? { decision, expectedUpdatedAt, id: note.id }
					: {
							decision,
							expectedUpdatedAt,
							id: note.id,
							rejectionReason: reason ?? "",
						},
			);
			setSuccessMessage(
				decision === "approve"
					? `已通过「${note.title}」`
					: `已拒绝「${note.title}」并保存理由`,
			);
			await queue.refresh();
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
				contentErrorMessage={queue.contentErrorMessage}
				errorMessage={errorMessage}
				isContentLoading={queue.isContentLoading}
				isMutating={reviewMutation.isPending}
				isSyncing={queue.isSyncing}
				items={queue.items}
				keyword={keyword}
				lastSyncedAt={queue.lastSyncedAt}
				page={search.page - 1}
				successMessage={successMessage}
				summary={queue.summary}
				syncErrorMessage={queue.syncErrorMessage}
				total={queue.total}
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
