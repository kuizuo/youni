import { afterAll, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const migrationDirectory = fileURLToPath(new URL(".", import.meta.url));
const migrationFiles = readdirSync(migrationDirectory)
	.filter((file) => /^\d{4}_.+\.sql$/.test(file))
	.sort();
const databases: Database[] = [];

async function applyMigration(database: Database, file: string) {
	const sql = await Bun.file(`${migrationDirectory}${file}`).text();
	for (const statement of sql.split("--> statement-breakpoint")) {
		if (statement.trim()) database.exec(statement);
	}
}

async function createDatabaseThrough(lastMigration?: string) {
	const database = new Database(":memory:");
	databases.push(database);
	database.exec("PRAGMA foreign_keys = ON");
	for (const file of migrationFiles) {
		if (lastMigration && file > lastMigration) break;
		await applyMigration(database, file);
	}
	return database;
}

afterAll(() => {
	for (const database of databases) database.close();
});

describe("direct message personal state migration", () => {
	test("builds the final schema on a fresh database", async () => {
		const database = await createDatabaseThrough();
		const tables = database
			.query<{ name: string }, []>(
				"SELECT name FROM sqlite_master WHERE type = 'table'",
			)
			.all()
			.map((row) => row.name);

		expect(tables).toContain("direct_message_user_deletion");
		expect(tables).not.toContain("direct_message_hidden");

		const participantColumns = database
			.query<{ name: string }, []>(
				"SELECT name FROM pragma_table_info('direct_conversation_participant')",
			)
			.all()
			.map((row) => row.name);
		expect(participantColumns).toContain("last_read_message_id");
		expect(participantColumns).toContain("cleared_through_message_id");
		expect(participantColumns).not.toContain("last_read_at");
		expect(participantColumns).not.toContain("cleared_at");
	});

	test("converts old timestamps to deterministic message cursors", async () => {
		const database = await createDatabaseThrough("0009_serious_lila_cheney.sql");
		database.exec(`
			INSERT INTO user (id, name, email, created_at, updated_at)
			VALUES ('user-a', 'A', 'a@example.com', 1, 1),
				('user-b', 'B', 'b@example.com', 1, 1);
			INSERT INTO direct_conversation (id, member_key, created_at, updated_at)
			VALUES ('chat-1', 'user-a:user-b', 1, 1);
			INSERT INTO direct_message (id, conversation_id, sender_id, content, created_at, updated_at)
			VALUES ('message-0', 'chat-1', 'user-b', 'old', 900, 900),
				('message-a', 'chat-1', 'user-b', 'same time a', 1000, 1000),
				('message-b', 'chat-1', 'user-b', 'same time b', 1000, 1000),
				('message-new', 'chat-1', 'user-b', 'new', 1100, 1100);
			INSERT INTO direct_conversation_participant
				(conversation_id, user_id, last_read_at, cleared_at, created_at, updated_at)
			VALUES ('chat-1', 'user-a', 1000, 900, 1, 1),
				('chat-1', 'user-b', NULL, NULL, 1, 1);
		`);

		await applyMigration(database, "0010_dapper_hardball.sql");

		const migrated = database
			.query<
				{
					clearedThroughMessageId: string | null;
					lastReadMessageId: string | null;
				},
				[string]
			>(
				`SELECT
					cleared_through_message_id AS clearedThroughMessageId,
					last_read_message_id AS lastReadMessageId
				FROM direct_conversation_participant
				WHERE user_id = ?`,
			)
			.get("user-a");

		expect(migrated).toEqual({
			clearedThroughMessageId: "message-0",
			lastReadMessageId: "message-b",
		});
	});
});
