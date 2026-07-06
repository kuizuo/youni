import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListSeparator } from "@/components/shared/app-separator";
import { ConnectionRow } from "@/components/users/connections/connection-row";
import { ConnectionsEmptyState } from "@/components/users/connections/empty";
import { ConnectionsHeader } from "@/components/users/connections/header";
import type {
	ConnectionType,
	ConnectionUser,
} from "@/components/users/connections/types";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { orpc } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

export default function UserConnectionsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{
		title?: string | string[];
		type?: string | string[];
		userId?: string | string[];
	}>();
	const initialType =
		getRouteParam(params.type) === "followers" ? "followers" : "following";
	const userId = getRouteParam(params.userId) ?? "";
	const title = getRouteParam(params.title) ?? "用户";
	const socialActions = useSocialActions();
	const [activeType, setActiveType] = useState<ConnectionType>(initialType);
	const connections = useQuery({
		...orpc.connections.queryOptions({
			input: { userId: userId || "missing", type: activeType, limit: 60 },
		}),
		enabled: Boolean(userId),
	});
	const items = useMemo(
		() => (connections.data ?? []) as ConnectionUser[],
		[connections.data],
	);

	const switchType = (type: ConnectionType) => {
		setActiveType(type);
	};

	const openUser = (id: string) => {
		socialActions.goTo({ type: "user", id });
	};

	const runToggleFollow = (item: ConnectionUser) => {
		if (socialActions.currentUserId === item.id) return;
		if (socialActions.pending.follow(item.id)) return;
		socialActions.toggleFollow(
			{ userId: item.id },
			{
				redirectTo: `/user/${item.id}`,
			},
		);
	};

	const toggleFollow = (item: ConnectionUser) => {
		if (!item.isFollowing) {
			runToggleFollow(item);
			return;
		}

		Alert.alert("取消关注", `确定不再关注 ${item.name} 吗？`, [
			{ text: "继续关注", style: "cancel" },
			{
				text: "取消关注",
				style: "destructive",
				onPress: () => runToggleFollow(item),
			},
		]);
	};

	return (
		<View className="flex-1 bg-background">
			<ConnectionsHeader
				activeType={activeType}
				title={title}
				topInset={insets.top}
				onBack={() => router.back()}
				onTypeChange={switchType}
			/>

			<FlatList
				className="mx-auto w-full max-w-xl"
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
				data={items}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<ConnectionRow
						activeType={activeType}
						currentUserId={socialActions.currentUserId}
						item={item}
						onOpenUser={openUser}
						onToggleFollow={toggleFollow}
					/>
				)}
				ItemSeparatorComponent={ListSeparator}
				ListEmptyComponent={
					<ConnectionsEmptyState
						activeType={activeType}
						isError={connections.isError}
						isLoading={connections.isLoading}
						onRetry={() => connections.refetch()}
					/>
				}
			/>
		</View>
	);
}
