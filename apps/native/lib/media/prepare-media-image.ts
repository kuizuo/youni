import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

import type { MediaImage } from "./types";

function isGifAsset(asset: ImagePicker.ImagePickerAsset) {
	const mimeType = asset.mimeType?.toLowerCase();
	if (mimeType === "image/gif") return true;
	return asset.uri.split("?")[0]?.toLowerCase().endsWith(".gif") ?? false;
}

function imageFileName(asset: ImagePicker.ImagePickerAsset, extension: string) {
	const rawName =
		asset.fileName?.split(".").slice(0, -1).join(".") ||
		asset.assetId ||
		`media-image-${Date.now()}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");
	return `${safeName}.${extension}`;
}

export async function prepareMediaImage(
	asset: ImagePicker.ImagePickerAsset,
): Promise<MediaImage> {
	if (Platform.OS === "web" || isGifAsset(asset)) {
		return {
			asset,
			fileName: asset.fileName,
			fileSize: asset.fileSize,
			height: asset.height,
			id: `${asset.assetId ?? asset.uri}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
			mimeType: asset.mimeType,
			originalUri: asset.uri,
			uri: asset.uri,
			width: asset.width,
		};
	}

	const converted = await manipulateAsync(asset.uri, [], {
		compress: 0.92,
		format: SaveFormat.JPEG,
	});
	const info = await FileSystem.getInfoAsync(converted.uri);
	const fileSize =
		info.exists && !info.isDirectory ? info.size : asset.fileSize;
	const fileName = imageFileName(asset, "jpg");

	return {
		asset: {
			fileName,
			fileSize,
			mimeType: "image/jpeg",
			uri: converted.uri,
		},
		fileName,
		fileSize,
		height: converted.height,
		id: `${asset.assetId ?? asset.uri}-${converted.uri}`,
		mimeType: "image/jpeg",
		originalUri: asset.uri,
		uri: converted.uri,
		width: converted.width,
	};
}
