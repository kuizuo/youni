import { expect, test } from "bun:test";
import { createD1HttpDatabase } from "./d1-http";

test("sends HTTP batch statements in order as individual queries", async () => {
	const originalFetch = globalThis.fetch;
	const bodies: unknown[] = [];
	globalThis.fetch = async (_input, init) => {
		bodies.push(JSON.parse(String(init?.body)));
		return new Response(
			JSON.stringify({
				result: [{ results: [], success: true }],
				success: true,
			}),
		);
	};

	try {
		const database = createD1HttpDatabase({
			accountId: "account",
			databaseId: "database",
			queryUrl: "https://d1.example.test/query",
			token: "token",
		});
		await database.batch([
			database.prepare("delete from history"),
			database.prepare("insert into history values (?)").bind("note-1"),
		]);
	} finally {
		globalThis.fetch = originalFetch;
	}

	expect(bodies).toEqual([
		{ params: [], sql: "delete from history" },
		{ params: ["note-1"], sql: "insert into history values (?)" },
	]);
});
