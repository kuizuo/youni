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
import type { SQL } from "drizzle-orm";
import { and, count, desc, eq, inArray, ne, or } from "drizzle-orm";
import { containsInsensitive } from "./search";

export type ContentNoteStatus =
	| "audit"
	| "draft"
	| "published"
	| "rejected"
	| "hidden";

export type ContentNoteMutationInput = {
	title: string;
	content: string;
	images: string[];
	imageMetas: Array<{ height: number; url: string; width: number }>;
	topics: string[];
	locationName?: string;
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
	submitMode: "draft" | "publish";
};
export type ContentNoteEditInput = Omit<
	ContentNoteMutationInput,
	"submitMode"
> & {
	id: string;
};

export type ContentNoteRow = {
	id: string;
	title: string;
	content: string;
	images: string[];
	imageMetas: Array<{ height: number; url: string; width: number }>;
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
	status: ContentNoteStatus;
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

export type HydratedContentNote = ContentNoteRow & {
	topics: string[];
	likedCount: number;
	collectedCount: number;
	commentCount: number;
	liked: boolean;
	collected: boolean;
	author: {
		id: string;
		name: string;
		image: string | null;
		handle: string | null;
		isFollowing: boolean;
	};
};

export type AdminHydratedContentNote<
	T extends { id: string } = AdminContentNoteRow,
> = T & {
	topics: string[];
	topicDetails: { id: string; name: string }[];
	likedCount: number;
	commentCount: number;
	collectedCount: number;
};

type AdminContentNoteRow = {
	id: string;
	title: string;
	content: string;
	cover: string | null;
	images: string[];
	imageMetas: Array<{ height: number; url: string; width: number }>;
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
	status: ContentNoteStatus;
	rejectionReason: string | null;
	createdAt: Date;
	publishedAt: Date | null;
	draftSavedAt: Date | null;
	userId: string;
	authorName: string;
	authorEmail: string;
};

const contentNoteRowFields = {
	id: note.id,
	title: note.title,
	content: note.content,
	images: note.images,
	imageMetas: note.imageMetas,
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

const adminContentNoteRowFields = {
	id: note.id,
	title: note.title,
	content: note.content,
	cover: note.cover,
	images: note.images,
	imageMetas: note.imageMetas,
	locationName: note.locationName,
	visibility: note.visibility,
	components: note.components,
	advancedOptions: note.advancedOptions,
	status: note.status,
	rejectionReason: note.rejectionReason,
	createdAt: note.createdAt,
	publishedAt: note.publishedAt,
	draftSavedAt: note.draftSavedAt,
	userId: note.userId,
	authorName: user.name,
	authorEmail: user.email,
};

function toNumber(value: unknown) {
	return Number(value ?? 0);
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

function normalizeImageMetas(input: ContentNoteMutationInput) {
	const imageSet = new Set(input.images);
	const metasByUrl = new Map(
		input.imageMetas
			.filter(
				(meta) =>
					imageSet.has(meta.url) &&
					Number.isFinite(meta.width) &&
					Number.isFinite(meta.height) &&
					meta.width > 0 &&
					meta.height > 0,
			)
			.map((meta) => [
				meta.url,
				{
					height: Math.round(meta.height),
					url: meta.url,
					width: Math.round(meta.width),
				},
			]),
	);

	return input.images.flatMap((url) => {
		const meta = metasByUrl.get(url);
		return meta ? [meta] : [];
	});
}

function getMissingPublishItems(
	input: ContentNoteMutationInput,
	topicNames: string[],
) {
	return [
		input.images[0] ? null : "图片",
		input.title.trim() ? null : "标题",
		input.content.trim() ? null : "正文",
		topicNames.length > 0 ? null : "话题",
	].filter((item): item is string => Boolean(item));
}

function assertPublishReady(
	input: ContentNoteMutationInput,
	topicNames: string[],
) {
	const missingItems = getMissingPublishItems(input, topicNames);
	if (missingItems.length > 0) {
		throw new ORPCError("BAD_REQUEST", {
			message: `还差：${missingItems.join("、")}`,
		});
	}
}

async function syncNoteTopics({
	db,
	noteId,
	topicNames,
	clearExisting = false,
}: {
	db: ReturnType<typeof createDb>;
	noteId: string;
	topicNames: string[];
	clearExisting?: boolean;
}) {
	if (clearExisting) {
		await db.delete(noteTopic).where(eq(noteTopic.noteId, noteId));
	}

	for (const name of topicNames) {
		await db.insert(topic).values({ name }).onConflictDoNothing();
	}

	if (topicNames.length === 0) {
		return;
	}

	const topicRows = await db
		.select({ id: topic.id })
		.from(topic)
		.where(inArray(topic.name, topicNames));
	await db
		.insert(noteTopic)
		.values(topicRows.map((row) => ({ noteId, topicId: row.id })))
		.onConflictDoNothing();
}

export async function selectContentNoteRows(whereClause?: SQL) {
	const db = createDb();

	if (whereClause) {
		return db
			.select(contentNoteRowFields)
			.from(note)
			.innerJoin(user, eq(note.userId, user.id))
			.where(whereClause)
			.orderBy(desc(note.createdAt));
	}

	return db
		.select(contentNoteRowFields)
		.from(note)
		.innerJoin(user, eq(note.userId, user.id))
		.orderBy(desc(note.createdAt));
}

export async function hydrateContentNotes(
	rows: ContentNoteRow[],
	viewerId?: string,
): Promise<HydratedContentNote[]> {
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

export async function listMeContentNoteRows(
	userId: string,
	tab: "notes" | "collections" | "liked",
	limit: number,
) {
	if (tab === "notes") {
		return selectContentNoteRows(
			and(eq(note.userId, userId), ne(note.status, "hidden")),
		).then((items) => items.slice(0, limit));
	}

	if (tab === "collections") {
		return createDb()
			.select(contentNoteRowFields)
			.from(noteCollection)
			.innerJoin(note, eq(noteCollection.noteId, note.id))
			.innerJoin(user, eq(note.userId, user.id))
			.where(and(eq(noteCollection.userId, userId), ne(note.status, "hidden")))
			.orderBy(desc(noteCollection.createdAt))
			.limit(limit);
	}

	return createDb()
		.select(contentNoteRowFields)
		.from(noteLike)
		.innerJoin(note, eq(noteLike.noteId, note.id))
		.innerJoin(user, eq(note.userId, user.id))
		.where(
			and(
				eq(noteLike.userId, userId),
				ne(note.status, "hidden"),
				or(
					and(eq(note.status, "published"), eq(note.visibility, "public")),
					eq(note.userId, userId),
				),
			),
		)
		.orderBy(desc(noteLike.createdAt))
		.limit(limit);
}

export async function listDraftContentNotes(userId: string) {
	const rows = await createDb()
		.select(contentNoteRowFields)
		.from(note)
		.innerJoin(user, eq(note.userId, user.id))
		.where(and(eq(note.userId, userId), eq(note.status, "draft")))
		.orderBy(desc(note.draftSavedAt), desc(note.updatedAt))
		.limit(60);

	return hydrateContentNotes(rows, userId);
}

export async function listViewedContentNoteRows(userId: string, limit: number) {
	return createDb()
		.select({
			...contentNoteRowFields,
			viewedAt: noteViewHistory.viewedAt,
		})
		.from(noteViewHistory)
		.innerJoin(note, eq(noteViewHistory.noteId, note.id))
		.innerJoin(user, eq(note.userId, user.id))
		.where(
			and(
				eq(noteViewHistory.userId, userId),
				ne(note.status, "hidden"),
				or(
					and(eq(note.status, "published"), eq(note.visibility, "public")),
					eq(note.userId, userId),
				),
			),
		)
		.orderBy(desc(noteViewHistory.viewedAt))
		.limit(limit);
}

export async function getDraftContentNoteById({
	id,
	userId,
}: {
	id: string;
	userId: string;
}) {
	const [row] = await selectContentNoteRows(
		and(eq(note.id, id), eq(note.userId, userId), eq(note.status, "draft")),
	);

	if (!row) {
		throw new ORPCError("NOT_FOUND");
	}

	const [item] = await hydrateContentNotes([row], userId);
	return item;
}

export async function getEditableContentNoteById({
	id,
	userId,
}: {
	id: string;
	userId: string;
}) {
	const [row] = await selectContentNoteRows(
		and(eq(note.id, id), eq(note.userId, userId), ne(note.status, "hidden")),
	);

	if (!row) {
		throw new ORPCError("NOT_FOUND");
	}

	const [item] = await hydrateContentNotes([row], userId);
	return item;
}

export async function updateDraftContentNote({
	input,
	userId,
}: {
	input: ContentNoteMutationInput & { id: string };
	userId: string;
}) {
	const db = createDb();
	const [existing] = await db
		.select({ id: note.id })
		.from(note)
		.where(
			and(
				eq(note.id, input.id),
				eq(note.userId, userId),
				eq(note.status, "draft"),
			),
		)
		.limit(1);

	if (!existing) {
		throw new ORPCError("NOT_FOUND");
	}

	const topicNames = uniqueTopics(input.topics);
	const status = input.submitMode === "draft" ? "draft" : "audit";
	const cover = input.images[0];
	const imageMetas = normalizeImageMetas(input);
	const title = input.title.trim();
	const content = input.content.trim();

	if (input.submitMode === "publish") {
		assertPublishReady(input, topicNames);
	}

	await db
		.update(note)
		.set({
			title: title || "未命名草稿",
			content,
			images: input.images,
			imageMetas,
			cover: cover ?? null,
			locationName: input.locationName || null,
			visibility: input.visibility,
			components: input.components,
			advancedOptions: input.advancedOptions,
			status,
			draftSavedAt: status === "draft" ? new Date() : null,
		})
		.where(eq(note.id, input.id));

	await syncNoteTopics({
		db,
		noteId: input.id,
		topicNames,
		clearExisting: true,
	});

	return { id: input.id, status };
}

export async function updateEditableContentNote({
	input,
	userId,
}: {
	input: ContentNoteEditInput;
	userId: string;
}) {
	const db = createDb();
	const [existing] = await db
		.select({ id: note.id })
		.from(note)
		.where(
			and(
				eq(note.id, input.id),
				eq(note.userId, userId),
				ne(note.status, "hidden"),
			),
		)
		.limit(1);

	if (!existing) {
		throw new ORPCError("NOT_FOUND");
	}

	const topicNames = uniqueTopics(input.topics);
	assertPublishReady({ ...input, submitMode: "publish" }, topicNames);

	const cover = input.images[0];
	const imageMetas = normalizeImageMetas({ ...input, submitMode: "publish" });

	await db
		.update(note)
		.set({
			title: input.title.trim(),
			content: input.content.trim(),
			images: input.images,
			imageMetas,
			cover: cover ?? null,
			locationName: input.locationName || null,
			visibility: input.visibility,
			components: input.components,
			advancedOptions: input.advancedOptions,
			status: "audit",
			rejectionReason: null,
			publishedAt: null,
			draftSavedAt: null,
		})
		.where(
			and(
				eq(note.id, input.id),
				eq(note.userId, userId),
				ne(note.status, "hidden"),
			),
		);

	await syncNoteTopics({
		db,
		noteId: input.id,
		topicNames,
		clearExisting: true,
	});

	return { id: input.id, status: "audit" as const };
}

export async function createContentNote({
	input,
	userId,
}: {
	input: ContentNoteMutationInput;
	userId: string;
}) {
	const db = createDb();
	const topicNames = uniqueTopics(input.topics);
	const cover = input.images[0];
	const imageMetas = normalizeImageMetas(input);
	const title = input.title.trim();
	const content = input.content.trim();
	const status = input.submitMode === "draft" ? "draft" : "audit";

	if (input.submitMode === "publish") {
		assertPublishReady(input, topicNames);
	}

	const [createdNote] = await db
		.insert(note)
		.values({
			title: title || "未命名草稿",
			content,
			images: input.images,
			imageMetas,
			cover: cover ?? null,
			locationName: input.locationName || null,
			visibility: input.visibility,
			components: input.components,
			advancedOptions: input.advancedOptions,
			status,
			draftSavedAt: status === "draft" ? new Date() : null,
			userId,
		})
		.returning({ id: note.id });
	if (!createdNote) {
		throw new ORPCError("INTERNAL_SERVER_ERROR");
	}

	await syncNoteTopics({ db, noteId: createdNote.id, topicNames });

	return { id: createdNote.id, status };
}

export async function updateContentNoteVisibility({
	id,
	userId,
	visibility,
}: {
	id: string;
	userId: string;
	visibility: "followers" | "private" | "public";
}) {
	const [updated] = await createDb()
		.update(note)
		.set({ visibility })
		.where(
			and(eq(note.id, id), eq(note.userId, userId), ne(note.status, "hidden")),
		)
		.returning({ id: note.id, visibility: note.visibility });

	if (!updated) {
		throw new ORPCError("NOT_FOUND");
	}

	return updated;
}

export async function softDeleteContentNote({
	id,
	userId,
}: {
	id: string;
	userId: string;
}) {
	const [updated] = await createDb()
		.update(note)
		.set({
			status: "hidden",
			rejectionReason: null,
			publishedAt: null,
			draftSavedAt: null,
		})
		.where(
			and(eq(note.id, id), eq(note.userId, userId), ne(note.status, "hidden")),
		)
		.returning({ id: note.id });

	if (!updated) {
		throw new ORPCError("NOT_FOUND");
	}

	return { ok: true };
}

export async function hydrateAdminContentNotes<T extends { id: string }>(
	rows: T[],
): Promise<AdminHydratedContentNote<T>[]> {
	if (rows.length === 0) return [];

	const db = createDb();
	const noteIds = rows.map((row) => row.id);
	const [topicRows, likeRows, commentRows, collectionRows] = await Promise.all([
		db
			.select({ noteId: noteTopic.noteId, id: topic.id, name: topic.name })
			.from(noteTopic)
			.innerJoin(topic, eq(noteTopic.topicId, topic.id))
			.where(inArray(noteTopic.noteId, noteIds)),
		db
			.select({ noteId: noteLike.noteId, value: count() })
			.from(noteLike)
			.where(inArray(noteLike.noteId, noteIds))
			.groupBy(noteLike.noteId),
		db
			.select({ noteId: comment.noteId, value: count() })
			.from(comment)
			.where(inArray(comment.noteId, noteIds))
			.groupBy(comment.noteId),
		db
			.select({ noteId: noteCollection.noteId, value: count() })
			.from(noteCollection)
			.where(inArray(noteCollection.noteId, noteIds))
			.groupBy(noteCollection.noteId),
	]);

	const topicsByNote = new Map<string, { id: string; name: string }[]>();
	for (const row of topicRows) {
		topicsByNote.set(row.noteId, [
			...(topicsByNote.get(row.noteId) ?? []),
			{ id: row.id, name: row.name },
		]);
	}

	const likesByNote = new Map(
		likeRows.map((row) => [row.noteId, toNumber(row.value)]),
	);
	const commentsByNote = new Map(
		commentRows.map((row) => [row.noteId, toNumber(row.value)]),
	);
	const collectionsByNote = new Map(
		collectionRows.map((row) => [row.noteId, toNumber(row.value)]),
	);

	return rows.map((row) => {
		const topics = topicsByNote.get(row.id) ?? [];
		return {
			...row,
			topics: topics.map((item) => item.name),
			topicDetails: topics,
			likedCount: likesByNote.get(row.id) ?? 0,
			commentCount: commentsByNote.get(row.id) ?? 0,
			collectedCount: collectionsByNote.get(row.id) ?? 0,
		};
	});
}

export async function listAdminContentNotes(input: {
	keyword?: string;
	status?: ContentNoteStatus;
	limit: number;
	offset: number;
}) {
	const db = createDb();
	const conditions: SQL[] = [];
	if (input.status) {
		conditions.push(eq(note.status, input.status));
	}
	if (input.keyword) {
		const keywordClause = or(
			containsInsensitive(note.title, input.keyword),
			containsInsensitive(note.content, input.keyword),
		);
		if (keywordClause) {
			conditions.push(keywordClause);
		}
	}

	const whereClause = conditions.length ? and(...conditions) : undefined;
	const [totalRow] = whereClause
		? await db.select({ value: count() }).from(note).where(whereClause)
		: await db.select({ value: count() }).from(note);
	const rows = whereClause
		? await db
				.select(adminContentNoteRowFields)
				.from(note)
				.innerJoin(user, eq(note.userId, user.id))
				.where(whereClause)
				.orderBy(desc(note.createdAt))
				.limit(input.limit)
				.offset(input.offset)
		: await db
				.select(adminContentNoteRowFields)
				.from(note)
				.innerJoin(user, eq(note.userId, user.id))
				.orderBy(desc(note.createdAt))
				.limit(input.limit)
				.offset(input.offset);

	return {
		items: await hydrateAdminContentNotes(rows),
		total: toNumber(totalRow?.value),
	};
}

export async function getAdminContentNoteDetail(id: string) {
	const db = createDb();
	const [row] = await db
		.select({
			...adminContentNoteRowFields,
			updatedAt: note.updatedAt,
			authorImage: user.image,
			authorHandle: user.handle,
		})
		.from(note)
		.innerJoin(user, eq(note.userId, user.id))
		.where(eq(note.id, id))
		.limit(1);

	if (!row) {
		throw new ORPCError("NOT_FOUND");
	}

	const [detail] = await hydrateAdminContentNotes([row]);
	const [comments, likedUsers, collectedUsers] = await Promise.all([
		db
			.select({
				id: comment.id,
				content: comment.content,
				createdAt: comment.createdAt,
				authorId: user.id,
				authorName: user.name,
				authorEmail: user.email,
				authorImage: user.image,
			})
			.from(comment)
			.innerJoin(user, eq(comment.userId, user.id))
			.where(eq(comment.noteId, id))
			.orderBy(desc(comment.createdAt))
			.limit(50),
		db
			.select({
				userId: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				createdAt: noteLike.createdAt,
			})
			.from(noteLike)
			.innerJoin(user, eq(noteLike.userId, user.id))
			.where(eq(noteLike.noteId, id))
			.orderBy(desc(noteLike.createdAt))
			.limit(20),
		db
			.select({
				userId: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				createdAt: noteCollection.createdAt,
			})
			.from(noteCollection)
			.innerJoin(user, eq(noteCollection.userId, user.id))
			.where(eq(noteCollection.noteId, id))
			.orderBy(desc(noteCollection.createdAt))
			.limit(20),
	]);

	return {
		...detail,
		comments,
		likedUsers,
		collectedUsers,
	};
}

export async function listAdminContentNotesByTopic(topicId: string) {
	const rows = await createDb()
		.select(adminContentNoteRowFields)
		.from(noteTopic)
		.innerJoin(note, eq(noteTopic.noteId, note.id))
		.innerJoin(user, eq(note.userId, user.id))
		.where(eq(noteTopic.topicId, topicId))
		.orderBy(desc(note.createdAt))
		.limit(100);

	return hydrateAdminContentNotes(rows);
}

export async function listAdminContentNotesByUser(userId: string) {
	const rows = await createDb()
		.select(adminContentNoteRowFields)
		.from(note)
		.innerJoin(user, eq(note.userId, user.id))
		.where(eq(note.userId, userId))
		.orderBy(desc(note.createdAt))
		.limit(100);

	return hydrateAdminContentNotes(rows);
}

export async function updateContentNoteStatus(input: {
	id: string;
	status: ContentNoteStatus;
	rejectionReason?: string;
}) {
	const [updated] = await createDb()
		.update(note)
		.set({
			status: input.status,
			rejectionReason:
				input.status === "rejected"
					? input.rejectionReason || "内容未通过审核"
					: null,
			publishedAt: input.status === "published" ? new Date() : null,
		})
		.where(eq(note.id, input.id))
		.returning();
	return updated;
}

export async function deleteContentNote(id: string) {
	await createDb().delete(note).where(eq(note.id, id));
	return { ok: true };
}
