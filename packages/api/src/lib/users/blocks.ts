import { ORPCError } from "@orpc/server";
import { createDb } from "@youni/db";
import { follow, user, userBlock } from "@youni/db/schema/index";
import { and, desc, eq, or } from "drizzle-orm";

export async function getBlockedUserIds(viewerId?: string) {
	if (!viewerId) return [];
	const rows = await createDb()
		.select({ blockedId: userBlock.blockedId })
		.from(userBlock)
		.where(eq(userBlock.blockerId, viewerId));
	return rows.map((row) => row.blockedId);
}

export async function isUserBlockedBy(blockerId: string, blockedId: string) {
	const [row] = await createDb()
		.select({ blockedId: userBlock.blockedId })
		.from(userBlock)
		.where(
			and(
				eq(userBlock.blockerId, blockerId),
				eq(userBlock.blockedId, blockedId),
			),
		)
		.limit(1);
	return Boolean(row);
}

export async function hasMessagingBlock(
	leftUserId: string,
	rightUserId: string,
) {
	const [row] = await createDb()
		.select({ blockerId: userBlock.blockerId })
		.from(userBlock)
		.where(
			or(
				and(
					eq(userBlock.blockerId, leftUserId),
					eq(userBlock.blockedId, rightUserId),
				),
				and(
					eq(userBlock.blockerId, rightUserId),
					eq(userBlock.blockedId, leftUserId),
				),
			),
		)
		.limit(1);
	return Boolean(row);
}

export async function setUserBlocked({
	blocked,
	blockedId,
	blockerId,
}: {
	blocked: boolean;
	blockedId: string;
	blockerId: string;
}) {
	if (blockedId === blockerId) {
		throw new ORPCError("BAD_REQUEST", { message: "不能拉黑自己" });
	}
	const db = createDb();
	const [target] = await db
		.select({ id: user.id })
		.from(user)
		.where(
			and(
				eq(user.id, blockedId),
				eq(user.isAnonymous, false),
				eq(user.status, "active"),
			),
		)
		.limit(1);
	if (!target) throw new ORPCError("NOT_FOUND");

	if (blocked) {
		await db.batch([
			db
				.insert(userBlock)
				.values({ blockerId, blockedId })
				.onConflictDoNothing(),
			db
				.delete(follow)
				.where(
					or(
						and(
							eq(follow.followerId, blockerId),
							eq(follow.followingId, blockedId),
						),
						and(
							eq(follow.followerId, blockedId),
							eq(follow.followingId, blockerId),
						),
					),
				),
		]);
	} else {
		await db
			.delete(userBlock)
			.where(
				and(
					eq(userBlock.blockerId, blockerId),
					eq(userBlock.blockedId, blockedId),
				),
			);
	}
	return { blocked, userId: blockedId };
}

export async function listBlockedUsers(blockerId: string) {
	return createDb()
		.select({
			blockedAt: userBlock.createdAt,
			id: user.id,
			image: user.image,
			handle: user.handle,
			name: user.name,
		})
		.from(userBlock)
		.innerJoin(user, eq(userBlock.blockedId, user.id))
		.where(eq(userBlock.blockerId, blockerId))
		.orderBy(desc(userBlock.createdAt));
}
