import { integer } from "drizzle-orm/sqlite-core";

export function booleanColumn(name: string) {
	return integer(name, { mode: "boolean" });
}

export function timestampColumn(name: string) {
	return integer(name, { mode: "timestamp_ms" });
}
