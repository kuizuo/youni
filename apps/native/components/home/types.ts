export const HOME_TABS = [
	{ id: "following", label: "关注" },
	{ id: "discover", label: "发现" },
] as const;

export const DISCOVER_PAGE_SIZE = 20;

export type HomeTab = (typeof HOME_TABS)[number]["id"];

export function getHomeTabAtOffset(
	contentOffsetX: number,
	pageWidth: number,
): HomeTab {
	const index = Math.min(
		HOME_TABS.length - 1,
		Math.max(0, Math.round(contentOffsetX / Math.max(1, pageWidth))),
	);
	return HOME_TABS[index]?.id ?? "discover";
}
