import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	cn,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState } from "@/components/social-states";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { orpc } from "@/utils/orpc";

type ConnectionType = "following" | "followers";
type ConnectionUser = {
	bio: null | string;
	email: string;
	followerCount: number;
	handle: null | string;
	id: string;
	image: null | string;
	isFollowing: boolean;
	name: string;
	noteCount: number;
};

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

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
	const mutedColor = useThemeColor("muted");
	const socialActions = useSocialActions();
	const [activeType, setActiveType] = useState<ConnectionType>(initialType);
	const [pendingFollowId, setPendingFollowId] = useState<null | string>(null);
	const connections = useQuery({
		...orpc.social.connections.queryOptions({
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

	const toggleFollow = (item: ConnectionUser) => {
		if (socialActions.currentUserId === item.id) return;
		setPendingFollowId(item.id);
		const started = socialActions.toggleFollow(
			{ userId: item.id },
			{
				onSettled: () => {
					setPendingFollowId(null);
				},
				redirectTo: `/user/${item.id}`,
				showSuccessToast: false,
			},
		);
		if (!started) {
			setPendingFollowId(null);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<View
				className="border-border-secondary border-b bg-background px-4 pb-3"
				style={{ paddingTop: insets.top + 8 }}
			>
				<View className="h-12 flex-row items-center gap-3">
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="返回"
						onPress={() => router.back()}
					>
						<Ionicons name="chevron-back" size={24} color={mutedColor} />
					</Button>
					<View className="min-w-0 flex-1">
						<Text.Paragraph weight="bold" numberOfLines={1}>
							{title}
						</Text.Paragraph>
						<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
							关注与粉丝
						</Text.Paragraph>
					</View>
				</View>
				<View className="mt-3 flex-row rounded-full bg-content2 p-1">
					<SegmentButton
						isActive={activeType === "following"}
						label="关注"
						onPress={() => switchType("following")}
					/>
					<SegmentButton
						isActive={activeType === "followers"}
						label="粉丝"
						onPress={() => switchType("followers")}
					/>
				</View>
			</View>

			<FlatList
				className="mx-auto w-full max-w-xl"
				contentInsetAdjustmentBehavior="automatic"
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
				data={items}
				keyExtractor={(item) => item.id}
				refreshControl={
					<RefreshControl
						refreshing={connections.isRefetching}
						onRefresh={() => connections.refetch()}
					/>
				}
				renderItem={({ item }) => (
					<ConnectionRow
						currentUserId={socialActions.currentUserId}
						isPending={pendingFollowId === item.id}
						item={item}
						onOpenUser={openUser}
						onToggleFollow={toggleFollow}
					/>
				)}
				ListEmptyComponent={
					connections.isLoading ? (
						<View className="items-center py-16">
							<Spinner />
						</View>
					) : connections.isError ? (
						<ErrorState
							description="列表暂时没有加载出来，请稍后重试。"
							onRetry={() => connections.refetch()}
						/>
					) : (
						<EmptyState
							icon="people-outline"
							title={activeType === "following" ? "还没有关注" : "还没有粉丝"}
							description="有新的关系后，会显示在这里。"
						/>
					)
				}
			/>
		</View>
	);
}

function SegmentButton({
	isActive,
	label,
	onPress,
}: {
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant={isActive ? "primary" : "ghost"}
			className="h-9 flex-1 rounded-full"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}

function ConnectionRow({
	currentUserId,
	isPending,
	item,
	onOpenUser,
	onToggleFollow,
}: {
	currentUserId?: string;
	isPending: boolean;
	item: ConnectionUser;
	onOpenUser: (id: string) => void;
	onToggleFollow: (item: ConnectionUser) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const isSelf = currentUserId === item.id;

	const openUser = () => {
		onOpenUser(item.id);
	};

	const toggleFollow = () => {
		if (isSelf) return;
		onToggleFollow(item);
	};

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`查看 ${item.name} 的主页`}
			className="flex-row items-center gap-3 border-border-tertiary border-b px-4 py-3"
			onPress={openUser}
		>
			<Avatar size="md" alt={item.name}>
				{item.image ? <Avatar.Image source={{ uri: item.image }} /> : null}
				<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
			</Avatar>
			<View className="min-w-0 flex-1 gap-1">
				<Text.Paragraph
					weight="semibold"
					numberOfLines={1}
					className="text-foreground"
				>
					{item.name}
				</Text.Paragraph>
				<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
					{[
						item.noteCount ? `笔记 ${item.noteCount}` : null,
						item.followerCount ? `粉丝 ${item.followerCount}` : null,
					]
						.filter(Boolean)
						.join(" · ") ||
						item.bio ||
						(item.handle ? `@${item.handle}` : item.email)}
				</Text.Paragraph>
			</View>
			{isSelf ? null : (
				<Button
					size="sm"
					variant={item.isFollowing ? "secondary" : "primary"}
					className={cn("rounded-full px-4", isPending && "opacity-70")}
					feedbackVariant="scale-ripple"
					isDisabled={isPending}
					onPress={toggleFollow}
				>
					<Ionicons
						name={item.isFollowing ? "checkmark-outline" : "person-add-outline"}
						size={15}
						color={mutedColor}
					/>
					<Button.Label>{item.isFollowing ? "已关注" : "关注"}</Button.Label>
				</Button>
			)}
		</PressableFeedback>
	);
}
