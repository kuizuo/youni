import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	follow,
	note,
	noteViewCountState,
	noteViewHistory,
} from "@youni/db/schema/index";
import { and, eq, ne } from "drizzle-orm";

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
