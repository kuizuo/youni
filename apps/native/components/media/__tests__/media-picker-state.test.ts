import { describe, expect, test } from "@jest/globals";
import type * as MediaLibrary from "expo-media-library";

import { getPhotoPermissionMode, toggleSelection } from "../media-picker-state";

function permission(
	granted: boolean,
	accessPrivileges: "all" | "limited" | "none",
) {
	return {
		accessPrivileges,
		granted,
		status: granted ? "granted" : "denied",
	} as MediaLibrary.PermissionResponse;
}

describe("media picker", () => {
	test("distinguishes full, limited, and denied photo access", () => {
		expect(getPhotoPermissionMode(permission(true, "all"))).toBe("all");
		expect(getPhotoPermissionMode(permission(true, "limited"))).toBe("limited");
		expect(getPhotoPermissionMode(permission(false, "none"))).toBe("denied");
		expect(getPhotoPermissionMode(null)).toBe("undetermined");
	});

	test("enforces the selection limit while allowing removal", () => {
		expect(toggleSelection(["a", "b"], "c", 2)).toEqual(["a", "b"]);
		expect(toggleSelection(["a", "b"], "a", 2)).toEqual(["b"]);
		expect(toggleSelection(["a"], "b", 2)).toEqual(["a", "b"]);
	});
});
