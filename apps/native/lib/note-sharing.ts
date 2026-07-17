export const PUBLIC_NOTE_BASE_URL = "https://youni.kuizuo.me/note";

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
	"gif",
	"heic",
	"heif",
	"jpeg",
	"jpg",
	"png",
	"webp",
]);

export function getPublicNoteUrl(noteId: string) {
	return `${PUBLIC_NOTE_BASE_URL}/${noteId}`;
}

export function formatNoteShareDate(value: Date | string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (part: number) => String(part).padStart(2, "0");
	return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
		date.getDate(),
	)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function getDownloadedImageFileName({
	batchId,
	index,
	noteId,
	url,
}: {
	batchId: number;
	index: number;
	noteId: string;
	url: string;
}) {
	let extension = "jpg";
	try {
		const match = new URL(url).pathname.match(/\.([a-zA-Z0-9]+)$/);
		const candidate = match?.[1]?.toLowerCase();
		if (candidate && SUPPORTED_IMAGE_EXTENSIONS.has(candidate)) {
			extension = candidate;
		}
	} catch {
		// Keep the broadly supported JPEG extension for malformed remote URLs.
	}

	return `youni-note-${noteId}-${batchId}-${index + 1}.${extension}`;
}

export function getSavedImagesFeedback(savedCount: number, totalCount: number) {
	if (savedCount === totalCount && totalCount > 0) {
		return {
			label: `已保存 ${savedCount} 张图片`,
			variant: "success" as const,
		};
	}
	if (savedCount === 0) {
		return {
			label: "图片保存失败，请重试",
			variant: "danger" as const,
		};
	}
	return {
		label: `已保存 ${savedCount} 张，${totalCount - savedCount} 张失败`,
		variant: "warning" as const,
	};
}
