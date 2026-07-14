import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { ModerationQueueBucket } from "@youni/api/contracts/admin";
import type {
	AdminHydratedContentNote,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { useState } from "react";

import { AdminPage } from "@/components/admin-shell";
import { ReviewQueue } from "@/routes/-admin-reviews/review-queue";
import { orpc, queryClient } from "@/utils/orpc";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/admin/reviews")({
	component: AdminReviewsRoute,
});

function AdminReviewsRoute() {
	const [bucket, setBucket] = useState<ModerationQueueBucket>("attention");
	const [keyword, setKeyword] = useState("");
	const [page, setPage] = useState(0);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const queue = useQuery({
		...orpc.admin.moderationQueue.queryOptions({
			input: {
				bucket,
				keyword: keyword.trim() || undefined,
				limit: PAGE_SIZE,
				offset: page * PAGE_SIZE,
			},
		}),
		placeholderData: keepPreviousData,
	});
	const reviewMutation = useMutation(
		orpc.admin.updateNoteStatus.mutationOptions(),
	);

	const updateBucket = (nextBucket: ModerationQueueBucket) => {
		setBucket(nextBucket);
		setPage(0);
		setErrorMessage(null);
		setSuccessMessage(null);
	};

	const updateKeyword = (value: string) => {
		setKeyword(value);
		setPage(0);
		setErrorMessage(null);
		setSuccessMessage(null);
	};

	const reviewNote = async (
		note: AdminHydratedContentNote,
		status: Extract<ContentNoteStatus, "published" | "rejected">,
		reason?: string,
	) => {
		setErrorMessage(null);
		setSuccessMessage(null);
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
			await queryClient.invalidateQueries();
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
				errorMessage={
					errorMessage ??
					(queue.error instanceof Error ? queue.error.message : null)
				}
				isFetching={queue.isFetching}
				isLoading={queue.isLoading}
				isMutating={reviewMutation.isPending}
				items={queue.data?.items ?? []}
				keyword={keyword}
				page={page}
				successMessage={successMessage}
				summary={
					queue.data?.summary ?? {
						all: 0,
						attention: 0,
						blocked: 0,
						failed: 0,
						passed: 0,
					}
				}
				total={queue.data?.total ?? 0}
				onBucketChange={updateBucket}
				onKeywordChange={updateKeyword}
				onPageChange={setPage}
				onReview={reviewNote}
			/>
		</AdminPage>
	);
}
