import { describe, expect, test } from "bun:test";
import {
	createProfileMediaIdentity,
	parseProfileMediaIdentity,
} from "./media-identity";

describe("profile media identity", () => {
	test("keeps owned profile media identifiable from keys and URLs", () => {
		const identity = createProfileMediaIdentity({
			baseUrl: "https://example.com/request",
			fileName: "123e4567-e89b-12d3-a456-426614174000.jpg",
			kind: "avatar",
			userId: "user-1",
		});

		expect(parseProfileMediaIdentity(identity.key)).toMatchObject({
			kind: "avatar",
			userId: "user-1",
		});
		expect(parseProfileMediaIdentity(identity.url)).toMatchObject({
			kind: "avatar",
			origin: "https://example.com",
			userId: "user-1",
		});
		expect(parseProfileMediaIdentity("avatar/user-2/not-owned.jpg")).toBeNull();
	});
});
