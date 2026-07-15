import { createDb } from "@youni/db";
import { prohibitedTerm } from "@youni/db/schema/index";
import { asc, desc, eq } from "drizzle-orm";

export const BUILTIN_PROHIBITED_TERMS = [
	"出售枪支",
	"购买枪支",
	"枪支货到付款",
	"弹药出售",
	"出售毒品",
	"购买毒品",
	"代购毒品",
	"毒品包邮",
	"制毒教程",
	"炸弹制作教程",
	"代办假证",
	"出售假证",
	"代开发票",
	"出售银行卡",
	"收购银行卡",
	"跑分平台招募",
	"洗钱通道",
	"招嫖",
	"同城援交",
	"裸聊服务",
	"成人视频资源",
	"出售成人视频",
	"儿童色情",
	"未成年色情",
	"博彩开户",
	"网赌代理",
	"赌博平台推广",
	"棋牌下注群",
	"兼职刷单",
	"刷单返利",
	"贷款先交保证金",
	"杀猪盘引流",
	"加入恐怖组织",
	"恐怖袭击教程",
	"操你妈",
	"草你妈",
	"你妈的",
	"你妈死了",
	"傻逼",
	"煞笔",
] as const;

export function normalizeProhibitedTerm(term: string) {
	return term.normalize("NFKC").trim();
}

export async function listProhibitedTerms() {
	return createDb()
		.select()
		.from(prohibitedTerm)
		.orderBy(desc(prohibitedTerm.isBuiltin), asc(prohibitedTerm.term));
}

export async function listProhibitedTermValues() {
	const rows = await createDb()
		.select({ term: prohibitedTerm.term })
		.from(prohibitedTerm);
	return rows.map((row) => row.term);
}

export async function addProhibitedTerm(term: string) {
	const [created] = await createDb()
		.insert(prohibitedTerm)
		.values({ term: normalizeProhibitedTerm(term) })
		.onConflictDoNothing({ target: prohibitedTerm.term })
		.returning({ term: prohibitedTerm.term });
	return { created: Boolean(created) };
}

export async function deleteProhibitedTerm(term: string) {
	const deleted = await createDb()
		.delete(prohibitedTerm)
		.where(eq(prohibitedTerm.term, normalizeProhibitedTerm(term)))
		.returning({ term: prohibitedTerm.term });
	return { deleted: deleted.length > 0 };
}

export async function restoreBuiltinProhibitedTerms() {
	await createDb()
		.insert(prohibitedTerm)
		.values(BUILTIN_PROHIBITED_TERMS.map((term) => ({ isBuiltin: true, term })))
		.onConflictDoUpdate({
			target: prohibitedTerm.term,
			set: { isBuiltin: true },
		});
	return { ok: true as const };
}
