import { describe, expect, test } from "bun:test";
import type { AdminHydratedContentNote } from "@youni/api/contracts/shared";
import { renderToStaticMarkup } from "react-dom/server";

import { ReviewQueue } from "./review-queue";

const reviewNote: AdminHydratedContentNote = {
	advancedOptions: {
		allowComment: true,
		allowShare: true,
		isOriginal: true,
	},
	authorEmail: "author@example.com",
	authorName: "测试用户",
	collectedCount: 0,
	commentCount: 0,
	components: [],
	content: "测试正文",
	cover: "https://example.com/image.jpg",
	createdAt: new Date("2026-07-15T00:00:00.000Z"),
	draftSavedAt: null,
	id: "note-1",
	imageMetas: [],
	images: ["https://example.com/image.jpg"],
	likedCount: 0,
	locationName: null,
	moderatedAt: new Date("2026-07-15T00:00:01.000Z"),
	moderationDetails: [
		{
			categories: ["prohibited_text"],
			confidence: 1,
			decision: "block",
			field: "title",
			reason: "text_rule",
			source: "text",
			terms: ["你妈的"],
		},
		{
			categories: [],
			confidence: 0.99,
			decision: "pass",
			image: "https://example.com/image.jpg",
			reason: "model",
			source: "image",
		},
	],
	moderationReason: "policy_violation",
	moderationStatus: "blocked",
	publishedAt: null,
	rejectionReason: "内容未通过审核",
	status: "rejected",
	title: "你妈的xxx",
	topicDetails: [],
	topics: [],
	userId: "user-1",
	visibility: "public",
};

describe("ReviewQueue", () => {
	test("shows matched prohibited terms together with image review results", () => {
		const markup = renderToStaticMarkup(
			<ReviewQueue
				bucket="blocked"
				contentErrorMessage={null}
				errorMessage={null}
				isContentLoading={false}
				isMutating={false}
				isSyncing={false}
				items={[reviewNote]}
				keyword=""
				lastSyncedAt={null}
				onBucketChange={() => {}}
				onClearKeyword={() => {}}
				onKeywordChange={() => {}}
				onKeywordSubmit={() => {}}
				onPageChange={() => {}}
				onRetry={async () => {}}
				onReview={async () => {}}
				page={0}
				successMessage={null}
				summary={{ all: 1, attention: 0, blocked: 1, failed: 0, passed: 0 }}
				syncErrorMessage={null}
				total={1}
			/>,
		);

		expect(markup).toContain("命中违禁词：你妈的");
		expect(markup).toContain("文字内容 · 标题");
		expect(markup).toContain("图片 1");
		expect(markup).toContain("安全判断 99%");
	});
});
