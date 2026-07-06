export const PROFILE_HERO_COLOR = "#728894";
export const PROFILE_HEADER_FALLBACK_HEIGHT = 300;
export const PROFILE_TAB_BAR_HEIGHT = 50;
export const PROFILE_FEED_LIMIT = 30;
export const MAX_PROFILE_WIDTH = 576;

export const PROFILE_TABS = [
	{ key: "notes", label: "笔记", icon: null },
	{ key: "collections", label: "收藏", icon: null },
	{ key: "liked", label: "赞过", icon: null },
] as const;

export type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];

export type EditableProfile = {
	bio?: null | string;
	gender?: null | string;
	handle?: null | string;
	image?: null | string;
	name?: null | string;
};

export type ProfileSessionUser = {
	email?: null | string;
	id?: null | string;
	image?: null | string;
	name?: null | string;
};
