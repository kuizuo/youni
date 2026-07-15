import { describe, expect, test } from "bun:test";

import {
	sortDescriptorToState,
	sortingStateToDescriptor,
} from "./admin-table-sorting";

describe("admin table sorting adapters", () => {
	test("converts the single table sort in both directions", () => {
		expect(sortingStateToDescriptor([{ desc: true, id: "createdAt" }])).toEqual(
			{ column: "createdAt", direction: "descending" },
		);
		expect(
			sortDescriptorToState({ column: "title", direction: "ascending" }),
		).toEqual([{ desc: false, id: "title" }]);
	});
});
