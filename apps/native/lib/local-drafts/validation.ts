import {
	NOTE_IMAGE_MAX_COUNT,
	NOTE_IMAGE_MAX_SIZE_BYTES,
} from "@youni/api/lib/notes/image-identity";
import type { SaveLocalDraftInput } from "@/lib/local-drafts/types";

export function validateLocalDraft(input: SaveLocalDraftInput) {
	if (
		input.title.trim().length === 0 &&
		input.content.trim().length === 0 &&
		input.images.length === 0
	) {
		throw new Error("还没有可保存的内容");
	}
	if (input.images.length > NOTE_IMAGE_MAX_COUNT) {
		throw new Error(`最多只能保存 ${NOTE_IMAGE_MAX_COUNT} 张图片`);
	}
	if (
		input.images.some(
			(image) => image.data.byteLength > NOTE_IMAGE_MAX_SIZE_BYTES,
		)
	) {
		throw new Error("单张图片不能超过 8MB");
	}
}
