import type { ProfileMediaKind } from "@youni/api/contracts/profiles";
import * as ImagePicker from "expo-image-picker";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import type { ImageUploadResponse } from "@/lib/media/types";
import { appendUploadFile } from "@/lib/media/upload-form-data";
import { createProfileMediaSubmission } from "@/lib/profile-media-submission-flow";
import { client, queryClient } from "@/utils/orpc";
import { fetchWithTimeout } from "@/utils/request-timeout";

const PROFILE_IMAGE_UPLOAD_TIMEOUT_MS = 30_000;
const PROFILE_IMAGE_MIME_EXTENSIONS = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);

type ProfileImageOptions = {
	aspect: [number, number];
	endpoint: string;
	fieldName: string;
	label: string;
	maxSize: number;
	namePrefix: string;
};

function extensionFromName(value?: null | string) {
	const cleanValue = value?.split("?")[0]?.split("#")[0];
	const match = cleanValue?.match(/\.([a-z0-9]+)$/i);
	return match?.[1]?.toLowerCase();
}

function mimeTypeFromAsset(asset: ImagePicker.ImagePickerAsset, label: string) {
	const explicitType = asset.mimeType?.toLowerCase();
	if (explicitType) {
		if (PROFILE_IMAGE_MIME_EXTENSIONS.has(explicitType)) {
			return explicitType;
		}
		throw new Error(`${label}仅支持 JPG、PNG、WebP 或 GIF`);
	}

	const extension =
		extensionFromName(asset.fileName) ?? extensionFromName(asset.uri);
	const detectedType = extension
		? Array.from(PROFILE_IMAGE_MIME_EXTENSIONS.entries()).find(
				([, value]) =>
					value === extension || (extension === "jpeg" && value === "jpg"),
			)?.[0]
		: undefined;

	return detectedType ?? "image/jpeg";
}

function fileNameFromAsset(
	asset: ImagePicker.ImagePickerAsset,
	mimeType: string,
	namePrefix: string,
) {
	const extension = PROFILE_IMAGE_MIME_EXTENSIONS.get(mimeType) ?? "jpg";
	const rawName =
		asset.fileName?.trim() ||
		asset.uri.split("/").pop()?.split("?")[0]?.split("#")[0] ||
		`${namePrefix}.${extension}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");

	if (extensionFromName(safeName)) {
		return safeName;
	}

	return `${safeName}.${extension}`;
}

async function parseUploadResponse(response: Response, label: string) {
	const payload = (await response.json().catch(() => null)) as {
		key?: unknown;
		message?: unknown;
		url?: unknown;
	} | null;

	if (!response.ok) {
		throw new Error(
			typeof payload?.message === "string"
				? payload.message
				: `${label}上传失败`,
		);
	}

	if (typeof payload?.url !== "string" || typeof payload.key !== "string") {
		throw new Error(`${label}上传失败`);
	}

	return payload as ImageUploadResponse;
}

async function pickAndUploadProfileImage(options: ProfileImageOptions) {
	const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
	if (!permission.granted) {
		throw new Error(`需要允许访问相册后才能选择${options.label}`);
	}

	const result = await ImagePicker.launchImageLibraryAsync({
		allowsEditing: true,
		aspect: options.aspect,
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

	if (asset.fileSize && asset.fileSize > options.maxSize) {
		throw new Error(
			`${options.label}不能超过 ${options.maxSize / 1024 / 1024}MB`,
		);
	}

	const mimeType = mimeTypeFromAsset(asset, options.label);
	const fileName = fileNameFromAsset(asset, mimeType, options.namePrefix);
	const formData = new FormData();
	const isWeb = process.env.EXPO_OS === "web";

	appendUploadFile({
		fieldName: options.fieldName,
		fileName,
		formData,
		isWeb,
		uri: asset.uri,
		webFile: asset.file,
	});

	let headers: Headers | undefined;
	if (!isWeb) {
		const cookies = authClient.getCookie();
		if (cookies) {
			headers = new Headers();
			headers.set("Cookie", cookies);
		}
	}

	const response = await fetchWithTimeout(
		`${apiBaseUrl}${options.endpoint}`,
		{
			body: formData,
			credentials: isWeb ? "include" : "omit",
			headers,
			method: "POST",
		},
		PROFILE_IMAGE_UPLOAD_TIMEOUT_MS,
	);

	return parseUploadResponse(response, options.label);
}

const profileImageOptions: Record<ProfileMediaKind, ProfileImageOptions> = {
	avatar: {
		aspect: [1, 1],
		endpoint: "/uploads/avatar",
		fieldName: "avatar",
		label: "头像",
		maxSize: 2 * 1024 * 1024,
		namePrefix: "avatar",
	},
	cover: {
		aspect: [3, 1],
		endpoint: "/uploads/profile-cover",
		fieldName: "cover",
		label: "背景图",
		maxSize: 5 * 1024 * 1024,
		namePrefix: "profile-cover",
	},
};

async function cleanupProfileMedia(key: string) {
	const headers = new Headers({ "Content-Type": "application/json" });
	const isWeb = process.env.EXPO_OS === "web";
	if (!isWeb) {
		const cookies = authClient.getCookie();
		if (cookies) headers.set("Cookie", cookies);
	}

	const response = await fetchWithTimeout(
		`${apiBaseUrl}/uploads/profile-media/cleanup`,
		{
			body: JSON.stringify({ key }),
			credentials: isWeb ? "include" : "omit",
			headers,
			method: "POST",
		},
		PROFILE_IMAGE_UPLOAD_TIMEOUT_MS,
	);
	if (!response.ok) throw new Error("资料图片清理失败");
}

export const submitProfileMedia = createProfileMediaSubmission({
	bind: (input) => client.profiles.updateProfileMedia(input),
	cleanup: cleanupProfileMedia,
	pickAndUpload: (kind) => pickAndUploadProfileImage(profileImageOptions[kind]),
	refresh: async () => {
		authClient.$store.notify("$sessionSignal");
		await queryClient.refetchQueries();
	},
});
