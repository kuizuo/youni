import {
	NOTE_IMAGE_MAX_COUNT,
	prepareNoteImageSource,
} from "@youni/api/lib/notes/image-identity";
import type * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import type { ImageUploadResponse } from "@/lib/media/types";
import { appendUploadFile } from "@/lib/media/upload-form-data";
import { fetchWithTimeout } from "@/utils/request-timeout";

const NOTE_IMAGE_UPLOAD_TIMEOUT_MS = 60_000;

export type NoteImageUploadAsset = {
	file?: ImagePicker.ImagePickerAsset["file"];
	fileName?: null | string;
	fileSize?: null | number;
	mimeType?: null | string;
	uri: string;
};

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
		(item): item is ImageUploadResponse =>
			typeof item === "object" &&
			item !== null &&
			typeof (item as ImageUploadResponse).key === "string" &&
			typeof (item as ImageUploadResponse).url === "string",
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
	if (assets.length > NOTE_IMAGE_MAX_COUNT) {
		throw new Error(`最多只能上传 ${NOTE_IMAGE_MAX_COUNT} 张图片`);
	}

	const formData = new FormData();

	for (const [index, asset] of assets.entries()) {
		const { fileName } = prepareNoteImageSource({
			fileName: asset.fileName,
			fileSize: asset.fileSize,
			mimeType: asset.mimeType,
			uri: asset.uri,
		});

		appendUploadFile({
			fieldName: `image${index}`,
			fileName,
			formData,
			isWeb: Platform.OS === "web",
			uri: asset.uri,
			webFile: asset.file,
		});
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
