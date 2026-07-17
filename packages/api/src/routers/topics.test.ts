import { expect, test } from "bun:test";

import { sortTopicNotes } from "./topics";

test("sorts topic notes by popularity or publish time", () => {
	const notes = [
		{ createdAt: "2026-01-03T00:00:00.000Z", id: "latest", likedCount: 1 },
		{ createdAt: "2026-01-01T00:00:00.000Z", id: "hot", likedCount: 9 },
	];

	expect(sortTopicNotes(notes, "hot").map((note) => note.id)).toEqual([
		"hot",
		"latest",
	]);
	expect(sortTopicNotes(notes, "latest").map((note) => note.id)).toEqual([
		"latest",
		"hot",
	]);
});
