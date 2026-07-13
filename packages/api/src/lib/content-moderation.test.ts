import { describe, expect, test } from "bun:test";
import { hasBlockedNoteText } from "./content-moderation";

function noteInput(
	overrides: Partial<Parameters<typeof hasBlockedNoteText>[0]> = {},
): Parameters<typeof hasBlockedNoteText>[0] {
	return {
		advancedOptions: {},
		components: [],
		content: "记录周末露营时看到的日落。",
		title: "湖边露营",
		topics: ["旅行"],
		...overrides,
	};
}

describe("hasBlockedNoteText", () => {
	test("allows ordinary note text", () => {
		expect(hasBlockedNoteText(noteInput())).toBe(false);
	});

	test("blocks a clear prohibited phrase in the title", () => {
		expect(
			hasBlockedNoteText(noteInput({ title: "提供兼职刷单，高额返利" })),
		).toBe(true);
	});

	test("ignores punctuation and full-width spaces used to evade matching", () => {
		expect(
			hasBlockedNoteText(
				noteInput({ content: "可提供兼　职-刷_单，私信联系。" }),
			),
		).toBe(true);
	});

	test("checks topics and other visible text fields", () => {
		expect(
			hasBlockedNoteText(
				noteInput({
					components: [{ title: "代-办-假-证" }],
				}),
			),
		).toBe(true);
	});

	test("does not block general anti-fraud education", () => {
		expect(
			hasBlockedNoteText(
				noteInput({ content: "整理常见网络诈骗手法，提醒大家不要转账。" }),
			),
		).toBe(false);
	});
});
