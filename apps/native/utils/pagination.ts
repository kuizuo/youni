export function flattenPages<T>(pages?: Array<{ items: T[] }>) {
	return pages?.flatMap((page) => page.items) ?? [];
}
