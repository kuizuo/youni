import {
	NOTE_IMAGE_MAX_COUNT,
	prepareNoteImageSource,
} from "@youni/api/lib/notes/image-identity";
import { fromByteArray, toByteArray } from "base64-js";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import type {
	LocalDraftImage,
	LocalDraftImageInput,
} from "@/lib/local-drafts/types";
import type { MediaImage } from "@/lib/media/types";

const THUMBNAIL_WIDTH = 480;
const MATERIALIZED_DIRECTORY = `${FileSystem.cacheDirectory ?? ""}local-draft-images/`;

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
	if (images.length > NOTE_IMAGE_MAX_COUNT) {
		throw new Error(`最多只能选择 ${NOTE_IMAGE_MAX_COUNT} 张图片`);
	}
	const serialized: LocalDraftImageInput[] = [];
	for (const image of images) {
		const data = await imageData(image);
		const { contentType, fileName } = prepareNoteImageSource({
			fileName: image.fileName,
			fileSize: data.byteLength,
			mimeType: image.mimeType,
			uri: image.uri,
		});
		serialized.push({
			data,
			fileName,
			height: image.height,
			id: image.id,
			mimeType: contentType,
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
	const prepared = prepareNoteImageSource({
		fileName: image.fileName,
		mimeType: image.mimeType,
		uri: image.fileName,
	});
	const extension = prepared.fileName.split(".").pop() ?? "jpg";
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
