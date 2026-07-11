import type { SaveLocalDraftInput } from "@/lib/local-drafts/types";

export const MAX_DRAFT_IMAGE_COUNT = 9;
export const MAX_DRAFT_IMAGE_SIZE = 8 * 1024 * 1024;

export function validateLocalDraft(input: SaveLocalDraftInput) {
	if (
		input.title.trim().length === 0 &&
		input.content.trim().length === 0 &&
		input.images.length === 0
	) {
		throw new Error("还没有可保存的内容");
	}
	if (input.images.length > MAX_DRAFT_IMAGE_COUNT) {
		throw new Error(`最多只能保存 ${MAX_DRAFT_IMAGE_COUNT} 张图片`);
	}
	if (
		input.images.some((image) => image.data.byteLength > MAX_DRAFT_IMAGE_SIZE)
	) {
		throw new Error("单张图片不能超过 8MB");
	}
}
