import type { SortDescriptor } from "@heroui/react";
import type { SortingState } from "@tanstack/react-table";

export function sortingStateToDescriptor(
	sorting: SortingState,
): SortDescriptor | undefined {
	const first = sorting[0];
	if (!first) return undefined;
	return {
		column: first.id,
		direction: first.desc ? "descending" : "ascending",
	};
}

export function sortDescriptorToState(
	descriptor: SortDescriptor,
): SortingState {
	return [
		{
			desc: descriptor.direction === "descending",
			id: String(descriptor.column),
		},
	];
}
