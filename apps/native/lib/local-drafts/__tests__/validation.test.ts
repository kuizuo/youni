import { describe, expect, test } from "@jest/globals";
import {
	NOTE_IMAGE_MAX_COUNT,
	NOTE_IMAGE_MAX_SIZE_BYTES,
} from "@youni/api/lib/notes/image-identity";
import type { SaveLocalDraftInput } from "../types";
import { validateLocalDraft } from "../validation";

function draft(
	overrides: Partial<SaveLocalDraftInput> = {},
): SaveLocalDraftInput {
	return {
		advancedOptions: { allowComment: true, allowShare: true },
		content: "草稿正文",
		images: [],
		title: "",
		topics: [],
		userId: "user-1",
		visibility: "public",
		...overrides,
	};
}

function image(index: number, byteLength = 0) {
	return {
		data: { byteLength } as unknown as Uint8Array,
		fileName: `image-${index}.jpg`,
		id: `image-${index}`,
		mimeType: "image/jpeg",
	};
}

describe("local draft validation", () => {
	test("rejects an empty draft", () => {
		expect(() =>
			validateLocalDraft(draft({ content: " ", images: [], title: " " })),
		).toThrow("还没有可保存的内容");
	});

	test("protects image count and size limits", () => {
		expect(() =>
			validateLocalDraft(
				draft({
					images: Array.from({ length: NOTE_IMAGE_MAX_COUNT + 1 }, (_, index) =>
						image(index),
					),
				}),
			),
		).toThrow(`最多只能保存 ${NOTE_IMAGE_MAX_COUNT} 张图片`);
		expect(() =>
			validateLocalDraft(
				draft({
					images: [image(0, NOTE_IMAGE_MAX_SIZE_BYTES + 1)],
				}),
			),
		).toThrow("单张图片不能超过 8MB");
	});
});
