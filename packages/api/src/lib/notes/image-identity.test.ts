import { describe, expect, test } from "bun:test";
import {
	createNoteImageIdentity,
	isOwnedNoteImage,
	NOTE_IMAGE_MAX_COUNT,
	NOTE_IMAGE_MAX_SIZE_BYTES,
	parseNoteImageIdentity,
	prepareNoteImageSource,
	resolveStoredNoteImageUrl,
} from "./image-identity";

const fileId = "123e4567-e89b-12d3-a456-426614174000";

describe("note image identity", () => {
	test("normalizes every supported source and rejects invalid limits", () => {
		expect(
			prepareNoteImageSource({
				fileName: "我的照片.jpg",
				mimeType: "image/png",
				uri: "file:///tmp/photo.jpg",
			}),
		).toEqual({ contentType: "image/png", fileName: "----.png" });
		expect(
			prepareNoteImageSource({ uri: "file:///tmp/photo.webp?version=1" }),
		).toEqual({ contentType: "image/webp", fileName: "photo.webp" });
		expect(() =>
			prepareNoteImageSource({
				fileSize: NOTE_IMAGE_MAX_SIZE_BYTES + 1,
				uri: "photo.jpg",
			}),
		).toThrow("8MB");
		expect(() =>
			prepareNoteImageSource({ mimeType: "image/svg+xml", uri: "photo.svg" }),
		).toThrow("JPG、PNG、WebP 或 GIF");
		expect(() => prepareNoteImageSource({ uri: "photo.svg" })).toThrow(
			"JPG、PNG、WebP 或 GIF",
		);
		expect(
			prepareNoteImageSource({ mimeType: "image/jpg", uri: "photo.jpg" }),
		).toEqual({ contentType: "image/jpeg", fileName: "photo.jpg" });
		expect(NOTE_IMAGE_MAX_COUNT).toBe(9);
	});

	test("gives upload, publishing, review, display and cleanup one identity", () => {
		const identity = createNoteImageIdentity({
			baseUrl: "http://192.168.1.8:3000/uploads/note-images",
			fileId,
			mimeType: "image/jpeg",
			userId: "user-1",
		});

		expect(identity).toMatchObject({
			contentType: "image/jpeg",
			key: `note-images/user-1/${fileId}.jpg`,
			url: `http://192.168.1.8:3000/uploads/note-images/user-1/${fileId}.jpg`,
			userId: "user-1",
		});
		expect(parseNoteImageIdentity(identity.url)).toMatchObject({
			key: identity.key,
			userId: "user-1",
		});
		expect(parseNoteImageIdentity(identity.key)).toMatchObject({
			key: identity.key,
			origin: null,
			userId: "user-1",
		});
		expect(
			isOwnedNoteImage(identity.url, "user-1", "http://192.168.1.8:3000"),
		).toBe(true);
		expect(isOwnedNoteImage(identity.url, "user-2")).toBe(false);
		expect(
			isOwnedNoteImage(identity.url, "user-1", "https://api.example.com"),
		).toBe(false);
		expect(
			resolveStoredNoteImageUrl(identity.url, "http://localhost:3000"),
		).toBe(`http://localhost:3000/uploads/note-images/user-1/${fileId}.jpg`);
	});

	test("keeps legacy stored images readable without granting ownership", () => {
		const legacy = `https://api.example.com/uploads/note-images/${fileId}.png`;
		expect(parseNoteImageIdentity(legacy)).toMatchObject({
			key: `note-images/${fileId}.png`,
			userId: null,
		});
		expect(isOwnedNoteImage(legacy, "user-1")).toBe(false);
		expect(parseNoteImageIdentity("https://example.com/photo.jpg")).toBeNull();
		expect(
			parseNoteImageIdentity("note-images/user-1/not-a-uuid.jpg"),
		).toBeNull();
	});
});
