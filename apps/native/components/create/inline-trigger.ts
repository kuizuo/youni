import type { InlineTrigger } from "./create-types";

export function findInlineTrigger(
	value: string,
	cursor: number,
): InlineTrigger | null {
	const beforeCursor = value.slice(0, cursor);
	const match = beforeCursor.match(/(^|\s)([#@])([^\s#@]*)$/);
	if (!match) return null;

	const symbol = match[2];
	const query = match[3] ?? "";
	const tokenLength = symbol.length + query.length;
	return {
		end: cursor,
		query,
		start: cursor - tokenLength,
		type: symbol === "#" ? "topic" : "mention",
	};
}
