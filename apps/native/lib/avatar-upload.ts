import * as ImagePicker from "expo-image-picker";

import { apiBaseUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import { fetchWithTimeout } from "@/utils/request-timeout";

const PROFILE_IMAGE_UPLOAD_TIMEOUT_MS = 30_000;
const PROFILE_IMAGE_MIME_EXTENSIONS = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);

type ProfileImageUploadResponse = {
	key: string;
	url: string;
};

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

	return payload as ProfileImageUploadResponse;
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

	if (isWeb && asset.file) {
		formData.append(options.fieldName, asset.file, fileName);
	} else {
		formData.append(options.fieldName, {
			name: fileName,
			type: mimeType,
			uri: asset.uri,
		} as unknown as Blob);
	}

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

export function pickAndUploadAvatar() {
	return pickAndUploadProfileImage({
		aspect: [1, 1],
		endpoint: "/uploads/avatar",
		fieldName: "avatar",
		label: "头像",
		maxSize: 2 * 1024 * 1024,
		namePrefix: "avatar",
	});
}

export function pickAndUploadProfileCover() {
	return pickAndUploadProfileImage({
		aspect: [3, 1],
		endpoint: "/uploads/profile-cover",
		fieldName: "cover",
		label: "背景图",
		maxSize: 5 * 1024 * 1024,
		namePrefix: "profile-cover",
	});
}
