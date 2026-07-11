import { describe, expect, test } from "bun:test";

import {
	MAX_DRAFT_IMAGE_COUNT,
	MAX_DRAFT_IMAGE_SIZE,
	validateLocalDraft,
} from "./validation";

const draft = (images = [], overrides = {}) => ({
	advancedOptions: { allowComment: true, allowShare: true },
	content: "正文",
	images,
	title: "标题",
	topics: [],
	userId: "user-a",
	visibility: "public",
	...overrides,
});
const image = (size = 1) => ({
	data: new Uint8Array(size),
	fileName: "image.jpg",
	id: crypto.randomUUID(),
	mimeType: "image/jpeg",
});

describe("validateLocalDraft", () => {
	test("拒绝完全空白的草稿", () => {
		expect(() =>
			validateLocalDraft(draft([], { content: " ", title: " " })),
		).toThrow("还没有可保存的内容");
	});

	test("允许九张图片，拒绝第十张", () => {
		expect(() =>
			validateLocalDraft(
				draft(Array.from({ length: MAX_DRAFT_IMAGE_COUNT }, () => image())),
			),
		).not.toThrow();
		expect(() =>
			validateLocalDraft(
				draft(Array.from({ length: MAX_DRAFT_IMAGE_COUNT + 1 }, () => image())),
			),
		).toThrow("最多只能保存 9 张图片");
	});

	test("允许 8MB 图片，拒绝超过 8MB 的图片", () => {
		expect(() =>
			validateLocalDraft(draft([image(MAX_DRAFT_IMAGE_SIZE)])),
		).not.toThrow();
		expect(() =>
			validateLocalDraft(draft([image(MAX_DRAFT_IMAGE_SIZE + 1)])),
		).toThrow("单张图片不能超过 8MB");
	});
});
