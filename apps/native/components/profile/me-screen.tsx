import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Input,
	Label,
	Skeleton,
	Spinner,
	Text,
	TextArea,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
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

import { AuthPanel } from "@/components/auth-panel";
import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
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
	{ key: "liked", label: "赞过", icon: "lock-closed-outline" },
] as const;

type ProfileTabKey = (typeof PROFILE_TABS)[number]["key"];
type ProfileFeedNote = Parameters<typeof NoteCard>[0]["note"];
type ProfileFeedItem = ReturnType<
	typeof createTwoColumnFeed<ProfileFeedNote>
>[number];

export default function MeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const currentUser = session.data?.user;
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState<ProfileTabKey>("notes");
	const [stickyTabsEnabled, setStickyTabsEnabled] = useState(false);
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [image, setImage] = useState("");
	const [showAvatarLink, setShowAvatarLink] = useState(false);
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
	const isAuthenticated = Boolean(currentUser) || hasAuthenticated;
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

	useEffect(() => {
		if (!profile || isEditing) return;
		setName(profile.name ?? "");
		setHandle(profile.handle ?? "");
		setBio(profile.bio ?? "");
		setImage(profile.image ?? "");
	}, [isEditing, profile]);

	useEffect(() => {
		if (currentUser) {
			setHasAuthenticated(true);
		}
	}, [currentUser]);

	const updateProfile = useMutation(
		orpc.social.updateProfile.mutationOptions({
			onSuccess: () => {
				setIsEditing(false);
				setShowAvatarLink(false);
				me.refetch();
				queryClient.refetchQueries();
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

	const notesData = useMemo(() => me.data?.notes ?? [], [me.data?.notes]);
	const collectionsData = useMemo(
		() => me.data?.collections ?? [],
		[me.data?.collections],
	);
	const likedData = useMemo(() => [], []);
	const listData = useMemo(() => {
		if (activeTab === "collections") return collectionsData;
		if (activeTab === "liked") return likedData;
		return notesData;
	}, [activeTab, collectionsData, likedData, notesData]);
	const feedItems = useMemo(() => createTwoColumnFeed(listData), [listData]);
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

	if (!isAuthenticated) {
		return (
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="bg-background p-4 pb-32"
			>
				<AuthPanel
					onAuthenticated={() => {
						setHasAuthenticated(true);
						session.refetch();
					}}
				/>
			</ScrollView>
		);
	}

	const saveProfile = () => {
		if (!name.trim()) {
			toast.show({ variant: "warning", label: "请输入昵称" });
			return;
		}

		updateProfile.mutate({
			name: name.trim(),
			handle: handle.trim(),
			bio: bio.trim(),
			image: image.trim(),
			gender:
				profile?.gender === "male" || profile?.gender === "female"
					? profile.gender
					: "unknown",
		});
	};

	const signOut = () => {
		setHasAuthenticated(false);
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

	const emptyState =
		activeTab === "collections" ? (
			<EmptyState
				icon="bookmark-outline"
				title="还没有收藏"
				description="收藏过的图文会出现在这里。"
			/>
		) : activeTab === "liked" ? (
			<EmptyState
				icon="heart-outline"
				title="还没有赞过"
				description="赞过的内容会显示在这里。"
			/>
		) : (
			<EmptyState
				icon="add-circle-outline"
				title="还没有作品"
				description="发布第一篇图文后，会出现在这里。"
				actionLabel="去发布"
				onAction={openCreate}
			/>
		);

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
						refreshing={me.isRefetching}
						onRefresh={() => me.refetch()}
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
								value={profile?.followingCount}
							/>
							<HeroStat
								isLoading={isProfileLoading}
								label="粉丝"
								value={profile?.followerCount}
							/>
							<HeroStat
								isLoading={isProfileLoading}
								label="获赞与收藏"
								value={profile?.likedCount}
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
								点击这里，填写简介
							</Text.Paragraph>
						)}

						<View className="flex-row gap-2">
							<Button
								variant="secondary"
								className="flex-1 rounded-full bg-white/15"
								feedbackVariant="scale-ripple"
								isDisabled={isEditing && updateProfile.isPending}
								onPress={() => {
									if (isEditing) {
										saveProfile();
										return;
									}
									openCreate();
								}}
							>
								{isEditing && updateProfile.isPending ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name={isEditing ? "checkmark-outline" : "add-outline"}
										size={16}
										color="#ffffff"
									/>
								)}
								<Button.Label>
									{isEditing
										? updateProfile.isPending
											? "保存中"
											: "保存资料"
										: "发布图文"}
								</Button.Label>
							</Button>
							<Button
								isIconOnly
								variant="ghost"
								className="rounded-full bg-white/15"
								feedbackVariant="scale-ripple"
								accessibilityLabel="退出登录"
								onPress={signOut}
							>
								<Ionicons name="log-out-outline" size={18} color="#ffffff" />
							</Button>
						</View>

						{isEditing ? (
							<View className="gap-4 rounded-3xl bg-white/95 p-4">
								<View className="gap-3">
									<View className="flex-row items-center gap-3">
										<Avatar size="md" alt={name || "头像预览"}>
											{image ? <Avatar.Image source={{ uri: image }} /> : null}
											<Avatar.Fallback>
												{(name || profile?.name || displayName).slice(0, 1)}
											</Avatar.Fallback>
										</Avatar>
										<View className="min-w-0 flex-1">
											<Text.Paragraph
												weight="semibold"
												className="text-foreground"
											>
												头像
											</Text.Paragraph>
											<Text.Paragraph
												type="body-sm"
												color="muted"
												numberOfLines={1}
											>
												默认沿用当前头像。
											</Text.Paragraph>
										</View>
										<Button
											size="sm"
											variant="ghost"
											feedbackVariant="scale-ripple"
											onPress={() => setShowAvatarLink((value) => !value)}
										>
											<Button.Label>
												{showAvatarLink ? "收起" : "更换"}
											</Button.Label>
										</Button>
									</View>
									{showAvatarLink ? (
										<TextField>
											<Label>头像链接</Label>
											<Input
												value={image}
												onChangeText={setImage}
												autoCapitalize="none"
												placeholder="https://..."
												placeholderTextColor={mutedColor}
											/>
										</TextField>
									) : null}
								</View>
								<TextField isRequired>
									<Label>昵称</Label>
									<Input
										value={name}
										onChangeText={setName}
										placeholder="你的昵称"
										placeholderTextColor={mutedColor}
									/>
								</TextField>
								<TextField>
									<Label>用户名</Label>
									<Input
										value={handle}
										onChangeText={setHandle}
										autoCapitalize="none"
										placeholder="letters_and_numbers"
										placeholderTextColor={mutedColor}
									/>
								</TextField>
								<TextField>
									<Label>简介</Label>
									<TextArea
										value={bio}
										onChangeText={setBio}
										placeholder="一句话介绍你分享的内容"
										placeholderTextColor={mutedColor}
										className="min-h-24"
										maxLength={160}
									/>
								</TextField>
							</View>
						) : null}
					</View>
				</View>

				<View className="-mt-5 bg-background pt-0">
					<ProfileTabBar
						activeTab={activeTab}
						count={listData.length}
						mutedColor={mutedColor}
						onSearch={openSearch}
						onSelect={setActiveTab}
					/>
				</View>

				<View className="mx-auto w-full max-w-xl pt-3">
					{me.isLoading ? (
						<FeedSkeleton />
					) : me.isError ? (
						<ErrorState
							description="个人页暂时没有加载出来，请稍后重试。"
							onRetry={() => me.refetch()}
						/>
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
						emptyState
					)}
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
						accessibilityLabel="退出登录"
						onPress={signOut}
					>
						<Ionicons name="log-out-outline" size={24} color="#ffffff" />
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
							size="sm"
							variant="ghost"
							className="rounded-full bg-white/15 px-3"
							feedbackVariant="scale-ripple"
							isDisabled={isProfileLoading}
							onPress={() => {
								setIsEditing((value) => !value);
								setShowAvatarLink(false);
							}}
						>
							<Ionicons name="pencil-outline" size={15} color="#ffffff" />
							<Button.Label>{isEditing ? "取消" : "编辑主页"}</Button.Label>
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel="分享主页"
						>
							<Ionicons name="share-outline" size={24} color="#ffffff" />
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
							count={listData.length}
							elevated
							mutedColor={mutedColor}
							onSearch={openSearch}
							onSelect={setActiveTab}
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
		</View>
	);
}

function HeroStat({
	isLoading,
	label,
	value,
}: {
	isLoading: boolean;
	label: string;
	value?: number;
}) {
	return (
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
}

function ProfileTabBar({
	activeTab,
	count,
	elevated = false,
	mutedColor,
	onSearch,
	onSelect,
}: {
	activeTab: ProfileTabKey;
	count: number;
	elevated?: boolean;
	mutedColor: string;
	onSearch: () => void;
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
				<View className="flex-row items-center gap-1">
					<Text.Paragraph type="body-xs" color="muted">
						{count}
					</Text.Paragraph>
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="搜索"
						onPress={onSearch}
					>
						<Ionicons name="search-outline" size={25} color={mutedColor} />
					</Button>
				</View>
			</View>
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
