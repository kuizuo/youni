import { describe, expect, test } from "bun:test";

import { resolveStoredNoteImageUrl } from "./api-url-resolver";

describe("resolveStoredNoteImageUrl", () => {
	test("uses the current API origin for an uploaded note image", () => {
		expect(
			resolveStoredNoteImageUrl(
				"http://192.168.10.153:3000/uploads/note-images/user/image.jpg",
				"http://localhost:3000",
			),
		).toBe("http://localhost:3000/uploads/note-images/user/image.jpg");
	});

	test("keeps external images unchanged", () => {
		expect(
			resolveStoredNoteImageUrl(
				"https://images.example.com/photo.jpg",
				"http://localhost:3000",
			),
		).toBe("https://images.example.com/photo.jpg");
	});

	test("keeps malformed values unchanged", () => {
		expect(
			resolveStoredNoteImageUrl("not-a-url", "http://localhost:3000"),
		).toBe("not-a-url");
	});
});
