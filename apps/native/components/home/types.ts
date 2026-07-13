export const HOME_TABS = [
	{ id: "following", label: "关注" },
	{ id: "discover", label: "发现" },
] as const;

export const DISCOVER_PAGE_SIZE = 20;

export type HomeTab = (typeof HOME_TABS)[number]["id"];
