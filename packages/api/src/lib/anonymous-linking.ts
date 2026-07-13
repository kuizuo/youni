import { createDb } from "@youni/db";
import {
	type NoteViewHistoryRow,
	noteViewHistory,
} from "@youni/db/schema/index";
import { inArray } from "drizzle-orm";

function earlierDate(left: Date, right: Date) {
	return left.getTime() <= right.getTime() ? left : right;
}

function laterDate(left: Date, right: Date) {
	return left.getTime() >= right.getTime() ? left : right;
}

export function mergeAnonymousViewHistory(
	rows: NoteViewHistoryRow[],
	newUserId: string,
) {
	const mergedByNoteId = new Map<string, NoteViewHistoryRow>();

	for (const row of rows) {
		const existing = mergedByNoteId.get(row.noteId);
		if (!existing) {
			mergedByNoteId.set(row.noteId, { ...row, userId: newUserId });
			continue;
		}

		mergedByNoteId.set(row.noteId, {
			...existing,
			createdAt: earlierDate(existing.createdAt, row.createdAt),
			updatedAt: laterDate(existing.updatedAt, row.updatedAt),
			viewedAt: laterDate(existing.viewedAt, row.viewedAt),
		});
	}

	return [...mergedByNoteId.values()].sort((left, right) =>
		left.noteId.localeCompare(right.noteId),
	);
}

export async function linkAnonymousUserActivity({
	anonymousUserId,
	newUserId,
}: {
	anonymousUserId: string;
	newUserId: string;
}) {
	if (anonymousUserId === newUserId) return;

	const db = createDb();
	const userIds = [anonymousUserId, newUserId];
	const rows = await db
		.select({
			createdAt: noteViewHistory.createdAt,
			noteId: noteViewHistory.noteId,
			updatedAt: noteViewHistory.updatedAt,
			userId: noteViewHistory.userId,
			viewedAt: noteViewHistory.viewedAt,
		})
		.from(noteViewHistory)
		.where(inArray(noteViewHistory.userId, userIds));
	const mergedRows = mergeAnonymousViewHistory(rows, newUserId);

	if (mergedRows.length === 0) return;

	await db.batch([
		db.delete(noteViewHistory).where(inArray(noteViewHistory.userId, userIds)),
		db.insert(noteViewHistory).values(mergedRows),
	]);
}
