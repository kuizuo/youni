import { describe, expect, test } from "bun:test";
import { findBlockedContentText } from "./text";

function noteInput(
	overrides: Partial<Parameters<typeof findBlockedContentText>[0]> = {},
): Parameters<typeof findBlockedContentText>[0] {
	return {
		advancedOptions: {},
		components: [],
		content: "记录周末露营时看到的日落。",
		title: "湖边露营",
		topics: ["旅行"],
		...overrides,
	};
}

describe("findBlockedContentText", () => {
	test("allows ordinary note text", () => {
		expect(findBlockedContentText(noteInput())).toEqual([]);
	});

	test("blocks a clear prohibited phrase in the title", () => {
		expect(
			findBlockedContentText(noteInput({ title: "提供兼职刷单，高额返利" })),
		).not.toEqual([]);
	});

	test("ignores punctuation and full-width spaces used to evade matching", () => {
		expect(
			findBlockedContentText(
				noteInput({ content: "可提供兼　职-刷_单，私信联系。" }),
			),
		).not.toEqual([]);
	});

	test("checks topics and other visible text fields", () => {
		expect(
			findBlockedContentText(
				noteInput({
					components: [{ title: "代-办-假-证" }],
				}),
			),
		).not.toEqual([]);
	});

	test("does not block general anti-fraud education", () => {
		expect(
			findBlockedContentText(
				noteInput({ content: "整理常见网络诈骗手法，提醒大家不要转账。" }),
			),
		).toEqual([]);
	});

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
