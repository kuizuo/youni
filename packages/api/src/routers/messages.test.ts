import { describe, expect, test } from "bun:test";

import { isMessageAfter } from "./messages";

const sameTime = new Date("2026-07-20T08:00:00.000Z");

describe("direct message cursor order", () => {
	test("uses the message id to keep equal timestamps deterministic", () => {
		expect(
			isMessageAfter(
				{ createdAt: sameTime, id: "message-b" },
				{ createdAt: sameTime, id: "message-a" },
			),
		).toBe(true);
		expect(
			isMessageAfter(
				{ createdAt: sameTime, id: "message-a" },
				{ createdAt: sameTime, id: "message-b" },
			),
		).toBe(false);
	});

	test("never moves a read cursor backwards", () => {
		expect(
			isMessageAfter(
				{ createdAt: new Date("2026-07-20T07:59:59.999Z"), id: "later-id" },
				{ createdAt: sameTime, id: "earlier-id" },
			),
		).toBe(false);
	});
});
