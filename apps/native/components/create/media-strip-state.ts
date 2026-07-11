export function positionsFromItems<T extends { id: string }>(items: T[]) {
	return Object.fromEntries(items.map((item, index) => [item.id, index]));
}

export async function synchronizeSortableItems<T extends { id: string }>(
	items: T[],
	synchronizePositions: (
		positions: Record<string, number>,
	) => Promise<unknown> | unknown,
	commitItems: (items: T[]) => void,
) {
	await synchronizePositions(positionsFromItems(items));
	commitItems(items);
}
