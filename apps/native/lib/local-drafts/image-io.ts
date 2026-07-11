import { fromByteArray, toByteArray } from "base64-js";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import type {
	LocalDraftImage,
	LocalDraftImageInput,
} from "@/lib/local-drafts/types";
import type { MediaImage } from "@/lib/media/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const THUMBNAIL_WIDTH = 480;
const MATERIALIZED_DIRECTORY = `${FileSystem.cacheDirectory ?? ""}local-draft-images/`;

const MIME_EXTENSIONS = new Map([
	["image/gif", "gif"],
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
]);

function extensionFromName(value?: null | string) {
	return value
		?.split(/[?#]/)[0]
		?.match(/\.([a-z0-9]+)$/i)?.[1]
		?.toLowerCase();
}

function mimeTypeForImage(image: MediaImage) {
	if (image.mimeType && MIME_EXTENSIONS.has(image.mimeType.toLowerCase())) {
		return image.mimeType.toLowerCase();
	}
	const extension =
		extensionFromName(image.fileName) ?? extensionFromName(image.uri);
	if (extension === "gif") return "image/gif";
	if (extension === "png") return "image/png";
	if (extension === "webp") return "image/webp";
	return "image/jpeg";
}

function fileNameForImage(image: MediaImage, mimeType: string) {
	const extension = MIME_EXTENSIONS.get(mimeType) ?? "jpg";
	const rawName = image.fileName?.trim() || `draft-image.${extension}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");
	return extensionFromName(safeName) ? safeName : `${safeName}.${extension}`;
}

async function bytesFromUri(uri: string) {
	if (
		Platform.OS === "web" ||
		uri.startsWith("blob:") ||
		uri.startsWith("data:")
	) {
		const response = await fetch(uri);
		if (!response.ok) throw new Error("图片读取失败");
		return new Uint8Array(await response.arrayBuffer());
	}
	const base64 = await FileSystem.readAsStringAsync(uri, {
		encoding: FileSystem.EncodingType.Base64,
	});
	return toByteArray(base64);
}

async function imageData(image: MediaImage) {
	if (Platform.OS === "web" && image.asset?.file) {
		return new Uint8Array(await image.asset.file.arrayBuffer());
	}
	return bytesFromUri(image.uri);
}

export async function serializeComposerImages(images: MediaImage[]) {
	if (images.length > 9) throw new Error("最多只能选择 9 张图片");
	const serialized: LocalDraftImageInput[] = [];
	for (const image of images) {
		const data = await imageData(image);
		if (data.byteLength > MAX_IMAGE_BYTES) {
			throw new Error("单张图片不能超过 8MB");
		}
		const mimeType = mimeTypeForImage(image);
		serialized.push({
			data,
			fileName: fileNameForImage(image, mimeType),
			height: image.height,
			id: image.id,
			mimeType,
			width: image.width,
		});
	}

	return serialized;
}

export async function createDraftCoverThumbnail(image?: MediaImage) {
	if (!image) return null;
	try {
		const result = await manipulateAsync(
			image.uri,
			image.width && image.width <= THUMBNAIL_WIDTH
				? []
				: [{ resize: { width: THUMBNAIL_WIDTH } }],
			{ compress: 0.72, format: SaveFormat.JPEG },
		);
		return {
			aspectRatio:
				result.width > 0 && result.height > 0
					? result.width / result.height
					: 1,
			data: await bytesFromUri(result.uri),
			mimeType: "image/jpeg",
		};
	} catch {
		return null;
	}
}

async function ensureMaterializedDirectory() {
	if (!FileSystem.cacheDirectory) throw new Error("本地图片目录不可用");
	const info = await FileSystem.getInfoAsync(MATERIALIZED_DIRECTORY);
	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(MATERIALIZED_DIRECTORY, {
			intermediates: true,
		});
	}
}

export async function materializeLocalDraftImage(
	draftId: string,
	image: LocalDraftImage,
): Promise<MediaImage> {
	if (Platform.OS === "web") {
		const blob = new Blob([image.data as BlobPart], { type: image.mimeType });
		const file = new File([blob], image.fileName, { type: image.mimeType });
		const uri = URL.createObjectURL(blob);
		return {
			asset: {
				file,
				fileName: image.fileName,
				fileSize: image.data.byteLength,
				mimeType: image.mimeType,
				uri,
			},
			fileName: image.fileName,
			fileSize: image.data.byteLength,
			height: image.height,
			id: image.id,
			mimeType: image.mimeType,
			originalUri: uri,
			uri,
			width: image.width,
		};
	}

	await ensureMaterializedDirectory();
	const extension = MIME_EXTENSIONS.get(image.mimeType) ?? "jpg";
	const safeDraftId = draftId.replace(/[^a-zA-Z0-9_-]/g, "-");
	const uri = `${MATERIALIZED_DIRECTORY}${safeDraftId}-${image.position}.${extension}`;
	await FileSystem.writeAsStringAsync(uri, fromByteArray(image.data), {
		encoding: FileSystem.EncodingType.Base64,
	});
	return {
		asset: {
			fileName: image.fileName,
			fileSize: image.data.byteLength,
			mimeType: image.mimeType,
			uri,
		},
		fileName: image.fileName,
		fileSize: image.data.byteLength,
		height: image.height,
		id: image.id,
		mimeType: image.mimeType,
		originalUri: uri,
		uri,
		width: image.width,
	};
}

export async function releaseMaterializedDraftImages(uris: string[]) {
	await Promise.all(
		uris.map(async (uri) => {
			if (uri.startsWith("blob:")) {
				URL.revokeObjectURL(uri);
				return;
			}
			if (uri.startsWith(MATERIALIZED_DIRECTORY)) {
				await FileSystem.deleteAsync(uri, { idempotent: true });
			}
		}),
	);
}

export function localDraftCoverUri(data: Uint8Array, mimeType: string) {
	return `data:${mimeType};base64,${fromByteArray(data)}`;
}
