import { afterAll, describe, expect, jest, test } from "@jest/globals";
import { fetchWithTimeout } from "@/utils/request-timeout";
import { uploadNoteImages } from "../note-image-upload";

const originalFormDataDescriptor = Object.getOwnPropertyDescriptor(
	globalThis,
	"FormData",
);

class NativeFormData {
	private readonly parts: Array<[string, unknown]> = [];

	append(name: string, value: unknown) {
		this.parts.push([name, value]);
	}

	entries() {
		return this.parts;
	}
}

jest.mock("expo-file-system", () => ({
	File: class MockExpoFile {
		readonly name = "photo.jpg";
		readonly type = "image/jpeg";
		readonly uri: string;

		constructor(uri: string) {
			this.uri = uri;
		}

		async bytes() {
			return new Uint8Array([1, 2, 3]);
		}
	},
}));
jest.mock("@/lib/api-url", () => ({ apiBaseUrl: "https://api.example.com" }));
jest.mock("@/lib/auth-client", () => ({
	authClient: { getCookie: () => "" },
}));
jest.mock("@/utils/request-timeout", () => ({ fetchWithTimeout: jest.fn() }));

const mockFetchWithTimeout = jest.mocked(fetchWithTimeout);

afterAll(() => {
	if (originalFormDataDescriptor) {
		Object.defineProperty(globalThis, "FormData", originalFormDataDescriptor);
	} else {
		Reflect.deleteProperty(globalThis, "FormData");
	}
});

describe("uploadNoteImages", () => {
	test("encodes a native image as a supported file part", async () => {
		globalThis.FormData = NativeFormData as unknown as typeof FormData;
		mockFetchWithTimeout.mockImplementation(
			async (_input, init?: { body?: unknown }) => {
				const parts = [...(init?.body as unknown as NativeFormData).entries()];
				expect(parts).toEqual([
					[
						"image0",
						expect.objectContaining({
							name: "photo.jpg",
							type: "image/jpeg",
							uri: "file:///tmp/photo.jpg",
						}),
					],
				]);

				return {
					json: async () => ({
						items: [
							{
								key: "note-images/user/123e4567-e89b-12d3-a456-426614174000.jpg",
								url: "https://api.example.com/uploads/note-images/user/123e4567-e89b-12d3-a456-426614174000.jpg",
							},
						],
					}),
					ok: true,
				} as Response;
			},
		);

		const uploaded = await uploadNoteImages([
			{
				fileName: "photo.jpg",
				mimeType: "image/jpeg",
				uri: "file:///tmp/photo.jpg",
			},
		]);

		expect(uploaded).toEqual([
			{
				key: "note-images/user/123e4567-e89b-12d3-a456-426614174000.jpg",
				url: "https://api.example.com/uploads/note-images/user/123e4567-e89b-12d3-a456-426614174000.jpg",
			},
		]);
		expect(mockFetchWithTimeout).toHaveBeenCalledTimes(1);
	});
});
