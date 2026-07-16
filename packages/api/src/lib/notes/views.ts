import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	follow,
	type NoteViewCountStateRow,
	type NoteViewHistoryRow,
	note,
	noteViewCountState,
	noteViewHistory,
} from "@youni/db/schema/index";
import { and, eq, inArray, ne, sql } from "drizzle-orm";

import { getShanghaiDay } from "../analytics/search";
import { isUserBlockedBy } from "../users/blocks";
import { hydrateContentNotes, selectContentNoteRows } from "./content";

const encoder = new TextEncoder();

async function createViewIdentityKey(userId: string) {
	const digest = await crypto.subtle.digest("SHA-256", encoder.encode(userId));
	return Array.from(new Uint8Array(digest), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
}

async function canViewNoteDetail(
	row: Awaited<ReturnType<typeof selectContentNoteRows>>[number],
	viewerId?: string,
) {
	if (viewerId && row.userId === viewerId) return true;
	if (row.status !== "published") return false;
	if (row.visibility === "public") return true;
	if (row.visibility !== "followers" || !viewerId) return false;

	const [followingRow] = await createDb()
		.select({ followingId: follow.followingId })
		.from(follow)
		.where(
			and(eq(follow.followerId, viewerId), eq(follow.followingId, row.userId)),
		)
		.limit(1);
	return Boolean(followingRow);
}

async function getViewableNote(noteId: string, viewerId?: string) {
	const [row] = await selectContentNoteRows(
		and(eq(note.id, noteId), ne(note.status, "hidden")),
	);
	if (
		!row ||
		!(await canViewNoteDetail(row, viewerId)) ||
		(viewerId && (await isUserBlockedBy(viewerId, row.userId)))
	) {
		throw new ORPCError("NOT_FOUND");
	}
	return row;
}

export async function getNoteDetail(noteId: string, viewerId?: string) {
	const row = await getViewableNote(noteId, viewerId);
	const [item] = await hydrateContentNotes([row], viewerId);
	if (!item) throw new ORPCError("INTERNAL_SERVER_ERROR");
	return item;
}

export async function recordNoteView(noteId: string, viewerId: string) {
	await getViewableNote(noteId, viewerId);

	const now = new Date();
	const day = getShanghaiDay(now);
	const viewerKey = await createViewIdentityKey(viewerId);
	const db = createDb();
	await Promise.all([
		db
			.insert(noteViewHistory)
			.values({ noteId, userId: viewerId, viewedAt: now, updatedAt: now })
			.onConflictDoUpdate({
				target: [noteViewHistory.userId, noteViewHistory.noteId],
				set: { viewedAt: now, updatedAt: now },
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
				set: { lastCountedDay: day, updatedAt: now },
			}),
	]);
	return { recorded: true as const };
}

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

export async function linkAnonymousNoteViews({
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
