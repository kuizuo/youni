import type * as MediaLibrary from "expo-media-library";

export type PhotoPermissionMode = "all" | "denied" | "limited" | "undetermined";

export function getPhotoPermissionMode(
	permission: MediaLibrary.PermissionResponse | null,
): PhotoPermissionMode {
	if (!permission || permission.status === "undetermined")
		return "undetermined";
	if (!permission.granted || permission.accessPrivileges === "none") {
		return "denied";
	}
	return permission.accessPrivileges === "limited" ? "limited" : "all";
}

export function toggleSelection(
	selectedIds: string[],
	id: string,
	limit: number,
) {
	if (selectedIds.includes(id)) {
		return selectedIds.filter((selectedId) => selectedId !== id);
	}
	if (selectedIds.length >= limit) return selectedIds;
	return [...selectedIds, id];
}

export function insertAddMoreItem<T>(
	items: T[],
	addMoreItem: T,
	showAddMore: boolean,
) {
	if (!showAddMore) return items;
	const index = Math.min(3, items.length);
	return [...items.slice(0, index), addMoreItem, ...items.slice(index)];
}

export function imageMimeType(fileName: string | null | undefined) {
	const extension = fileName?.split(".").pop()?.toLowerCase();
	switch (extension) {
		case "gif":
			return "image/gif";
		case "heic":
		case "heif":
			return "image/heic";
		case "png":
			return "image/png";
		case "webp":
			return "image/webp";
		default:
			return "image/jpeg";
	}
}
