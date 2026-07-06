type ImageLike = {
	fileName?: null | string;
	mimeType?: null | string;
	uri: string;
};

export function isGifImage(image: ImageLike) {
	return (
		image.mimeType?.toLowerCase() === "image/gif" ||
		image.fileName?.toLowerCase().endsWith(".gif") ||
		image.uri.split("?")[0]?.toLowerCase().endsWith(".gif")
	);
}
