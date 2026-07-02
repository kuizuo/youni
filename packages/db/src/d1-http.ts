type D1HttpCredentials = {
	accountId: string;
	databaseId: string;
	token: string;
};

type D1HttpQuery = {
	params?: unknown[];
	sql: string;
};

type D1HttpResult = {
	meta?: D1Result["meta"];
	results?: Record<string, unknown>[];
	success: boolean;
};

type D1HttpResponse = {
	errors?: Array<{ message?: string }>;
	result?: D1HttpResult[];
	success: boolean;
};

const credentialNames = {
	accountId: ["CLOUDFLARE_ACCOUNT_ID"],
	databaseId: ["CLOUDFLARE_D1_DATABASE_ID", "D1_DATABASE_ID"],
	token: ["CLOUDFLARE_API_TOKEN"],
};

function firstEnvValue(names: string[]) {
	for (const name of names) {
		const value = process.env[name];
		if (value) return value;
	}

	return undefined;
}

export function getD1HttpCredentials(): D1HttpCredentials | null {
	const accountId = firstEnvValue(credentialNames.accountId);
	const databaseId = firstEnvValue(credentialNames.databaseId);
	const token = firstEnvValue(credentialNames.token);

	if (!accountId || !databaseId || !token) {
		return null;
	}

	return { accountId, databaseId, token };
}

function d1HttpUrl(credentials: D1HttpCredentials) {
	if (process.env.CLOUDFLARE_D1_QUERY_URL) {
		return process.env.CLOUDFLARE_D1_QUERY_URL;
	}

	return `https://api.cloudflare.com/client/v4/accounts/${credentials.accountId}/d1/database/${credentials.databaseId}/query`;
}

function assertD1Success(response: D1HttpResponse) {
	if (response.success && response.result?.[0]?.success !== false) {
		return;
	}

	const message =
		response.errors
			?.map((error) => error.message)
			.filter(Boolean)
			.join("; ") || "D1 HTTP query failed";
	throw new Error(message);
}

async function queryD1(
	credentials: D1HttpCredentials,
	query: D1HttpQuery | D1HttpQuery[],
) {
	const response = await fetch(d1HttpUrl(credentials), {
		body: JSON.stringify(query),
		headers: {
			authorization: `Bearer ${credentials.token}`,
			"content-type": "application/json",
		},
		method: "POST",
	});

	const body = (await response.json()) as D1HttpResponse;
	if (!response.ok) {
		const message =
			body.errors
				?.map((error) => error.message)
				.filter(Boolean)
				.join("; ") || `${response.status} ${response.statusText}`;
		throw new Error(message);
	}

	assertD1Success(body);
	return body.result ?? [];
}

function resultToD1Response(result: D1HttpResult): D1Result {
	return {
		meta: result.meta ?? ({} as D1Result["meta"]),
		results: result.results ?? [],
		success: true,
	};
}

function rowsToRaw(rows: Record<string, unknown>[]) {
	return rows.map((row) => Object.keys(row).map((key) => row[key]));
}

function createPreparedStatement(
	credentials: D1HttpCredentials,
	sql: string,
	params: unknown[] = [],
): D1PreparedStatement {
	return {
		bind(...boundValues: unknown[]) {
			return createPreparedStatement(credentials, sql, boundValues);
		},
		async all() {
			const [result] = await queryD1(credentials, { params, sql });
			return resultToD1Response(result ?? { success: true });
		},
		async first(columnName?: string) {
			const response = await this.all();
			const row = response.results?.[0];
			if (!row) return null;
			if (columnName) {
				return (row as Record<string, unknown>)[columnName] ?? null;
			}
			return row;
		},
		async raw() {
			const response = await this.all();
			return rowsToRaw(
				(response.results ?? []) as unknown as Record<string, unknown>[],
			);
		},
		async run() {
			const [result] = await queryD1(credentials, { params, sql });
			return resultToD1Response(result ?? { success: true });
		},
	} as D1PreparedStatement;
}

export function createD1HttpDatabase(
	credentials: D1HttpCredentials,
): D1Database {
	return {
		async batch(statements: D1PreparedStatement[]) {
			const results: D1Result[] = [];
			for (const statement of statements) {
				results.push(await statement.run());
			}
			return results;
		},
		dump() {
			throw new Error("D1 HTTP dump is not supported by this adapter");
		},
		exec(statement: string) {
			return createPreparedStatement(credentials, statement).run();
		},
		prepare(statement: string) {
			return createPreparedStatement(credentials, statement);
		},
		withSession() {
			throw new Error("D1 HTTP sessions are not supported by this adapter");
		},
	} as unknown as D1Database;
}
