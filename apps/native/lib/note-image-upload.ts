import type * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import { fetchWithTimeout } from "@/utils/request-timeout";

const NOTE_IMAGE_UPLOAD_TIMEOUT_MS = 60_000;
const MAX_NOTE_IMAGE_SIZE = 8 * 1024 * 1024;
const NOTE_IMAGE_MIME_EXTENSIONS = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);

export type NoteImageUploadResponse = {
	key: string;
	url: string;
};
export type NoteImageUploadAsset = {
	file?: ImagePicker.ImagePickerAsset["file"];
	fileName?: null | string;
	fileSize?: null | number;
	mimeType?: null | string;
	uri: string;
};

function extensionFromName(value?: null | string) {
	const cleanValue = value?.split("?")[0]?.split("#")[0];
	const match = cleanValue?.match(/\.([a-z0-9]+)$/i);
	return match?.[1]?.toLowerCase();
}

function mimeTypeFromAsset(asset: NoteImageUploadAsset) {
	const explicitType = asset.mimeType?.toLowerCase();
	if (explicitType) {
		if (NOTE_IMAGE_MIME_EXTENSIONS.has(explicitType)) {
			return explicitType;
		}
		throw new Error("图片仅支持 JPG、PNG、WebP 或 GIF");
	}

	const extension =
		extensionFromName(asset.fileName) ?? extensionFromName(asset.uri);
	const detectedType = extension
		? Array.from(NOTE_IMAGE_MIME_EXTENSIONS.entries()).find(
				([, value]) =>
					value === extension || (extension === "jpeg" && value === "jpg"),
			)?.[0]
		: undefined;

	return detectedType ?? "image/jpeg";
}

function fileNameFromAsset(asset: NoteImageUploadAsset, mimeType: string) {
	const extension = NOTE_IMAGE_MIME_EXTENSIONS.get(mimeType) ?? "jpg";
	const rawName =
		asset.fileName?.trim() ||
		asset.uri.split("/").pop()?.split("?")[0]?.split("#")[0] ||
		`note-image.${extension}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");

	if (extensionFromName(safeName)) {
		return safeName;
	}

	return `${safeName}.${extension}`;
}

async function parseUploadResponse(response: Response) {
	const payload = (await response.json().catch(() => null)) as {
		items?: unknown;
		message?: unknown;
	} | null;

	if (!response.ok) {
		throw new Error(
			typeof payload?.message === "string" ? payload.message : "图片上传失败",
		);
	}

	if (!Array.isArray(payload?.items)) {
		throw new Error("图片上传失败");
	}

	const items = payload.items.filter(
		(item): item is NoteImageUploadResponse =>
			typeof item === "object" &&
			item !== null &&
			typeof (item as NoteImageUploadResponse).key === "string" &&
			typeof (item as NoteImageUploadResponse).url === "string",
	);

	if (items.length !== payload.items.length) {
		throw new Error("图片上传失败");
	}

	return items;
}

export async function uploadNoteImages(assets: NoteImageUploadAsset[]) {
	if (assets.length === 0) {
		return [];
	}

	const formData = new FormData();

	for (const [index, asset] of assets.entries()) {
		if (asset.fileSize && asset.fileSize > MAX_NOTE_IMAGE_SIZE) {
			throw new Error("单张图片不能超过 8MB");
		}

		const mimeType = mimeTypeFromAsset(asset);
		const fileName = fileNameFromAsset(asset, mimeType);

		if (Platform.OS === "web" && asset.file) {
			formData.append(`image${index}`, asset.file, fileName);
		} else {
			formData.append(`image${index}`, {
				name: fileName,
				type: mimeType,
				uri: asset.uri,
			} as unknown as Blob);
		}
	}

	let headers: Headers | undefined;
	if (Platform.OS !== "web") {
		const cookies = authClient.getCookie();
		if (cookies) {
			headers = new Headers();
			headers.set("Cookie", cookies);
		}
	}

	const response = await fetchWithTimeout(
		`${apiBaseUrl}/uploads/note-images`,
		{
			body: formData,
			credentials: Platform.OS === "web" ? "include" : "omit",
			headers,
			method: "POST",
		},
		NOTE_IMAGE_UPLOAD_TIMEOUT_MS,
	);

	return parseUploadResponse(response);
}

export async function deleteUploadedNoteImages(keys: string[]) {
	if (keys.length === 0) return;

	const headers = new Headers({ "Content-Type": "application/json" });
	if (Platform.OS !== "web") {
		const cookies = authClient.getCookie();
		if (cookies) headers.set("Cookie", cookies);
	}

	const response = await fetchWithTimeout(
		`${apiBaseUrl}/uploads/note-images/cleanup`,
		{
			body: JSON.stringify({ keys }),
			credentials: Platform.OS === "web" ? "include" : "omit",
			headers,
			method: "POST",
		},
		NOTE_IMAGE_UPLOAD_TIMEOUT_MS,
	);
	if (!response.ok) {
		throw new Error("未发布图片清理失败");
	}
}
