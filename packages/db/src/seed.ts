import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray, or } from "drizzle-orm";
import { closeDb, createDb } from "./index";
import {
	account,
	comment,
	commentLike,
	directConversation,
	directConversationParticipant,
	directMessage,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
	notification,
	topic,
	user,
} from "./schema";

const now = new Date();
const adminPassword = "Admin123456";
const demoPassword = "Demo123456";

const seedUsers = [
	{
		key: "admin",
		id: "seed-user-admin",
		name: "Youni Admin",
		email: "admin@youni.local",
		handle: "youni_admin",
		bio: "内容审核与社区运营",
		image:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
		password: adminPassword,
		role: "admin" as const,
	},
	{
		key: "operator",
		id: "seed-user-operator",
		name: "Youni Operator",
		email: "operator@youni.local",
		handle: "youni_operator",
		bio: "社区内容运营",
		image:
			"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80",
		password: adminPassword,
		role: "operator" as const,
	},
	{
		key: "kuizuo",
		id: "seed-user-kuizuo",
		name: "愧怍",
		email: "kuizuo@youni.local",
		handle: "kuizuo",
		bio: "Youni 的产品体验测试账号。",
		image:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "lin",
		id: "seed-user-lin",
		name: "林一一",
		email: "lin@youni.local",
		handle: "lin_daily",
		bio: "记录穿搭、咖啡和周末散步。",
		image:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "momo",
		id: "seed-user-momo",
		name: "Momo",
		email: "momo@youni.local",
		handle: "momo_list",
		bio: "喜欢整理城市里的小灵感。",
		image:
			"https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "ash",
		id: "seed-user-ash",
		name: "阿树",
		email: "ash@youni.local",
		handle: "ash_weekend",
		bio: "周末出逃和简单食谱。",
		image:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "nana",
		id: "seed-user-nana",
		name: "Nana",
		email: "nana@youni.local",
		handle: "nana_home",
		bio: "家居角落、香氛和日常收纳。",
		image:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "qiqi",
		id: "seed-user-qiqi",
		name: "七七",
		email: "qiqi@youni.local",
		handle: "qiqi_notes",
		bio: "拍照、护肤和轻运动打卡。",
		image:
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
];

const seedTopics = [
	"穿搭",
	"美食",
	"周末",
	"旅行",
	"灵感",
	"好物",
	"咖啡",
	"家居",
	"护肤",
	"摄影",
	"运动",
];

type SeedImageMeta = { height: number; url: string; width: number };
type SeedNote = {
	authorKey: (typeof seedUsers)[number]["key"];
	content: string;
	id: string;
	imageMetas?: SeedImageMeta[];
	images: string[];
	publishedAt: Date | null;
	status: "audit" | "draft" | "hidden" | "published" | "rejected";
	title: string;
	topics: string[];
};

const seedImageSizes = [
	{ height: 1200, width: 900 },
	{ height: 900, width: 900 },
	{ height: 900, width: 1200 },
	{ height: 1350, width: 900 },
	{ height: 675, width: 1200 },
	{ height: 1100, width: 880 },
];

function unsplashPhoto(photoId: string, width: number, height: number) {
	return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

function imageMeta(url: string, width: number, height: number): SeedImageMeta {
	return { height, url, width };
}

function imageMetasForSeedNote(item: SeedNote, noteIndex: number) {
	if (item.imageMetas) return item.imageMetas;
	return item.images.map((url, imageIndex) => {
		const size =
			seedImageSizes[(noteIndex + imageIndex) % seedImageSizes.length];
		if (!size) throw new Error("Missing seed image size");
		return imageMeta(url, size.width, size.height);
	});
}

const masonryNoteSeeds = [
	{
		authorKey: "lin",
		height: 1200,
		photoId: "1515886657613-9f3515b0c78f",
		title: "白衬衫和牛仔裤，周一也能很轻松",
		topics: ["穿搭", "灵感"],
		width: 900,
	},
	{
		authorKey: "momo",
		height: 900,
		photoId: "1495474472287-4d71bcdd2085",
		title: "这杯冰拿铁的比例刚刚好",
		topics: ["咖啡", "周末"],
		width: 900,
	},
	{
		authorKey: "ash",
		height: 760,
		photoId: "1482049016688-2d3e1b311543",
		title: "十分钟早餐：烤吐司、鸡蛋和水果",
		topics: ["美食"],
		width: 1180,
	},
	{
		authorKey: "nana",
		height: 1350,
		photoId: "1519710164239-da123dc03ef4",
		title: "阅读角换了暖光灯，晚上安静很多",
		topics: ["家居", "好物"],
		width: 900,
	},
	{
		authorKey: "qiqi",
		height: 960,
		photoId: "1556228578-8c89e6adf883",
		title: "通勤包里只留三件护肤小物",
		topics: ["护肤", "好物"],
		width: 900,
	},
	{
		authorKey: "kuizuo",
		height: 675,
		photoId: "1497366754035-f200968a6e72",
		title: "把工作台清空后，思路也跟着清楚了",
		topics: ["灵感", "好物"],
		width: 1200,
	},
	{
		authorKey: "momo",
		height: 1280,
		photoId: "1500530855697-b586d89ba3ee",
		title: "傍晚散步，路过一片很柔和的光",
		topics: ["旅行", "摄影"],
		width: 900,
	},
	{
		authorKey: "ash",
		height: 900,
		photoId: "1502224562085-639556652f33",
		title: "晨跑结束后的空气很清醒",
		topics: ["运动", "周末"],
		width: 900,
	},
	{
		authorKey: "lin",
		height: 740,
		photoId: "1483985988355-763728e1935b",
		title: "逛店时看到一组低饱和配色",
		topics: ["穿搭", "好物"],
		width: 1180,
	},
	{
		authorKey: "nana",
		height: 1320,
		photoId: "1618220179428-22790b461013",
		title: "小户型边柜收纳，桌面终于不乱了",
		topics: ["家居"],
		width: 900,
	},
	{
		authorKey: "qiqi",
		height: 900,
		photoId: "1522335789203-aabd1fc54bc9",
		title: "周末补水面膜和一本书",
		topics: ["护肤", "周末"],
		width: 900,
	},
	{
		authorKey: "momo",
		height: 720,
		photoId: "1501339847302-ac426a4a7cbb",
		title: "社区咖啡店的靠窗位很适合久坐",
		topics: ["咖啡"],
		width: 1180,
	},
	{
		authorKey: "ash",
		height: 1250,
		photoId: "1517438322307-e67111335449",
		title: "酸奶碗里多加一点坚果更满足",
		topics: ["美食", "运动"],
		width: 900,
	},
	{
		authorKey: "lin",
		height: 900,
		photoId: "1492691527719-9d1e07e534b4",
		title: "拍照前先找干净背景",
		topics: ["摄影", "灵感"],
		width: 900,
	},
	{
		authorKey: "nana",
		height: 700,
		photoId: "1541643600914-78b084683601",
		title: "香氛放在玄关，回家第一秒就放松",
		topics: ["家居", "好物"],
		width: 1180,
	},
	{
		authorKey: "qiqi",
		height: 1260,
		photoId: "1524504388940-b1c1722653e1",
		title: "今天的轻运动打卡：拉伸二十分钟",
		topics: ["运动", "护肤"],
		width: 900,
	},
	{
		authorKey: "kuizuo",
		height: 900,
		photoId: "1497366811353-6870744d04b2",
		title: "会议记录整理成三行重点",
		topics: ["灵感"],
		width: 900,
	},
	{
		authorKey: "momo",
		height: 735,
		photoId: "1500534314209-a25ddb2bd429",
		title: "沿河走到天黑，城市慢慢安静下来",
		topics: ["旅行", "周末"],
		width: 1180,
	},
	{
		authorKey: "lin",
		height: 1280,
		photoId: "1544005313-94ddf0286df2",
		title: "黑白灰也可以有层次感",
		topics: ["穿搭"],
		width: 900,
	},
	{
		authorKey: "ash",
		height: 900,
		photoId: "1498804103079-a6351b050096",
		title: "冷萃偏清爽，下午喝刚好",
		topics: ["咖啡", "周末"],
		width: 900,
	},
	{
		authorKey: "nana",
		height: 720,
		photoId: "1534528741775-53994a69daeb",
		title: "给床头换了一束花",
		topics: ["家居", "灵感"],
		width: 1180,
	},
	{
		authorKey: "qiqi",
		height: 1320,
		photoId: "1527980965255-d3b416303d12",
		title: "护手霜和润唇膏是冬天的安全感",
		topics: ["护肤", "好物"],
		width: 900,
	},
	{
		authorKey: "momo",
		height: 900,
		photoId: "1494790108377-be9c29b29330",
		title: "今天遇到一个很会聊天的店主",
		topics: ["周末", "灵感"],
		width: 900,
	},
	{
		authorKey: "ash",
		height: 700,
		photoId: "1500648767791-00dcc994a43e",
		title: "背包轻一点，出门也更愿意走远一点",
		topics: ["旅行", "好物"],
		width: 1180,
	},
	{
		authorKey: "lin",
		height: 1300,
		photoId: "1508214751196-bcfd4ca60f91",
		title: "今天的妆面只保留一点光泽",
		topics: ["护肤", "穿搭"],
		width: 900,
	},
	{
		authorKey: "nana",
		height: 900,
		photoId: "1519710164239-da123dc03ef4",
		title: "把书按颜色排了一遍",
		topics: ["家居", "摄影"],
		width: 900,
	},
	{
		authorKey: "qiqi",
		height: 730,
		photoId: "1556228720-195a672e8a03",
		title: "早上出门前的精简流程",
		topics: ["护肤"],
		width: 1180,
	},
	{
		authorKey: "kuizuo",
		height: 1260,
		photoId: "1497366754035-f200968a6e72",
		title: "把待办拆小以后，下午推进得更顺",
		topics: ["灵感"],
		width: 900,
	},
	{
		authorKey: "momo",
		height: 900,
		photoId: "1500530855697-b586d89ba3ee",
		title: "晴天适合拍树影",
		topics: ["摄影", "周末"],
		width: 900,
	},
	{
		authorKey: "ash",
		height: 690,
		photoId: "1482049016688-2d3e1b311543",
		title: "把剩余食材做成开放三明治",
		topics: ["美食"],
		width: 1180,
	},
	{
		authorKey: "lin",
		height: 1300,
		photoId: "1515886657613-9f3515b0c78f",
		title: "长外套和运动鞋，走路很舒服",
		topics: ["穿搭", "旅行"],
		width: 900,
	},
	{
		authorKey: "nana",
		height: 900,
		photoId: "1618220179428-22790b461013",
		title: "给餐桌留白以后，吃饭更有仪式感",
		topics: ["家居", "美食"],
		width: 900,
	},
	{
		authorKey: "qiqi",
		height: 720,
		photoId: "1522335789203-aabd1fc54bc9",
		title: "睡前护肤只做两步",
		topics: ["护肤", "好物"],
		width: 1180,
	},
	{
		authorKey: "momo",
		height: 1280,
		photoId: "1501339847302-ac426a4a7cbb",
		title: "下午四点的咖啡店最安静",
		topics: ["咖啡", "摄影"],
		width: 900,
	},
	{
		authorKey: "ash",
		height: 900,
		photoId: "1502224562085-639556652f33",
		title: "今天跑完没有看配速，只看心情",
		topics: ["运动"],
		width: 900,
	},
	{
		authorKey: "lin",
		height: 700,
		photoId: "1483985988355-763728e1935b",
		title: "试衣间灯光不好，也能看出版型",
		topics: ["穿搭", "好物"],
		width: 1180,
	},
] satisfies Array<{
	authorKey: (typeof seedUsers)[number]["key"];
	height: number;
	photoId: string;
	title: string;
	topics: string[];
	width: number;
}>;

const masonrySeedNotes: SeedNote[] = masonryNoteSeeds.map((item, index) => {
	const url = unsplashPhoto(item.photoId, item.width, item.height);
	return {
		id: `seed-note-masonry-${String(index + 1).padStart(2, "0")}`,
		authorKey: item.authorKey,
		status: "published",
		title: item.title,
		content:
			"这条内容用于本地发现页瀑布流和无限下拉测试。封面比例刻意做了差异，方便直观看到两列列表的真实高度变化。",
		images: [url],
		imageMetas: [imageMeta(url, item.width, item.height)],
		topics: item.topics,
		publishedAt: new Date(now.getTime() - 1000 * 60 * (30 + index * 17)),
	};
});

const seedNotes: SeedNote[] = [
	{
		id: "seed-note-kuizuo-inspiration",
		authorKey: "kuizuo",
		status: "published" as const,
		title: "把消息中心整理成更清楚的三类入口",
		content:
			"今天想把互动消息分成赞和收藏、关注、评论三类。这样打开消息页时，可以一眼知道哪里有新动态。",
		images: [
			"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["灵感", "好物"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 24),
	},
	{
		id: "seed-note-outfit",
		authorKey: "lin",
		status: "published" as const,
		title: "初夏通勤穿搭：蓝白衬衫和低饱和配色",
		content:
			"最近很喜欢蓝白组合，干净、轻盈，也适合通勤。包和鞋都选了低饱和色，整体会更柔和。",
		images: [
			"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["穿搭", "好物", "灵感"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 18),
	},
	{
		id: "seed-note-brunch",
		authorKey: "ash",
		status: "published" as const,
		title: "周末早午餐清单：牛油果吐司和冰拿铁",
		content:
			"不想排队的时候就在家做早午餐。吐司烤脆，鸡蛋半熟，冰拿铁多放一点奶，十分钟就能开吃。",
		images: [
			"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["美食", "周末", "咖啡"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 10),
	},
	{
		id: "seed-note-citywalk",
		authorKey: "momo",
		status: "published" as const,
		title: "城市散步路线：傍晚去河边看日落",
		content:
			"从老街一路走到河边，傍晚的光线很好。适合拍照，也适合一个人慢慢走。",
		images: [
			"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["旅行", "周末", "灵感"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 4),
	},
	{
		id: "seed-note-home-corner",
		authorKey: "nana",
		status: "published" as const,
		title: "把卧室角落改成小阅读区，晚上很放松",
		content:
			"只换了落地灯、地毯和一个窄边柜，角落马上安静很多。晚上关主灯，只开暖光灯，适合看书和整理照片。",
		images: [
			"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["家居", "好物", "灵感"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 7),
	},
	{
		id: "seed-note-skincare",
		authorKey: "qiqi",
		status: "published" as const,
		title: "出门前 5 分钟护肤包：精简但够用",
		content:
			"最近包里只留防晒、润唇膏和小支护手霜。少带一点反而更容易坚持，也不会每天换包忘东西。",
		images: [
			"https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["护肤", "好物", "灵感"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
	},
	{
		id: "seed-note-coffee-shop",
		authorKey: "momo",
		status: "published" as const,
		title: "一家适合久坐的社区咖啡店",
		content:
			"座位间距舒服，下午阳光会落在靠窗位置。冷萃偏清爽，带电脑坐两小时也不会觉得吵。",
		images: [
			"https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["咖啡", "周末", "摄影"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 22),
	},
	{
		id: "seed-note-running",
		authorKey: "ash",
		status: "published" as const,
		title: "晨跑 3 公里以后，早餐会变得更好吃",
		content:
			"路线不用复杂，固定一条小路更容易坚持。今天配了酸奶碗和香蕉，补充完能量再开始工作。",
		images: [
			"https://images.unsplash.com/photo-1502224562085-639556652f33?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1517438322307-e67111335449?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["运动", "美食", "周末"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 28),
	},
	{
		id: "seed-note-photo-light",
		authorKey: "lin",
		status: "published" as const,
		title: "手机拍照的小技巧：先找一块干净的光",
		content:
			"不用急着套滤镜。先看光线是不是柔和，背景有没有杂物，再让主体靠近窗边，照片会自然很多。",
		images: [
			"https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["摄影", "灵感", "好物"],
		publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 34),
	},
	{
		id: "seed-note-audit",
		authorKey: "lin",
		status: "audit" as const,
		title: "新买的小众香氛，想写一篇使用感",
		content:
			"前调很清爽，后调更木质。图片先用链接记录，等后台审核通过后再公开展示。",
		images: [
			"https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["好物", "灵感"],
		publishedAt: null,
	},
	{
		id: "seed-note-hidden",
		authorKey: "momo",
		status: "hidden" as const,
		title: "这篇用于后台隐藏状态演示",
		content: "后台可以看到隐藏内容，Native 公开信息流不会展示。",
		images: [
			"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
		],
		topics: ["运营"],
		publishedAt: null,
	},
	...masonrySeedNotes,
];

const seedConversations = [
	{
		id: "seed-conversation-kuizuo-lin",
		members: ["kuizuo", "lin"] as const,
		messages: [
			{
				id: "seed-message-kuizuo-lin-1",
				senderKey: "lin",
				content: "我看到了新的消息分类，入口比之前清楚很多。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 18),
			},
			{
				id: "seed-message-kuizuo-lin-2",
				senderKey: "kuizuo",
				content: "我也想看看评论回复和通知列表的效果。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 15),
			},
			{
				id: "seed-message-kuizuo-lin-3",
				senderKey: "lin",
				content: "我给你的笔记留了几条评论，方便测试。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 12),
			},
		],
	},
	{
		id: "seed-conversation-lin-momo",
		members: ["lin", "momo"] as const,
		messages: [
			{
				id: "seed-message-lin-momo-1",
				senderKey: "momo",
				content: "你那条手机拍照技巧很有用，我今晚试了一下。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 40),
			},
			{
				id: "seed-message-lin-momo-2",
				senderKey: "lin",
				content: "先找干净光线就会好很多，拍完可以发我看看。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 36),
			},
			{
				id: "seed-message-lin-momo-3",
				senderKey: "momo",
				content: "好，我明天整理一下城市散步路线也发你。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 28),
			},
		],
	},
	{
		id: "seed-conversation-lin-ash",
		members: ["lin", "ash"] as const,
		messages: [
			{
				id: "seed-message-lin-ash-1",
				senderKey: "ash",
				content: "周末早午餐那篇你要不要一起补几张图？",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3),
			},
			{
				id: "seed-message-lin-ash-2",
				senderKey: "lin",
				content: "可以，我有一组咖啡店照片，晚上发你。",
				createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2.8),
			},
		],
	},
];

async function ensureUser(
	db: ReturnType<typeof createDb>,
	item: (typeof seedUsers)[number],
) {
	const [row] = await db
		.insert(user)
		.values({
			id: item.id,
			name: item.name,
			email: item.email,
			emailVerified: true,
			handle: item.handle,
			bio: item.bio,
			image: item.image,
			role: item.role,
			status: "active",
		})
		.onConflictDoUpdate({
			target: user.email,
			set: {
				name: item.name,
				emailVerified: true,
				handle: item.handle,
				bio: item.bio,
				image: item.image,
				role: item.role,
				status: "active",
			},
		})
		.returning({ id: user.id });

	if (!row) {
		throw new Error(`Failed to seed user ${item.email}`);
	}

	const password = await hashPassword(item.password);
	const existing = await db
		.select({ id: account.id })
		.from(account)
		.where(
			and(eq(account.userId, row.id), eq(account.providerId, "credential")),
		)
		.limit(1);

	if (existing[0]) {
		await db
			.update(account)
			.set({
				accountId: row.id,
				password,
				updatedAt: now,
			})
			.where(eq(account.id, existing[0].id));
	} else {
		await db.insert(account).values({
			id: `seed-account-${item.key}`,
			accountId: row.id,
			providerId: "credential",
			userId: row.id,
			password,
			createdAt: now,
			updatedAt: now,
		});
	}

	return row.id;
}

function chunks<T>(items: T[], size: number) {
	const result: T[][] = [];
	for (let index = 0; index < items.length; index += size) {
		result.push(items.slice(index, index + size));
	}
	return result;
}

async function main() {
	const db = createDb();

	const seedNoteIds = seedNotes.map((item) => item.id);
	const seedConversationIds = seedConversations.map((item) => item.id);
	const seedCommentIds = [
		"seed-comment-kuizuo-1",
		"seed-comment-kuizuo-2",
		"seed-comment-kuizuo-3",
		"seed-comment-kuizuo-4",
		"seed-comment-kuizuo-5",
		"seed-comment-kuizuo-6",
		"seed-comment-1",
		"seed-comment-2",
		"seed-comment-3",
		"seed-comment-4",
		"seed-comment-5",
		"seed-comment-6",
		"seed-comment-7",
		"seed-comment-8",
	];

	await db
		.delete(directMessage)
		.where(inArray(directMessage.conversationId, seedConversationIds));
	await db
		.delete(directConversationParticipant)
		.where(
			inArray(
				directConversationParticipant.conversationId,
				seedConversationIds,
			),
		);
	await db
		.delete(directConversation)
		.where(inArray(directConversation.id, seedConversationIds));
	await db.delete(noteLike).where(inArray(noteLike.noteId, seedNoteIds));
	await db
		.delete(noteCollection)
		.where(inArray(noteCollection.noteId, seedNoteIds));
	await db
		.delete(commentLike)
		.where(inArray(commentLike.commentId, seedCommentIds));
	await db.delete(comment).where(inArray(comment.noteId, seedNoteIds));
	await db.delete(noteTopic).where(inArray(noteTopic.noteId, seedNoteIds));
	await db.delete(note).where(inArray(note.id, seedNoteIds));

	const userIds = new Map<string, string>();
	for (const item of seedUsers) {
		userIds.set(item.key, await ensureUser(db, item));
	}
	const seedUserIds = [...userIds.values()];

	await db
		.delete(follow)
		.where(
			or(
				inArray(follow.followerId, seedUserIds),
				inArray(follow.followingId, seedUserIds),
			),
		);
	await db
		.delete(notification)
		.where(
			or(
				inArray(notification.recipientId, seedUserIds),
				inArray(notification.actorId, seedUserIds),
			),
		);

	for (const name of [...seedTopics, "运营"]) {
		await db
			.insert(topic)
			.values({ id: `seed-topic-${name}`, name })
			.onConflictDoNothing({ target: topic.name });
	}

	const topicRows = await db
		.select({ id: topic.id, name: topic.name })
		.from(topic);
	const topicIds = new Map(topicRows.map((item) => [item.name, item.id]));

	for (const [noteIndex, item] of seedNotes.entries()) {
		const authorId = userIds.get(item.authorKey);
		if (!authorId) throw new Error(`Missing author ${item.authorKey}`);
		const cover = item.images[0];
		if (!cover) throw new Error(`Missing cover image for ${item.id}`);
		const imageMetas = imageMetasForSeedNote(item, noteIndex);

		await db.insert(note).values({
			id: item.id,
			title: item.title,
			content: item.content,
			images: item.images,
			imageMetas,
			cover,
			status: item.status,
			publishedAt: item.publishedAt,
			userId: authorId,
			createdAt: item.publishedAt ?? now,
			updatedAt: now,
		});

		const pairs = item.topics
			.map((name) => topicIds.get(name))
			.filter((id): id is string => Boolean(id))
			.map((topicId) => ({ noteId: item.id, topicId }));
		if (pairs.length > 0) {
			await db.insert(noteTopic).values(pairs).onConflictDoNothing();
		}
	}

	const lin = userIds.get("lin");
	const kuizuo = userIds.get("kuizuo");
	const momo = userIds.get("momo");
	const ash = userIds.get("ash");
	const admin = userIds.get("admin");
	const operator = userIds.get("operator");
	const nana = userIds.get("nana");
	const qiqi = userIds.get("qiqi");
	if (
		!lin ||
		!kuizuo ||
		!momo ||
		!ash ||
		!admin ||
		!operator ||
		!nana ||
		!qiqi
	) {
		throw new Error("Missing seed users");
	}
	const engagementUserIds = [
		lin,
		momo,
		ash,
		nana,
		qiqi,
		admin,
		operator,
		kuizuo,
	];

	await db.insert(comment).values([
		{
			id: "seed-comment-kuizuo-1",
			noteId: "seed-note-kuizuo-inspiration",
			userId: lin,
			content: "这个分类很直观，我第一眼就知道该看哪里。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 22),
		},
		{
			id: "seed-comment-kuizuo-2",
			noteId: "seed-note-kuizuo-inspiration",
			parentId: "seed-comment-kuizuo-1",
			userId: momo,
			content: "同意，赞和收藏放一起很适合快速扫一眼。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 20),
		},
		{
			id: "seed-comment-kuizuo-3",
			noteId: "seed-note-kuizuo-inspiration",
			parentId: "seed-comment-kuizuo-1",
			userId: kuizuo,
			content: "这条回复用来测试作者删除自己的评论。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 18),
		},
		{
			id: "seed-comment-kuizuo-4",
			noteId: "seed-note-kuizuo-inspiration",
			userId: ash,
			content: "评论列表支持展开以后，消息会完整很多。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 16),
		},
		{
			id: "seed-comment-kuizuo-5",
			noteId: "seed-note-kuizuo-inspiration",
			parentId: "seed-comment-kuizuo-4",
			userId: qiqi,
			content: "这里也顺便测试一下子评论点赞。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 14),
		},
		{
			id: "seed-comment-kuizuo-6",
			noteId: "seed-note-kuizuo-inspiration",
			parentId: "seed-comment-kuizuo-3",
			userId: lin,
			content: "回复你的评论，消息列表里应该能直接看到。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 13),
		},
		{
			id: "seed-comment-1",
			noteId: "seed-note-outfit",
			userId: momo,
			content: "这个配色很清爽，通勤可以直接参考。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3),
		},
		{
			id: "seed-comment-2",
			noteId: "seed-note-outfit",
			userId: ash,
			content: "包的颜色和衬衫很搭。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
		},
		{
			id: "seed-comment-3",
			noteId: "seed-note-brunch",
			userId: lin,
			content: "这个早午餐看起来很适合周末。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 45),
		},
		{
			id: "seed-comment-4",
			noteId: "seed-note-citywalk",
			userId: admin,
			content: "路线和图片都很适合首页推荐。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 20),
		},
		{
			id: "seed-comment-5",
			noteId: "seed-note-home-corner",
			userId: lin,
			content: "这个灯光氛围很好，想参考一下边柜尺寸。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 35),
		},
		{
			id: "seed-comment-6",
			noteId: "seed-note-skincare",
			userId: momo,
			content: "精简包很实用，通勤真的需要少一点。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 50),
		},
		{
			id: "seed-comment-7",
			noteId: "seed-note-coffee-shop",
			userId: qiqi,
			content: "靠窗位置看起来很舒服，下次周末去试试。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 75),
		},
		{
			id: "seed-comment-8",
			noteId: "seed-note-photo-light",
			userId: nana,
			content: "先找光这点太有用了，照片干净很多。",
			createdAt: new Date(now.getTime() - 1000 * 60 * 95),
		},
	]);

	await db
		.insert(noteLike)
		.values([
			{ noteId: "seed-note-outfit", userId: momo },
			{ noteId: "seed-note-kuizuo-inspiration", userId: lin },
			{ noteId: "seed-note-kuizuo-inspiration", userId: momo },
			{ noteId: "seed-note-kuizuo-inspiration", userId: ash },
			{ noteId: "seed-note-outfit", userId: ash },
			{ noteId: "seed-note-outfit", userId: qiqi },
			{ noteId: "seed-note-outfit", userId: admin },
			{ noteId: "seed-note-kuizuo-inspiration", userId: qiqi },
			{ noteId: "seed-note-brunch", userId: lin },
			{ noteId: "seed-note-brunch", userId: momo },
			{ noteId: "seed-note-brunch", userId: nana },
			{ noteId: "seed-note-citywalk", userId: lin },
			{ noteId: "seed-note-citywalk", userId: ash },
			{ noteId: "seed-note-citywalk", userId: qiqi },
			{ noteId: "seed-note-home-corner", userId: lin },
			{ noteId: "seed-note-home-corner", userId: momo },
			{ noteId: "seed-note-home-corner", userId: qiqi },
			{ noteId: "seed-note-skincare", userId: lin },
			{ noteId: "seed-note-skincare", userId: momo },
			{ noteId: "seed-note-coffee-shop", userId: ash },
			{ noteId: "seed-note-coffee-shop", userId: qiqi },
			{ noteId: "seed-note-running", userId: lin },
			{ noteId: "seed-note-running", userId: nana },
			{ noteId: "seed-note-photo-light", userId: momo },
			{ noteId: "seed-note-photo-light", userId: ash },
			{ noteId: "seed-note-photo-light", userId: qiqi },
		])
		.onConflictDoNothing();
	const masonryLikeRows = masonrySeedNotes.flatMap((item, index) =>
		engagementUserIds
			.slice(0, (index % 5) + 1)
			.map((userId) => ({ noteId: item.id, userId })),
	);
	if (masonryLikeRows.length > 0) {
		for (const rows of chunks(masonryLikeRows, 40)) {
			await db.insert(noteLike).values(rows).onConflictDoNothing();
		}
	}

	await db
		.insert(noteCollection)
		.values([
			{ noteId: "seed-note-outfit", userId: admin },
			{ noteId: "seed-note-kuizuo-inspiration", userId: momo },
			{ noteId: "seed-note-kuizuo-inspiration", userId: nana },
			{ noteId: "seed-note-brunch", userId: momo },
			{ noteId: "seed-note-citywalk", userId: lin },
			{ noteId: "seed-note-home-corner", userId: qiqi },
			{ noteId: "seed-note-skincare", userId: lin },
			{ noteId: "seed-note-coffee-shop", userId: nana },
			{ noteId: "seed-note-running", userId: momo },
			{ noteId: "seed-note-photo-light", userId: admin },
		])
		.onConflictDoNothing();
	const masonryCollectionRows = masonrySeedNotes.flatMap((item, index) =>
		engagementUserIds
			.slice(0, index % 3)
			.map((userId) => ({ noteId: item.id, userId })),
	);
	if (masonryCollectionRows.length > 0) {
		for (const rows of chunks(masonryCollectionRows, 40)) {
			await db.insert(noteCollection).values(rows).onConflictDoNothing();
		}
	}

	await db
		.insert(follow)
		.values([
			{ followerId: lin, followingId: momo },
			{ followerId: lin, followingId: kuizuo },
			{ followerId: momo, followingId: kuizuo },
			{ followerId: ash, followingId: kuizuo },
			{ followerId: momo, followingId: lin },
			{ followerId: ash, followingId: lin },
			{ followerId: admin, followingId: lin },
			{ followerId: nana, followingId: lin },
			{ followerId: nana, followingId: momo },
			{ followerId: qiqi, followingId: nana },
			{ followerId: lin, followingId: qiqi },
			{ followerId: momo, followingId: ash },
		])
		.onConflictDoNothing();

	await db
		.insert(commentLike)
		.values([
			{ commentId: "seed-comment-kuizuo-1", userId: kuizuo },
			{ commentId: "seed-comment-kuizuo-1", userId: momo },
			{ commentId: "seed-comment-kuizuo-2", userId: lin },
			{ commentId: "seed-comment-kuizuo-4", userId: kuizuo },
			{ commentId: "seed-comment-kuizuo-5", userId: momo },
			{ commentId: "seed-comment-kuizuo-3", userId: momo },
		])
		.onConflictDoNothing();

	await db.insert(notification).values([
		{
			id: "seed-notification-kuizuo-like",
			recipientId: kuizuo,
			actorId: lin,
			type: "like",
			category: "activity",
			title: "林一一 赞了你的笔记",
			body: "把消息中心整理成更清楚的三类入口",
			targetType: "note",
			targetId: "seed-note-kuizuo-inspiration",
			noteId: "seed-note-kuizuo-inspiration",
			dedupeKey: "seed:kuizuo:like:lin:seed-note-kuizuo-inspiration",
			isRead: false,
			isDeleted: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 21),
			updatedAt: now,
		},
		{
			id: "seed-notification-kuizuo-collect",
			recipientId: kuizuo,
			actorId: momo,
			type: "collect",
			category: "activity",
			title: "Momo 收藏了你的笔记",
			body: "把消息中心整理成更清楚的三类入口",
			targetType: "note",
			targetId: "seed-note-kuizuo-inspiration",
			noteId: "seed-note-kuizuo-inspiration",
			dedupeKey: "seed:kuizuo:collect:momo:seed-note-kuizuo-inspiration",
			isRead: false,
			isDeleted: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 19),
			updatedAt: now,
		},
		{
			id: "seed-notification-kuizuo-follow",
			recipientId: kuizuo,
			actorId: ash,
			type: "follow",
			category: "followers",
			title: "阿树 开始关注你",
			body: "周末出逃和简单食谱。",
			targetType: "user",
			targetId: ash,
			dedupeKey: "seed:kuizuo:follow:ash",
			isRead: false,
			isDeleted: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 17),
			updatedAt: now,
		},
		{
			id: "seed-notification-kuizuo-comment",
			recipientId: kuizuo,
			actorId: lin,
			type: "comment",
			category: "activity",
			title: "林一一 评论了你的内容",
			body: "这个分类很直观，我第一眼就知道该看哪里。",
			targetType: "comment",
			targetId: "seed-comment-kuizuo-1",
			noteId: "seed-note-kuizuo-inspiration",
			dedupeKey: "seed:kuizuo:comment:lin:seed-comment-kuizuo-1",
			isRead: false,
			isDeleted: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 15),
			updatedAt: now,
		},
		{
			id: "seed-notification-kuizuo-comment-reply",
			recipientId: kuizuo,
			actorId: lin,
			type: "comment",
			category: "activity",
			title: "林一一 回复了你的评论",
			body: "回复你的评论，消息列表里应该能直接看到。",
			targetType: "comment",
			targetId: "seed-comment-kuizuo-6",
			noteId: "seed-note-kuizuo-inspiration",
			dedupeKey: "seed:kuizuo:comment:lin:seed-comment-kuizuo-6",
			isRead: false,
			isDeleted: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 13),
			updatedAt: now,
		},
		{
			id: "seed-notification-kuizuo-comment-like",
			recipientId: kuizuo,
			actorId: momo,
			type: "like",
			category: "activity",
			title: "Momo 赞了你的评论",
			body: "这条回复用来测试作者删除自己的评论。",
			targetType: "comment",
			targetId: "seed-comment-kuizuo-3",
			noteId: "seed-note-kuizuo-inspiration",
			dedupeKey: "seed:kuizuo:like:momo:seed-comment-kuizuo-3",
			isRead: false,
			isDeleted: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 11),
			updatedAt: now,
		},
	]);

	for (const item of seedConversations) {
		const memberIds = item.members.map((key) => userIds.get(key));
		if (memberIds.some((id) => !id)) {
			throw new Error(`Missing conversation members for ${item.id}`);
		}
		const typedMemberIds = memberIds as [string, string];
		const updatedAt =
			item.messages.at(-1)?.createdAt ??
			new Date(now.getTime() - 1000 * 60 * 5);

		await db.insert(directConversation).values({
			id: item.id,
			memberKey: [...typedMemberIds].sort().join(":"),
			createdAt: item.messages[0]?.createdAt ?? updatedAt,
			updatedAt,
		});
		await db
			.insert(directConversationParticipant)
			.values(
				typedMemberIds.map((userId) => ({
					conversationId: item.id,
					userId,
					lastReadAt: userId === lin ? updatedAt : null,
					createdAt: item.messages[0]?.createdAt ?? updatedAt,
					updatedAt,
				})),
			)
			.onConflictDoNothing();
		await db.insert(directMessage).values(
			item.messages.map((message) => {
				const senderId = userIds.get(message.senderKey);
				if (!senderId) {
					throw new Error(`Missing sender ${message.senderKey}`);
				}
				return {
					id: message.id,
					conversationId: item.id,
					senderId,
					content: message.content,
					createdAt: message.createdAt,
					updatedAt: message.createdAt,
				};
			}),
		);
	}

	console.log("Seed completed");
	console.log(`Admin: admin@youni.local / ${adminPassword}`);
	console.log(`Operator: operator@youni.local / ${adminPassword}`);
	console.log(`Demo: kuizuo@youni.local / ${demoPassword}`);
	console.log(`Demo: lin@youni.local / ${demoPassword}`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await closeDb();
	});
