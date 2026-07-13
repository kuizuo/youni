import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, Spinner, Typography, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MeEditProfileSheetHost } from "@/components/profile/me/edit-profile-sheet-host";
import { MeTabEmptyState } from "@/components/profile/me/empty-state";
import { MeStickyChrome } from "@/components/profile/me/sticky-chrome";
import { MeCommentsTab } from "@/components/profile/me-comments-tab";
import { MeProfileHeader } from "@/components/profile/me-profile-header";
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
import { authClient } from "@/lib/auth-client";
import {
	pickAndUploadAvatar,
	pickAndUploadProfileCover,
} from "@/lib/avatar-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

export default function MeScreen() {
	const router = useRouter();
	const { toast } = useAppToast();
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
	const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
	const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
	const [isChangingAvatar, setIsChangingAvatar] = useState(false);
	const [isChangingCover, setIsChangingCover] = useState(false);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const isAuthenticated = Boolean(currentUser);
	const profileQuery = useQuery({
		...orpc.profiles.meProfile.queryOptions(),
		enabled: isAuthenticated,
	});
	const notesFeed = useQuery({
		...orpc.profiles.meFeed.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT, tab: "notes" },
		}),
		enabled: isAuthenticated,
	});
	const collectionsFeed = useQuery({
		...orpc.profiles.meFeed.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT, tab: "collections" },
		}),
		enabled: isAuthenticated && activeTab === "collections",
	});
	const likedFeed = useQuery({
		...orpc.profiles.meFeed.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT, tab: "liked" },
		}),
		enabled: isAuthenticated && activeTab === "liked",
	});
	const commentsFeed = useQuery({
		...orpc.comments.myComments.queryOptions({
			input: { limit: PROFILE_FEED_LIMIT },
		}),
		enabled: isAuthenticated && activeTab === "comments",
	});
	const tabQueries = {
		collections: collectionsFeed,
		comments: commentsFeed,
		liked: likedFeed,
		notes: notesFeed,
	};
	const profile = profileQuery.data;
	const isProfileLoading = !profileQuery.data && profileQuery.isLoading;
	const isAccountLoading = isProfileLoading && !currentUser;
	const displayName = profile?.name ?? currentUser?.name ?? "我";
	const displayEmail = currentUser?.email ?? "登录账号";
	const displayHandle = profile?.handle ? `@${profile.handle}` : displayEmail;
	const avatarImage = profile?.image ?? currentUser?.image;
	const coverImage = profile?.coverImage;
	const avatarInitial = displayName.slice(0, 1);
	const updateProfile = useMutation(
		orpc.profiles.updateProfile.mutationOptions(),
	);

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
	const activeFeed = tabQueries[activeTab];

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

	const openAvatarPreview = () => {
		fireHaptic();
		setIsAvatarPreviewOpen(true);
	};

	const changeAvatar = async () => {
		fireHaptic();
		setIsChangingAvatar(true);
		try {
			const uploaded = await pickAndUploadAvatar();
			if (!uploaded) return;

			await updateProfile.mutateAsync({
				bio: profile?.bio?.trim() ?? "",
				gender:
					profile?.gender === "male" || profile?.gender === "female"
						? profile.gender
						: "unknown",
				handle: profile?.handle?.trim() ?? "",
				image: uploaded.url,
				name: displayName.trim() || "我",
			});
			await profileQuery.refetch();
			await queryClient.refetchQueries();
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "头像更换失败",
			});
		} finally {
			setIsChangingAvatar(false);
		}
	};

	const changeCover = async () => {
		fireHaptic();
		setIsChangingCover(true);
		try {
			const uploaded = await pickAndUploadProfileCover();
			if (!uploaded) return;

			await updateProfile.mutateAsync({
				bio: profile?.bio?.trim() ?? "",
				coverImage: uploaded.url,
				gender:
					profile?.gender === "male" || profile?.gender === "female"
						? profile.gender
						: "unknown",
				handle: profile?.handle?.trim() ?? "",
				image: avatarImage ?? "",
				name: displayName.trim() || "我",
			});
			await profileQuery.refetch();
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "背景图更换失败",
			});
		} finally {
			setIsChangingCover(false);
		}
	};

	const openCover = () => {
		if (!coverImage) {
			void changeCover();
			return;
		}

		fireHaptic();
		setIsCoverPreviewOpen(true);
	};

	const refreshTab = async (
		tab: ProfileTabKey,
		options: { showRefreshControl?: boolean } = {},
	) => {
		const showRefreshControl = options.showRefreshControl ?? true;
		fireHaptic();
		if (showRefreshControl) {
			setIsManuallyRefreshing(true);
		}
		try {
			await Promise.all([profileQuery.refetch(), tabQueries[tab].refetch()]);
		} finally {
			if (showRefreshControl) {
				setIsManuallyRefreshing(false);
			}
		}
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

	return (
		<View className="flex-1" style={{ backgroundColor }}>
			<ProfileCollapsibleTabs
				activeTab={activeTab}
				backgroundColor={backgroundColor}
				contentWidth={contentWidth}
				headerColor={PROFILE_HERO_COLOR}
				headerHeight={headerHeight}
				minTabContentHeight={minTabContentHeight}
				refreshColor={foregroundColor}
				refreshing={isManuallyRefreshing}
				tabBarHeight={PROFILE_TAB_BAR_HEIGHT}
				tabs={PROFILE_TABS}
				topChromeHeight={topChromeHeight}
				onRefresh={() => refreshTab(activeTab)}
				onTabChange={setActiveTab}
				renderHeader={(scrollY) => (
					<MeProfileHeader
						avatarInitial={avatarInitial}
						backgroundColor={backgroundColor}
						coverImage={coverImage}
						displayHandle={displayHandle}
						displayName={displayName}
						headerHeight={headerHeight}
						image={avatarImage}
						isAccountLoading={isAccountLoading}
						isChangingCover={isChangingCover || updateProfile.isPending}
						isProfileLoading={isProfileLoading}
						profile={profile}
						scrollY={scrollY}
						topChromeHeight={topChromeHeight}
						onAvatarPress={openAvatarPreview}
						onCoverPress={openCover}
						onMeasuredHeight={(height) => {
							setMeasuredHeaderHeight((current) =>
								current === height ? current : height,
							);
						}}
						onOpenConnections={openConnections}
					/>
				)}
				renderStickyHeader={(style, miniProfileStyle) => (
					<MeStickyChrome
						avatarInitial={avatarInitial}
						displayName={displayName}
						image={avatarImage}
						isEditDisabled={isProfileLoading}
						miniProfileStyle={miniProfileStyle}
						style={style}
						topChromeHeight={topChromeHeight}
						onAvatarPress={openAvatarPreview}
						onEdit={() => {
							fireHaptic();
							setIsEditOpen(true);
						}}
						onMenu={() => setIsMenuOpen(true)}
						onSearch={openSearch}
					/>
				)}
				renderTabBar={({ elevated, onSelect, pageWidth, pagerScrollX }) => (
					<ProfileTabBar
						accentColor={accentColor}
						activeTab={activeTab}
						backgroundColor={backgroundColor}
						elevated={elevated}
						foregroundColor={foregroundColor}
						mutedColor={mutedColor}
						pageWidth={pageWidth}
						pagerScrollX={pagerScrollX}
						onSelect={onSelect}
					/>
				)}
			>
				{PROFILE_TABS.map((tab) => (
					<ProfileTabPane key={tab.key}>
						{tab.key === "comments" ? (
							<MeCommentsTab
								authorImage={avatarImage}
								authorName={displayName}
								comments={commentsFeed.data ?? []}
								isError={commentsFeed.isError || profileQuery.isError}
								isLoading={commentsFeed.isLoading}
								width={contentWidth}
								onRetry={() => {
									void refreshTab("comments", {
										showRefreshControl: false,
									});
								}}
							/>
						) : (
							<ProfileTabPage
								emptyState={
									<MeTabEmptyState tab={tab.key} onCreate={openCreate} />
								}
								feedItems={feedItemsByTab[tab.key]}
								isError={tabQueries[tab.key].isError || profileQuery.isError}
								isLoading={tabQueries[tab.key].isLoading}
								width={contentWidth}
								onRetry={() => {
									void refreshTab(tab.key, { showRefreshControl: false });
								}}
							/>
						)}
					</ProfileTabPane>
				))}
			</ProfileCollapsibleTabs>

			<ProfileMenuDrawer
				displayHandle={displayHandle}
				displayName={displayName}
				image={avatarImage}
				isVisible={isMenuOpen}
				onClose={() => setIsMenuOpen(false)}
				onSignOut={signOut}
			/>

			<AvatarPreviewModal
				displayName={displayName}
				image={avatarImage}
				initial={avatarInitial}
				insetsBottom={insets.bottom}
				insetsTop={insets.top}
				isChanging={isChangingAvatar || updateProfile.isPending}
				isVisible={isAvatarPreviewOpen}
				onChangeAvatar={changeAvatar}
				onClose={() => setIsAvatarPreviewOpen(false)}
			/>

			<CoverPreviewModal
				image={coverImage}
				insetsBottom={insets.bottom}
				insetsTop={insets.top}
				isChanging={isChangingCover || updateProfile.isPending}
				isVisible={isCoverPreviewOpen && Boolean(coverImage)}
				onChangeCover={changeCover}
				onClose={() => setIsCoverPreviewOpen(false)}
			/>

			<MeEditProfileSheetHost
				displayName={displayName}
				isOpen={isEditOpen}
				profile={profile}
				user={currentUser}
				onOpenChange={setIsEditOpen}
				onSaved={async () => {
					await profileQuery.refetch();
					await activeFeed.refetch();
					await queryClient.refetchQueries();
					setIsEditOpen(false);
				}}
			/>
		</View>
	);
}

function CoverPreviewModal({
	image,
	insetsBottom,
	insetsTop,
	isChanging,
	isVisible,
	onChangeCover,
	onClose,
}: {
	image?: null | string;
	insetsBottom: number;
	insetsTop: number;
	isChanging: boolean;
	isVisible: boolean;
	onChangeCover: () => void;
	onClose: () => void;
}) {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const dimensions = useWindowDimensions();
	const previewWidth = dimensions.width;
	const previewHeight = Math.min(dimensions.height * 0.5, previewWidth * 0.62);

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			transparent
			visible={isVisible}
		>
			<View className="flex-1 bg-black">
				<Pressable className="absolute inset-0" onPress={onClose} />
				<View
					className="absolute right-4 left-4 flex-row justify-end"
					style={{ top: insetsTop + 12 }}
				>
					<Button
						isIconOnly
						variant="ghost"
						className="rounded-full bg-white/15"
						accessibilityLabel="关闭背景图预览"
						onPress={onClose}
					>
						<Ionicons name="close" size={22} color="#ffffff" />
					</Button>
				</View>

				<View className="flex-1 items-center justify-center">
					{image ? (
						<Image
							source={{ uri: image }}
							contentFit="cover"
							className="bg-white/10"
							style={{ height: previewHeight, width: previewWidth }}
						/>
					) : null}
				</View>

				<View
					className="absolute right-4 left-4"
					style={{ bottom: Math.max(insetsBottom, 16) }}
				>
					<Button
						variant="primary"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						isDisabled={isChanging}
						onPress={onChangeCover}
					>
						{isChanging ? (
							<Spinner size="sm" color={accentForegroundColor} />
						) : null}
						<Button.Label>{isChanging ? "更换中" : "更换背景图"}</Button.Label>
					</Button>
				</View>
			</View>
		</Modal>
	);
}

function AvatarPreviewModal({
	displayName,
	image,
	initial,
	insetsBottom,
	insetsTop,
	isChanging,
	isVisible,
	onChangeAvatar,
	onClose,
}: {
	displayName: string;
	image?: null | string;
	initial: string;
	insetsBottom: number;
	insetsTop: number;
	isChanging: boolean;
	isVisible: boolean;
	onChangeAvatar: () => void;
	onClose: () => void;
}) {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const dimensions = useWindowDimensions();
	const previewSize = Math.min(dimensions.width - 48, 320);

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			transparent
			visible={isVisible}
		>
			<View className="flex-1 bg-black">
				<Pressable className="absolute inset-0" onPress={onClose} />
				<View
					className="absolute right-4 left-4 flex-row justify-end"
					style={{ top: insetsTop + 12 }}
				>
					<Button
						isIconOnly
						variant="ghost"
						className="rounded-full bg-white/15"
						accessibilityLabel="关闭头像预览"
						onPress={onClose}
					>
						<Ionicons name="close" size={22} color="#ffffff" />
					</Button>
				</View>

				<View className="flex-1 items-center justify-center px-6">
					{image ? (
						<Image
							source={{ uri: image }}
							contentFit="cover"
							className="bg-white/10"
							style={{
								borderRadius: previewSize / 2,
								height: previewSize,
								width: previewSize,
							}}
						/>
					) : (
						<View
							accessibilityLabel={displayName}
							className="items-center justify-center bg-white/10"
							style={{
								borderRadius: previewSize / 2,
								height: previewSize,
								width: previewSize,
							}}
						>
							<Typography.Paragraph
								weight="bold"
								style={{ color: "#ffffff", fontSize: 88, lineHeight: 104 }}
							>
								{initial}
							</Typography.Paragraph>
						</View>
					)}
				</View>

				<View
					className="absolute right-4 left-4"
					style={{ bottom: Math.max(insetsBottom, 16) }}
				>
					<Button
						variant="primary"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						isDisabled={isChanging}
						onPress={onChangeAvatar}
					>
						{isChanging ? (
							<Spinner size="sm" color={accentForegroundColor} />
						) : (
							<Ionicons
								name="camera-outline"
								size={18}
								color={accentForegroundColor}
							/>
						)}
						<Button.Label>{isChanging ? "更换中" : "更换头像"}</Button.Label>
					</Button>
				</View>
			</View>
		</Modal>
	);
}
