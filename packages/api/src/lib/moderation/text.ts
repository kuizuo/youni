import SensitiveWordTool from "sensitive-word-tool";

const BLOCKED_CONTENT_TERMS = [
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
	"你妈死了",
	"傻逼",
	"煞笔",
];

const blockedContentText = new SensitiveWordTool({
	wordList: BLOCKED_CONTENT_TERMS,
});

type ContentTextModerationInput = {
	advancedOptions: {
		contentDisclosure?: string | null;
	};
	components: Array<{
		options?: string[];
		title: string;
		value?: string;
	}>;
	content: string;
	locationName?: string;
	title: string;
	topics: string[];
};

function contentTextParts(input: ContentTextModerationInput) {
	const componentParts = input.components.flatMap((component) => [
		component.title,
		component.value ?? "",
		...(component.options ?? []),
	]);

	return [
		input.title,
		input.content,
		...input.topics,
		input.locationName ?? "",
		input.advancedOptions.contentDisclosure ?? "",
		...componentParts,
	];
}

export function hasBlockedContentText(input: ContentTextModerationInput) {
	return contentTextParts(input).some((part) =>
		blockedContentText.verify(part.normalize("NFKC")),
	);
}
