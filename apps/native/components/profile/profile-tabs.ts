export const PROFILE_HERO_COLOR = "#728894";
export const PROFILE_COVER_FALLBACK_COLOR = "#c6d7df";
export const PROFILE_COVER_GRADIENT =
	"linear-gradient(135deg, #e5edf1 0%, #c6d7df 52%, #a9c0cb 100%)";
export const PROFILE_HEADER_FALLBACK_HEIGHT = 300;
export const PROFILE_TAB_BAR_HEIGHT = 50;
export const PROFILE_FEED_LIMIT = 30;
export const MAX_PROFILE_WIDTH = 576;

export const PROFILE_TABS = [
	{ key: "notes", label: "笔记", icon: null },
	{ key: "comments", label: "评论", icon: null },
	{ key: "collections", label: "收藏", icon: null },
	{ key: "liked", label: "赞过", icon: null },
] as const;

export type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];
