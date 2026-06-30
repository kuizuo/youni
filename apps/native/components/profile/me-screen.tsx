import { Ionicons } from "@expo/vector-icons";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	BottomSheet,
	Button,
	Input,
	Label,
	PressableFeedback,
	Skeleton,
	Spinner,
	Text,
	TextArea,
	TextField,
	useBottomSheetAwareHandlers,
	useThemeColor,
} from "heroui-native";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	RefreshControl,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	runOnJS,
	useAnimatedReaction,
	useAnimatedScrollHandler,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import { EditableAvatar } from "@/components/profile/editable-avatar";
import { ProfileMenuDrawer } from "@/components/profile/profile-menu-drawer";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { pickAndUploadAvatar } from "@/lib/avatar-upload";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const PROFILE_HERO_COLOR = "#728894";
const PROFILE_HEADER_HEIGHT = 330;
const STICKY_TAB_TRIGGER = 300;

const PROFILE_TABS = [
	{ key: "notes", label: "笔记", icon: null },
	{ key: "collections", label: "收藏", icon: null },
	{ key: "liked", label: "赞过", icon: null },
] as const;

type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];
type ProfileFeedNote = Parameters<typeof NoteCard>[0]["note"];
type ProfileFeedItem = ReturnType<
	typeof createTwoColumnFeed<ProfileFeedNote>
>[number];
type EditableProfile = {
	bio?: null | string;
	gender?: null | string;
	handle?: null | string;
	image?: null | string;
	name?: null | string;
};
type SessionUser = NonNullable<
	ReturnType<typeof authClient.useSession>["data"]
>["user"];

const MAX_PROFILE_WIDTH = 576;

export default function MeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const dimensions = useWindowDimensions();
	const session = authClient.useSession();
	const mutedColor = useThemeColor("muted");
	const currentUser = session.data?.user;
	const pagerRef = useRef<ScrollView>(null);
	const [activeTab, setActiveTab] = useState<ProfileTabKey>("notes");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [pagerWidth, setPagerWidth] = useState(0);
	const [stickyTabsEnabled, setStickyTabsEnabled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const scrollOffset = useSharedValue(0);
	const handleScroll = useAnimatedScrollHandler((event) => {
		scrollOffset.value = event.contentOffset.y;
	});
	useAnimatedReaction(
		() => scrollOffset.value > STICKY_TAB_TRIGGER - 8,
		(current, previous) => {
			if (current !== previous) {
				runOnJS(setStickyTabsEnabled)(current);
			}
		},
	);
	const isAuthenticated = Boolean(currentUser);
	const me = useQuery({
		...orpc.social.me.queryOptions(),
		enabled: isAuthenticated,
	});
	const profile = me.data?.profile;
	const isProfileLoading = !me.data && me.isLoading;
	const isAccountLoading = isProfileLoading && !currentUser;
	const displayName = profile?.name ?? currentUser?.name ?? "我";
	const displayEmail = currentUser?.email ?? "登录账号";
	const displayHandle = profile?.handle ? `@${profile.handle}` : displayEmail;
	const avatarInitial = displayName.slice(0, 1);

	const notesData = useMemo(() => me.data?.notes ?? [], [me.data?.notes]);
	const collectionsData = useMemo(
		() => me.data?.collections ?? [],
		[me.data?.collections],
	);
	const likedData = useMemo(() => me.data?.liked ?? [], [me.data?.liked]);
	const feedItemsByTab = useMemo(
		() => ({
			collections: createTwoColumnFeed(collectionsData),
			liked: createTwoColumnFeed(likedData),
			notes: createTwoColumnFeed(notesData),
		}),
		[collectionsData, likedData, notesData],
	);
	const fallbackPageWidth = Math.max(
		1,
		Math.min(dimensions.width, MAX_PROFILE_WIDTH),
	);
	const pageWidth = pagerWidth || fallbackPageWidth;
	const activeTabIndex = Math.max(
		0,
		PROFILE_TABS.findIndex((tab) => tab.key === activeTab),
	);
	const stickyTop = insets.top + 76;
	const topChromeHeight = insets.top + 86;
	const topChromeStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			scrollOffset.value,
			[80, STICKY_TAB_TRIGGER],
			[0, 1],
			Extrapolation.CLAMP,
		);

		return {
			backgroundColor: `rgba(114, 136, 148, ${opacity})`,
		};
	});
	const miniAvatarStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollOffset.value,
			[140, STICKY_TAB_TRIGGER],
			[0, 1],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				scale: interpolate(
					scrollOffset.value,
					[140, STICKY_TAB_TRIGGER],
					[0.82, 1],
					Extrapolation.CLAMP,
				),
			},
		],
	}));
	const stickyTabsStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			scrollOffset.value,
			[STICKY_TAB_TRIGGER - 16, STICKY_TAB_TRIGGER + 12],
			[0, 1],
			Extrapolation.CLAMP,
		),
		transform: [
			{
				translateY: interpolate(
					scrollOffset.value,
					[STICKY_TAB_TRIGGER - 18, STICKY_TAB_TRIGGER + 12],
					[12, 0],
					Extrapolation.CLAMP,
				),
			},
		],
	}));

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

	const refreshCurrentTab = async () => {
		fireHaptic();
		setIsRefreshing(true);
		try {
			await me.refetch();
		} finally {
			setIsRefreshing(false);
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

	const selectTab = (tab: ProfileTabKey) => {
		const nextIndex = PROFILE_TABS.findIndex((item) => item.key === tab);
		if (nextIndex < 0) return;
		setActiveTab(tab);
		pagerRef.current?.scrollTo({
			animated: true,
			x: nextIndex * pageWidth,
		});
	};

	const handlePagerLayout = (event: LayoutChangeEvent) => {
		const nextWidth = Math.round(event.nativeEvent.layout.width);
		if (nextWidth > 0 && nextWidth !== pagerWidth) {
			setPagerWidth(nextWidth);
		}
	};

	const handlePagerMomentumEnd = (
		event: NativeSyntheticEvent<NativeScrollEvent>,
	) => {
		const nextIndex = Math.min(
			PROFILE_TABS.length - 1,
			Math.max(0, Math.round(event.nativeEvent.contentOffset.x / pageWidth)),
		);
		const nextTab = PROFILE_TABS[nextIndex];
		if (nextTab) {
			setActiveTab(nextTab.key);
		}
	};

	useEffect(() => {
		pagerRef.current?.scrollTo({
			animated: false,
			x: activeTabIndex * pageWidth,
		});
	}, [activeTabIndex, pageWidth]);

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
		<View className="flex-1 bg-background">
			<Animated.ScrollView
				className="flex-1"
				contentContainerClassName="bg-background pb-32"
				contentInsetAdjustmentBehavior="never"
				onScroll={handleScroll}
				refreshControl={
					<RefreshControl
						progressViewOffset={topChromeHeight}
						refreshing={isRefreshing}
						onRefresh={refreshCurrentTab}
					/>
				}
				scrollEventThrottle={16}
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
								{isAccountLoading ? (
									<Skeleton className="size-24 rounded-full" />
								) : (
									<Avatar size="lg" alt={displayName} className="size-24">
										{profile?.image ? (
											<Avatar.Image source={{ uri: profile.image }} />
										) : null}
										<Avatar.Fallback>{avatarInitial}</Avatar.Fallback>
									</Avatar>
								)}
							</View>

							<View className="min-w-0 flex-1 gap-2">
								{isAccountLoading ? (
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
								isLoading={isProfileLoading}
								label="关注"
								onPress={() => openConnections("following")}
								value={profile?.followingCount}
							/>
							<HeroStat
								isLoading={isProfileLoading}
								label="粉丝"
								onPress={() => openConnections("followers")}
								value={profile?.followerCount}
							/>
						</View>

						{profile?.bio ? (
							<Text.Paragraph
								className="leading-6"
								style={{ color: "rgba(255, 255, 255, 0.82)" }}
							>
								{profile.bio}
							</Text.Paragraph>
						) : isProfileLoading ? (
							<View className="gap-2">
								<Skeleton className="h-3 w-4/5 rounded-full" />
								<Skeleton className="h-3 w-2/3 rounded-full" />
							</View>
						) : (
							<Text.Paragraph
								className="leading-6"
								style={{ color: "rgba(255, 255, 255, 0.72)" }}
							>
								点击编辑，填写简介
							</Text.Paragraph>
						)}

						<View className="flex-row gap-2">
							<Button
								variant="secondary"
								className="flex-1 rounded-full bg-white/15"
								feedbackVariant="scale-ripple"
								onPress={openCreate}
							>
								<Ionicons name="add-outline" size={16} color="#ffffff" />
								<Button.Label>发布图文</Button.Label>
							</Button>
						</View>
					</View>
				</View>

				<View className="-mt-5 bg-background pt-0">
					<ProfileTabBar
						activeTab={activeTab}
						mutedColor={mutedColor}
						onSelect={selectTab}
					/>
				</View>

				<View
					className="mx-auto w-full max-w-xl"
					style={{ width: fallbackPageWidth }}
					onLayout={handlePagerLayout}
				>
					<ScrollView
						ref={pagerRef}
						horizontal
						bounces={false}
						contentContainerStyle={{
							width: pageWidth * PROFILE_TABS.length,
						}}
						decelerationRate="fast"
						disableIntervalMomentum
						nestedScrollEnabled
						scrollEventThrottle={16}
						showsHorizontalScrollIndicator={false}
						snapToAlignment="start"
						snapToInterval={pageWidth}
						onScrollEndDrag={handlePagerMomentumEnd}
						onMomentumScrollEnd={handlePagerMomentumEnd}
					>
						{PROFILE_TABS.map((tab) => (
							<ProfileTabPage
								key={tab.key}
								emptyState={renderEmptyState(tab.key)}
								feedItems={feedItemsByTab[tab.key]}
								isError={me.isError}
								isLoading={me.isLoading}
								width={pageWidth}
								onRetry={() => me.refetch()}
							/>
						))}
					</ScrollView>
				</View>
			</Animated.ScrollView>

			<Animated.View
				className="absolute top-0 right-0 left-0"
				style={[
					{
						height: topChromeHeight,
						paddingTop: insets.top + 10,
						pointerEvents: "box-none",
					},
					topChromeStyle,
				]}
			>
				<View className="mx-auto w-full max-w-xl flex-row items-center justify-between px-4">
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="打开更多菜单"
						onPress={() => setIsMenuOpen(true)}
					>
						<Ionicons name="menu-outline" size={24} color="#ffffff" />
					</Button>

					<Animated.View style={miniAvatarStyle}>
						<Avatar size="sm" alt={displayName} className="border border-white">
							{profile?.image ? (
								<Avatar.Image source={{ uri: profile.image }} />
							) : null}
							<Avatar.Fallback>{avatarInitial}</Avatar.Fallback>
						</Avatar>
					</Animated.View>

					<View className="flex-row items-center gap-2">
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel="搜索"
							onPress={openSearch}
						>
							<Ionicons name="search-outline" size={23} color="#ffffff" />
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel="编辑资料"
							isDisabled={isProfileLoading}
							onPress={() => {
								fireHaptic();
								setIsEditOpen(true);
							}}
						>
							<Ionicons name="pencil-outline" size={22} color="#ffffff" />
						</Button>
					</View>
				</View>
			</Animated.View>

			{stickyTabsEnabled ? (
				<>
					<Animated.View
						className="absolute right-0 left-0"
						style={[
							{
								pointerEvents: "box-none",
								top: stickyTop,
							},
							stickyTabsStyle,
						]}
					>
						<ProfileTabBar
							activeTab={activeTab}
							elevated
							mutedColor={mutedColor}
							onSelect={selectTab}
						/>
					</Animated.View>

					<View
						className="absolute right-0 left-0"
						style={{ pointerEvents: "none", top: stickyTop + 58 }}
					>
						<View
							style={{
								borderTopColor: "rgba(0, 0, 0, 0.07)",
								borderTopWidth: 1,
							}}
						/>
					</View>
				</>
			) : null}

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
								await me.refetch();
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

function ProfileTabBar({
	activeTab,
	elevated = false,
	mutedColor,
	onSelect,
}: {
	activeTab: ProfileTabKey;
	elevated?: boolean;
	mutedColor: string;
	onSelect: (tab: ProfileTabKey) => void;
}) {
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");

	return (
		<View
			className={
				elevated
					? "bg-background"
					: "overflow-hidden rounded-t-3xl bg-background"
			}
			style={
				elevated ? { boxShadow: "0 1px 0 rgba(0, 0, 0, 0.07)" } : undefined
			}
		>
			<View className="mx-auto h-16 w-full max-w-xl flex-row items-center px-3">
				<View className="min-w-0 flex-1 flex-row items-center">
					{PROFILE_TABS.map((tab) => {
						const selected = tab.key === activeTab;
						return (
							<Button
								key={tab.key}
								size="sm"
								variant="ghost"
								className="h-16 flex-1 rounded-none px-0"
								feedbackVariant="scale-ripple"
								accessibilityLabel={tab.label}
								accessibilityState={selected ? { selected: true } : undefined}
								onPress={() => onSelect(tab.key)}
							>
								<View className="h-16 items-center justify-center gap-1">
									<View className="flex-row items-center gap-1">
										{tab.icon ? (
											<Ionicons
												name={tab.icon}
												size={15}
												color={selected ? foregroundColor : mutedColor}
											/>
										) : null}
										<Button.Label>{tab.label}</Button.Label>
									</View>
									<View
										className="h-1 w-7 rounded-full"
										style={{
											backgroundColor: selected ? accentColor : "transparent",
										}}
									/>
								</View>
							</Button>
						);
					})}
				</View>
			</View>
		</View>
	);
}

function ProfileTabPage({
	emptyState,
	feedItems,
	isError,
	isLoading,
	onRetry,
	width,
}: {
	emptyState: ReactNode;
	feedItems: ProfileFeedItem[];
	isError: boolean;
	isLoading: boolean;
	onRetry: () => void;
	width: number;
}) {
	return (
		<View className="pt-3" style={{ width }}>
			{isLoading ? (
				<FeedSkeleton />
			) : isError ? (
				<ErrorState
					description="个人页暂时没有加载出来，请稍后重试。"
					onRetry={onRetry}
				/>
			) : feedItems.length > 0 ? (
				<View className="gap-3 px-3">
					{feedItems.reduce<ReactNode[]>((rows, item, index) => {
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
				emptyState
			)}
		</View>
	);
}

function FeedCell({ item }: { item: ProfileFeedItem }) {
	return (
		<View className="flex-1 basis-0">
			{item.type === "item" ? <NoteCard compact note={item.item} /> : null}
		</View>
	);
}

function EditProfileSheet({
	displayName,
	onSaved,
	profile,
	user,
}: {
	displayName: string;
	onSaved: () => Promise<void>;
	profile?: EditableProfile;
	user?: SessionUser;
}) {
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const { onBlur, onFocus } = useBottomSheetAwareHandlers();
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");
	const [gender, setGender] = useState<"female" | "male" | "unknown">(
		"unknown",
	);
	const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
	const updateProfile = useMutation(
		orpc.social.updateProfile.mutationOptions({
			onSuccess: async () => {
				await onSaved();
				toast.show({ variant: "success", label: "资料已保存" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: "保存失败",
					description: error.message,
				});
			},
		}),
	);

	useEffect(() => {
		setName(profile?.name ?? user?.name ?? "");
		setHandle(profile?.handle ?? "");
		setBio(profile?.bio ?? "");
		setAvatarUrl(profile?.image ?? user?.image ?? "");
		setGender(
			profile?.gender === "male" || profile?.gender === "female"
				? profile.gender
				: "unknown",
		);
	}, [profile, user]);

	const chooseAvatar = async () => {
		fireHaptic();
		setIsUploadingAvatar(true);
		try {
			const uploaded = await pickAndUploadAvatar();
			if (uploaded) {
				setAvatarUrl(uploaded.url);
				toast.show({ variant: "success", label: "头像已上传，保存后生效" });
			}
		} catch (error) {
			if (isRequestTimeoutError(error)) return;
			toast.show({
				variant: "danger",
				label: "头像上传失败",
				description: error instanceof Error ? error.message : undefined,
			});
		} finally {
			setIsUploadingAvatar(false);
		}
	};

	const saveProfile = () => {
		fireHaptic();
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}

		updateProfile.mutate({
			bio: bio.trim(),
			gender,
			handle: handle.trim(),
			image: avatarUrl.trim(),
			name: name.trim(),
		});
	};

	return (
		<View className="flex-1">
			<View className="px-4 pb-2">
				<View className="min-w-0 flex-1">
					<BottomSheet.Title>编辑资料</BottomSheet.Title>
				</View>
			</View>

			<BottomSheetScrollView
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 20 }}
			>
				<View className="gap-4 px-4">
					<View className="flex-row items-center gap-3">
						<EditableAvatar
							alt={name || displayName}
							image={avatarUrl}
							initial={(name || displayName).slice(0, 1)}
							isDisabled={updateProfile.isPending}
							isUploading={isUploadingAvatar}
							onPress={chooseAvatar}
						/>
						<View className="min-w-0 flex-1">
							<Text.Paragraph weight="bold" numberOfLines={1}>
								{name || displayName}
							</Text.Paragraph>
							<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
								{handle ? `@${handle}` : "设置公开资料"}
							</Text.Paragraph>
						</View>
					</View>

					<TextField isRequired>
						<Label>昵称</Label>
						<Input
							value={name}
							onBlur={onBlur}
							onChangeText={setName}
							onFocus={onFocus}
							placeholder="你的昵称"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<TextField>
						<Label>用户名</Label>
						<Input
							value={handle}
							autoCapitalize="none"
							onBlur={onBlur}
							onChangeText={setHandle}
							onFocus={onFocus}
							placeholder="letters_and_numbers"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<TextField>
						<Label>简介</Label>
						<TextArea
							value={bio}
							className="min-h-24"
							maxLength={160}
							onBlur={onBlur}
							onChangeText={setBio}
							onFocus={onFocus}
							placeholder="一句话介绍你分享的内容"
							placeholderTextColor={mutedColor}
						/>
					</TextField>

					<View className="gap-2">
						<Text.Paragraph type="body-sm" weight="semibold">
							性别
						</Text.Paragraph>
						<View className="flex-row rounded-full bg-content2 p-1">
							<GenderButton
								isActive={gender === "unknown"}
								label="不展示"
								onPress={() => setGender("unknown")}
							/>
							<GenderButton
								isActive={gender === "female"}
								label="女"
								onPress={() => setGender("female")}
							/>
							<GenderButton
								isActive={gender === "male"}
								label="男"
								onPress={() => setGender("male")}
							/>
						</View>
					</View>

					<Button
						variant="primary"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						isDisabled={updateProfile.isPending || isUploadingAvatar}
						onPress={saveProfile}
					>
						{updateProfile.isPending ? (
							<Spinner size="sm" color={accentForegroundColor} />
						) : (
							<Ionicons
								name="checkmark-outline"
								size={18}
								color={accentForegroundColor}
							/>
						)}
						<Button.Label>
							{updateProfile.isPending ? "保存中" : "保存资料"}
						</Button.Label>
					</Button>
				</View>
			</BottomSheetScrollView>
		</View>
	);
}

function GenderButton({
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
