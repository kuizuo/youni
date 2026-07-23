import { expect, test } from "@jest/globals";
import { createFormSchema } from "../create-types";

test("rejects publishing without an image, title, and content", () => {
	const result = createFormSchema.safeParse({
		advancedOptions: { allowComment: true, allowShare: true },
		content: "",
		images: [],
		title: "",
		topics: [],
		visibility: "public",
	});

	expect(result.success).toBe(false);
	if (result.success) return;
	expect(result.error.issues.map((issue) => issue.path[0])).toEqual([
		"title",
		"content",
		"images",
	]);
});
