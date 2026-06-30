import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Skeleton,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo } from "react";
import { RefreshControl, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const PROFILE_HERO_COLOR = "#728894";
const PROFILE_HEADER_HEIGHT = 330;

type UserFeedNote = Parameters<typeof NoteCard>[0]["note"];
type UserFeedItem = ReturnType<
	typeof createTwoColumnFeed<UserFeedNote>
>[number];

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function UserProfileScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const currentUserId = session.data?.user?.id;

	const profile = useQuery({
		...orpc.social.profile.queryOptions({ input: { userId: id || "missing" } }),
		enabled: Boolean(id),
	});
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: async (result) => {
				await profile.refetch();
				queryClient.refetchQueries();
				toast.show({ label: result.following ? "已关注" : "已取消关注" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const startChatMutation = useMutation(
		orpc.messages.start.mutationOptions({
			onSuccess: (result) => {
				queryClient.refetchQueries();
				router.push({
					pathname: "/chat/[id]",
					params: { id: result.id },
				} as unknown as Href);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	const profileData = profile.data?.profile;
	const notes = useMemo(() => profile.data?.notes ?? [], [profile.data?.notes]);
	const feedItems = useMemo(() => createTwoColumnFeed(notes), [notes]);
	const isSelf = currentUserId === id;
	const displayName = profileData?.name ?? "用户";
	const displayHandle = profileData?.handle
		? `@${profileData.handle}`
		: (profileData?.email ?? "Youni 用户");
	const isFollowing = Boolean(profileData?.isFollowing);
	const topChromeHeight = insets.top + 72;

	const requireLogin = () => {
		if (session.data?.user) return true;
		router.push(getLoginHref(`/user/${id}`));
		return false;
	};

	const toggleFollow = () => {
		if (!id || isSelf || !requireLogin()) return;
		followMutation.mutate({ userId: id });
	};

	const openChat = () => {
		if (!id || isSelf || !requireLogin()) return;
		startChatMutation.mutate({ userId: id });
	};

	const openConnections = (type: "followers" | "following") => {
		router.push({
			pathname: "/user-connections",
			params: {
				type,
				userId: id,
				title: displayName,
			},
		} as unknown as Href);
	};

	if (profile.isError) {
		return (
			<View className="flex-1 bg-background pt-6">
				<ProfileTopBar onBack={() => router.back()} />
				<ErrorState
					title="主页没有打开"
					description="用户可能不存在，或者网络暂时不可用。"
					onRetry={() => profile.refetch()}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<Animated.ScrollView
				className="flex-1"
				contentContainerClassName="bg-background pb-32"
				contentInsetAdjustmentBehavior="never"
				refreshControl={
					<RefreshControl
						progressViewOffset={topChromeHeight}
						refreshing={profile.isRefetching}
						onRefresh={() => profile.refetch()}
					/>
				}
				showsVerticalScrollIndicator={false}
			>
				<View
					className="overflow-hidden"
					style={{
						backgroundColor: PROFILE_HERO_COLOR,
						minHeight: PROFILE_HEADER_HEIGHT + insets.top,
						paddingTop: topChromeHeight,
					}}
				>
					<View className="mx-auto w-full max-w-xl gap-5 px-4 pb-8">
						<View className="flex-row items-center gap-4">
							<View className="size-24 items-center justify-center overflow-hidden rounded-full border border-white/50 bg-black/20">
								{profile.isLoading || !profileData ? (
									<Skeleton className="size-24 rounded-full" />
								) : (
									<Avatar size="lg" alt={displayName} className="size-24">
										{profileData.image ? (
											<Avatar.Image source={{ uri: profileData.image }} />
										) : null}
										<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
									</Avatar>
								)}
							</View>

							<View className="min-w-0 flex-1 gap-2">
								{profile.isLoading || !profileData ? (
									<>
										<Skeleton className="h-6 w-24 rounded-full" />
										<Skeleton className="h-4 w-36 rounded-full" />
									</>
								) : (
									<>
										<Text.Paragraph
											weight="bold"
											numberOfLines={1}
											style={{ color: "#ffffff", fontSize: 26 }}
										>
											{displayName}
										</Text.Paragraph>
										<Text.Paragraph
											type="body-sm"
											numberOfLines={1}
											style={{ color: "rgba(255, 255, 255, 0.7)" }}
										>
											{displayHandle}
										</Text.Paragraph>
									</>
								)}
							</View>
						</View>

						<View className="flex-row items-center gap-6">
							<HeroStat
								isLoading={profile.isLoading}
								label="关注"
								value={profileData?.followingCount}
								onPress={() => openConnections("following")}
							/>
							<HeroStat
								isLoading={profile.isLoading}
								label="粉丝"
								value={profileData?.followerCount}
								onPress={() => openConnections("followers")}
							/>
							<HeroStat
								isLoading={profile.isLoading}
								label="获赞与收藏"
								value={profileData?.likedCount}
							/>
						</View>

						{profileData?.bio ? (
							<Text.Paragraph
								className="leading-6"
								style={{ color: "rgba(255, 255, 255, 0.82)" }}
							>
								{profileData.bio}
							</Text.Paragraph>
						) : profile.isLoading ? (
							<View className="gap-2">
								<Skeleton className="h-3 w-4/5 rounded-full" />
								<Skeleton className="h-3 w-2/3 rounded-full" />
							</View>
						) : null}

						<View className="flex-row gap-2">
							{isSelf ? (
								<Button
									variant="secondary"
									className="flex-1 rounded-full bg-white/15"
									feedbackVariant="scale-ripple"
									onPress={() => router.push("/me" as Href)}
								>
									<Ionicons name="person-outline" size={16} color="#ffffff" />
									<Button.Label className="text-white">
										回到我的主页
									</Button.Label>
								</Button>
							) : (
								<>
									<Button
										variant={isFollowing ? "secondary" : "primary"}
										className="flex-1 rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={followMutation.isPending}
										onPress={toggleFollow}
									>
										{followMutation.isPending ? (
											<Spinner size="sm" />
										) : (
											<Ionicons
												name={
													isFollowing
														? "checkmark-outline"
														: "person-add-outline"
												}
												size={16}
												color={isFollowing ? "#ffffff" : accentForegroundColor}
											/>
										)}
										<Button.Label
											className={isFollowing ? "text-white" : undefined}
										>
											{isFollowing ? "已关注" : "关注"}
										</Button.Label>
									</Button>
									<Button
										variant="secondary"
										className="flex-1 rounded-full bg-white/15"
										feedbackVariant="scale-ripple"
										isDisabled={startChatMutation.isPending}
										onPress={openChat}
									>
										{startChatMutation.isPending ? (
											<Spinner size="sm" />
										) : (
											<Ionicons
												name="chatbubble-ellipses-outline"
												size={16}
												color="#ffffff"
											/>
										)}
										<Button.Label className="text-white">发私信</Button.Label>
									</Button>
								</>
							)}
						</View>
					</View>
				</View>

				<View className="-mt-5 overflow-hidden rounded-t-3xl bg-background pt-0">
					<View className="mx-auto h-16 w-full max-w-xl flex-row items-center justify-between px-4">
						<Text.Paragraph weight="semibold" className="text-foreground">
							公开图文
						</Text.Paragraph>
						<View className="flex-row items-center gap-1">
							<Ionicons name="images-outline" size={15} color={mutedColor} />
							<Text.Paragraph type="body-xs" color="muted">
								{notes.length} 篇
							</Text.Paragraph>
						</View>
					</View>
				</View>

				<View className="mx-auto w-full max-w-xl pt-3">
					{profile.isLoading ? (
						<FeedSkeleton />
					) : feedItems.length > 0 ? (
						<View className="gap-3 px-3">
							{feedItems.reduce<React.ReactNode[]>((rows, item, index) => {
								if (index % 2 === 1) return rows;
								const nextItem = feedItems[index + 1];
								rows.push(
									<View
										key={`row-${item.id}`}
										className="flex-row items-start gap-3"
									>
										<FeedCell item={item} />
										{nextItem ? (
											<FeedCell item={nextItem} />
										) : (
											<View className="flex-1 basis-0" />
										)}
									</View>,
								);
								return rows;
							}, [])}
						</View>
					) : (
						<EmptyState
							icon="images-outline"
							title="还没有公开图文"
							description="有新内容发布后，会出现在这里。"
						/>
					)}
				</View>
			</Animated.ScrollView>

			<View
				className="absolute top-0 right-0 left-0"
				pointerEvents="box-none"
				style={{
					paddingTop: insets.top + 10,
				}}
			>
				<View className="mx-auto w-full max-w-xl flex-row items-center justify-between px-4">
					<ProfileTopBar onBack={() => router.back()} />
				</View>
			</View>
		</View>
	);
}

function ProfileTopBar({ onBack }: { onBack: () => void }) {
	return (
		<View className="h-11 flex-1 flex-row items-center justify-between">
			<Button
				isIconOnly
				size="sm"
				variant="ghost"
				className="rounded-full bg-white/15"
				feedbackVariant="scale-ripple"
				accessibilityLabel="返回"
				onPress={onBack}
			>
				<Ionicons name="chevron-back" size={24} color="#ffffff" />
			</Button>
			<View className="h-11 w-11" />
		</View>
	);
}

function HeroStat({
	isLoading,
	label,
	onPress,
	value,
}: {
	isLoading: boolean;
	label: string;
	onPress?: () => void;
	value?: number;
}) {
	const content = (
		<View className="flex-row items-baseline gap-1">
			{isLoading ? (
				<Skeleton className="h-5 w-8 rounded-full" />
			) : (
				<Text.Paragraph
					weight="bold"
					style={{ color: "#ffffff", fontVariant: ["tabular-nums"] }}
				>
					{value ?? 0}
				</Text.Paragraph>
			)}
			<Text.Paragraph
				type="body-sm"
				style={{ color: "rgba(255, 255, 255, 0.78)" }}
			>
				{label}
			</Text.Paragraph>
		</View>
	);

	if (!onPress) return content;

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`查看${label}`}
			onPress={onPress}
		>
			{content}
		</PressableFeedback>
	);
}

function FeedCell({ item }: { item: UserFeedItem }) {
	return (
		<View className="flex-1 basis-0">
			{item.type === "item" ? <NoteCard compact note={item.item} /> : null}
		</View>
	);
}
