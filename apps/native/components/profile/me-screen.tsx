import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { BottomSheet, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EditProfileSheet } from "@/components/profile/edit-profile-sheet";
import {
	MeProfileHeader,
	MeProfileTopChrome,
} from "@/components/profile/me-profile-header";
import {
	createProfileFeedItems,
	ProfileTabBar,
	ProfileTabPage,
	ProfileTabPane,
} from "@/components/profile/me-profile-tab-content";
import { ProfileCollapsibleTabs } from "@/components/profile/profile-collapsible-tabs";
import { ProfileMenuDrawer } from "@/components/profile/profile-menu-drawer";
import {
	MAX_PROFILE_WIDTH,
	PROFILE_FEED_LIMIT,
	PROFILE_HEADER_FALLBACK_HEIGHT,
	PROFILE_HERO_COLOR,
	PROFILE_TAB_BAR_HEIGHT,
	PROFILE_TABS,
	type ProfileTabKey,
} from "@/components/profile/profile-tabs";
import { EmptyState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc, queryClient } from "@/utils/orpc";

export default function MeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const session = authClient.useSession();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");
	const backgroundColor = useThemeColor("background");
	const currentUser = session.data?.user;
	const [activeTab, setActiveTab] = useState<ProfileTabKey>("notes");
	const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState<
		null | number
	>(null);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const isAuthenticated = Boolean(currentUser);
	const profileQuery = useQuery({
		...orpc.social.meProfile.queryOptions(),
		enabled: isAuthenticated,
	});
	const notesFeed = useQuery({
		...orpc.social.meFeed.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT, tab: "notes" },
		}),
		enabled: isAuthenticated,
	});
	const collectionsFeed = useQuery({
		...orpc.social.meFeed.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT, tab: "collections" },
		}),
		enabled: isAuthenticated && activeTab === "collections",
	});
	const likedFeed = useQuery({
		...orpc.social.meFeed.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT, tab: "liked" },
		}),
		enabled: isAuthenticated && activeTab === "liked",
	});
	const feedQueries = {
		collections: collectionsFeed,
		liked: likedFeed,
		notes: notesFeed,
	};
	const profile = profileQuery.data;
	const isProfileLoading = !profileQuery.data && profileQuery.isLoading;
	const isAccountLoading = isProfileLoading && !currentUser;
	const displayName = profile?.name ?? currentUser?.name ?? "我";
	const displayEmail = currentUser?.email ?? "登录账号";
	const displayHandle = profile?.handle ? `@${profile.handle}` : displayEmail;
	const avatarInitial = displayName.slice(0, 1);

	const feedItemsByTab = useMemo(
		() => ({
			collections: createProfileFeedItems(collectionsFeed.data ?? []),
			liked: createProfileFeedItems(likedFeed.data ?? []),
			notes: createProfileFeedItems(notesFeed.data ?? []),
		}),
		[collectionsFeed.data, likedFeed.data, notesFeed.data],
	);
	const contentWidth = Math.max(
		1,
		Math.min(dimensions.width, MAX_PROFILE_WIDTH),
	);
	const headerHeight =
		measuredHeaderHeight ?? PROFILE_HEADER_FALLBACK_HEIGHT + insets.top;
	const topChromeHeight = insets.top + 64;
	const minTabContentHeight = Math.max(
		360,
		dimensions.height - topChromeHeight - PROFILE_TAB_BAR_HEIGHT,
	);
	const activeFeed = feedQueries[activeTab];

	const signOut = () => {
		authClient.signOut();
		queryClient.clear();
		router.replace("/" as Href);
	};

	const openSearch = () => {
		router.push({
			pathname: "/search",
			params: { actionAt: String(Date.now()), source: "me" },
		} as unknown as Href);
	};

	const openCreate = () => {
		router.push("/create" as Href);
	};

	const refreshTab = async (tab: ProfileTabKey) => {
		fireHaptic();
		await Promise.all([profileQuery.refetch(), feedQueries[tab].refetch()]);
	};

	const openConnections = (type: "followers" | "following") => {
		if (!currentUser?.id) return;
		router.push({
			pathname: "/user-connections",
			params: {
				title: displayName,
				type,
				userId: currentUser.id,
			},
		} as unknown as Href);
	};

	const renderEmptyState = (tab: ProfileTabKey) => {
		if (tab === "collections") {
			return (
				<EmptyState
					icon="bookmark-outline"
					title="还没有收藏"
					description="收藏过的图文会出现在这里。"
				/>
			);
		}
		if (tab === "liked") {
			return (
				<EmptyState title="还没有赞过" description="赞过的内容会显示在这里。" />
			);
		}
		return (
			<EmptyState
				icon="add-circle-outline"
				title="还没有作品"
				description="发布第一篇图文后，会出现在这里。"
				actionLabel="去发布"
				onAction={openCreate}
			/>
		);
	};

	return (
		<View className="flex-1" style={{ backgroundColor: PROFILE_HERO_COLOR }}>
			<ProfileCollapsibleTabs
				activeTab={activeTab}
				backgroundColor={backgroundColor}
				contentWidth={contentWidth}
				headerColor={PROFILE_HERO_COLOR}
				headerHeight={headerHeight}
				minTabContentHeight={minTabContentHeight}
				refreshColor={foregroundColor}
				refreshing={profileQuery.isRefetching || activeFeed.isRefetching}
				tabBarHeight={PROFILE_TAB_BAR_HEIGHT}
				tabs={PROFILE_TABS}
				topChromeHeight={topChromeHeight}
				onRefresh={() => refreshTab(activeTab)}
				onTabChange={setActiveTab}
				renderHeader={() => (
					<MeProfileHeader
						avatarInitial={avatarInitial}
						displayHandle={displayHandle}
						displayName={displayName}
						headerHeight={headerHeight}
						image={profile?.image ?? currentUser?.image}
						isAccountLoading={isAccountLoading}
						isProfileLoading={isProfileLoading}
						profile={profile}
						topChromeHeight={topChromeHeight}
						onMeasuredHeight={(height) => {
							setMeasuredHeaderHeight((current) =>
								current === height ? current : height,
							);
						}}
						onOpenConnections={openConnections}
					/>
				)}
				renderStickyHeader={(style, miniProfileStyle) => (
					<Animated.View
						className="absolute top-0 right-0 left-0"
						pointerEvents="box-none"
						style={[
							{
								backgroundColor: PROFILE_HERO_COLOR,
								height: topChromeHeight,
								zIndex: 20,
							},
							style,
						]}
					>
						<MeProfileTopChrome
							avatarInitial={avatarInitial}
							displayName={displayName}
							image={profile?.image ?? currentUser?.image}
							isEditDisabled={isProfileLoading}
							miniProfileStyle={miniProfileStyle}
							topChromeHeight={topChromeHeight}
							onEdit={() => {
								fireHaptic();
								setIsEditOpen(true);
							}}
							onMenu={() => setIsMenuOpen(true)}
							onSearch={openSearch}
						/>
					</Animated.View>
				)}
				renderTabBar={({ elevated, onSelect }) => (
					<ProfileTabBar
						accentColor={accentColor}
						activeTab={activeTab}
						backgroundColor={backgroundColor}
						elevated={elevated}
						foregroundColor={foregroundColor}
						mutedColor={mutedColor}
						onSelect={onSelect}
					/>
				)}
			>
				{PROFILE_TABS.map((tab) => (
					<ProfileTabPane key={tab.key}>
						<ProfileTabPage
							emptyState={renderEmptyState(tab.key)}
							feedItems={feedItemsByTab[tab.key]}
							isError={feedQueries[tab.key].isError || profileQuery.isError}
							isLoading={feedQueries[tab.key].isLoading}
							width={contentWidth}
							onRetry={() => refreshTab(tab.key)}
						/>
					</ProfileTabPane>
				))}
			</ProfileCollapsibleTabs>

			<ProfileMenuDrawer
				displayHandle={displayHandle}
				displayName={displayName}
				image={profile?.image ?? currentUser?.image}
				isVisible={isMenuOpen}
				onClose={() => setIsMenuOpen(false)}
				onSignOut={signOut}
			/>

			<BottomSheet isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
				<BottomSheet.Portal disableFullWindowOverlay>
					<BottomSheet.Overlay />
					<BottomSheet.Content
						snapPoints={["86%"]}
						enableDynamicSizing={false}
						enableOverDrag={false}
						keyboardBehavior="extend"
						contentContainerClassName="h-full"
					>
						<EditProfileSheet
							displayName={displayName}
							profile={profile}
							user={currentUser}
							onSaved={async () => {
								await profileQuery.refetch();
								await activeFeed.refetch();
								await queryClient.refetchQueries();
								setIsEditOpen(false);
							}}
						/>
					</BottomSheet.Content>
				</BottomSheet.Portal>
			</BottomSheet>
		</View>
	);
}
