import { expect, test } from "bun:test";
import { createNoteViewRecorder } from "./note-view-recorder";

test("records one view per note and viewer", async () => {
	const writes: string[] = [];
	const record = createNoteViewRecorder(async (noteId) => {
		writes.push(noteId);
	});

	expect(await record({ noteId: "note-a", viewerId: "user-a" })).toBe(true);
	expect(await record({ noteId: "note-a", viewerId: "user-a" })).toBe(false);
	expect(await record({ noteId: "note-b", viewerId: "user-a" })).toBe(true);
	expect(writes).toEqual(["note-a", "note-b"]);
});

test("allows a failed view to be retried", async () => {
	let attempts = 0;
	const record = createNoteViewRecorder(async () => {
		attempts += 1;
		if (attempts === 1) throw new Error("offline");
	});

	await expect(
		record({ noteId: "note-a", viewerId: "user-a" }),
	).rejects.toThrow("offline");
	expect(await record({ noteId: "note-a", viewerId: "user-a" })).toBe(true);
	expect(attempts).toBe(2);
});
