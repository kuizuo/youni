import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import { fetchWithTimeout } from "@/utils/request-timeout";

const AVATAR_UPLOAD_TIMEOUT_MS = 30_000;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const AVATAR_MIME_EXTENSIONS = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);

type AvatarUploadResponse = {
	key: string;
	url: string;
};

function extensionFromName(value?: null | string) {
	const cleanValue = value?.split("?")[0]?.split("#")[0];
	const match = cleanValue?.match(/\.([a-z0-9]+)$/i);
	return match?.[1]?.toLowerCase();
}

function mimeTypeFromAsset(asset: ImagePicker.ImagePickerAsset) {
	const explicitType = asset.mimeType?.toLowerCase();
	if (explicitType) {
		if (AVATAR_MIME_EXTENSIONS.has(explicitType)) {
			return explicitType;
		}
		throw new Error("头像仅支持 JPG、PNG、WebP 或 GIF");
	}

	const extension =
		extensionFromName(asset.fileName) ?? extensionFromName(asset.uri);
	const detectedType = extension
		? Array.from(AVATAR_MIME_EXTENSIONS.entries()).find(
				([, value]) =>
					value === extension || (extension === "jpeg" && value === "jpg"),
			)?.[0]
		: undefined;

	return detectedType ?? "image/jpeg";
}

function fileNameFromAsset(
	asset: ImagePicker.ImagePickerAsset,
	mimeType: string,
) {
	const extension = AVATAR_MIME_EXTENSIONS.get(mimeType) ?? "jpg";
	const rawName =
		asset.fileName?.trim() ||
		asset.uri.split("/").pop()?.split("?")[0]?.split("#")[0] ||
		`avatar.${extension}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");

	if (extensionFromName(safeName)) {
		return safeName;
	}

	return `${safeName}.${extension}`;
}

async function parseUploadResponse(response: Response) {
	const payload = (await response.json().catch(() => null)) as {
		key?: unknown;
		message?: unknown;
		url?: unknown;
	} | null;

	if (!response.ok) {
		throw new Error(
			typeof payload?.message === "string" ? payload.message : "头像上传失败",
		);
	}

	if (typeof payload?.url !== "string" || typeof payload.key !== "string") {
		throw new Error("头像上传失败");
	}

	return payload as AvatarUploadResponse;
}

export async function pickAndUploadAvatar() {
	const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
	if (!permission.granted) {
		throw new Error("需要允许访问相册后才能选择头像");
	}

	const result = await ImagePicker.launchImageLibraryAsync({
		allowsEditing: true,
		aspect: [1, 1],
		mediaTypes: "images",
		quality: 0.85,
	});

	if (result.canceled) {
		return null;
	}

	const asset = result.assets[0];
	if (!asset) {
		return null;
	}

	if (asset.fileSize && asset.fileSize > MAX_AVATAR_SIZE) {
		throw new Error("头像不能超过 2MB");
	}

	const mimeType = mimeTypeFromAsset(asset);
	const fileName = fileNameFromAsset(asset, mimeType);
	const formData = new FormData();

	if (Platform.OS === "web" && asset.file) {
		formData.append("avatar", asset.file, fileName);
	} else {
		formData.append("avatar", {
			name: fileName,
			type: mimeType,
			uri: asset.uri,
		} as unknown as Blob);
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
		`${apiBaseUrl}/uploads/avatar`,
		{
			body: formData,
			credentials: Platform.OS === "web" ? "include" : "omit",
			headers,
			method: "POST",
		},
		AVATAR_UPLOAD_TIMEOUT_MS,
	);

	return parseUploadResponse(response);
}
