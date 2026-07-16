export function resolveStoredNoteImageUrl(
	imageUrl: string,
	apiBaseUrl: string,
) {
	try {
		const image = new URL(imageUrl);
		if (!image.pathname.startsWith("/uploads/note-images/")) return imageUrl;

		const api = new URL(apiBaseUrl);
		image.protocol = api.protocol;
		image.host = api.host;
		return image.toString();
	} catch {
		return imageUrl;
	}
}
