import { type AnyColumn, type SQL, sql } from "drizzle-orm";

const maxD1LikePatternBytes = 50;
const wildcardBytes = 2;
const encoder = new TextEncoder();

function trimUtf8Bytes(value: string, maxBytes: number) {
	let result = "";
	let usedBytes = 0;

	for (const character of value) {
		const bytes = encoder.encode(character).byteLength;
		if (usedBytes + bytes > maxBytes) break;
		result += character;
		usedBytes += bytes;
	}

	return result;
}

function escapeLikePattern(value: string) {
	return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function containsInsensitive(column: AnyColumn, value: string): SQL {
	const trimmed = trimUtf8Bytes(
		value.trim().toLowerCase(),
		maxD1LikePatternBytes - wildcardBytes,
	);
	const pattern = `%${escapeLikePattern(trimmed)}%`;
	return sql`lower(${column}) like ${pattern} escape '\\'`;
}
