import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
	topic,
	user,
} from "@youni/db/schema/index";
import { and, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import z from "zod";
import {
	activeUserProcedure,
	protectedProcedure,
	publicProcedure,
} from "../index";
import { notifyFollow, notifyNoteOwner } from "../lib/notifications";

const idInput = z.object({ id: z.string().min(1) });
const profileInput = z.object({ userId: z.string().min(1) });
const listInput = z.object({
	keyword: z.string().trim().optional(),
	limit: z.number().int().min(1).max(60).default(30),
});

const noteCreateInput = z.object({
	title: z.string().trim().max(100).default(""),
	content: z.string().trim().max(5000).default(""),
	images: z.array(z.string().trim().url()).max(9).default([]),
	topics: z.array(z.string().trim().min(1).max(24)).max(8).default([]),
	locationName: z.string().trim().min(1).max(80).optional(),
	visibility: z.enum(["public", "followers", "private"]).default("public"),
	components: z
		.array(
			z.object({
				type: z.enum(["file", "poll"]),
				title: z.string().trim().min(1).max(80),
				value: z.string().trim().max(300).optional(),
				options: z.array(z.string().trim().min(1).max(80)).max(8).optional(),
			}),
		)
		.max(5)
		.default([]),
	advancedOptions: z
		.object({
			allowComment: z.boolean().default(true),
			allowShare: z.boolean().default(true),
			isOriginal: z.boolean().default(true),
			contentDisclosure: z.string().trim().max(120).optional(),
		})
		.default({
			allowComment: true,
			allowShare: true,
			isOriginal: true,
		}),
	submitMode: z.enum(["draft", "publish"]).default("publish"),
});

const commentInput = z.object({
	noteId: z.string().min(1),
	content: z.string().trim().min(1).max(500),
});

const profileUpdateInput = z.object({
	name: z.string().trim().min(1).max(50),
	handle: z
		.string()
		.trim()
		.min(2)
		.max(30)
		.regex(/^[a-zA-Z0-9_]+$/)
		.optional()
		.or(z.literal("")),
	bio: z.string().trim().max(160).optional(),
	gender: z.enum(["unknown", "male", "female"]).default("unknown"),
	image: z.string().trim().url().optional().or(z.literal("")),
});

type NoteRow = {
	id: string;
	title: string;
	content: string;
	images: string[];
	cover: string | null;
	locationName: string | null;
	visibility: "public" | "followers" | "private";
	components: Array<{
		options?: string[];
		title: string;
		type: "file" | "poll";
		value?: string;
	}>;
	advancedOptions: {
		allowComment: boolean;
		allowShare: boolean;
		contentDisclosure?: string | null;
		isOriginal: boolean;
	};
	status: "audit" | "draft" | "published" | "rejected" | "hidden";
	rejectionReason: string | null;
	publishedAt: Date | null;
	draftSavedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	authorName: string;
	authorImage: string | null;
	authorHandle: string | null;
};

function createId() {
	return crypto.randomUUID();
}

function uniqueTopics(values: string[]) {
	return Array.from(
		new Set(
			values
				.map((value) => value.trim().replace(/^#/, ""))
				.filter((value) => value.length > 0),
		),
	).slice(0, 8);
}

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

async function hydrateNotes(rows: NoteRow[], viewerId?: string) {
	if (rows.length === 0) {
		return [];
	}

	const db = createDb();
	const noteIds = rows.map((row) => row.id);
	const authorIds = Array.from(new Set(rows.map((row) => row.userId)));

	const [
		topicRows,
		likeRows,
		collectionRows,
		commentRows,
		likedRows,
		collectedRows,
		followingRows,
	] = await Promise.all([
		db
			.select({ noteId: noteTopic.noteId, name: topic.name })
			.from(noteTopic)
			.innerJoin(topic, eq(noteTopic.topicId, topic.id))
			.where(inArray(noteTopic.noteId, noteIds)),
		db
			.select({ noteId: noteLike.noteId, value: count() })
			.from(noteLike)
			.where(inArray(noteLike.noteId, noteIds))
			.groupBy(noteLike.noteId),
		db
			.select({ noteId: noteCollection.noteId, value: count() })
			.from(noteCollection)
			.where(inArray(noteCollection.noteId, noteIds))
			.groupBy(noteCollection.noteId),
		db
			.select({ noteId: comment.noteId, value: count() })
			.from(comment)
			.where(inArray(comment.noteId, noteIds))
			.groupBy(comment.noteId),
		viewerId
			? db
					.select({ noteId: noteLike.noteId })
					.from(noteLike)
					.where(
						and(
							inArray(noteLike.noteId, noteIds),
							eq(noteLike.userId, viewerId),
						),
					)
			: Promise.resolve([]),
		viewerId
			? db
					.select({ noteId: noteCollection.noteId })
					.from(noteCollection)
					.where(
						and(
							inArray(noteCollection.noteId, noteIds),
							eq(noteCollection.userId, viewerId),
						),
					)
			: Promise.resolve([]),
		viewerId
			? db
					.select({ followingId: follow.followingId })
					.from(follow)
					.where(
						and(
							inArray(follow.followingId, authorIds),
							eq(follow.followerId, viewerId),
						),
					)
			: Promise.resolve([]),
	]);

	const topicsByNote = new Map<string, string[]>();
	for (const row of topicRows) {
		topicsByNote.set(row.noteId, [
			...(topicsByNote.get(row.noteId) ?? []),
			row.name,
		]);
	}

	const likesByNote = new Map(
		likeRows.map((row) => [row.noteId, toNumber(row.value)]),
	);
	const collectionsByNote = new Map(
		collectionRows.map((row) => [row.noteId, toNumber(row.value)]),
	);
	const commentsByNote = new Map(
		commentRows.map((row) => [row.noteId, toNumber(row.value)]),
	);
	const likedSet = new Set(likedRows.map((row) => row.noteId));
	const collectedSet = new Set(collectedRows.map((row) => row.noteId));
	const followingSet = new Set(followingRows.map((row) => row.followingId));

	return rows.map((row) => ({
		...row,
		topics: topicsByNote.get(row.id) ?? [],
		likedCount: likesByNote.get(row.id) ?? 0,
		collectedCount: collectionsByNote.get(row.id) ?? 0,
		commentCount: commentsByNote.get(row.id) ?? 0,
		liked: likedSet.has(row.id),
		collected: collectedSet.has(row.id),
		author: {
			id: row.userId,
			name: row.authorName,
			image: row.authorImage,
			handle: row.authorHandle,
			isFollowing: followingSet.has(row.userId),
		},
	}));
}

async function selectNoteRows(whereClause?: ReturnType<typeof and>) {
	const db = createDb();
	const fields = {
		id: note.id,
		title: note.title,
		content: note.content,
		images: note.images,
		cover: note.cover,
		locationName: note.locationName,
		visibility: note.visibility,
		components: note.components,
		advancedOptions: note.advancedOptions,
		status: note.status,
		rejectionReason: note.rejectionReason,
		publishedAt: note.publishedAt,
		draftSavedAt: note.draftSavedAt,
		createdAt: note.createdAt,
		updatedAt: note.updatedAt,
		userId: note.userId,
		authorName: user.name,
		authorImage: user.image,
		authorHandle: user.handle,
	};

	if (whereClause) {
		return db
			.select(fields)
			.from(note)
			.innerJoin(user, eq(note.userId, user.id))
			.where(whereClause)
			.orderBy(desc(note.createdAt));
	}

	return db
		.select(fields)
		.from(note)
		.innerJoin(user, eq(note.userId, user.id))
		.orderBy(desc(note.createdAt));
}

async function getProfile(userId: string, viewerId?: string) {
	const db = createDb();
	const [profile] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			handle: user.handle,
			bio: user.bio,
			gender: user.gender,
			status: user.status,
			createdAt: user.createdAt,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1);

	if (!profile) {
		throw new ORPCError("NOT_FOUND");
	}

	const [
		[noteCount],
		[followerCount],
		[followingCount],
		[likedCount],
		followingState,
	] = await Promise.all([
		db.select({ value: count() }).from(note).where(eq(note.userId, userId)),
		db
			.select({ value: count() })
			.from(follow)
			.where(eq(follow.followingId, userId)),
		db
			.select({ value: count() })
			.from(follow)
			.where(eq(follow.followerId, userId)),
		db
			.select({ value: count() })
			.from(noteLike)
			.innerJoin(note, eq(noteLike.noteId, note.id))
			.where(eq(note.userId, userId)),
		viewerId
			? db
					.select({ followingId: follow.followingId })
					.from(follow)
					.where(
						and(
							eq(follow.followingId, userId),
							eq(follow.followerId, viewerId),
						),
					)
					.limit(1)
			: Promise.resolve([]),
	]);

	return {
		...profile,
		noteCount: toNumber(noteCount?.value),
		followerCount: toNumber(followerCount?.value),
		followingCount: toNumber(followingCount?.value),
		likedCount: toNumber(likedCount?.value),
		isFollowing: followingState.length > 0,
	};
}

export const socialRouter = {
	feed: publicProcedure.input(listInput).handler(async ({ input, context }) => {
		let topicNoteIds: string[] = [];
		if (input.keyword) {
			const rows = await createDb()
				.select({ noteId: noteTopic.noteId })
				.from(noteTopic)
				.innerJoin(topic, eq(noteTopic.topicId, topic.id))
				.where(ilike(topic.name, `%${input.keyword}%`));
			topicNoteIds = Array.from(new Set(rows.map((row) => row.noteId)));
		}
		const keywordClause = input.keyword
			? topicNoteIds.length > 0
				? or(
						ilike(note.title, `%${input.keyword}%`),
						ilike(note.content, `%${input.keyword}%`),
						inArray(note.id, topicNoteIds),
					)
				: or(
						ilike(note.title, `%${input.keyword}%`),
						ilike(note.content, `%${input.keyword}%`),
					)
			: undefined;
		const whereClause = input.keyword
			? and(
					eq(note.status, "published"),
					eq(note.visibility, "public"),
					keywordClause,
				)
			: and(eq(note.status, "published"), eq(note.visibility, "public"));
		const rows = (await selectNoteRows(whereClause)).slice(0, input.limit);
		return hydrateNotes(rows, context.session?.user.id);
	}),

	followingFeed: protectedProcedure
		.input(listInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const followingRows = await db
				.select({ followingId: follow.followingId })
				.from(follow)
				.where(eq(follow.followerId, context.session.user.id));
			const followingIds = followingRows.map((row) => row.followingId);

			if (followingIds.length === 0) {
				return [];
			}

			const rows = (
				await selectNoteRows(
					and(
						eq(note.status, "published"),
						inArray(note.userId, followingIds),
						or(eq(note.visibility, "public"), eq(note.visibility, "followers")),
					),
				)
			).slice(0, input.limit);

			return hydrateNotes(rows, context.session.user.id);
		}),

	topics: publicProcedure.input(listInput).handler(async ({ input }) => {
		const db = createDb();
		const rows = input.keyword
			? await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.where(ilike(topic.name, `%${input.keyword}%`))
					.orderBy(desc(topic.createdAt))
					.limit(input.limit)
			: await db
					.select({
						id: topic.id,
						name: topic.name,
						createdAt: topic.createdAt,
					})
					.from(topic)
					.orderBy(desc(topic.createdAt))
					.limit(input.limit);

		if (rows.length === 0) return [];

		const counts = await db
			.select({ topicId: noteTopic.topicId, value: count() })
			.from(noteTopic)
			.where(
				inArray(
					noteTopic.topicId,
					rows.map((row) => row.id),
				),
			)
			.groupBy(noteTopic.topicId);
		const countByTopic = new Map(
			counts.map((row) => [row.topicId, toNumber(row.value)]),
		);

		return rows.map((row) => ({
			...row,
			noteCount: countByTopic.get(row.id) ?? 0,
		}));
	}),

	byId: publicProcedure.input(idInput).handler(async ({ input, context }) => {
		const [row] = await selectNoteRows(
			context.session?.user.id
				? and(
						eq(note.id, input.id),
						or(
							and(eq(note.status, "published"), eq(note.visibility, "public")),
							eq(note.userId, context.session.user.id),
						),
					)
				: and(
						eq(note.id, input.id),
						eq(note.status, "published"),
						eq(note.visibility, "public"),
					),
		);

		if (!row) {
			throw new ORPCError("NOT_FOUND");
		}

		const [item] = await hydrateNotes([row], context.session?.user.id);
		const db = createDb();
		const comments = await db
			.select({
				id: comment.id,
				content: comment.content,
				createdAt: comment.createdAt,
				userId: comment.userId,
				authorName: user.name,
				authorImage: user.image,
			})
			.from(comment)
			.innerJoin(user, eq(comment.userId, user.id))
			.where(eq(comment.noteId, input.id))
			.orderBy(desc(comment.createdAt));

		return {
			...item,
			comments,
		};
	}),

	profile: publicProcedure
		.input(profileInput)
		.handler(async ({ input, context }) => {
			const profile = await getProfile(input.userId, context.session?.user.id);
			const rows = (
				await selectNoteRows(
					and(
						eq(note.userId, input.userId),
						eq(note.status, "published"),
						eq(note.visibility, "public"),
					),
				)
			).slice(0, 30);
			return {
				profile,
				notes: await hydrateNotes(rows, context.session?.user.id),
			};
		}),

	me: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;
		const [profile, rows, collectedRows] = await Promise.all([
			getProfile(userId, userId),
			selectNoteRows(and(eq(note.userId, userId))).then((items) =>
				items.slice(0, 30),
			),
			createDb()
				.select({
					id: note.id,
					title: note.title,
					content: note.content,
					images: note.images,
					cover: note.cover,
					locationName: note.locationName,
					visibility: note.visibility,
					components: note.components,
					advancedOptions: note.advancedOptions,
					status: note.status,
					rejectionReason: note.rejectionReason,
					publishedAt: note.publishedAt,
					draftSavedAt: note.draftSavedAt,
					createdAt: note.createdAt,
					updatedAt: note.updatedAt,
					userId: note.userId,
					authorName: user.name,
					authorImage: user.image,
					authorHandle: user.handle,
				})
				.from(noteCollection)
				.innerJoin(note, eq(noteCollection.noteId, note.id))
				.innerJoin(user, eq(note.userId, user.id))
				.where(eq(noteCollection.userId, userId))
				.orderBy(desc(noteCollection.createdAt))
				.limit(30),
		]);
		const rowById = new Map<string, NoteRow>();
		for (const row of [...rows, ...collectedRows]) {
			rowById.set(row.id, row);
		}
		const hydratedRows = await hydrateNotes(
			Array.from(rowById.values()),
			userId,
		);
		const hydratedById = new Map(hydratedRows.map((row) => [row.id, row]));
		const notes = rows.flatMap((row) => {
			const item = hydratedById.get(row.id);
			return item ? [item] : [];
		});
		const collections = collectedRows.flatMap((row) => {
			const item = hydratedById.get(row.id);
			return item ? [item] : [];
		});

		return {
			profile,
			notes,
			collections,
		};
	}),

	updateProfile: activeUserProcedure
		.input(profileUpdateInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const [updated] = await db
				.update(user)
				.set({
					name: input.name,
					handle: input.handle || null,
					bio: input.bio || null,
					gender: input.gender,
					image: input.image || null,
				})
				.where(eq(user.id, context.session.user.id))
				.returning();
			return updated;
		}),

	create: activeUserProcedure
		.input(noteCreateInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const noteId = createId();
			const topicNames = uniqueTopics(input.topics);
			const cover = input.images[0];
			const title = input.title.trim();
			const content = input.content.trim();
			const status = input.submitMode === "draft" ? "draft" : "audit";

			if (input.submitMode === "publish") {
				const missingItems = [
					cover ? null : "图片",
					title ? null : "标题",
					content ? null : "正文",
					topicNames.length > 0 ? null : "话题",
				].filter((item): item is string => Boolean(item));

				if (missingItems.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: `还差：${missingItems.join("、")}`,
					});
				}
			}

			await db.insert(note).values({
				id: noteId,
				title: title || "未命名草稿",
				content,
				images: input.images,
				cover: cover ?? null,
				locationName: input.locationName || null,
				visibility: input.visibility,
				components: input.components,
				advancedOptions: input.advancedOptions,
				status,
				draftSavedAt: status === "draft" ? new Date() : null,
				userId: context.session.user.id,
			});

			for (const name of topicNames) {
				await db
					.insert(topic)
					.values({ id: createId(), name })
					.onConflictDoNothing();
			}

			if (topicNames.length > 0) {
				const topicRows = await db
					.select({ id: topic.id })
					.from(topic)
					.where(inArray(topic.name, topicNames));
				await db
					.insert(noteTopic)
					.values(topicRows.map((row) => ({ noteId, topicId: row.id })))
					.onConflictDoNothing();
			}

			return { id: noteId, status };
		}),

	toggleLike: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const whereClause = and(
				eq(noteLike.noteId, input.id),
				eq(noteLike.userId, context.session.user.id),
			);
			const existing = await db
				.select({ noteId: noteLike.noteId })
				.from(noteLike)
				.where(whereClause)
				.limit(1);
			const liked = existing.length === 0;

			if (liked) {
				await db
					.insert(noteLike)
					.values({ noteId: input.id, userId: context.session.user.id });
				await notifyNoteOwner({
					type: "like",
					noteId: input.id,
					actorId: context.session.user.id,
				});
			} else {
				await db.delete(noteLike).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(noteLike)
				.where(eq(noteLike.noteId, input.id));
			return { liked, likedCount: toNumber(row?.value) };
		}),

	toggleCollect: activeUserProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const whereClause = and(
				eq(noteCollection.noteId, input.id),
				eq(noteCollection.userId, context.session.user.id),
			);
			const existing = await db
				.select({ noteId: noteCollection.noteId })
				.from(noteCollection)
				.where(whereClause)
				.limit(1);
			const collected = existing.length === 0;

			if (collected) {
				await db
					.insert(noteCollection)
					.values({ noteId: input.id, userId: context.session.user.id });
				await notifyNoteOwner({
					type: "collect",
					noteId: input.id,
					actorId: context.session.user.id,
				});
			} else {
				await db.delete(noteCollection).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(noteCollection)
				.where(eq(noteCollection.noteId, input.id));
			return { collected, collectedCount: toNumber(row?.value) };
		}),

	addComment: activeUserProcedure
		.input(commentInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const [targetNote] = await db
				.select({ advancedOptions: note.advancedOptions })
				.from(note)
				.where(eq(note.id, input.noteId))
				.limit(1);

			if (!targetNote) {
				throw new ORPCError("NOT_FOUND");
			}

			if (!targetNote.advancedOptions.allowComment) {
				throw new ORPCError("FORBIDDEN", {
					message: "作者已关闭评论",
				});
			}

			const [created] = await db
				.insert(comment)
				.values({
					id: createId(),
					noteId: input.noteId,
					userId: context.session.user.id,
					content: input.content,
				})
				.returning();
			await notifyNoteOwner({
				type: "comment",
				noteId: input.noteId,
				actorId: context.session.user.id,
				content: input.content,
			});
			return created;
		}),

	toggleFollow: activeUserProcedure
		.input(profileInput)
		.handler(async ({ input, context }) => {
			const viewerId = context.session.user.id;
			if (viewerId === input.userId) {
				throw new ORPCError("BAD_REQUEST");
			}

			const db = createDb();
			const whereClause = and(
				eq(follow.followingId, input.userId),
				eq(follow.followerId, viewerId),
			);
			const existing = await db
				.select({ followingId: follow.followingId })
				.from(follow)
				.where(whereClause)
				.limit(1);
			const following = existing.length === 0;

			if (following) {
				await db
					.insert(follow)
					.values({ followingId: input.userId, followerId: viewerId });
				await notifyFollow({
					actorId: viewerId,
					recipientId: input.userId,
				});
			} else {
				await db.delete(follow).where(whereClause);
			}

			const [row] = await db
				.select({ value: count() })
				.from(follow)
				.where(eq(follow.followingId, input.userId));
			return { following, followerCount: toNumber(row?.value) };
		}),
};
