import { createDb } from "@youni/db";
import { noteViewCountState, noteViewHistory } from "@youni/db/schema/index";

import { getShanghaiDay } from "../analytics/search";

const encoder = new TextEncoder();

export async function createViewIdentityKey(userId: string) {
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(userId));
	return Array.from(new Uint8Array(digest), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

export async function recordNoteView(noteId: string, userId: string) {
	const now = new Date();
	const day = getShanghaiDay(now);
	const viewerKey = await createViewIdentityKey(userId);
	const db = createDb();

	await Promise.all([
		db
			.insert(noteViewHistory)
			.values({
				noteId,
				userId,
				viewedAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: [noteViewHistory.userId, noteViewHistory.noteId],
				set: {
					viewedAt: now,
					updatedAt: now,
				},
			}),
		db
			.insert(noteViewCountState)
			.values({
				lastCountedDay: day,
				noteId,
				updatedAt: now,
				viewerKey,
			})
			.onConflictDoUpdate({
				target: [noteViewCountState.noteId, noteViewCountState.viewerKey],
				set: {
					lastCountedDay: day,
					updatedAt: now,
				},
			}),
	]);
}
