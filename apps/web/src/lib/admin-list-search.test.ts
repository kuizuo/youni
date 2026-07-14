import { describe, expect, test } from "bun:test";

import {
	adminListSearchDefaults,
	adminSortingStateToSort,
	adminSortToState,
	parseAdminListSearch,
	parseAdminSearchOption,
} from "./admin-list-search";

const noteSortFields = ["title", "author", "status", "createdAt"] as const;

describe("parseAdminListSearch", () => {
	test("returns safe defaults for an empty URL", () => {
		expect(parseAdminListSearch({}, noteSortFields)).toEqual(
			adminListSearchDefaults,
		);
	});

	test("parses a shareable list URL", () => {
		expect(
			parseAdminListSearch(
				{
					page: 3,
					pageSize: 50,
					q: "  咖啡  ",
					sort: "author.asc",
				},
				noteSortFields,
			),
		).toEqual({
			page: 3,
			pageSize: 50,
			q: "咖啡",
			sort: "author.asc",
		});
	});

	test("repairs unsupported and out-of-range values", () => {
		expect(
			parseAdminListSearch(
				{
					page: -4,
					pageSize: 17,
					q: ["not", "text"],
					sort: "unknown.sideways",
				},
				noteSortFields,
			),
		).toEqual(adminListSearchDefaults);
	});
});

describe("table sort mapping", () => {
	test("maps a URL sort value to the controlled table state", () => {
		expect(adminSortToState("author.asc")).toEqual([
			{ desc: false, id: "author" },
		]);
	});

	test("maps the controlled table state back to the URL value", () => {
		expect(adminSortingStateToSort([{ desc: true, id: "createdAt" }])).toBe(
			"createdAt.desc",
		);
		expect(adminSortingStateToSort([])).toBeUndefined();
	});
});

describe("parseAdminSearchOption", () => {
	test("keeps supported filters and clears unknown values", () => {
		const statuses = ["audit", "published"] as const;
		expect(parseAdminSearchOption("audit", statuses)).toBe("audit");
		expect(parseAdminSearchOption("hidden", statuses)).toBe("");
		expect(parseAdminSearchOption(["audit"], statuses)).toBe("");
	});
});
