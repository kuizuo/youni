import type * as ImagePicker from "expo-image-picker";

export type ImageUploadResponse = {
	key: string;
	url: string;
};

export type MediaFileAsset = {
	file?: ImagePicker.ImagePickerAsset["file"];
	fileName?: null | string;
	fileSize?: null | number;
	mimeType?: null | string;
	uri: string;
};

export type MediaImage = {
	asset?: MediaFileAsset;
	fileName?: null | string;
	fileSize?: null | number;
	height?: number;
	id: string;
	isEdited?: boolean;
	mimeType?: null | string;
	originalUri?: string;
	remoteUrl?: string;
	uri: string;
	width?: number;
};
