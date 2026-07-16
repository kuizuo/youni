import { useMutation, useQuery } from "@tanstack/react-query";
import type {
	ProfileConnectionType,
	ProfileUser,
} from "@youni/api/contracts/profiles";
import type { HydratedContentNote } from "@youni/api/contracts/shared";
import * as Clipboard from "expo-clipboard";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileCollapsibleTabs } from "@/components/profile/profile-collapsible-tabs";
import {
	MAX_PROFILE_WIDTH,
	PROFILE_HEADER_FALLBACK_HEIGHT,
	PROFILE_HERO_COLOR,
	PROFILE_TAB_BAR_HEIGHT,
} from "@/components/profile/profile-tabs";
import { EmptyState, ErrorState } from "@/components/social-states";
import { UserProfileActionsSheet } from "@/components/users/profile/actions-sheet";
import {
	UserProfileFeedHeader,
	UserProfileFeedSection,
} from "@/components/users/profile/feed-section";
import { UserProfileHero } from "@/components/users/profile/hero";
import { UserProfileStickyChrome } from "@/components/users/profile/sticky-chrome";
import { ProfileTopBar } from "@/components/users/profile/top-bar";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { confirmAction } from "@/utils/confirm-action";
import { orpc } from "@/utils/orpc";
import { getRouteParam } from "@/utils/route-params";

const USER_PROFILE_TABS = [{ key: "notes" }] as const;
const PUBLIC_PROFILE_BASE_URL = "https://youni.kuizuo.me/user";

export default function UserProfileScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const { toast } = useAppToast();
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const backgroundColor = useThemeColor("background");
	const foregroundColor = useThemeColor("foreground");
	const socialActions = useSocialActions();
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [isMoreOpen, setIsMoreOpen] = useState(false);
	const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState<
		null | number
	>(null);

	const profile = useQuery({
		...orpc.profiles.profile.queryOptions({
			input: { userId: id || "missing" },
		}),
		enabled: Boolean(id),
	});
	const setBlocked = useMutation(
		orpc.profiles.setBlocked.mutationOptions({
			onError: (error) => {
				toast.show({
					label: error instanceof Error ? error.message : "操作失败，请重试",
					variant: "danger",
				});
			},
			onSuccess: (result) => {
				if (result.blocked) {
					toast.show({ label: "已拉黑该用户", variant: "success" });
				}
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
	const followState = socialActions.optimistic.follow(
		id,
		Boolean(profileData?.isFollowing),
		profileData?.followerCount,
	);
	const displayedProfile = profileData
		? {
				...profileData,
				followerCount: followState.count ?? profileData.followerCount,
			}
		: undefined;
	const topChromeHeight = insets.top + 64;
	const contentWidth = Math.max(
		1,
		Math.min(dimensions.width, MAX_PROFILE_WIDTH),
	);
	const headerHeight =
		measuredHeaderHeight ?? PROFILE_HEADER_FALLBACK_HEIGHT + insets.top;
	const minTabContentHeight = Math.max(
		360,
		dimensions.height - topChromeHeight - PROFILE_TAB_BAR_HEIGHT,
	);

	const toggleFollow = () => {
		if (!id || isSelf) return;
		socialActions.toggleFollow(
			{
				active: followState.active,
				count: followState.count,
				userId: id,
			},
			{
				redirectTo: `/user/${id}`,
			},
		);
	};

	const openChat = () => {
		if (!id || isSelf) return;
		socialActions.startChat({ userId: id }, { redirectTo: `/user/${id}` });
	};
	const openMore = () => {
		fireHaptic();
		setIsMoreOpen(true);
	};
	const copyProfileLink = async () => {
		try {
			await Clipboard.setStringAsync(`${PUBLIC_PROFILE_BASE_URL}/${id}`);
			toast.show({ label: "链接已复制", variant: "success" });
		} catch {
			toast.show({ label: "复制失败，请重试", variant: "danger" });
		} finally {
			setIsMoreOpen(false);
		}
	};
	const confirmBlock = () => {
		setIsMoreOpen(false);
		confirmAction({
			cancelText: "取消",
			confirmText: "确认拉黑",
			message: "拉黑后将不再看到对方，双方也不能继续私信。可在设置中解除。",
			onConfirm: () => {
				if (!id || setBlocked.isPending) return;
				setBlocked.mutate({ blocked: true, userId: id });
			},
			title: `拉黑 ${displayName}`,
		});
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
				<ProfileTopBar
					iconColor={foregroundColor}
					onBack={() => router.back()}
				/>
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
				<ProfileTopBar
					iconColor={foregroundColor}
					onBack={() => router.back()}
				/>
				<EmptyState
					icon="ban-outline"
					title="你已拉黑该用户"
					description="解除后可以重新查看对方的公开主页和内容。"
					actionLabel={setBlocked.isPending ? "正在解除" : "解除拉黑"}
					onAction={() => {
						if (setBlocked.isPending) return;
						fireHaptic();
						setBlocked.mutate({ blocked: false, userId: id });
					}}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1" style={{ backgroundColor }}>
			<ProfileCollapsibleTabs
				activeTab="notes"
				backgroundColor={backgroundColor}
				contentWidth={contentWidth}
				headerColor={PROFILE_HERO_COLOR}
				headerHeight={headerHeight}
				minTabContentHeight={minTabContentHeight}
				refreshColor={foregroundColor}
				refreshing={isManuallyRefreshing}
				tabBarHeight={PROFILE_TAB_BAR_HEIGHT}
				tabs={USER_PROFILE_TABS}
				topChromeHeight={topChromeHeight}
				onRefresh={refreshProfile}
				onTabChange={() => {}}
				renderHeader={(scrollY) => (
					<UserProfileHero
						displayHandle={displayHandle}
						displayName={displayName}
						headerHeight={headerHeight}
						isFollowing={followState.active}
						isLoading={profile.isLoading}
						isSelf={isSelf}
						isStartChatPending={socialActions.mutations.startChat.isPending}
						profile={displayedProfile}
						scrollY={scrollY}
						topChromeHeight={topChromeHeight}
						onOpenChat={openChat}
						onOpenConnections={openConnections}
						onOpenMe={() => router.push("/me" as Href)}
						onToggleFollow={toggleFollow}
						onMeasuredHeight={(height) => {
							setMeasuredHeaderHeight((current) =>
								current === height ? current : height,
							);
						}}
					/>
				)}
				renderStickyHeader={(style, miniProfileStyle, isSticky) => (
					<UserProfileStickyChrome
						displayName={displayName}
						image={profileData?.image}
						isFollowing={followState.active}
						isLoading={profile.isLoading}
						isSelf={isSelf}
						isSticky={isSticky}
						miniProfileStyle={miniProfileStyle}
						style={style}
						topChromeHeight={topChromeHeight}
						onBack={() => router.back()}
						onMore={openMore}
						onOpenMe={() => router.push("/me" as Href)}
						onToggleFollow={toggleFollow}
					/>
				)}
				renderTabBar={({ elevated }) => (
					<UserProfileFeedHeader elevated={elevated} noteCount={notes.length} />
				)}
			>
				<UserProfileFeedSection isLoading={profile.isLoading} notes={notes} />
			</ProfileCollapsibleTabs>
			<UserProfileActionsSheet
				isBlockPending={setBlocked.isPending}
				isOpen={isMoreOpen}
				isSelf={isSelf}
				onBlock={confirmBlock}
				onCopyLink={() => {
					void copyProfileLink();
				}}
				onMessage={() => {
					setIsMoreOpen(false);
					openChat();
				}}
				onOpenChange={setIsMoreOpen}
			/>
		</View>
	);
}
