export function shouldReplaceProfileDraft({
	hasUnsavedChanges,
	loadedUserId,
	nextUserId,
}: {
	hasUnsavedChanges: boolean;
	loadedUserId?: string;
	nextUserId?: string;
}) {
	return !hasUnsavedChanges || loadedUserId !== nextUserId;
}
