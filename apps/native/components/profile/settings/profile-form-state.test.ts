import { expect, test } from "bun:test";

import { shouldReplaceProfileDraft } from "./profile-form-state";

test("keeps an edited draft during refresh but resets it for another user", () => {
	expect(
		shouldReplaceProfileDraft({
			hasUnsavedChanges: true,
			loadedUserId: "user-1",
			nextUserId: "user-1",
		}),
	).toBe(false);
	expect(
		shouldReplaceProfileDraft({
			hasUnsavedChanges: true,
			loadedUserId: "user-1",
			nextUserId: "user-2",
		}),
	).toBe(true);
});
