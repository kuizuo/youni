import { describe, expect, test } from "bun:test";

import { noteCreateInput } from "./notes";

const publishInput = {
	content: "正文",
	publishAttemptId: "publish_image_required_1",
	title: "标题",
};

describe("noteCreateInput", () => {
	test("requires at least one image to publish a note", () => {
		expect(noteCreateInput.safeParse(publishInput).success).toBe(false);
		expect(
			noteCreateInput.safeParse({ ...publishInput, images: [] }).success,
		).toBe(false);
		expect(
			noteCreateInput.safeParse({
				...publishInput,
				images: ["https://youni.kuizuo.me/example.jpg"],
			}).success,
		).toBe(true);
	});
});
