import type { InlineToken, MentionTrigger } from "./types";

export function parseInlineTokens(value: string): InlineToken[] {
	const tokens: InlineToken[] = [];
	const pattern = /@([A-Za-z0-9_]{1,30})|#([\p{L}\p{N}_-]{1,24})/gu;
	let cursor = 0;
	let index = 0;

	for (const match of value.matchAll(pattern)) {
		const matchIndex = match.index ?? 0;
		if (matchIndex > cursor) {
			tokens.push({
				key: `text-${index}`,
				text: value.slice(cursor, matchIndex),
				type: "text",
			});
			index += 1;
		}

		const mention = match[1];
		const topic = match[2];
		if (mention) {
			tokens.push({
				key: `mention-${mention}-${index}`,
				text: `@${mention}`,
				type: "mention",
				value: mention,
			});
		} else if (topic) {
			tokens.push({
				key: `topic-${topic}-${index}`,
				text: `#${topic}`,
				type: "topic",
				value: topic,
			});
		}
		cursor = matchIndex + match[0].length;
		index += 1;
	}

	if (cursor < value.length) {
		tokens.push({
			key: `text-${index}`,
			text: value.slice(cursor),
			type: "text",
		});
	}

	return tokens.length > 0
		? tokens
		: [{ key: "text-0", text: value, type: "text" }];
}

export function findMentionTrigger(
	value: string,
	cursor: number,
): MentionTrigger | null {
	const beforeCursor = value.slice(0, cursor);
	const match = beforeCursor.match(/(^|\s)@([^\s#@]*)$/);
	if (!match) return null;

	const query = match[2] ?? "";
	const tokenLength = 1 + query.length;
	return {
		end: cursor,
		query,
		start: cursor - tokenLength,
	};
}

export function clampCursor(value: number, max: number) {
	return Math.max(0, Math.min(value, max));
}
