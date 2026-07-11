import * as SQLite from "expo-sqlite";

import type {
	LocalDraft,
	LocalDraftAdvancedOptions,
	LocalDraftImage,
	LocalDraftSummary,
	LocalDraftVisibility,
	SaveLocalDraftInput,
} from "@/lib/local-drafts/types";
import { validateLocalDraft } from "@/lib/local-drafts/validation";

const DATABASE_NAME = "youni-local-drafts.db";
const DATABASE_VERSION = 1;

type DraftRow = {
	advanced_options: string;
	content: string;
	created_at: number;
	id: string;
	title: string;
	topics: string;
	updated_at: number;
	user_id: string;
	visibility: LocalDraftVisibility;
};

type DraftSummaryRow = DraftRow & {
	cover_aspect_ratio: number | null;
	cover_data: Uint8Array | null;
	cover_mime_type: string | null;
	image_count: number;
};

type DraftImageRow = {
	data: Uint8Array;
	draft_id: string;
	file_name: string;
	height: number | null;
	id: string;
	mime_type: string;
	position: number;
	width: number | null;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function parseJson<T>(value: string, fallback: T): T {
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}

function draftFromRow(row: DraftRow, images: LocalDraftImage[]): LocalDraft {
	return {
		advancedOptions: parseJson<LocalDraftAdvancedOptions>(
			row.advanced_options,
			{
				allowComment: true,
				allowShare: true,
			},
		),
		content: row.content,
		createdAt: row.created_at,
		id: row.id,
		images,
		title: row.title,
		topics: parseJson<string[]>(row.topics, []),
		updatedAt: row.updated_at,
		userId: row.user_id,
		visibility: row.visibility,
	};
}

function createDraftId() {
	if (typeof globalThis.crypto?.randomUUID === "function") {
		return globalThis.crypto.randomUUID();
	}
	return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

async function migrateDatabase(database: SQLite.SQLiteDatabase) {
	await database.execAsync("PRAGMA foreign_keys = ON");
	await database.execAsync("PRAGMA journal_mode = WAL");
	const version = await database.getFirstAsync<{ user_version: number }>(
		"PRAGMA user_version",
	);
	if ((version?.user_version ?? 0) >= DATABASE_VERSION) return;

	await database.withTransactionAsync(async () => {
		await database.execAsync(`
			CREATE TABLE IF NOT EXISTS local_draft (
				id TEXT PRIMARY KEY NOT NULL,
				user_id TEXT NOT NULL,
				title TEXT NOT NULL,
				content TEXT NOT NULL,
				topics TEXT NOT NULL,
				visibility TEXT NOT NULL,
				advanced_options TEXT NOT NULL,
				cover_data BLOB,
				cover_mime_type TEXT,
				cover_aspect_ratio REAL,
				created_at INTEGER NOT NULL,
				updated_at INTEGER NOT NULL
			);
			CREATE INDEX IF NOT EXISTS local_draft_user_updated_idx
				ON local_draft (user_id, updated_at DESC);
			CREATE TABLE IF NOT EXISTS local_draft_image (
				id TEXT PRIMARY KEY NOT NULL,
				draft_id TEXT NOT NULL REFERENCES local_draft(id) ON DELETE CASCADE,
				position INTEGER NOT NULL,
				file_name TEXT NOT NULL,
				mime_type TEXT NOT NULL,
				width INTEGER,
				height INTEGER,
				data BLOB NOT NULL,
				UNIQUE (draft_id, position)
			);
			CREATE INDEX IF NOT EXISTS local_draft_image_draft_idx
				ON local_draft_image (draft_id, position);
			CREATE TABLE IF NOT EXISTS local_draft_preference (
				user_id TEXT PRIMARY KEY NOT NULL,
				alert_dismissed INTEGER NOT NULL DEFAULT 0
			);
		`);
		await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
	});
}

async function openDatabase() {
	const database = await SQLite.openDatabaseAsync(DATABASE_NAME);
	await migrateDatabase(database);
	return database;
}

export function getLocalDraftDatabase() {
	databasePromise ??= openDatabase().catch((error) => {
		databasePromise = null;
		throw error;
	});
	return databasePromise;
}

export async function listLocalDrafts(userId: string) {
	const database = await getLocalDraftDatabase();
	const rows = await database.getAllAsync<DraftSummaryRow>(
		`SELECT
			id, user_id, title, content, topics, visibility, advanced_options,
			cover_data, cover_mime_type, cover_aspect_ratio, created_at, updated_at,
			(SELECT COUNT(*) FROM local_draft_image image WHERE image.draft_id = local_draft.id) AS image_count
		FROM local_draft
		WHERE user_id = ?
		ORDER BY updated_at DESC`,
		userId,
	);

	return rows.map<LocalDraftSummary>((row) => ({
		...draftFromRow(row, []),
		coverAspectRatio: row.cover_aspect_ratio,
		coverData: row.cover_data,
		coverMimeType: row.cover_mime_type,
		imageCount: row.image_count,
	}));
}

export async function getLocalDraft(userId: string, id: string) {
	const database = await getLocalDraftDatabase();
	const row = await database.getFirstAsync<DraftRow>(
		`SELECT id, user_id, title, content, topics, visibility, advanced_options, created_at, updated_at
		FROM local_draft WHERE id = ? AND user_id = ?`,
		id,
		userId,
	);
	if (!row) return null;

	const imageRows = await database.getAllAsync<DraftImageRow>(
		`SELECT image.id, image.draft_id, image.position, image.file_name,
			image.mime_type, image.width, image.height, image.data
		FROM local_draft_image image
		INNER JOIN local_draft draft ON draft.id = image.draft_id
		WHERE image.draft_id = ? AND draft.user_id = ?
		ORDER BY image.position ASC`,
		id,
		userId,
	);
	const images = imageRows.map<LocalDraftImage>((image) => ({
		data: image.data,
		fileName: image.file_name,
		height: image.height ?? undefined,
		id: image.id,
		mimeType: image.mime_type,
		position: image.position,
		width: image.width ?? undefined,
	}));

	return draftFromRow(row, images);
}

export async function saveLocalDraft(input: SaveLocalDraftInput) {
	validateLocalDraft(input);

	const database = await getLocalDraftDatabase();
	const id = input.id ?? createDraftId();
	const now = Date.now();

	await database.withTransactionAsync(async () => {
		const existing = await database.getFirstAsync<{
			created_at: number;
			user_id: string;
		}>("SELECT user_id, created_at FROM local_draft WHERE id = ?", id);
		if (existing && existing.user_id !== input.userId) {
			throw new Error("没有权限修改这份草稿");
		}

		await database.runAsync(
			`INSERT INTO local_draft (
				id, user_id, title, content, topics, visibility, advanced_options,
				cover_data, cover_mime_type, cover_aspect_ratio, created_at, updated_at
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET
				title = excluded.title,
				content = excluded.content,
				topics = excluded.topics,
				visibility = excluded.visibility,
				advanced_options = excluded.advanced_options,
				cover_data = excluded.cover_data,
				cover_mime_type = excluded.cover_mime_type,
				cover_aspect_ratio = excluded.cover_aspect_ratio,
				updated_at = excluded.updated_at`,
			id,
			input.userId,
			input.title,
			input.content,
			JSON.stringify(input.topics),
			input.visibility,
			JSON.stringify(input.advancedOptions),
			input.coverData ?? null,
			input.coverMimeType ?? null,
			input.coverAspectRatio ?? null,
			existing?.created_at ?? now,
			now,
		);

		await database.runAsync(
			"DELETE FROM local_draft_image WHERE draft_id = ?",
			id,
		);
		const insertImage = await database.prepareAsync(
			`INSERT INTO local_draft_image (
				id, draft_id, position, file_name, mime_type, width, height, data
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		);
		try {
			for (const [position, image] of input.images.entries()) {
				await insertImage.executeAsync(
					`${id}:${position}`,
					id,
					position,
					image.fileName,
					image.mimeType,
					image.width ?? null,
					image.height ?? null,
					image.data,
				);
			}
		} finally {
			await insertImage.finalizeAsync();
		}
	});

	return id;
}

export async function deleteLocalDraft(userId: string, id: string) {
	const database = await getLocalDraftDatabase();
	const result = await database.runAsync(
		"DELETE FROM local_draft WHERE id = ? AND user_id = ?",
		id,
		userId,
	);
	return result.changes > 0;
}

export async function isLocalDraftAlertDismissed(userId: string) {
	const database = await getLocalDraftDatabase();
	const row = await database.getFirstAsync<{ alert_dismissed: number }>(
		"SELECT alert_dismissed FROM local_draft_preference WHERE user_id = ?",
		userId,
	);
	return row?.alert_dismissed === 1;
}

export async function dismissLocalDraftAlert(userId: string) {
	const database = await getLocalDraftDatabase();
	await database.runAsync(
		`INSERT INTO local_draft_preference (user_id, alert_dismissed)
		VALUES (?, 1)
		ON CONFLICT(user_id) DO UPDATE SET alert_dismissed = 1`,
		userId,
	);
}
