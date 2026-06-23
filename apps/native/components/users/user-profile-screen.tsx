import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Skeleton,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo } from "react";
import { FlatList, View } from "react-native";

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

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function UserProfileScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");

	const profile = useQuery({
		...orpc.social.profile.queryOptions({ input: { userId: id || "missing" } }),
		enabled: Boolean(id),
	});
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: async () => {
				await profile.refetch();
				queryClient.refetchQueries();
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
	const isSelf = session.data?.user?.id === id;
	const isFollowing = Boolean(profileData?.isFollowing);

	const requireLogin = () => {
		if (session.data?.user) return true;
		router.push(getLoginHref(`/user/${id}`));
		return false;
	};

	const toggleFollow = () => {
		if (!id || isSelf || !requireLogin()) return;
		followMutation.mutate({ userId: id });
	};

	if (profile.isLoading) {
		return (
			<View className="flex-1 bg-background">
				<View className="mx-auto w-full max-w-xl gap-5 px-4 pt-2 pb-5">
					<ProfileTopBar onBack={() => router.back()} />

					<View className="flex-row items-center gap-4">
						<Skeleton className="size-14 rounded-full" />
						<View className="min-w-0 flex-1 gap-2">
							<Skeleton className="h-6 w-28 rounded-full" />
							<Skeleton className="h-3 w-36 rounded-full" />
							<Skeleton className="h-8 w-20 rounded-full" />
						</View>
					</View>

					<View className="gap-2">
						<Skeleton className="h-3 w-4/5 rounded-full" />
						<Skeleton className="h-3 w-2/3 rounded-full" />
					</View>

					<View className="flex-row border-border-tertiary border-y py-3">
						<ProfileStatSkeleton label="作品" />
						<ProfileStatSkeleton label="获赞" />
						<ProfileStatSkeleton label="粉丝" />
					</View>

					<View className="flex-row items-center justify-between">
						<Skeleton className="h-4 w-20 rounded-full" />
						<Skeleton className="h-3 w-12 rounded-full" />
					</View>
				</View>
				<FeedSkeleton />
			</View>
		);
	}

	if (profile.isError || !profileData) {
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
			<FlatList
				className="mx-auto w-full max-w-xl"
				data={feedItems}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperClassName="gap-3 px-3"
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="bg-background pt-2 pb-32"
				renderItem={({ item }) => (
					<View className="flex-1 basis-0">
						{item.type === "item" ? (
							<NoteCard compact note={item.item} />
						) : null}
					</View>
				)}
				ListHeaderComponent={
					<View className="gap-5 px-4 pb-5">
						<ProfileTopBar onBack={() => router.back()} />

						<View className="flex-row items-center gap-4">
							<Avatar size="lg" alt={profileData.name}>
								{profileData.image ? (
									<Avatar.Image source={{ uri: profileData.image }} />
								) : null}
								<Avatar.Fallback>
									{profileData.name.slice(0, 1)}
								</Avatar.Fallback>
							</Avatar>
							<View className="min-w-0 flex-1 gap-2">
								<View className="gap-1">
									<Text.Heading type="h2" numberOfLines={1}>
										{profileData.name}
									</Text.Heading>
									<Text.Paragraph
										type="body-sm"
										color="muted"
										numberOfLines={1}
									>
										{profileData.handle
											? `@${profileData.handle}`
											: profileData.email}
									</Text.Paragraph>
								</View>
								{isSelf ? (
									<Button
										size="sm"
										variant="secondary"
										feedbackVariant="scale-ripple"
										onPress={() => router.push("/me" as Href)}
									>
										<Button.Label>编辑我的资料</Button.Label>
									</Button>
								) : (
									<Button
										size="sm"
										variant={isFollowing ? "secondary" : "primary"}
										feedbackVariant="scale-ripple"
										isDisabled={followMutation.isPending}
										onPress={toggleFollow}
									>
										<Button.Label>
											{isFollowing ? "已关注" : "关注"}
										</Button.Label>
									</Button>
								)}
							</View>
						</View>

						{profileData.bio ? (
							<Text.Paragraph className="text-foreground leading-6">
								{profileData.bio}
							</Text.Paragraph>
						) : null}

						<View className="flex-row border-border-tertiary border-y py-3">
							<ProfileStat label="作品" value={profileData.noteCount} />
							<ProfileStat label="获赞" value={profileData.likedCount} />
							<ProfileStat label="粉丝" value={profileData.followerCount} />
						</View>

						<View className="flex-row items-center justify-between">
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
				}
				ListEmptyComponent={
					<EmptyState
						icon="images-outline"
						title="还没有公开图文"
						description="有新内容发布后，会出现在这里。"
					/>
				}
			/>
		</View>
	);
}

function ProfileTopBar({ onBack }: { onBack: () => void }) {
	const mutedColor = useThemeColor("muted");

	return (
		<View className="flex-row items-center justify-between">
			<PressableFeedback
				accessibilityLabel="返回"
				accessibilityRole="button"
				hitSlop={8}
				onPress={onBack}
				className="size-10 items-center justify-center"
			>
				<Ionicons name="chevron-back" size={24} color={mutedColor} />
			</PressableFeedback>
			<Text.Paragraph type="body-sm" color="muted">
				个人主页
			</Text.Paragraph>
			<View className="size-10" />
		</View>
	);
}

function ProfileStat({ label, value }: { label: string; value: number }) {
	return (
		<View className="flex-1 items-center gap-1">
			<Text.Paragraph weight="semibold" className="text-foreground">
				{value}
			</Text.Paragraph>
			<Text.Paragraph type="body-xs" color="muted">
				{label}
			</Text.Paragraph>
		</View>
	);
}

function ProfileStatSkeleton({ label }: { label: string }) {
	return (
		<View className="flex-1 items-center gap-1">
			<Skeleton className="h-5 w-8 rounded-full" />
			<Text.Paragraph type="body-xs" color="muted">
				{label}
			</Text.Paragraph>
		</View>
	);
}
