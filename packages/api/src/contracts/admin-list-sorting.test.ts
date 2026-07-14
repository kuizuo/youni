import { describe, expect, test } from "bun:test";

import {
	adminListInput,
	adminTopicListInput,
	adminUserListInput,
} from "./admin";

describe("admin list sorting inputs", () => {
	test("keeps newest-first defaults for existing callers", () => {
		expect(adminListInput.parse({})).toMatchObject({
			limit: 10,
			offset: 0,
			sortBy: "createdAt",
			sortDirection: "desc",
		});
		expect(adminUserListInput.parse({})).toMatchObject({
			sortBy: "createdAt",
			sortDirection: "desc",
		});
		expect(adminTopicListInput.parse({})).toMatchObject({
			sortBy: "createdAt",
			sortDirection: "desc",
		});
	});

	test("accepts only the public sort fields for each list", () => {
		expect(
			adminListInput.parse({ sortBy: "author", sortDirection: "asc" }),
		).toMatchObject({ sortBy: "author", sortDirection: "asc" });
		expect(
			adminUserListInput.parse({ sortBy: "role", sortDirection: "desc" }),
		).toMatchObject({ sortBy: "role", sortDirection: "desc" });
		expect(
			adminTopicListInput.parse({ sortBy: "noteCount", sortDirection: "asc" }),
		).toMatchObject({ sortBy: "noteCount", sortDirection: "asc" });

		expect(() => adminListInput.parse({ sortBy: "noteCount" })).toThrow();
		expect(() => adminUserListInput.parse({ sortBy: "bio" })).toThrow();
		expect(() => adminTopicListInput.parse({ sortBy: "status" })).toThrow();
	});
});
