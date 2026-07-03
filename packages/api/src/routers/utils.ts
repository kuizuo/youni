export function toNumber(value: unknown) {
	return Number(value ?? 0);
}

export function toPage<T>(items: T[], limit: number, offset: number) {
	const pageItems = items.slice(0, limit);
	const hasMore = items.length > limit;

	return {
		items: pageItems,
		hasMore,
		nextOffset: hasMore ? offset + limit : null,
	};
}
