import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import type { ContentModerationDetail } from "@youni/db/schema/content";
import type { ContentModerationReason } from "@youni/db/schema/content-values";
import { note } from "@youni/db/schema/index";
import { and, eq, inArray } from "drizzle-orm";
import { manualReviewModerationStatuses } from "../../contracts/shared";

type ContentReviewTarget = {
	contentId: string;
	images: string[];
	userId: string;
};

type ContentReviewTransition =
	| { type: "claimed" }
	| {
			decision: "block" | "pass" | "review";
			moderationDetails: ContentModerationDetail[];
			moderationReason: ContentModerationReason | null;
			rejectionReason: string | null;
			type: "automated";
	  }
	| { reason: "queue_unavailable"; type: "failed" }
	| { reason: "result_write_failed"; type: "failed" };

export function deriveContentModerationStatus(
	decision: "block" | "pass" | "review",
	reason: ContentModerationReason | null,
) {
	if (decision === "pass") return "passed" as const;
	if (decision === "block") return "blocked" as const;
	return reason === "low_confidence"
		? ("needs_review" as const)
		: ("failed" as const);
}

export function contentReviewSubmissionState() {
	return {
		draftSavedAt: null,
		moderatedAt: null,
		moderationDetails: [],
		moderationReason: null,
		moderationStatus: "pending" as const,
		publishedAt: null,
		rejectionReason: null,
		status: "audit" as const,
	};
}

export function contentReviewTransitionState(
	transition: ContentReviewTransition,
	now = new Date(),
) {
	if (transition.type === "claimed") {
		return {
			moderationReason: null,
			moderationStatus: "processing" as const,
		};
	}

	if (transition.type === "failed") {
		return {
			moderatedAt: now,
			...(transition.reason === "result_write_failed"
				? { moderationDetails: [] }
				: {}),
			moderationReason: transition.reason,
			moderationStatus: "failed" as const,
		};
	}

	return {
		moderatedAt: now,
		moderationDetails: transition.moderationDetails,
		moderationReason: transition.moderationReason,
		moderationStatus: deriveContentModerationStatus(
			transition.decision,
			transition.moderationReason,
		),
		...(transition.decision === "review"
			? {}
			: {
					publishedAt: transition.decision === "pass" ? now : null,
					rejectionReason: transition.rejectionReason,
					status:
						transition.decision === "pass"
							? ("published" as const)
							: ("rejected" as const),
				}),
	};
}

export function contentReviewTransitionGuard(
	transition: ContentReviewTransition,
) {
	return {
		moderationStatus:
			transition.type === "claimed" ||
			(transition.type === "failed" &&
				transition.reason === "queue_unavailable")
				? ("pending" as const)
				: ("processing" as const),
		status: "audit" as const,
	};
}

export async function transitionContentReview({
	target,
	transition,
}: {
	target: ContentReviewTarget;
	transition: ContentReviewTransition;
}) {
	const guard = contentReviewTransitionGuard(transition);
	const [updated] = await createDb()
		.update(note)
		.set(contentReviewTransitionState(transition))
		.where(
			and(
				eq(note.id, target.contentId),
				eq(note.userId, target.userId),
				eq(note.status, guard.status),
				eq(note.moderationStatus, guard.moderationStatus),
				eq(note.images, target.images),
			),
		)
		.returning({ id: note.id });

	return Boolean(updated);
}

export async function reviewContentNote(
	input:
		| {
				decision: "approve";
				expectedUpdatedAt: string;
				id: string;
		  }
		| {
				decision: "reject";
				expectedUpdatedAt: string;
				id: string;
				rejectionReason: string;
		  },
) {
	const approved = input.decision === "approve";
	const [updated] = await createDb()
		.update(note)
		.set({
			publishedAt: approved ? new Date() : null,
			rejectionReason: approved ? null : input.rejectionReason,
			status: approved ? "published" : "rejected",
		})
		.where(
			and(
				eq(note.id, input.id),
				eq(note.status, "audit"),
				eq(note.updatedAt, new Date(input.expectedUpdatedAt)),
				inArray(note.moderationStatus, [...manualReviewModerationStatuses]),
			),
		)
		.returning();

	if (!updated) {
		throw new ORPCError("CONFLICT", {
			message: "内容状态已变化，请刷新后重试",
		});
	}

	return updated;
}
