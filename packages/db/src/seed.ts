import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray, or } from "drizzle-orm";
import { closeDb, createDb } from "./index";
import {
	account,
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
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

const seedNotes = [
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

async function main() {
	const db = createDb();

	const seedNoteIds = seedNotes.map((item) => item.id);

	await db.delete(noteLike).where(inArray(noteLike.noteId, seedNoteIds));
	await db
		.delete(noteCollection)
		.where(inArray(noteCollection.noteId, seedNoteIds));
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

	for (const item of seedNotes) {
		const authorId = userIds.get(item.authorKey);
		if (!authorId) throw new Error(`Missing author ${item.authorKey}`);
		const cover = item.images[0];
		if (!cover) throw new Error(`Missing cover image for ${item.id}`);

		await db.insert(note).values({
			id: item.id,
			title: item.title,
			content: item.content,
			images: item.images,
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
	const momo = userIds.get("momo");
	const ash = userIds.get("ash");
	const admin = userIds.get("admin");
	const operator = userIds.get("operator");
	const nana = userIds.get("nana");
	const qiqi = userIds.get("qiqi");
	if (!lin || !momo || !ash || !admin || !operator || !nana || !qiqi) {
		throw new Error("Missing seed users");
	}

	await db.insert(comment).values([
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
			{ noteId: "seed-note-outfit", userId: ash },
			{ noteId: "seed-note-outfit", userId: qiqi },
			{ noteId: "seed-note-outfit", userId: admin },
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

	await db
		.insert(noteCollection)
		.values([
			{ noteId: "seed-note-outfit", userId: admin },
			{ noteId: "seed-note-brunch", userId: momo },
			{ noteId: "seed-note-citywalk", userId: lin },
			{ noteId: "seed-note-home-corner", userId: qiqi },
			{ noteId: "seed-note-skincare", userId: lin },
			{ noteId: "seed-note-coffee-shop", userId: nana },
			{ noteId: "seed-note-running", userId: momo },
			{ noteId: "seed-note-photo-light", userId: admin },
		])
		.onConflictDoNothing();

	await db
		.insert(follow)
		.values([
			{ followerId: lin, followingId: momo },
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

	console.log("Seed completed");
	console.log(`Admin: admin@youni.local / ${adminPassword}`);
	console.log(`Operator: operator@youni.local / ${adminPassword}`);
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
