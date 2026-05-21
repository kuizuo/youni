import { hashPassword } from "better-auth/crypto";
import { and, eq, inArray } from "drizzle-orm";
import { createDb } from "./index";
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
	},
];

const seedTopics = ["穿搭", "美食", "周末", "旅行", "灵感", "好物", "咖啡"];

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
		id: "seed-note-audit",
		authorKey: "lin",
		status: "audit" as const,
		title: "新买的小众香氛，想写一篇使用感",
		content:
			"前调很清爽，后调更木质。图片先用链接记录，等后台审核通过后再公开展示。",
		images: [
			"https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=80",
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

const seedCommentIds = [
	"seed-comment-1",
	"seed-comment-2",
	"seed-comment-3",
	"seed-comment-4",
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
				status: "active",
			},
		})
		.returning({ id: user.id });

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
	await db.delete(comment).where(inArray(comment.id, seedCommentIds));
	await db.delete(noteTopic).where(inArray(noteTopic.noteId, seedNoteIds));
	await db.delete(note).where(inArray(note.id, seedNoteIds));

	const userIds = new Map<string, string>();
	for (const item of seedUsers) {
		userIds.set(item.key, await ensureUser(db, item));
	}

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

		await db.insert(note).values({
			id: item.id,
			title: item.title,
			content: item.content,
			images: item.images,
			cover: item.images[0],
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
	if (!lin || !momo || !ash || !admin) throw new Error("Missing seed users");

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
	]);

	await db
		.insert(noteLike)
		.values([
			{ noteId: "seed-note-outfit", userId: momo },
			{ noteId: "seed-note-outfit", userId: ash },
			{ noteId: "seed-note-brunch", userId: lin },
			{ noteId: "seed-note-citywalk", userId: lin },
			{ noteId: "seed-note-citywalk", userId: ash },
		])
		.onConflictDoNothing();

	await db
		.insert(noteCollection)
		.values([
			{ noteId: "seed-note-outfit", userId: admin },
			{ noteId: "seed-note-brunch", userId: momo },
			{ noteId: "seed-note-citywalk", userId: lin },
		])
		.onConflictDoNothing();

	await db
		.insert(follow)
		.values([
			{ followerId: lin, followingId: momo },
			{ followerId: momo, followingId: lin },
			{ followerId: ash, followingId: lin },
			{ followerId: admin, followingId: lin },
		])
		.onConflictDoNothing();

	console.log("Seed completed");
	console.log(`Admin: admin@youni.local / ${adminPassword}`);
	console.log(`Demo: lin@youni.local / ${demoPassword}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
