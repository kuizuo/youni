import { describe, expect, test } from "bun:test";
import { parseRssItems } from "./actions";
import {
	automaticControl,
	canRunDailyAction,
	isActiveHour,
	isTrustedSource,
	nextRunDelayMinutes,
	validateGeneratedText,
} from "./policy";

test("自动分阶段开放账号", () => {
	expect(automaticControl(0)).toEqual({
		liveCreatorLimit: 3,
		mode: "shadow",
	});
	expect(automaticControl(3 * 86_400_000)).toEqual({
		liveCreatorLimit: 3,
		mode: "live",
	});
	expect(automaticControl(6 * 86_400_000)).toEqual({
		liveCreatorLimit: 6,
		mode: "live",
	});
	expect(automaticControl(9 * 86_400_000)).toEqual({
		liveCreatorLimit: 12,
		mode: "live",
	});
});

describe("创作者账号运行规则", () => {
	test("只在中国时区的白天运行", () => {
		expect(isActiveHour(new Date("2026-07-21T00:00:00Z"))).toBe(true);
		expect(isActiveHour(new Date("2026-07-21T15:00:00Z"))).toBe(false);
	});

	test("新闻来源只接受白名单域名", () => {
		expect(isTrustedSource("https://www.news.cn/tech/example.htm")).toBe(true);
		expect(isTrustedSource("https://news.example.com/story")).toBe(false);
	});

	test("拒绝高风险主题和虚构亲历", () => {
		expect(
			validateGeneratedText({ content: "我今天去了这家店", isNews: false }),
		).toContain("亲历");
		expect(
			validateGeneratedText({
				content: "分享一套整理桌面的方法",
				isNews: false,
			}),
		).toBeNull();
		expect(
			validateGeneratedText({ content: "今日股票观察", isNews: true }),
		).toContain("高风险");
	});

	test("频率和预算节流边界稳定", () => {
		expect(canRunDailyAction("like", 3)).toBe(true);
		expect(canRunDailyAction("like", 4)).toBe(false);
		expect(nextRunDelayMinutes(true, 0)).toBe(40);
		expect(nextRunDelayMinutes(true, 1)).toBe(120);
	});

	test("只从新闻订阅中读取可信标题和链接", () => {
		expect(
			parseRssItems(`
				<item><title><![CDATA[城市文化活动开幕]]></title><link>https://www.news.cn/culture/example.htm</link></item>
				<item><title>未知来源</title><link>https://example.com/news</link></item>
			`),
		).toEqual([
			{
				title: "城市文化活动开幕",
				url: "https://www.news.cn/culture/example.htm",
			},
		]);
	});
});
