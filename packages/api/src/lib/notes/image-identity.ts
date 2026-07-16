export const NOTE_IMAGE_MAX_COUNT = 9;
export const NOTE_IMAGE_MAX_SIZE_BYTES = 8 * 1024 * 1024;

const NOTE_IMAGE_PUBLIC_PREFIX = "/uploads/note-images/";
const NOTE_IMAGE_STORAGE_PREFIX = "note-images/";
const extensionByMimeType = new Map<string, string>([
	["image/gif", "gif"],
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
]);
const mimeTypeByExtension = new Map<string, string>([
	["gif", "image/gif"],
	["jpeg", "image/jpeg"],
	["jpg", "image/jpeg"],
	["png", "image/png"],
	["webp", "image/webp"],
]);
const storedFilePattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(gif|jpg|png|webp)$/;
const storedIdPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type NoteImageIdentity = {
	contentType: string;
	fileName: string;
	key: string;
	origin: string | null;
	userId: string | null;
};

function extensionFromName(value?: null | string) {
	return value
		?.split(/[?#]/)[0]
		?.match(/\.([a-z0-9]+)$/i)?.[1]
		?.toLowerCase();
}

function contentTypeFromFileName(fileName: string) {
	const extension = extensionFromName(fileName);
	return extension ? mimeTypeByExtension.get(extension) : undefined;
}

export function prepareNoteImageSource(source: {
	fileName?: null | string;
	fileSize?: null | number;
	mimeType?: null | string;
	uri: string;
}) {
	if (
		typeof source.fileSize === "number" &&
		source.fileSize > NOTE_IMAGE_MAX_SIZE_BYTES
	) {
		throw new Error("单张图片不能超过 8MB");
	}

	const explicitType = source.mimeType?.toLowerCase();
	const normalizedExplicitType =
		explicitType === "image/jpg" ? "image/jpeg" : explicitType;
	const sourceExtension =
		extensionFromName(source.fileName) ?? extensionFromName(source.uri);
	const contentType = normalizedExplicitType
		? extensionByMimeType.has(normalizedExplicitType)
			? normalizedExplicitType
			: null
		: sourceExtension
			? (mimeTypeByExtension.get(sourceExtension) ?? null)
			: "image/jpeg";
	if (!contentType) {
		throw new Error("图片仅支持 JPG、PNG、WebP 或 GIF");
	}

	const extension = extensionByMimeType.get(contentType);
	if (!extension) throw new Error("图片仅支持 JPG、PNG、WebP 或 GIF");

	const rawName =
		source.fileName?.trim() ||
		source.uri.split("/").pop()?.split(/[?#]/)[0] ||
		`note-image.${extension}`;
	const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-");
	const currentExtension = extensionFromName(safeName);
	const fileName =
		currentExtension === extension ||
		(extension === "jpg" && currentExtension === "jpeg")
			? safeName
			: `${currentExtension ? safeName.slice(0, -(currentExtension.length + 1)) : safeName}.${extension}`;

	return { contentType, fileName };
}

export function createNoteImageIdentity({
	baseUrl,
	fileId,
	mimeType,
	userId,
}: {
	baseUrl: string;
	fileId: string;
	mimeType: string;
	userId: string;
}) {
	if (!userId || userId.includes("/")) throw new Error("图片归属无效");
	if (!storedIdPattern.test(fileId)) throw new Error("图片标识无效");
	const prepared = prepareNoteImageSource({ mimeType, uri: fileId });
	const extension = extensionByMimeType.get(prepared.contentType);
	if (!extension) throw new Error("图片格式无效");
	const fileName = `${fileId}.${extension}`;
	const key = `${NOTE_IMAGE_STORAGE_PREFIX}${userId}/${fileName}`;

	return {
		contentType: prepared.contentType,
		fileName,
		key,
		origin: new URL(baseUrl).origin,
		url: new URL(
			`${NOTE_IMAGE_PUBLIC_PREFIX}${encodeURIComponent(userId)}/${fileName}`,
			baseUrl,
		).toString(),
		userId,
	};
}

export function parseNoteImageIdentity(
	value: string,
): NoteImageIdentity | null {
	let path = value;
	let origin: string | null = null;
	if (!value.startsWith(NOTE_IMAGE_STORAGE_PREFIX)) {
		try {
			const url = new URL(value);
			path = url.pathname;
			origin = url.origin;
		} catch {
			return null;
		}
	}

	const storagePath = path.startsWith(NOTE_IMAGE_PUBLIC_PREFIX)
		? path.slice(NOTE_IMAGE_PUBLIC_PREFIX.length)
		: path.startsWith(NOTE_IMAGE_STORAGE_PREFIX)
			? path.slice(NOTE_IMAGE_STORAGE_PREFIX.length)
			: null;
	if (!storagePath) return null;

	const parts = storagePath.split("/");
	const fileName = parts.at(-1) ?? "";
	if (!storedFilePattern.test(fileName)) return null;
	const contentType = contentTypeFromFileName(fileName);
	if (!contentType) return null;

	if (parts.length === 1) {
		return {
			contentType,
			fileName,
			key: `${NOTE_IMAGE_STORAGE_PREFIX}${fileName}`,
			origin,
			userId: null,
		};
	}
	if (parts.length !== 2 || !parts[0]) return null;

	let userId: string;
	try {
		userId = origin ? decodeURIComponent(parts[0]) : parts[0];
	} catch {
		return null;
	}
	if (!userId || userId.includes("/")) return null;

	return {
		contentType,
		fileName,
		key: `${NOTE_IMAGE_STORAGE_PREFIX}${userId}/${fileName}`,
		origin,
		userId,
	};
}

export function isOwnedNoteImage(
	value: string,
	userId: string,
	serverUrl?: string,
) {
	const identity = parseNoteImageIdentity(value);
	if (!identity || identity.userId !== userId) return false;
	if (!serverUrl) return true;

	try {
		return identity.origin === new URL(serverUrl).origin;
	} catch {
		return false;
	}
}

export function resolveStoredNoteImageUrl(
	imageUrl: string,
	apiBaseUrl: string,
) {
	const identity = parseNoteImageIdentity(imageUrl);
	if (!identity?.origin) return imageUrl;

	try {
		const image = new URL(imageUrl);
		const api = new URL(apiBaseUrl);
		image.protocol = api.protocol;
		image.host = api.host;
		return image.toString();
	} catch {
		return imageUrl;
	}
}
