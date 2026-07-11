import { hashPassword } from "better-auth/crypto";
import { and, eq, like, or, sql } from "drizzle-orm";
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

const minutesAgo = (minutes: number) =>
	new Date(now.getTime() - 1000 * 60 * minutes);
const hoursAgo = (hours: number) => minutesAgo(hours * 60);
const daysAgo = (days: number) => hoursAgo(days * 24);

const seedUsers = [
	{
		key: "admin",
		id: "seed-user-admin",
		name: "Youni Admin",
		email: "admin@youni.app",
		handle: "youni_admin",
		bio: "维护社区内容与演示数据。",
		image:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
		password: adminPassword,
		role: "admin" as const,
	},
	{
		key: "test",
		id: "seed-user-test",
		name: "Test",
		email: "test@youni.app",
		handle: "test",
		bio: "记录产品灵感和日常片段。",
		image:
			"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "lin",
		id: "seed-user-lin",
		name: "林一一",
		email: "lin@youni.app",
		handle: "lin_daily",
		bio: "喜欢散步、咖啡和随手拍。",
		image:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
	{
		key: "momo",
		id: "seed-user-momo",
		name: "Momo",
		email: "momo@youni.app",
		handle: "momo_life",
		bio: "分享简单料理和舒服的居家角落。",
		image:
			"https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=240&q=80",
		password: demoPassword,
		role: "user" as const,
	},
] as const;

const seedTopics = ["日常", "周末", "咖啡", "美食", "家居", "摄影"];

type SeedImage = {
	height: number;
	photoId: string;
	width: number;
};

type SeedNote = {
	authorKey: (typeof seedUsers)[number]["key"];
	content: string;
	id: string;
	images: SeedImage[];
	publishedAt: Date | null;
	status: "audit" | "published";
	title: string;
	topics: string[];
};

function imageUrl(image: SeedImage) {
	return `https://images.unsplash.com/photo-${image.photoId}?auto=format&fit=crop&w=${image.width}&h=${image.height}&q=80`;
}

const seedNotes: SeedNote[] = [
	{
		id: "seed-note-balcony-mint",
		authorKey: "test",
		status: "published",
		title: "周末给阳台添了一盆薄荷",
		content:
			"换盆以后浇了一点水，傍晚经过阳台时能闻到很淡的清香。准备下次摘几片泡进柠檬水。",
		images: [
			{ photoId: "1416879595882-3373a0480b5b", width: 900, height: 1200 },
		],
		topics: ["日常", "周末", "家居"],
		publishedAt: hoursAgo(2),
	},
	{
		id: "seed-note-morning-coffee",
		authorKey: "lin",
		status: "published",
		title: "早起十分钟，慢慢喝完一杯咖啡",
		content:
			"今天没有边走边喝，坐在窗边把早餐吃完才出门。普通的工作日也因此松弛了一点。",
		images: [
			{ photoId: "1495474472287-4d71bcdd2085", width: 1000, height: 1000 },
		],
		topics: ["日常", "咖啡"],
		publishedAt: hoursAgo(7),
	},
	{
		id: "seed-note-weekend-brunch",
		authorKey: "momo",
		status: "published",
		title: "冰箱里的食材刚好拼成一份早午餐",
		content:
			"吐司烤到边缘微脆，配上鸡蛋和水果。没有复杂步骤，十五分钟就能端上桌。",
		images: [
			{ photoId: "1482049016688-2d3e1b311543", width: 1200, height: 900 },
			{ photoId: "1498837167922-ddd27525d352", width: 900, height: 1200 },
		],
		topics: ["美食", "周末"],
		publishedAt: daysAgo(1),
	},
	{
		id: "seed-note-evening-walk",
		authorKey: "lin",
		status: "published",
		title: "傍晚散步时遇到一小片晚霞",
		content:
			"沿着熟悉的路走了一圈，没有特意安排路线。回家前抬头看见天空变成了很柔和的橙色。",
		images: [
			{ photoId: "1500530855697-b586d89ba3ee", width: 900, height: 1200 },
		],
		topics: ["日常", "摄影"],
		publishedAt: daysAgo(2),
	},
	{
		id: "seed-note-reading-corner",
		authorKey: "momo",
		status: "published",
		title: "把窗边整理成了一个小阅读角",
		content:
			"只留下台灯、靠垫和正在读的书。东西少一点以后，这个角落反而更愿意每天坐一会儿。",
		images: [
			{ photoId: "1519710164239-da123dc03ef4", width: 900, height: 1200 },
		],
		topics: ["家居", "日常"],
		publishedAt: daysAgo(3),
	},
	{
		id: "seed-note-cookie-audit",
		authorKey: "lin",
		status: "audit",
		title: "第一次烤曲奇，形状不完美但很香",
		content:
			"照着简单配方做了一小盘，边缘比预想中更酥。下次准备少放一点糖，再试试加入坚果。",
		images: [{ photoId: "1558961363-fa8fdf82db35", width: 1200, height: 900 }],
		topics: ["美食", "日常"],
		publishedAt: null,
	},
];

async function ensureUser(
	db: ReturnType<typeof createDb>,
	item: (typeof seedUsers)[number],
) {
	const [existingUser] = await db
		.select({ id: user.id })
		.from(user)
		.where(
			or(
				eq(user.id, item.id),
				eq(user.email, item.email),
				eq(user.handle, item.handle),
			),
		)
		.orderBy(
			sql`case when ${user.id} = ${item.id} then 0 when ${user.email} = ${item.email} then 1 else 2 end`,
		)
		.limit(1);

	const values = {
		name: item.name,
		email: item.email,
		emailVerified: true,
		handle: item.handle,
		bio: item.bio,
		image: item.image,
		role: item.role,
		status: "active" as const,
	};

	const [row] = existingUser
		? await db
				.update(user)
				.set(values)
				.where(eq(user.id, existingUser.id))
				.returning({ id: user.id })
		: await db
				.insert(user)
				.values({ id: item.id, ...values })
				.returning({ id: user.id });

	if (!row) throw new Error(`Failed to seed user ${item.email}`);

	const password = await hashPassword(item.password);
	const [credential] = await db
		.select({ id: account.id })
		.from(account)
		.where(
			and(eq(account.userId, row.id), eq(account.providerId, "credential")),
		)
		.limit(1);

	if (credential) {
		await db
			.update(account)
			.set({ accountId: row.id, password, updatedAt: now })
			.where(eq(account.id, credential.id));
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

async function clearPreviousSeed(db: ReturnType<typeof createDb>) {
	await db
		.delete(directConversation)
		.where(like(directConversation.id, "seed-%"));
	await db.delete(notification).where(like(notification.id, "seed-%"));
	await db.delete(note).where(like(note.id, "seed-%"));
	await db.delete(topic).where(like(topic.id, "seed-topic-%"));
	await db.delete(user).where(like(user.id, "seed-user-%"));
}

function requireUser(userIds: Map<string, string>, key: string) {
	const id = userIds.get(key);
	if (!id) throw new Error(`Missing seed user ${key}`);
	return id;
}

export async function seedDatabase(database?: D1Database) {
	const db = createDb(database);
	await clearPreviousSeed(db);

	const userIds = new Map<string, string>();
	for (const item of seedUsers) {
		userIds.set(item.key, await ensureUser(db, item));
	}

	for (const name of seedTopics) {
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
		const authorId = requireUser(userIds, item.authorKey);
		const urls = item.images.map(imageUrl);
		const cover = urls[0];
		if (!cover) throw new Error(`Missing cover for ${item.id}`);

		await db.insert(note).values({
			id: item.id,
			title: item.title,
			content: item.content,
			images: urls,
			imageMetas: item.images.map((image, index) => ({
				height: image.height,
				url: urls[index] ?? cover,
				width: image.width,
			})),
			cover,
			status: item.status,
			publishedAt: item.publishedAt,
			userId: authorId,
			createdAt: item.publishedAt ?? now,
			updatedAt: now,
		});

		const noteTopics = item.topics.flatMap((name) => {
			const topicId = topicIds.get(name);
			return topicId ? [{ noteId: item.id, topicId }] : [];
		});
		if (noteTopics.length > 0) {
			await db.insert(noteTopic).values(noteTopics).onConflictDoNothing();
		}
	}

	const test = requireUser(userIds, "test");
	const lin = requireUser(userIds, "lin");
	const momo = requireUser(userIds, "momo");

	await db.insert(comment).values([
		{
			id: "seed-comment-mint-1",
			noteId: "seed-note-balcony-mint",
			userId: lin,
			content: "薄荷很好养，泡水的时候加一片柠檬会更清爽。",
			createdAt: minutesAgo(70),
		},
		{
			id: "seed-comment-mint-2",
			noteId: "seed-note-balcony-mint",
			parentId: "seed-comment-mint-1",
			userId: test,
			content: "记下了，周末正好试一杯。",
			createdAt: minutesAgo(62),
		},
		{
			id: "seed-comment-coffee-1",
			noteId: "seed-note-morning-coffee",
			userId: momo,
			content: "慢一点吃早餐，整天的节奏都会舒服很多。",
			createdAt: hoursAgo(5),
		},
		{
			id: "seed-comment-brunch-1",
			noteId: "seed-note-weekend-brunch",
			userId: test,
			content: "看起来简单又好吃，下次也试试这个搭配。",
			createdAt: hoursAgo(20),
		},
	]);

	await db
		.insert(noteLike)
		.values([
			{ noteId: "seed-note-balcony-mint", userId: lin },
			{ noteId: "seed-note-balcony-mint", userId: momo },
			{ noteId: "seed-note-morning-coffee", userId: test },
			{ noteId: "seed-note-morning-coffee", userId: momo },
			{ noteId: "seed-note-weekend-brunch", userId: test },
			{ noteId: "seed-note-evening-walk", userId: momo },
			{ noteId: "seed-note-reading-corner", userId: lin },
		])
		.onConflictDoNothing();

	await db
		.insert(noteCollection)
		.values([
			{ noteId: "seed-note-balcony-mint", userId: lin },
			{ noteId: "seed-note-morning-coffee", userId: momo },
			{ noteId: "seed-note-weekend-brunch", userId: lin },
			{ noteId: "seed-note-reading-corner", userId: test },
		])
		.onConflictDoNothing();

	await db
		.insert(follow)
		.values([
			{ followerId: lin, followingId: test },
			{ followerId: momo, followingId: test },
			{ followerId: test, followingId: lin },
			{ followerId: lin, followingId: momo },
			{ followerId: momo, followingId: lin },
		])
		.onConflictDoNothing();

	await db
		.insert(commentLike)
		.values([
			{ commentId: "seed-comment-mint-1", userId: test },
			{ commentId: "seed-comment-brunch-1", userId: momo },
		])
		.onConflictDoNothing();

	await db.insert(notification).values([
		{
			id: "seed-notification-like",
			recipientId: test,
			actorId: lin,
			type: "like",
			category: "activity",
			title: "林一一 赞了你的笔记",
			body: "周末给阳台添了一盆薄荷",
			targetType: "note",
			targetId: "seed-note-balcony-mint",
			noteId: "seed-note-balcony-mint",
			dedupeKey: "seed:like:lin:balcony-mint",
			isRead: false,
			isDeleted: false,
			createdAt: minutesAgo(68),
			updatedAt: now,
		},
		{
			id: "seed-notification-collect",
			recipientId: test,
			actorId: lin,
			type: "collect",
			category: "activity",
			title: "林一一 收藏了你的笔记",
			body: "周末给阳台添了一盆薄荷",
			targetType: "note",
			targetId: "seed-note-balcony-mint",
			noteId: "seed-note-balcony-mint",
			dedupeKey: "seed:collect:lin:balcony-mint",
			isRead: false,
			isDeleted: false,
			createdAt: minutesAgo(66),
			updatedAt: now,
		},
		{
			id: "seed-notification-comment",
			recipientId: test,
			actorId: lin,
			type: "comment",
			category: "activity",
			title: "林一一 评论了你的笔记",
			body: "薄荷很好养，泡水的时候加一片柠檬会更清爽。",
			targetType: "comment",
			targetId: "seed-comment-mint-1",
			noteId: "seed-note-balcony-mint",
			dedupeKey: "seed:comment:lin:balcony-mint",
			isRead: false,
			isDeleted: false,
			createdAt: minutesAgo(64),
			updatedAt: now,
		},
		{
			id: "seed-notification-follow",
			recipientId: test,
			actorId: momo,
			type: "follow",
			category: "followers",
			title: "Momo 开始关注你",
			body: "分享简单料理和舒服的居家角落。",
			targetType: "user",
			targetId: momo,
			dedupeKey: "seed:follow:momo:test",
			isRead: false,
			isDeleted: false,
			createdAt: minutesAgo(55),
			updatedAt: now,
		},
	]);

	const conversationId = "seed-conversation-test-lin";
	await db.insert(directConversation).values({
		id: conversationId,
		memberKey: [test, lin].sort().join(":"),
		createdAt: minutesAgo(40),
		updatedAt: minutesAgo(28),
	});
	await db.insert(directConversationParticipant).values([
		{
			conversationId,
			userId: test,
			lastReadAt: minutesAgo(28),
			createdAt: minutesAgo(40),
			updatedAt: minutesAgo(28),
		},
		{
			conversationId,
			userId: lin,
			lastReadAt: null,
			createdAt: minutesAgo(40),
			updatedAt: minutesAgo(28),
		},
	]);
	await db.insert(directMessage).values([
		{
			id: "seed-message-walk-1",
			conversationId,
			senderId: lin,
			content: "周末天气不错，要不要一起去河边走走？",
			createdAt: minutesAgo(40),
			updatedAt: minutesAgo(40),
		},
		{
			id: "seed-message-walk-2",
			conversationId,
			senderId: test,
			content: "好呀，傍晚光线应该很适合拍照。",
			createdAt: minutesAgo(34),
			updatedAt: minutesAgo(34),
		},
		{
			id: "seed-message-walk-3",
			conversationId,
			senderId: lin,
			content: "那就五点见，我带一杯咖啡过去。",
			createdAt: minutesAgo(28),
			updatedAt: minutesAgo(28),
		},
	]);

	console.log("Seed completed: 4 users, 6 notes, and essential interactions");
	console.log(`Admin: admin@youni.app / ${adminPassword}`);
	console.log(`Demo: test@youni.app / ${demoPassword}`);
	console.log(`Demo: lin@youni.app / ${demoPassword}`);
	console.log(`Demo: momo@youni.app / ${demoPassword}`);
}

if (import.meta.main) {
	seedDatabase()
		.catch((error) => {
			console.error(error);
			process.exitCode = 1;
		})
		.finally(async () => {
			await closeDb();
		});
}
