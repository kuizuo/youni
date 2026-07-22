import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ProfileConnectionType } from "@youni/api/contracts/profiles";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { BottomSheet, ListGroup, useThemeColor } from "heroui-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListDivider } from "@/components/create/create-ui";
import type { NoteCardNote } from "@/components/note-card";
import { MeTabEmptyState } from "@/components/profile/me/empty-state";
import { MeStickyChrome } from "@/components/profile/me/sticky-chrome";
import { MeCommentsTab } from "@/components/profile/me-comments-tab";
import { MeProfileHeader } from "@/components/profile/me-profile-header";
import {
	ProfileTabBar,
	ProfileTabPage,
	ProfileTabPane,
} from "@/components/profile/me-profile-tab-content";
import { ProfileCollapsibleTabs } from "@/components/profile/profile-collapsible-tabs";
import {
	ProfileAvatarPreview,
	ProfileCoverPreview,
} from "@/components/profile/profile-media-preview";
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
import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";
import { authClient } from "@/lib/auth-client";
import { submitProfileMedia } from "@/lib/profile-media-submission";
import { signOutCurrentUser } from "@/lib/sign-out";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { confirmAction } from "@/utils/confirm-action";
import { orpc } from "@/utils/orpc";
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
	const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);
	const [isCoverPreviewOpen, setIsCoverPreviewOpen] = useState(false);
	const [isChangingAvatar, setIsChangingAvatar] = useState(false);
	const [isChangingCover, setIsChangingCover] = useState(false);
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const [selectedNote, setSelectedNote] = useState<NoteCardNote | null>(null);
	const [contentWidth, setContentWidth] = useState(() =>
		Math.min(dimensions.width, MAX_PROFILE_WIDTH),
	);
	const hasFocusedRef = useRef(false);
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
	const refetchNotesFeed = notesFeed.refetch;
	useFocusEffect(
		useCallback(() => {
			if (!hasFocusedRef.current) {
				hasFocusedRef.current = true;
				return;
			}
			if (isAuthenticated) void refetchNotesFeed();
		}, [isAuthenticated, refetchNotesFeed]),
	);
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
	const deleteNote = useMutation(
		orpc.notes.deleteMyNote.mutationOptions({
			onError: (error) => {
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "删除失败",
				});
			},
			onSuccess: async () => {
				setSelectedNote(null);
				await notesFeed.refetch();
			},
		}),
	);

	const feedItemsByTab = useMemo(
		() => ({
			collections: collectionsFeed.data ?? [],
			liked: likedFeed.data ?? [],
			notes: notesFeed.data ?? [],
		}),
		[collectionsFeed.data, likedFeed.data, notesFeed.data],
	);
	const headerHeight =
		measuredHeaderHeight ?? PROFILE_HEADER_FALLBACK_HEIGHT + insets.top;
	const topChromeHeight = insets.top + 64;
	const minTabContentHeight = Math.max(
		360,
		dimensions.height - topChromeHeight - PROFILE_TAB_BAR_HEIGHT,
	);
	const signOut = async () => {
		await signOutCurrentUser();
		router.replace("/login" as Href);
	};

	const openSearch = () => {
		router.push({
			pathname: "/search",
			params: { actionAt: String(Date.now()), source: "me" },
		} as unknown as Href);
	};

	const openCreate = () => {
		router.push("/publish" as Href);
	};

	const openProfileSettings = () => {
		fireHaptic();
		router.push("/settings/profile" as Href);
	};

	const openAvatarPreview = () => {
		fireHaptic();
		setIsAvatarPreviewOpen(true);
	};

	const changeAvatar = async () => {
		fireHaptic();
		setIsChangingAvatar(true);
		try {
			await submitProfileMedia("avatar");
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
			await submitProfileMedia("cover");
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

	const openConnections = (type: ProfileConnectionType) => {
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

	const openNoteActions = (note: NoteCardNote) => {
		fireHaptic();
		setSelectedNote(note);
	};

	const editSelectedNote = () => {
		if (!selectedNote) return;
		fireHaptic();
		const noteId = selectedNote.id;
		setSelectedNote(null);
		router.push({
			pathname: "/publish",
			params: { noteId },
		} as unknown as Href);
	};

	const confirmDeleteSelectedNote = () => {
		if (!selectedNote || deleteNote.isPending) return;
		fireHaptic();
		const noteId = selectedNote.id;
		setSelectedNote(null);
		confirmAction({
			cancelText: "取消",
			confirmText: "删除",
			message: "删除后这篇笔记将不再对任何人可见。",
			title: "删除笔记",
			onConfirm: () => deleteNote.mutate({ id: noteId }),
		});
	};

	return (
		<View
			className="flex-1"
			style={{ backgroundColor }}
			onLayout={(event) => {
				setContentWidth(
					Math.min(
						Math.ceil(event.nativeEvent.layout.width),
						MAX_PROFILE_WIDTH,
					),
				);
			}}
		>
			<ProfileCollapsibleTabs
				activeTab={activeTab}
				backgroundColor={backgroundColor}
				contentWidth={contentWidth}
				headerColor={PROFILE_HERO_COLOR}
				headerHeight={headerHeight}
				minTabContentHeight={minTabContentHeight}
				refreshColor={foregroundColor}
				refreshOnTabReselect
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
						isChangingCover={isChangingCover}
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
						onEdit={openProfileSettings}
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
								onLongPressNote={
									tab.key === "notes" ? openNoteActions : undefined
								}
								showViewCount={tab.key === "notes"}
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

			<ProfileAvatarPreview
				action={{
					isLoading: isChangingAvatar,
					label: "更换头像",
					loadingLabel: "更换中",
					onPress: changeAvatar,
				}}
				displayName={displayName}
				image={avatarImage}
				initial={avatarInitial}
				insetsBottom={insets.bottom}
				insetsTop={insets.top}
				isVisible={isAvatarPreviewOpen}
				onClose={() => setIsAvatarPreviewOpen(false)}
			/>

			<ProfileCoverPreview
				action={{
					isLoading: isChangingCover,
					label: "更换背景图",
					loadingLabel: "更换中",
					onPress: changeCover,
				}}
				image={coverImage}
				insetsBottom={insets.bottom}
				insetsTop={insets.top}
				isVisible={isCoverPreviewOpen && Boolean(coverImage)}
				onClose={() => setIsCoverPreviewOpen(false)}
			/>

			<MeNoteActionsSheet
				note={selectedNote}
				onDelete={confirmDeleteSelectedNote}
				onEdit={editSelectedNote}
				onOpenChange={(isOpen) => {
					if (!isOpen) setSelectedNote(null);
				}}
			/>
		</View>
	);
}

function MeNoteActionsSheet({
	note,
	onDelete,
	onEdit,
	onOpenChange,
}: {
	note: NoteCardNote | null;
	onDelete: () => void;
	onEdit: () => void;
	onOpenChange: (isOpen: boolean) => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const dangerColor = useThemeColor("danger");

	return (
		<BottomSheet isOpen={Boolean(note)} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent enableOverDrag={false}>
					<View className="gap-3">
						<BottomSheet.Title numberOfLines={1}>
							{note?.title || "笔记操作"}
						</BottomSheet.Title>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-xl"
						>
							<ListGroup.Item
								accessibilityLabel="编辑笔记"
								accessibilityRole="button"
								disabled={!note}
								onPress={onEdit}
								className="gap-2.5 px-3.5 py-3"
							>
								<ListGroup.ItemPrefix>
									<Ionicons
										name="create-outline"
										size={21}
										color={foregroundColor}
									/>
								</ListGroup.ItemPrefix>
								<ListGroup.ItemContent>
									<ListGroup.ItemTitle>编辑</ListGroup.ItemTitle>
								</ListGroup.ItemContent>
							</ListGroup.Item>
							<ListDivider />
							<ListGroup.Item
								accessibilityLabel="删除笔记"
								accessibilityRole="button"
								disabled={!note}
								onPress={onDelete}
								className="gap-2.5 px-3.5 py-3"
							>
								<ListGroup.ItemPrefix>
									<Ionicons
										name="trash-outline"
										size={21}
										color={dangerColor}
									/>
								</ListGroup.ItemPrefix>
								<ListGroup.ItemContent>
									<ListGroup.ItemTitle style={{ color: dangerColor }}>
										删除
									</ListGroup.ItemTitle>
								</ListGroup.ItemContent>
							</ListGroup.Item>
						</ListGroup>
					</View>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}
