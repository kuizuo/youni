import { createDb } from "@youni/db";
import {
	type NoteViewCountStateRow,
	type NoteViewHistoryRow,
	note,
	noteViewCountState,
	noteViewHistory,
} from "@youni/db/schema/index";
import { and, eq, inArray, sql } from "drizzle-orm";

import { createViewIdentityKey } from "../notes/views";

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

async function linkAnonymousViewCountState(
	anonymousUserId: string,
	newUserId: string,
) {
	const [anonymousViewerKey, newViewerKey] = await Promise.all([
		createViewIdentityKey(anonymousUserId),
		createViewIdentityKey(newUserId),
	]);
	if (anonymousViewerKey === newViewerKey) return;

	const db = createDb();
	const rows = await db
		.select({
			lastCountedDay: noteViewCountState.lastCountedDay,
			noteId: noteViewCountState.noteId,
			updatedAt: noteViewCountState.updatedAt,
			viewerKey: noteViewCountState.viewerKey,
		})
		.from(noteViewCountState)
		.where(
			inArray(noteViewCountState.viewerKey, [anonymousViewerKey, newViewerKey]),
		);
	const rowsByNoteId = new Map<
		string,
		{
			anonymous?: NoteViewCountStateRow;
			registered?: NoteViewCountStateRow;
		}
	>();

	for (const row of rows) {
		const pair = rowsByNoteId.get(row.noteId) ?? {};
		if (row.viewerKey === anonymousViewerKey) pair.anonymous = row;
		else pair.registered = row;
		rowsByNoteId.set(row.noteId, pair);
	}

	for (const [noteId, pair] of rowsByNoteId) {
		if (!pair.anonymous) continue;
		if (!pair.registered) {
			await db
				.update(noteViewCountState)
				.set({ viewerKey: newViewerKey })
				.where(
					and(
						eq(noteViewCountState.noteId, noteId),
						eq(noteViewCountState.viewerKey, anonymousViewerKey),
					),
				);
			continue;
		}

		if (pair.anonymous.lastCountedDay > pair.registered.lastCountedDay) {
			await db.batch([
				db
					.delete(noteViewCountState)
					.where(
						and(
							eq(noteViewCountState.noteId, noteId),
							eq(noteViewCountState.viewerKey, newViewerKey),
						),
					),
				db
					.update(noteViewCountState)
					.set({ viewerKey: newViewerKey })
					.where(
						and(
							eq(noteViewCountState.noteId, noteId),
							eq(noteViewCountState.viewerKey, anonymousViewerKey),
						),
					),
			]);
			continue;
		}

		const deleteAnonymousState = db
			.delete(noteViewCountState)
			.where(
				and(
					eq(noteViewCountState.noteId, noteId),
					eq(noteViewCountState.viewerKey, anonymousViewerKey),
				),
			);
		if (pair.anonymous.lastCountedDay === pair.registered.lastCountedDay) {
			await db.batch([
				deleteAnonymousState,
				db
					.update(note)
					.set({ viewCount: sql`max(${note.viewCount} - 1, 0)` })
					.where(eq(note.id, noteId)),
			]);
		} else {
			await deleteAnonymousState;
		}
	}
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

	if (mergedRows.length > 0) {
		await db.batch([
			db
				.delete(noteViewHistory)
				.where(inArray(noteViewHistory.userId, userIds)),
			db.insert(noteViewHistory).values(mergedRows),
		]);
	}
	await linkAnonymousViewCountState(anonymousUserId, newUserId);
}
