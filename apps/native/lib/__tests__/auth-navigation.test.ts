import { describe, expect, test } from "@jest/globals";

import { getLoginHref, sanitizeAuthRedirect } from "../auth-navigation";

describe("login navigation", () => {
	test("keeps valid in-app destinations", () => {
		expect(sanitizeAuthRedirect("/note/note-1")).toBe("/note/note-1");
		expect(sanitizeAuthRedirect(["/settings", "/"])).toBe("/settings");
	});

	test("blocks external and recursive login destinations", () => {
		for (const destination of [
			undefined,
			"https://example.com",
			"//example.com",
			"/login",
		]) {
			expect(sanitizeAuthRedirect(destination)).toBe("/");
		}
		expect(getLoginHref("//example.com")).toEqual({
			pathname: "/login",
			params: { redirectTo: "/" },
		});
	});
});
