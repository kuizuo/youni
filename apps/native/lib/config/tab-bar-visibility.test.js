import { expect, test } from "bun:test";

import { shouldShowTabBar } from "./tab-bar-visibility";

test.each([
	["/", true],
	["/search", true],
	["/messages", true],
	["/me", true],
	["/create", false],
	["/drafts", false],
	["/note/example", false],
])("tab bar visibility for %s", (pathname, expected) => {
	expect(shouldShowTabBar(pathname)).toBe(expected);
});
