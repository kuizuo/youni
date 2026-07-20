export type AgentActionType =
	| "view"
	| "like"
	| "collect"
	| "follow"
	| "comment"
	| "reply"
	| "publish"
	| "recheck";

export const trustedNewsDomains = [
	"news.cn",
	"xinhuanet.com",
	"people.com.cn",
	"cctv.com",
	"news.cctv.com",
	"chinanews.com.cn",
	"gov.cn",
	"miit.gov.cn",
	"mct.gov.cn",
	"sport.gov.cn",
] as const;

const prohibitedNewsTopics =
	/政治|选举|战争|灾难|地震|洪水|疫情|疾病|医疗|药物|股票|基金|投资|法律|诉讼/;
const falseExperienceClaims =
	/我(?:刚|今天|昨天|上周)?(?:去(?:了|过)|买(?:了|过)|参加(?:了|过)|到访|旅行|亲眼看见|在现场)|亲测|实测后|刚从.{0,12}回来/;

export function isActiveHour(date: Date) {
	const hourPart = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		hour12: false,
		timeZone: "Asia/Shanghai",
	})
		.formatToParts(date)
		.find((part) => part.type === "hour")?.value;
	const hour = Number(hourPart);
	return hour >= 8 && hour < 23;
}

export function isTrustedSource(value: string) {
	try {
		const hostname = new URL(value).hostname.toLowerCase();
		return trustedNewsDomains.some(
			(domain) => hostname === domain || hostname.endsWith(`.${domain}`),
		);
	} catch {
		return false;
	}
}

export function validateGeneratedText(input: {
	content: string;
	isNews: boolean;
	title?: string;
}) {
	const value = `${input.title ?? ""}\n${input.content}`;
	if (prohibitedNewsTopics.test(value)) return "内容涉及禁止的高风险主题";
	if (!input.isNews && falseExperienceClaims.test(value)) {
		return "生活内容包含未经允许的亲历声称";
	}
	return null;
}

const dailyCaps: Partial<Record<AgentActionType, number>> = {
	view: 20,
	like: 4,
	collect: 1,
	follow: 1,
	comment: 2,
	reply: 2,
	publish: 1,
};

export function canRunDailyAction(type: AgentActionType, count: number) {
	const cap = dailyCaps[type];
	return cap === undefined || count < cap;
}

export function automaticControl(elapsedMs: number) {
	const elapsedDays = elapsedMs / 86_400_000;
	if (elapsedDays < 3)
		return { liveCreatorLimit: 3 as const, mode: "shadow" as const };
	if (elapsedDays < 6)
		return { liveCreatorLimit: 3 as const, mode: "live" as const };
	if (elapsedDays < 9)
		return { liveCreatorLimit: 6 as const, mode: "live" as const };
	return { liveCreatorLimit: 12 as const, mode: "live" as const };
}

export function nextRunDelayMinutes(
	throttled: boolean,
	random = Math.random(),
) {
	const min = throttled ? 40 : 20;
	const max = throttled ? 120 : 90;
	return Math.round(min + random * (max - min));
}
