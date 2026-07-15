import { describe, expect, test } from "bun:test";
import { findBlockedContentText, hasBlockedContentText } from "./text";

function noteInput(
	overrides: Partial<Parameters<typeof hasBlockedContentText>[0]> = {},
): Parameters<typeof hasBlockedContentText>[0] {
	return {
		advancedOptions: {},
		components: [],
		content: "记录周末露营时看到的日落。",
		title: "湖边露营",
		topics: ["旅行"],
		...overrides,
	};
}

describe("hasBlockedContentText", () => {
	test("allows ordinary note text", () => {
		expect(hasBlockedContentText(noteInput())).toBe(false);
	});

	test("blocks a clear prohibited phrase in the title", () => {
		expect(
			hasBlockedContentText(noteInput({ title: "提供兼职刷单，高额返利" })),
		).toBe(true);
	});

	test("ignores punctuation and full-width spaces used to evade matching", () => {
		expect(
			hasBlockedContentText(
				noteInput({ content: "可提供兼　职-刷_单，私信联系。" }),
			),
		).toBe(true);
	});

	test("checks topics and other visible text fields", () => {
		expect(
			hasBlockedContentText(
				noteInput({
					components: [{ title: "代-办-假-证" }],
				}),
			),
		).toBe(true);
	});

	test("does not block general anti-fraud education", () => {
		expect(
			hasBlockedContentText(
				noteInput({ content: "整理常见网络诈骗手法，提醒大家不要转账。" }),
			),
		).toBe(false);
	});
});

describe("findBlockedContentText", () => {
	test("reports the prohibited phrase used by the review queue example", () => {
		expect(findBlockedContentText(noteInput({ title: "你妈的xxx" }))).toEqual([
			{ field: "title", terms: ["你妈的"] },
		]);
	});

	test("returns every matched term grouped by its visible text location", () => {
		expect(
			findBlockedContentText(
				noteInput({
					components: [
						{
							options: ["普通选项", "裸聊服务"],
							title: "投票",
						},
					],
					content: "提供兼 职-刷_单和代-办-假-证",
					title: "出售枪支",
					topics: ["日常", "网赌代理"],
				}),
			),
		).toEqual([
			{ field: "title", terms: ["出售枪支"] },
			{ field: "content", terms: ["兼职刷单", "代办假证"] },
			{ field: "topic", terms: ["网赌代理"] },
			{ field: "component", terms: ["裸聊服务"] },
		]);
	});
});
