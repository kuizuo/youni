export function getUserIdFromCode(value: string) {
	const match = value.match(/(?:user\/|user:)([a-zA-Z0-9_-]+)/);
	return match?.[1] ?? null;
}
