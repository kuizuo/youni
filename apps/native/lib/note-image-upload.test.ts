import { afterAll, describe, expect, mock, test } from "bun:test";
import { convertFormDataAsync } from "expo/src/winter/fetch/convertFormData";

const originalFormData = globalThis.FormData;

class NativeFormData {
	private readonly parts: Array<[string, unknown]> = [];

	append(name: string, value: unknown) {
		this.parts.push([name, value]);
	}

	entries() {
		return this.parts;
	}
}

class MockExpoFile {
	readonly name = "photo.jpg";
	readonly type = "image/jpeg";

	constructor(readonly uri: string) {}

	async bytes() {
		return new Uint8Array([1, 2, 3]);
	}
}

const fetchWithTimeout = mock(
	async (_input: unknown, init?: { body?: unknown }) => {
		await convertFormDataAsync(init?.body as FormData, "----test-boundary");

		return new Response(
			JSON.stringify({
				items: [
					{
						key: "note-images/user/photo.jpg",
						url: "https://example.com/photo.jpg",
					},
				],
			}),
			{ headers: { "Content-Type": "application/json" } },
		);
	},
);

mock.module("expo-file-system", () => ({ File: MockExpoFile }));
mock.module("react-native", () => ({
	Platform: { OS: "ios" },
	Text: "Text",
	TextInput: "TextInput",
	View: "View",
}));
mock.module("@/lib/api-url", () => ({ apiBaseUrl: "https://api.example.com" }));
mock.module("@/lib/auth-client", () => ({
	authClient: { getCookie: () => "" },
}));
mock.module("@/utils/request-timeout", () => ({ fetchWithTimeout }));

const { uploadNoteImages } = await import("./note-image-upload");

afterAll(() => {
	globalThis.FormData = originalFormData;
});

describe("uploadNoteImages", () => {
	test("encodes a native image as a supported file part", async () => {
		globalThis.FormData = NativeFormData as unknown as typeof FormData;

		const uploaded = await uploadNoteImages([
			{
				fileName: "photo.jpg",
				mimeType: "image/jpeg",
				uri: "file:///tmp/photo.jpg",
			},
		]);

		expect(uploaded).toEqual([
			{
				key: "note-images/user/photo.jpg",
				url: "https://example.com/photo.jpg",
			},
		]);
		expect(fetchWithTimeout).toHaveBeenCalledTimes(1);
	});
});
