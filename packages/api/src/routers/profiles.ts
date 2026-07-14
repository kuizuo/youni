import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import { follow, note, noteLike, user } from "@youni/db/schema/index";
import { and, count, desc, eq, notInArray, or } from "drizzle-orm";
import {
	activeUserProcedure,
	protectedProcedure,
	publicProcedure,
} from "../index";
import {
	type ContentNoteRow,
	hydrateContentNotes,
	listMeContentNoteRows,
	selectContentNoteRows,
} from "../lib/notes/content";
import { notifyFollow } from "../lib/notifications";
import { containsInsensitive } from "../lib/search";
import {
	getBlockedUserIds,
	hasMessagingBlock,
	isUserBlockedBy,
	listBlockedUsers,
	setUserBlocked,
} from "../lib/users/blocks";
import { toNumber, toPage } from "./utils";

async function getProfile(userId: string, viewerId?: string) {
	const db = createDb();
	const [profile] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
			coverImage: user.coverImage,
			handle: user.handle,
			bio: user.bio,
			gender: user.gender,
			status: user.status,
			createdAt: user.createdAt,
		})
		.from(user)
		.where(and(eq(user.id, userId), eq(user.isAnonymous, false)))
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

export const profilesRouter = {
	searchUsers: publicProcedure.profiles.searchUsers.handler(
		async ({ input, context }) => {
			const keyword = input.keyword?.trim();
			if (!keyword) return [];
			const blockedIds = await getBlockedUserIds(context.session?.user.id);

			const rows = await createDb()
				.select({ id: user.id })
				.from(user)
				.where(
					and(
						eq(user.status, "active"),
						eq(user.isAnonymous, false),
						...(blockedIds.length > 0 ? [notInArray(user.id, blockedIds)] : []),
						or(
							containsInsensitive(user.name, keyword),
							containsInsensitive(user.handle, keyword),
							containsInsensitive(user.bio, keyword),
						),
					),
				)
				.orderBy(desc(user.createdAt))
				.limit(input.limit);

			return Promise.all(
				rows.map((row) => getProfile(row.id, context.session?.user.id)),
			);
		},
	),

	searchUsersPage: publicProcedure.profiles.searchUsersPage.handler(
		async ({ input, context }) => {
			const keyword = input.keyword?.trim();
			if (!keyword) return { items: [], hasMore: false, nextOffset: null };
			const blockedIds = await getBlockedUserIds(context.session?.user.id);

			const rows = await createDb()
				.select({ id: user.id })
				.from(user)
				.where(
					and(
						eq(user.status, "active"),
						eq(user.isAnonymous, false),
						...(blockedIds.length > 0 ? [notInArray(user.id, blockedIds)] : []),
						or(
							containsInsensitive(user.name, keyword),
							containsInsensitive(user.handle, keyword),
							containsInsensitive(user.bio, keyword),
						),
					),
				)
				.orderBy(desc(user.createdAt))
				.limit(input.limit + 1)
				.offset(input.offset);
			const page = toPage(rows, input.limit, input.offset);

			return {
				...page,
				items: await Promise.all(
					page.items.map((row) => getProfile(row.id, context.session?.user.id)),
				),
			};
		},
	),

	connections: publicProcedure.profiles.connections.handler(
		async ({ input, context }) => {
			const db = createDb();
			const blockedIds = await getBlockedUserIds(context.session?.user.id);
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
									...(blockedIds.length > 0
										? [notInArray(user.id, blockedIds)]
										: []),
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
									...(blockedIds.length > 0
										? [notInArray(user.id, blockedIds)]
										: []),
								),
							)
							.orderBy(desc(follow.createdAt))
							.limit(input.limit);

			return Promise.all(
				rows.map((row) => getProfile(row.userId, context.session?.user.id)),
			);
		},
	),

	profile: publicProcedure.profiles.profile.handler(
		async ({ input, context }) => {
			const isBlocked = context.session?.user.id
				? await isUserBlockedBy(context.session.user.id, input.userId)
				: false;
			const profile = await getProfile(input.userId, context.session?.user.id);
			if (isBlocked) return { isBlocked, profile, notes: [] };
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
				isBlocked,
				profile,
				notes: await hydrateContentNotes(rows, context.session?.user.id),
			};
		},
	),

	profileByHandle: publicProcedure.profiles.profileByHandle.handler(
		async ({ input, context }) => {
			const [row] = await createDb()
				.select({ id: user.id })
				.from(user)
				.where(
					and(
						eq(user.handle, input.handle),
						eq(user.status, "active"),
						eq(user.isAnonymous, false),
					),
				)
				.limit(1);

			if (!row) {
				throw new ORPCError("NOT_FOUND");
			}

			if (
				context.session?.user.id &&
				(await isUserBlockedBy(context.session.user.id, row.id))
			) {
				throw new ORPCError("NOT_FOUND");
			}
			return getProfile(row.id, context.session?.user.id);
		},
	),

	me: protectedProcedure.profiles.me.handler(async ({ context }) => {
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

	meProfile: protectedProcedure.profiles.meProfile.handler(
		async ({ context }) => {
			const userId = context.session.user.id;
			return getProfile(userId, userId);
		},
	),

	meFeed: protectedProcedure.profiles.meFeed.handler(
		async ({ input, context }) => {
			const userId = context.session.user.id;
			const rows = await listMeContentNoteRows(userId, input.tab, input.limit);
			return hydrateContentNotes(rows, userId);
		},
	),

	updateProfile: activeUserProcedure.profiles.updateProfile.handler(
		async ({ input, context }) => {
			const db = createDb();
			const [updated] = await db
				.update(user)
				.set({
					name: input.name,
					handle: input.handle || null,
					bio: input.bio || null,
					gender: input.gender,
					image: input.image || null,
					...(input.coverImage !== undefined
						? { coverImage: input.coverImage || null }
						: {}),
				})
				.where(eq(user.id, context.session.user.id))
				.returning();
			return updated;
		},
	),

	toggleFollow: activeUserProcedure.profiles.toggleFollow.handler(
		async ({ input, context }) => {
			const viewerId = context.session.user.id;
			if (viewerId === input.userId) {
				throw new ORPCError("BAD_REQUEST");
			}
			if (await hasMessagingBlock(viewerId, input.userId)) {
				throw new ORPCError("FORBIDDEN", {
					message: "拉黑状态下不能关注对方",
				});
			}

			const db = createDb();
			const [target] = await db
				.select({ id: user.id })
				.from(user)
				.where(
					and(
						eq(user.id, input.userId),
						eq(user.status, "active"),
						eq(user.isAnonymous, false),
					),
				)
				.limit(1);
			if (!target) {
				throw new ORPCError("NOT_FOUND");
			}

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
		},
	),

	blockedUsers: protectedProcedure.profiles.blockedUsers.handler(
		async ({ context }) => {
			return listBlockedUsers(context.session.user.id);
		},
	),

	setBlocked: activeUserProcedure.profiles.setBlocked.handler(
		async ({ input, context }) => {
			return setUserBlocked({
				blocked: input.blocked,
				blockedId: input.userId,
				blockerId: context.session.user.id,
			});
		},
	),
};
