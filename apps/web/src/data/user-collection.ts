import type { AdminUserStatus } from "@youni/api/admin-user-governance";
import type { AdminUserListItem } from "@youni/api/contracts/admin";
import { useMemo } from "react";

import {
	compareCreatedAtDescending,
	createQueryCollection,
	createSingletonQueryCollection,
	useQueryCollection,
} from "@/data/query-collection";
import { client, queryClient } from "@/utils/orpc";

export type UsersQueryInput = {
	accountType?: "anonymous" | "registered";
	keyword?: string;
	limit: number;
	offset: number;
	status?: AdminUserStatus;
};

export function useUsersCollection(input: UsersQueryInput) {
	const scope = useMemo(
		() =>
			createQueryCollection({
				getKey: (item: AdminUserListItem) => item.id,
				id: `admin-users:${JSON.stringify(input)}`,
				queryClient,
				queryFn: ({ signal }) => client.admin.users(input, { signal }),
				queryKey: ["admin", "users", input] as const,
				select: (response) => response.items,
			}),
		[input],
	);

	return useQueryCollection(scope, compareCreatedAtDescending);
}

export function useUserDetailCollection(userId: string) {
	const scope = useMemo(
		() =>
			createSingletonQueryCollection({
				id: `admin-user-detail:${userId}`,
				queryClient,
				queryFn: ({ signal }) =>
					client.admin.userDetail({ id: userId }, { signal }),
				queryKey: ["admin", "user-detail", userId] as const,
			}),
		[userId],
	);

	return useQueryCollection(scope);
}
