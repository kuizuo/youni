import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	ProfileConnectionType,
	ProfileUser,
} from "@youni/api/contracts/profiles";
import type { HydratedContentNote } from "@youni/api/contracts/shared";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { RefreshControl, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState, ErrorState } from "@/components/social-states";
import { UserProfileFeedSection } from "@/components/users/profile/feed-section";
import { UserProfileHero } from "@/components/users/profile/hero";
import { ProfileTopBar } from "@/components/users/profile/top-bar";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

export default function UserProfileScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const socialActions = useSocialActions();
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);

	const profile = useQuery({
		...orpc.profiles.profile.queryOptions({
			input: { userId: id || "missing" },
		}),
		enabled: Boolean(id),
	});
	const unblock = useMutation(
		orpc.profiles.setBlocked.mutationOptions({
			onSuccess: () => {
				void profile.refetch();
			},
		}),
	);

	const profileData: ProfileUser | undefined = profile.data?.profile;
	const notes: HydratedContentNote[] = profile.data?.notes ?? [];
	const isSelf = socialActions.currentUserId === id;
	const displayName = profileData?.name ?? "用户";
	const displayHandle = profileData?.handle
		? `@${profileData.handle}`
		: (profileData?.email ?? "Youni 用户");
	const isFollowing = Boolean(profileData?.isFollowing);
	const topChromeHeight = insets.top + 72;

	const toggleFollow = () => {
		if (!id || isSelf) return;
		if (socialActions.pending.follow(id)) return;
		socialActions.toggleFollow(
			{ userId: id },
			{
				redirectTo: `/user/${id}`,
			},
		);
	};

	const openChat = () => {
		if (!id || isSelf) return;
		socialActions.startChat({ userId: id }, { redirectTo: `/user/${id}` });
	};

	const openConnections = (type: ProfileConnectionType) => {
		socialActions.goTo({
			type: "userConnections",
			userId: id,
			view: type,
			title: displayName,
		});
	};
	const refreshProfile = async () => {
		setIsManuallyRefreshing(true);
		try {
			await profile.refetch();
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	if (profile.isError) {
		return (
			<View className="flex-1 bg-background pt-6">
				<ProfileTopBar onBack={() => router.back()} />
				<ErrorState
					title="主页未能成功打开"
					description="用户可能已不存在，请重试。"
					onRetry={() => profile.refetch()}
				/>
			</View>
		);
	}

	if (profile.data?.isBlocked) {
		return (
			<View className="flex-1 bg-background pt-6">
				<ProfileTopBar onBack={() => router.back()} />
				<EmptyState
					icon="ban-outline"
					title="你已拉黑该用户"
					description="解除后可以重新查看对方的公开主页和内容。"
					actionLabel={unblock.isPending ? "正在解除" : "解除拉黑"}
					onAction={() => {
						if (unblock.isPending) return;
						fireHaptic();
						unblock.mutate({ blocked: false, userId: id });
					}}
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
						refreshing={isManuallyRefreshing}
						onRefresh={refreshProfile}
					/>
				}
				showsVerticalScrollIndicator={false}
			>
				<UserProfileHero
					displayHandle={displayHandle}
					displayName={displayName}
					isFollowing={isFollowing}
					isLoading={profile.isLoading}
					isSelf={isSelf}
					isStartChatPending={socialActions.mutations.startChat.isPending}
					profile={profileData}
					topChromeHeight={topChromeHeight}
					topInset={insets.top}
					onOpenChat={openChat}
					onOpenConnections={openConnections}
					onOpenMe={() => router.push("/me" as Href)}
					onToggleFollow={toggleFollow}
				/>

				<UserProfileFeedSection isLoading={profile.isLoading} notes={notes} />
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
