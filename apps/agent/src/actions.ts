import { listProhibitedTermValues } from "@youni/api/lib/moderation/prohibited-terms";
import { findBlockedContentText } from "@youni/api/lib/moderation/text";
import { createNoteImageIdentity } from "@youni/api/lib/notes/image-identity";
import {
	notifyCommentOwner,
	notifyFollow,
	notifyNoteOwner,
} from "@youni/api/lib/notifications/index";
import { createDb } from "@youni/db";
import {
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
	noteViewCountState,
	noteViewHistory,
	topic,
	user,
	userBlock,
} from "@youni/db/schema/index";
import {
	and,
	asc,
	eq,
	inArray,
	lte,
	notExists,
	notInArray,
	or,
	sql,
} from "drizzle-orm";
import { ulid } from "ulid";
import z from "zod";
import type { AgentEnv } from "./index";
import { personas } from "./personas";
import {
	type AgentActionType,
	automaticControl,
	canRunDailyAction,
	isActiveHour,
	isTrustedSource,
	nextRunDelayMinutes,
	validateGeneratedText,
} from "./policy";

type RuntimeEnv = AgentEnv;

type AgentMode = "paused" | "shadow" | "live";
type AgentControl = {
	liveCreatorLimit: 3 | 6 | 12;
	mode: AgentMode;
};
type PendingAction = {
	contentKind: "lifestyle" | "news";
	creatorId: string;
	id: string;
	mode: AgentMode;
	profileKey: string;
	targetId: string | null;
	targetUserId: string | null;
	type: AgentActionType;
};

const completeActionSchema = z.object({
	actionId: z.string().min(1),
	content: z.string().trim().max(1200).optional(),
	sources: z
		.array(z.object({ title: z.string().trim().min(1), url: z.string().url() }))
		.max(8)
		.optional(),
	title: z.string().trim().max(80).optional(),
	topics: z.array(z.string().trim().min(1).max(24)).max(4).optional(),
});

const generatedCommentSchema = z.object({
	content: z.string().trim().min(2).max(180),
});
const generatedNoteSchema = z.object({
	content: z.string().trim().min(20).max(1200),
	title: z.string().trim().min(4).max(80),
	topics: z.array(z.string().trim().min(1).max(24)).min(1).max(4),
});
const newsSelectionSchema = z.object({
	sourceIndexes: z.array(z.number().int().min(0)).min(2).max(4),
	summary: z.string().trim().min(20).max(800),
});

const managedUserIds = personas.map((persona) => `creator_${persona.key}`);

function chinaDay(now = new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		dateStyle: "short",
		timeZone: "Asia/Shanghai",
	}).format(now);
}

function budgetPeriod(now = new Date()) {
	return new Intl.DateTimeFormat("en-CA", {
		month: "2-digit",
		timeZone: "Asia/Shanghai",
		year: "numeric",
	}).format(now);
}

async function getControl(env: RuntimeEnv): Promise<AgentControl> {
	const manualControl = await env.AGENT_STATE.get<AgentControl>(
		"control",
		"json",
	);
	if (manualControl) return manualControl;
	const now = Date.now();
	const launchedAt = Number(await env.AGENT_STATE.get("launchedAt"));
	if (!Number.isFinite(launchedAt) || launchedAt <= 0) {
		await env.AGENT_STATE.put("launchedAt", String(now));
		return automaticControl(0);
	}
	return automaticControl(now - launchedAt);
}

export async function updateControl(env: RuntimeEnv, body: unknown) {
	const input = z
		.object({
			liveCreatorLimit: z.union([z.literal(3), z.literal(6), z.literal(12)]),
			mode: z.enum(["paused", "shadow", "live"]),
		})
		.parse(body);
	await env.AGENT_STATE.put("control", JSON.stringify(input));
	return input;
}

export async function controlStatus(env: RuntimeEnv) {
	const control = await getControl(env);
	const spentCents = Number(
		(await env.AGENT_STATE.get(`budget:${budgetPeriod()}`)) ?? 0,
	);
	return { ...control, monthlyBudgetCents: 30_000, spentCents };
}

async function ensureAccounts(env: RuntimeEnv) {
	const db = createDb(env.DB);
	for (const persona of personas) {
		const id = `creator_${persona.key}`;
		await db
			.insert(user)
			.values({
				id,
				name: persona.name,
				email: `${persona.key}@creator.youni.invalid`,
				emailVerified: true,
				handle: persona.handle,
				bio: persona.bio,
				status: "active",
			})
			.onConflictDoUpdate({
				target: user.id,
				set: { bio: persona.bio, handle: persona.handle, name: persona.name },
			});
	}
}

async function hasBlock(env: RuntimeEnv, leftId: string, rightId: string) {
	const [row] = await createDb(env.DB)
		.select({ blockerId: userBlock.blockerId })
		.from(userBlock)
		.where(
			or(
				and(eq(userBlock.blockerId, leftId), eq(userBlock.blockedId, rightId)),
				and(eq(userBlock.blockerId, rightId), eq(userBlock.blockedId, leftId)),
			),
		)
		.limit(1);
	return Boolean(row);
}

async function dailyCount(
	env: RuntimeEnv,
	creatorId: string,
	type: AgentActionType,
) {
	return Number(
		(await env.AGENT_STATE.get(`count:${chinaDay()}:${creatorId}:${type}`)) ??
			0,
	);
}

async function incrementDailyState(env: RuntimeEnv, action: PendingAction) {
	const countKey = `count:${chinaDay()}:${action.creatorId}:${action.type}`;
	await env.AGENT_STATE.put(
		countKey,
		String((await dailyCount(env, action.creatorId, action.type)) + 1),
		{ expirationTtl: 172_800 },
	);
	if (
		action.targetUserId &&
		action.targetUserId !== action.creatorId &&
		["like", "collect", "follow", "comment", "reply"].includes(action.type)
	) {
		await env.AGENT_STATE.put(
			`contact:${chinaDay()}:${action.targetUserId}`,
			"1",
			{ expirationTtl: 172_800 },
		);
	}
	const key = `budget:${budgetPeriod()}`;
	const current = Number((await env.AGENT_STATE.get(key)) ?? 0);
	await env.AGENT_STATE.put(
		key,
		String(current + (action.type === "publish" ? 10 : 1)),
		{ expirationTtl: 3_456_000 },
	);
}

async function chooseType(env: RuntimeEnv, creatorId: string) {
	const weighted: AgentActionType[] = [
		"view",
		"view",
		"view",
		"view",
		"like",
		"like",
		"collect",
		"follow",
		"comment",
		"reply",
		"publish",
	];
	const allowed: AgentActionType[] = [];
	for (const type of weighted) {
		if (canRunDailyAction(type, await dailyCount(env, creatorId, type)))
			allowed.push(type);
	}
	return allowed[Math.floor(Math.random() * allowed.length)] ?? "view";
}

async function chooseRecheck(env: RuntimeEnv, creatorId: string, now: Date) {
	const rows = await createDb(env.DB)
		.select({ id: note.id, title: note.title, content: note.content })
		.from(note)
		.where(
			and(
				eq(note.userId, creatorId),
				eq(note.status, "published"),
				lte(note.publishedAt, new Date(now.getTime() - 48 * 60 * 60 * 1_000)),
			),
		)
		.orderBy(asc(note.publishedAt))
		.limit(20);
	for (const row of rows) {
		if (!row.content.includes("参考来源：")) continue;
		if (await env.AGENT_STATE.get(`rechecked:${row.id}`)) continue;
		return row;
	}
	return null;
}

async function chooseTarget(
	env: RuntimeEnv,
	creatorId: string,
	type: AgentActionType,
) {
	if (type === "publish")
		return { target: null, targetId: null, targetUserId: null };
	const db = createDb(env.DB);
	const preferManaged = Math.random() < 0.7;
	if (type === "follow") {
		const candidates = await db
			.select({ id: user.id, name: user.name })
			.from(user)
			.where(
				and(
					eq(user.status, "active"),
					eq(user.isAnonymous, false),
					sql`${user.id} <> ${creatorId}`,
					preferManaged
						? inArray(user.id, managedUserIds)
						: notInArray(user.id, managedUserIds),
					notExists(
						db
							.select()
							.from(follow)
							.where(
								and(
									eq(follow.followerId, creatorId),
									eq(follow.followingId, user.id),
								),
							),
					),
				),
			)
			.orderBy(sql`random()`)
			.limit(20);
		for (const candidate of candidates) {
			if (await hasBlock(env, creatorId, candidate.id)) continue;
			if (await env.AGENT_STATE.get(`contact:${chinaDay()}:${candidate.id}`))
				continue;
			return {
				target: candidate,
				targetId: candidate.id,
				targetUserId: candidate.id,
			};
		}
		return null;
	}
	const candidates = await db
		.select({
			authorName: user.name,
			content: note.content,
			id: note.id,
			title: note.title,
			userId: note.userId,
		})
		.from(note)
		.innerJoin(user, eq(note.userId, user.id))
		.where(
			and(
				eq(note.status, "published"),
				eq(note.visibility, "public"),
				sql`${note.userId} <> ${creatorId}`,
				preferManaged
					? inArray(note.userId, managedUserIds)
					: notInArray(note.userId, managedUserIds),
			),
		)
		.orderBy(sql`random()`)
		.limit(20);
	for (const candidate of candidates) {
		if (await hasBlock(env, creatorId, candidate.userId)) continue;
		if (
			["like", "collect", "comment", "reply"].includes(type) &&
			(await env.AGENT_STATE.get(`contact:${chinaDay()}:${candidate.userId}`))
		)
			continue;
		if (type === "reply") {
			const [targetComment] = await db
				.select({
					id: comment.id,
					content: comment.content,
					userId: comment.userId,
				})
				.from(comment)
				.where(
					and(
						eq(comment.noteId, candidate.id),
						sql`${comment.userId} <> ${creatorId}`,
					),
				)
				.orderBy(sql`random()`)
				.limit(1);
			if (
				!targetComment ||
				(await hasBlock(env, creatorId, targetComment.userId))
			)
				continue;
			return {
				target: { ...candidate, comment: targetComment.content },
				targetId: targetComment.id,
				targetUserId: targetComment.userId,
			};
		}
		return {
			target: candidate,
			targetId: candidate.id,
			targetUserId: candidate.userId,
		};
	}
	return null;
}

export async function claimAction(env: RuntimeEnv) {
	const now = new Date();
	const control = await getControl(env);
	if (control.mode === "paused" || !isActiveHour(now))
		return { action: null, reason: "not_active" };
	const spent = Number(
		(await env.AGENT_STATE.get(`budget:${budgetPeriod(now)}`)) ?? 0,
	);
	if (spent >= 30_000) return { action: null, reason: "budget_exhausted" };
	await ensureAccounts(env);
	const eligible = personas.slice(
		0,
		control.mode === "live" ? control.liveCreatorLimit : personas.length,
	);
	const due = [];
	for (const persona of eligible) {
		const next = Number(
			(await env.AGENT_STATE.get(`next:creator_${persona.key}`)) ?? 0,
		);
		if (next <= now.getTime()) due.push(persona);
	}
	const persona = due[Math.floor(Math.random() * due.length)];
	if (!persona) return { action: null, reason: "nothing_due" };
	const creatorId = `creator_${persona.key}`;
	const recheck = await chooseRecheck(env, creatorId, now);
	const type: AgentActionType = recheck
		? "recheck"
		: await chooseType(env, creatorId);
	const chosen = recheck
		? { target: recheck, targetId: recheck.id, targetUserId: creatorId }
		: await chooseTarget(env, creatorId, type);
	await env.AGENT_STATE.put(
		`next:${creatorId}`,
		String(now.getTime() + nextRunDelayMinutes(spent >= 24_000) * 60_000),
	);
	if (!chosen) return { action: null, reason: "no_safe_target" };
	const action: PendingAction = {
		contentKind:
			type === "publish" && Math.random() < 0.2 ? "news" : "lifestyle",
		creatorId,
		id: crypto.randomUUID(),
		mode: control.mode,
		profileKey: persona.key,
		targetId: chosen.targetId,
		targetUserId: chosen.targetUserId,
		type,
	};
	await env.AGENT_STATE.put(`action:${action.id}`, JSON.stringify(action), {
		expirationTtl: 3_600,
	});
	return {
		action: {
			contentKind: action.contentKind,
			id: action.id,
			mode: action.mode,
			persona,
			target: chosen.target,
			type: action.type,
		},
	};
}

async function generateInfoCard(
	env: RuntimeEnv,
	title: string,
	vertical: string,
) {
	const result = await env.AI.run("@cf/leonardo/lucid-origin", {
		height: 1600,
		num_steps: 20,
		prompt: `3:4 vertical editorial information card illustration about ${title}, category ${vertical}. Original abstract shapes, soft colors, clean composition, no people, no brands, no documentary photography, no news scene, no text.`,
		width: 1200,
	});
	if (!result.image) throw new Error("image_generation_missing_image");
	return Uint8Array.from(atob(result.image), (character) =>
		character.charCodeAt(0),
	);
}

async function validateCommentText(content: string) {
	const error = validateGeneratedText({ content, isNews: false });
	if (error) throw new Error(error);
	const matches = findBlockedContentText(
		{ advancedOptions: {}, components: [], content, title: "", topics: [] },
		await listProhibitedTermValues(),
	);
	if (matches.length > 0) throw new Error("评论未通过文字安全检查");
}

async function publishNote(
	env: RuntimeEnv,
	action: PendingAction,
	input: z.infer<typeof completeActionSchema>,
) {
	const title = input.title?.trim();
	const content = input.content?.trim();
	if (!title || title.length < 4 || !content || content.length < 20)
		throw new Error("内容不完整");
	const isNews = action.contentKind === "news";
	const error = validateGeneratedText({ title, content, isNews });
	if (error) throw new Error(error);
	const sources = Array.from(
		new Map(
			(input.sources ?? []).map((source) => [source.url, source]),
		).values(),
	);
	if (
		(isNews && sources.length < 2) ||
		sources.some((source) => !isTrustedSource(source.url))
	)
		throw new Error("新闻来源不足或不在可信范围内");
	const matches = findBlockedContentText(
		{
			advancedOptions: {},
			components: [],
			content,
			title,
			topics: input.topics ?? [],
		},
		await listProhibitedTermValues(),
	);
	if (matches.length > 0) throw new Error("内容未通过文字安全检查");
	const persona = personas.find((item) => item.key === action.profileKey);
	const imageBytes = await generateInfoCard(
		env,
		title,
		persona?.vertical ?? "生活",
	);
	const identity = createNoteImageIdentity({
		baseUrl: env.PUBLIC_SERVER_URL,
		fileId: crypto.randomUUID(),
		mimeType: "image/jpeg",
		userId: action.creatorId,
	});
	await env.YOUNI_BUCKET.put(identity.key, imageBytes, {
		httpMetadata: {
			cacheControl: "public, max-age=31536000, immutable",
			contentType: "image/jpeg",
		},
	});
	const db = createDb(env.DB);
	const noteId = ulid();
	await db.insert(note).values({
		advancedOptions: {
			allowComment: true,
			allowShare: true,
			isOriginal: true,
		},
		content: isNews
			? `${content}\n\n参考来源：\n${sources.map((source) => `- ${source.title}：${source.url}`).join("\n")}`
			: content,
		cover: identity.url,
		id: noteId,
		imageMetas: [{ height: 1600, width: 1200, url: identity.url }],
		images: [identity.url],
		moderatedAt: new Date(),
		moderationStatus: "passed",
		publishedAt: new Date(),
		status: "published",
		title,
		userId: action.creatorId,
		visibility: "public",
	});
	const topicNames = Array.from(new Set(input.topics ?? [])).slice(0, 4);
	for (const name of topicNames)
		await db.insert(topic).values({ name }).onConflictDoNothing();
	if (topicNames.length > 0) {
		const rows = await db
			.select({ id: topic.id })
			.from(topic)
			.where(inArray(topic.name, topicNames));
		await db
			.insert(noteTopic)
			.values(rows.map((row) => ({ noteId, topicId: row.id })))
			.onConflictDoNothing();
	}
	return noteId;
}

async function recordView(env: RuntimeEnv, noteId: string, creatorId: string) {
	const db = createDb(env.DB);
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(creatorId),
	);
	const viewerKey = Array.from(new Uint8Array(digest), (byte) =>
		byte.toString(16).padStart(2, "0"),
	).join("");
	const now = new Date();
	await db.batch([
		db
			.insert(noteViewHistory)
			.values({ noteId, userId: creatorId, viewedAt: now, updatedAt: now })
			.onConflictDoUpdate({
				target: [noteViewHistory.userId, noteViewHistory.noteId],
				set: { updatedAt: now, viewedAt: now },
			}),
		db
			.insert(noteViewCountState)
			.values({
				lastCountedDay: chinaDay(now),
				noteId,
				updatedAt: now,
				viewerKey,
			})
			.onConflictDoUpdate({
				target: [noteViewCountState.noteId, noteViewCountState.viewerKey],
				set: { lastCountedDay: chinaDay(now), updatedAt: now },
			}),
	]);
}

export async function completeAction(env: RuntimeEnv, body: unknown) {
	const input = completeActionSchema.parse(body);
	const action = await env.AGENT_STATE.get<PendingAction>(
		`action:${input.actionId}`,
		"json",
	);
	if (!action) return { ok: true, status: "missing" };
	const db = createDb(env.DB);
	try {
		const control = await getControl(env);
		if (control.mode === "paused") throw new Error("Agent 已暂停");
		if (
			action.targetUserId &&
			(await hasBlock(env, action.creatorId, action.targetUserId))
		)
			throw new Error("目标用户已建立拉黑关系");
		if (action.mode === "shadow" || control.mode === "shadow") {
			await env.AGENT_STATE.put(
				`shadow:${action.id}`,
				JSON.stringify({ action, input }),
				{ expirationTtl: 604_800 },
			);
			await env.AGENT_STATE.delete(`action:${action.id}`);
			return { ok: true, status: "shadow" };
		}
		let resultId = action.targetId;
		switch (action.type) {
			case "publish":
				resultId = await publishNote(env, action, input);
				break;
			case "view":
				if (action.targetId)
					await recordView(env, action.targetId, action.creatorId);
				break;
			case "like":
				if (action.targetId) {
					const inserted = await db
						.insert(noteLike)
						.values({ noteId: action.targetId, userId: action.creatorId })
						.onConflictDoNothing()
						.returning();
					if (inserted.length)
						await notifyNoteOwner({
							actorId: action.creatorId,
							noteId: action.targetId,
							type: "like",
						});
				}
				break;
			case "collect":
				if (action.targetId) {
					const inserted = await db
						.insert(noteCollection)
						.values({ noteId: action.targetId, userId: action.creatorId })
						.onConflictDoNothing()
						.returning();
					if (inserted.length)
						await notifyNoteOwner({
							actorId: action.creatorId,
							noteId: action.targetId,
							type: "collect",
						});
				}
				break;
			case "follow":
				if (action.targetUserId) {
					const inserted = await db
						.insert(follow)
						.values({
							followerId: action.creatorId,
							followingId: action.targetUserId,
						})
						.onConflictDoNothing()
						.returning();
					if (inserted.length)
						await notifyFollow({
							actorId: action.creatorId,
							recipientId: action.targetUserId,
						});
				}
				break;
			case "comment": {
				const content = input.content?.trim();
				if (!action.targetId || !content || content.length > 180)
					throw new Error("评论内容无效");
				await validateCommentText(content);
				const [created] = await db
					.insert(comment)
					.values({
						content,
						noteId: action.targetId,
						userId: action.creatorId,
					})
					.returning();
				if (created) {
					resultId = created.id;
					await notifyNoteOwner({
						actorId: action.creatorId,
						commentId: created.id,
						content,
						noteId: action.targetId,
						type: "comment",
					});
				}
				break;
			}
			case "reply": {
				const content = input.content?.trim();
				if (!action.targetId || !content || content.length > 180)
					throw new Error("回复内容无效");
				await validateCommentText(content);
				const [parent] = await db
					.select({ noteId: comment.noteId })
					.from(comment)
					.where(eq(comment.id, action.targetId))
					.limit(1);
				if (!parent) throw new Error("回复目标不存在");
				const [created] = await db
					.insert(comment)
					.values({
						content,
						noteId: parent.noteId,
						parentId: action.targetId,
						userId: action.creatorId,
					})
					.returning();
				if (created) {
					resultId = created.id;
					await notifyCommentOwner({
						actorId: action.creatorId,
						commentId: action.targetId,
						content,
						notificationCommentId: created.id,
						type: "comment",
					});
				}
				break;
			}
			case "recheck":
				if (
					!action.targetId ||
					(input.sources?.filter((source) => isTrustedSource(source.url))
						.length ?? 0) < 2
				) {
					if (action.targetId)
						await db
							.update(note)
							.set({ status: "hidden", rejectionReason: "新闻来源复查未通过" })
							.where(eq(note.id, action.targetId));
				}
				if (action.targetId)
					await env.AGENT_STATE.put(`rechecked:${action.targetId}`, "1");
				break;
		}
		await incrementDailyState(env, action);
		await env.AGENT_STATE.delete(`action:${action.id}`);
		return { ok: true, resultId, status: "completed" };
	} catch (error) {
		const reason = error instanceof Error ? error.message : "unknown_error";
		await env.AGENT_STATE.put(
			`quarantine:${action.id}`,
			JSON.stringify({ action, input, reason }),
			{ expirationTtl: 2_592_000 },
		);
		await env.AGENT_STATE.delete(`action:${action.id}`);
		return { ok: false, reason, status: "quarantined" };
	}
}

const newsFeeds = [
	"https://www.chinanews.com.cn/rss/life.xml",
	"https://www.chinanews.com.cn/rss/culture.xml",
	"https://www.chinanews.com.cn/rss/sports.xml",
	"https://www.xinhuanet.com/ent/news_ent.xml",
	"https://www.xinhuanet.com/tech/news_tech.xml",
	"https://www.news.cn/travel/news_travel.xml",
] as const;

function decodeXml(value: string) {
	return value
		.replace(/^<!\[CDATA\[|\]\]>$/g, "")
		.replace(/<[^>]+>/g, "")
		.replaceAll("&amp;", "&")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&quot;", '"')
		.trim();
}

export function parseRssItems(xml: string) {
	return Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi))
		.flatMap(([item]) => {
			const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
			const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1];
			if (!title || !link) return [];
			const source = { title: decodeXml(title), url: decodeXml(link) };
			return source.title && isTrustedSource(source.url) ? [source] : [];
		})
		.slice(0, 20);
}

async function readLimitedText(response: Response, limit = 200_000) {
	if (!response.ok || !response.body) return "";
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let size = 0;
	let value = "";
	while (true) {
		const chunk = await reader.read();
		if (chunk.done) break;
		size += chunk.value.byteLength;
		if (size > limit) {
			await reader.cancel();
			throw new Error("news_feed_too_large");
		}
		value += decoder.decode(chunk.value, { stream: true });
	}
	return value + decoder.decode();
}

async function generateJson<T>(
	env: RuntimeEnv,
	schema: z.ZodType<T>,
	prompt: string,
) {
	const result = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
		max_tokens: 1_200,
		messages: [
			{
				role: "system",
				content:
					"你是中文社交平台内容编辑。只返回符合要求的 JSON，不使用 Markdown，不编造事实，不讨论政治、灾难、医疗、投资或法律。",
			},
			{ role: "user", content: prompt },
		],
		response_format: { type: "json_object" },
		temperature: 0.6,
	});
	const text = result.response?.trim() ?? "";
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start < 0 || end < start) throw new Error("ai_invalid_json");
	return schema.parse(JSON.parse(text.slice(start, end + 1)));
}

export async function researchNews(env: RuntimeEnv, query: string) {
	if (validateGeneratedText({ content: query, isNews: true }))
		return { sources: [], summary: "" };
	const settled = await Promise.allSettled(
		newsFeeds.map(async (url) =>
			parseRssItems(
				await readLimitedText(
					await fetch(url, { signal: AbortSignal.timeout(8_000) }),
				),
			),
		),
	);
	const candidates = settled
		.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
		.slice(0, 80);
	if (candidates.length < 2) return { sources: [], summary: "" };
	const selection = await generateJson(
		env,
		newsSelectionSchema,
		`从下面新闻标题中选择由至少两个不同网站报道的同一条低风险生活、科技、文化、娱乐或体育新闻，方向优先考虑“${query}”。如果没有可确认的共同事件，sourceIndexes 返回空数组。概括只能使用标题明确支持的信息。\n${candidates.map((source, index) => `${index}. ${source.title} | ${source.url}`).join("\n")}`,
	).catch(() => null);
	if (!selection) return { sources: [], summary: "" };
	const sources = Array.from(
		new Map(
			selection.sourceIndexes
				.map((index) => candidates[index])
				.filter((source): source is { title: string; url: string } =>
					Boolean(source && isTrustedSource(source.url)),
				)
				.map((source) => [source.url, source]),
		).values(),
	);
	const domains = new Set(
		sources.map((source) => new URL(source.url).hostname),
	);
	if (sources.length < 2 || domains.size < 2)
		return { sources: [], summary: "" };
	return { sources, summary: selection.summary };
}

export async function runScheduledAction(env: RuntimeEnv) {
	const claimed = await claimAction(env);
	if (!claimed.action) return claimed;
	const { action } = claimed;
	const base = { actionId: action.id };
	if (["view", "like", "collect", "follow"].includes(action.type))
		return completeAction(env, base);
	if (action.type === "recheck") {
		const news = await researchNews(
			env,
			typeof action.target === "object" &&
				action.target &&
				"title" in action.target
				? String(action.target.title)
				: action.persona.vertical,
		);
		return completeAction(env, { ...base, sources: news.sources });
	}
	if (action.type === "comment" || action.type === "reply") {
		const generated = await generateJson(
			env,
			generatedCommentSchema,
			`以“${action.persona.name}”的口吻写一条自然、具体、友善的${action.type === "reply" ? "回复" : "评论"}，不超过80个汉字。账号风格：${action.persona.style}。目标内容：${JSON.stringify(action.target).slice(0, 2_500)}。返回格式：{"content":"..."}`,
		);
		return completeAction(env, { ...base, ...generated });
	}
	const news =
		action.contentKind === "news"
			? await researchNews(env, action.persona.vertical)
			: { sources: [], summary: "" };
	if (action.contentKind === "news" && news.sources.length < 2) {
		return completeAction(env, base);
	}
	const generated = await generateJson(
		env,
		generatedNoteSchema,
		action.contentKind === "news"
			? `根据以下已核对新闻摘要写一篇准确、克制的图文，不添加摘要之外的事实。摘要：${news.summary}。账号领域：${action.persona.vertical}，风格：${action.persona.style}。返回格式：{"title":"...","content":"...","topics":["..."]}`
			: `为账号“${action.persona.name}”写一篇生活分享图文。领域：${action.persona.vertical}，风格：${action.persona.style}。80至350个汉字，不编造到访、购买、参加、旅行或亲眼见闻。返回格式：{"title":"...","content":"...","topics":["..."]}`,
	);
	return completeAction(env, { ...base, ...generated, sources: news.sources });
}
