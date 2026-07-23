import { describe, expect, test } from "@jest/globals";

import {
	formatNoteShareDate,
	getDownloadedImageFileName,
	getPublicNoteUrl,
	getSavedImagesFeedback,
} from "../note-sharing";

describe("note sharing helpers", () => {
	test("builds public links and safe image filenames", () => {
		expect(getPublicNoteUrl("note-1")).toBe(
			"https://youni.kuizuo.me/note/note-1",
		);
		expect(
			getDownloadedImageFileName({
				batchId: 12,
				index: 1,
				noteId: "note-1",
				url: "https://cdn.example.com/photo.WEBP?size=full",
			}),
		).toBe("youni-note-note-1-12-2.webp");
		expect(formatNoteShareDate(new Date(2026, 6, 13, 1, 50))).toBe(
			"2026/07/13 01:50",
		);
	});

	test("describes complete, partial, and failed saves", () => {
		expect(getSavedImagesFeedback(3, 3)).toEqual({
			label: "已保存 3 张图片",
			variant: "success",
		});
		expect(getSavedImagesFeedback(2, 3)).toEqual({
			label: "已保存 2 张，1 张失败",
			variant: "warning",
		});
		expect(getSavedImagesFeedback(0, 3)).toEqual({
			label: "图片保存失败，请重试",
			variant: "danger",
		});
	});
});
