import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import {
	comment,
	follow,
	note,
	noteCollection,
	noteLike,
	noteTopic,
	noteViewHistory,
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
import {
	type ContentNoteRow,
	createContentNote,
	getDraftContentNoteById,
	hydrateContentNotes,
	listDraftContentNotes,
	listMeContentNoteRows,
	listViewedContentNoteRows,
	selectContentNoteRows,
	updateDraftContentNote,
} from "../lib/content-notes";
import { notifyFollow, notifyNoteOwner } from "../lib/notifications";

const idInput = z.object({ id: z.string().min(1) });
const profileInput = z.object({ userId: z.string().min(1) });
const connectionsInput = profileInput.extend({
	type: z.enum(["following", "followers"]),
	limit: z.number().int().min(1).max(60).default(30),
});
const meFeedInput = z.object({
	tab: z.enum(["notes", "collections", "liked"]),
	limit: z.number().int().min(1).max(60).default(30),
});
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
const draftUpdateInput = noteCreateInput.extend({
	id: z.string().min(1),
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

function toNumber(value: unknown) {
	return Number(value ?? 0);
}

async function recordNoteView(noteId: string, userId: string) {
	const now = new Date();
	await createDb()
		.insert(noteViewHistory)
		.values({
			noteId,
			userId,
			viewedAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: [noteViewHistory.userId, noteViewHistory.noteId],
			set: {
				viewedAt: now,
				updatedAt: now,
			},
		});
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
		const rows = (await selectContentNoteRows(whereClause)).slice(
			0,
			input.limit,
		);
		return hydrateContentNotes(rows, context.session?.user.id);
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
				await selectContentNoteRows(
					and(
						eq(note.status, "published"),
						inArray(note.userId, followingIds),
						or(eq(note.visibility, "public"), eq(note.visibility, "followers")),
					),
				)
			).slice(0, input.limit);

			return hydrateContentNotes(rows, context.session.user.id);
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

	searchUsers: publicProcedure
		.input(listInput)
		.handler(async ({ input, context }) => {
			const keyword = input.keyword?.trim();
			if (!keyword) return [];

			const searchValue = `%${keyword}%`;
			const rows = await createDb()
				.select({ id: user.id })
				.from(user)
				.where(
					and(
						eq(user.status, "active"),
						or(
							ilike(user.name, searchValue),
							ilike(user.handle, searchValue),
							ilike(user.bio, searchValue),
						),
					),
				)
				.orderBy(desc(user.createdAt))
				.limit(input.limit);

			return Promise.all(
				rows.map((row) => getProfile(row.id, context.session?.user.id)),
			);
		}),

	connections: publicProcedure
		.input(connectionsInput)
		.handler(async ({ input, context }) => {
			const db = createDb();
			const rows =
				input.type === "following"
					? await db
							.select({ userId: follow.followingId })
							.from(follow)
							.innerJoin(user, eq(follow.followingId, user.id))
							.where(
								and(
									eq(follow.followerId, input.userId),
									eq(user.status, "active"),
								),
							)
							.orderBy(desc(follow.createdAt))
							.limit(input.limit)
					: await db
							.select({ userId: follow.followerId })
							.from(follow)
							.innerJoin(user, eq(follow.followerId, user.id))
							.where(
								and(
									eq(follow.followingId, input.userId),
									eq(user.status, "active"),
								),
							)
							.orderBy(desc(follow.createdAt))
							.limit(input.limit);

			return Promise.all(
				rows.map((row) => getProfile(row.userId, context.session?.user.id)),
			);
		}),

	byId: publicProcedure.input(idInput).handler(async ({ input, context }) => {
		const [row] = await selectContentNoteRows(
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

		const [item] = await hydrateContentNotes([row], context.session?.user.id);
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
		if (context.session?.user.id) {
			await recordNoteView(input.id, context.session.user.id);
		}

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
				await selectContentNoteRows(
					and(
						eq(note.userId, input.userId),
						eq(note.status, "published"),
						eq(note.visibility, "public"),
					),
				)
			).slice(0, 30);
			return {
				profile,
				notes: await hydrateContentNotes(rows, context.session?.user.id),
			};
		}),

	me: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;
		const [profile, rows, collectedRows, likedRows] = await Promise.all([
			getProfile(userId, userId),
			listMeContentNoteRows(userId, "notes", 30).then((items) =>
				items.slice(0, 30),
			),
			listMeContentNoteRows(userId, "collections", 30),
			listMeContentNoteRows(userId, "liked", 30),
		]);
		const rowById = new Map<string, ContentNoteRow>();
		for (const row of [...rows, ...collectedRows, ...likedRows]) {
			rowById.set(row.id, row);
		}
		const hydratedRows = await hydrateContentNotes(
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
		const liked = likedRows.flatMap((row) => {
			const item = hydratedById.get(row.id);
			return item ? [item] : [];
		});

		return {
			profile,
			notes,
			collections,
			liked,
		};
	}),

	meProfile: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;
		return getProfile(userId, userId);
	}),

	meFeed: protectedProcedure
		.input(meFeedInput)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			const rows = await listMeContentNoteRows(userId, input.tab, input.limit);
			return hydrateContentNotes(rows, userId);
		}),

	drafts: protectedProcedure.handler(async ({ context }) => {
		return listDraftContentNotes(context.session.user.id);
	}),

	draftById: protectedProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			return getDraftContentNoteById({
				id: input.id,
				userId: context.session.user.id,
			});
		}),

	updateDraft: activeUserProcedure
		.input(draftUpdateInput)
		.handler(async ({ input, context }) => {
			return updateDraftContentNote({
				input,
				userId: context.session.user.id,
			});
		}),

	creatorStats: protectedProcedure.handler(async ({ context }) => {
		const userId = context.session.user.id;
		const db = createDb();
		const [statusRows, [likeCount], [collectionCount], [commentCount]] =
			await Promise.all([
				db
					.select({ status: note.status, value: count() })
					.from(note)
					.where(eq(note.userId, userId))
					.groupBy(note.status),
				db
					.select({ value: count() })
					.from(noteLike)
					.innerJoin(note, eq(noteLike.noteId, note.id))
					.where(eq(note.userId, userId)),
				db
					.select({ value: count() })
					.from(noteCollection)
					.innerJoin(note, eq(noteCollection.noteId, note.id))
					.where(eq(note.userId, userId)),
				db
					.select({ value: count() })
					.from(comment)
					.innerJoin(note, eq(comment.noteId, note.id))
					.where(eq(note.userId, userId)),
			]);
		const byStatus = new Map(
			statusRows.map((row) => [row.status, toNumber(row.value)]),
		);
		const published = byStatus.get("published") ?? 0;
		const draft = byStatus.get("draft") ?? 0;
		const audit = byStatus.get("audit") ?? 0;
		const rejected = byStatus.get("rejected") ?? 0;
		const hidden = byStatus.get("hidden") ?? 0;

		return {
			total: published + draft + audit + rejected + hidden,
			published,
			draft,
			audit,
			rejected,
			hidden,
			liked: toNumber(likeCount?.value),
			collected: toNumber(collectionCount?.value),
			comments: toNumber(commentCount?.value),
		};
	}),

	viewHistory: protectedProcedure
		.input(listInput)
		.handler(async ({ input, context }) => {
			const userId = context.session.user.id;
			const rows = await listViewedContentNoteRows(userId, input.limit);
			const hydratedRows = await hydrateContentNotes(rows, userId);
			const viewedAtById = new Map(rows.map((row) => [row.id, row.viewedAt]));

			return hydratedRows.map((item) => ({
				note: item,
				viewedAt: viewedAtById.get(item.id) ?? item.updatedAt,
			}));
		}),

	deleteViewHistory: protectedProcedure
		.input(idInput)
		.handler(async ({ input, context }) => {
			await createDb()
				.delete(noteViewHistory)
				.where(
					and(
						eq(noteViewHistory.noteId, input.id),
						eq(noteViewHistory.userId, context.session.user.id),
					),
				);

			return { ok: true };
		}),

	clearViewHistory: protectedProcedure.handler(async ({ context }) => {
		await createDb()
			.delete(noteViewHistory)
			.where(eq(noteViewHistory.userId, context.session.user.id));

		return { ok: true };
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
			return createContentNote({
				input,
				userId: context.session.user.id,
			});
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
