import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Card,
	Input,
	Label,
	Spinner,
	Surface,
	Tabs,
	Text,
	TextArea,
	TextField,
	useToast,
} from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ScrollView } from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

type Shelf = "notes" | "collections";

const profileActions = [
	{
		label: "查看公开主页",
		description: "看看别人看到的主页效果",
		icon: "person-circle-outline",
	},
	{
		label: "分享主页",
		description: "把自己的主页分享给朋友",
		icon: "share-social-outline",
	},
	{
		label: "刷新资料",
		description: "同步最新作品、收藏和互动数据",
		icon: "refresh-outline",
	},
	{
		label: "退出账号",
		description: "退出后仍可继续浏览内容",
		icon: "log-out-outline",
	},
] as const;
const profileShareActions = [
	{
		label: "查看公开主页",
		description: "确认别人看到的主页效果",
		icon: "person-circle-outline",
		action: "profile",
	},
	{
		label: "准备主页名片",
		description: "整理昵称、用户名和简介",
		icon: "id-card-outline",
		action: "card",
	},
	{
		label: "找相似灵感",
		description: "去搜索同类内容和话题",
		icon: "search-outline",
		action: "search",
	},
] as const;
const profileTemplates = [
	{
		label: "城市散步",
		name: "林小野",
		handle: "lin_citywalk",
		bio: "周末在城市里慢慢走，记录路线、咖啡店和好看的光。",
		image:
			"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
		icon: "footsteps-outline",
	},
	{
		label: "穿搭日常",
		name: "小周的衣橱",
		handle: "zhou_style",
		bio: "分享通勤穿搭、低饱和配色和适合普通人的好物。",
		image:
			"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
		icon: "shirt-outline",
	},
	{
		label: "美食清单",
		name: "阿禾今天吃什么",
		handle: "ahe_foodie",
		bio: "把早餐、咖啡和周末探店写成可以直接照着去的清单。",
		image:
			"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
		icon: "cafe-outline",
	},
] as const;

export default function MeScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		shelf?: string;
		source?: string;
		actionAt?: string;
	}>();
	const session = authClient.useSession();
	const { toast } = useToast();
	const handledTabbarAction = useRef<string | null>(null);
	const [activeShelf, setActiveShelf] = useState<Shelf>("notes");
	const [isEditing, setIsEditing] = useState(false);
	const [name, setName] = useState("");
	const [handle, setHandle] = useState("");
	const [bio, setBio] = useState("");
	const [image, setImage] = useState("");
	const [isLogoutOpen, setIsLogoutOpen] = useState(false);
	const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false);
	const [isProfileShareOpen, setIsProfileShareOpen] = useState(false);
	const [profileHint, setProfileHint] = useState(
		"点作品、收藏或资料进度，继续整理你的主页。",
	);
	const me = useQuery({
		...orpc.social.me.queryOptions(),
		enabled: !!session.data?.user,
	});
	const updateProfile = useMutation(
		orpc.social.updateProfile.mutationOptions({
			onSuccess: () => {
				setIsEditing(false);
				setProfileHint("资料已保存，公开主页会同步展示最新内容。");
				toast.show({ variant: "success", label: "资料已更新" });
				me.refetch();
				queryClient.refetchQueries();
			},
			onError: (error) => {
				setProfileHint("资料保存失败，请检查填写内容后再试。");
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	useEffect(() => {
		if (!me.data?.profile || isEditing) return;
		setName(me.data.profile.name ?? "");
		setHandle(me.data.profile.handle ?? "");
		setBio(me.data.profile.bio ?? "");
		setImage(me.data.profile.image ?? "");
	}, [isEditing, me.data?.profile]);

	useEffect(() => {
		if (params.source !== "tabbar") return;
		if (params.shelf !== "notes" && params.shelf !== "collections") return;
		const actionKey = `${params.source}:${params.shelf}:${params.actionAt ?? ""}`;
		if (handledTabbarAction.current === actionKey) return;
		handledTabbarAction.current = actionKey;
		setActiveShelf(params.shelf);
		const nextHint =
			params.shelf === "notes"
				? "已从底部快捷入口切到你的作品。"
				: "已从底部快捷入口切到你的收藏。";
		setProfileHint(nextHint);
		toast.show({
			variant: "accent",
			label: params.shelf === "notes" ? "已打开作品" : "已打开收藏",
			description:
				params.shelf === "notes"
					? "可以继续检查发布过的图文。"
					: "可以继续整理收藏过的灵感。",
			duration: 1300,
		});
	}, [params.shelf, params.source, params.actionAt, toast.show]);

	const listData = useMemo(() => {
		if (activeShelf === "collections") {
			return me.data?.collections ?? [];
		}
		return me.data?.notes ?? [];
	}, [activeShelf, me.data?.collections, me.data?.notes]);

	if (!session.data?.user) {
		return (
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 bg-background p-4"
			>
				<AuthPanel />
			</ScrollView>
		);
	}

	const currentUser = session.data.user;
	const profile = me.data?.profile;
	const notesCount = me.data?.notes.length ?? profile?.noteCount ?? 0;
	const collectionsCount = me.data?.collections.length ?? 0;
	const profileFields = [
		profile?.name,
		profile?.handle,
		profile?.bio,
		profile?.image,
	].filter((item) => item?.trim()).length;
	const profilePercent = Math.round((profileFields / 4) * 100);
	const gender =
		profile?.gender === "male" || profile?.gender === "female"
			? profile.gender
			: "unknown";
	const switchShelf = (value: string) => {
		if (value !== "notes" && value !== "collections") return;
		setActiveShelf(value);
		setProfileHint(
			value === "notes" ? "正在查看你的公开作品。" : "正在查看你收藏的灵感。",
		);
		toast.show({
			label: value === "notes" ? "切到作品" : "切到收藏",
			duration: 1000,
		});
	};
	const goToCreate = () => {
		setProfileHint("去写一篇新的生活笔记。");
		router.push("/create" as Href);
		toast.show({ label: "去发布图文", duration: 1000 });
	};
	const goToSearch = () => {
		setProfileHint("去搜索更多穿搭、美食和生活灵感。");
		router.push("/search" as Href);
		toast.show({ label: "去找灵感", duration: 1000 });
	};
	const goToPublicProfile = () => {
		const userId = me.data?.profile.id ?? currentUser.id;
		setProfileHint("打开别人看到的公开主页。");
		router.push({ pathname: "/user/[id]", params: { id: userId } } as Href);
		toast.show({ label: "打开公开主页", duration: 1000 });
	};
	const refreshProfile = async () => {
		setProfileHint("正在同步你的主页数据。");
		toast.show({ label: "正在刷新个人页", duration: 1000 });
		await me.refetch();
		setProfileHint("个人页已更新，可以继续查看作品和收藏。");
		toast.show({ variant: "success", label: "个人页已更新", duration: 1200 });
	};
	const handleProfileAction = (action: (typeof profileActions)[number]) => {
		setIsProfileActionsOpen(false);
		if (action.label === "查看公开主页") {
			goToPublicProfile();
			return;
		}
		if (action.label === "刷新资料") {
			refreshProfile();
			return;
		}
		if (action.label === "退出账号") {
			setIsLogoutOpen(true);
			return;
		}
		setIsProfileShareOpen(true);
		setProfileHint("已打开主页分享，可以继续查看、整理或找相似灵感。");
		toast.show({
			variant: "accent",
			label: "打开主页分享",
			description: "选择下一步分享动作。",
			duration: 1200,
		});
	};
	const openProfileShare = () => {
		setIsProfileShareOpen(true);
		setProfileHint("已打开主页分享，可以继续查看、整理或找相似灵感。");
		toast.show({ label: "打开主页分享", duration: 1000 });
	};
	const handleProfileShareAction = (
		action: (typeof profileShareActions)[number],
	) => {
		setIsProfileShareOpen(false);
		if (action.action === "profile") {
			goToPublicProfile();
			return;
		}
		if (action.action === "search") {
			goToSearch();
			return;
		}
		const displayName = profile?.name ?? currentUser.name;
		const handleText = profile?.handle ? `@${profile.handle}` : "还没有用户名";
		setProfileHint(`${displayName} 的主页名片已准备好。`);
		toast.show({
			variant: "success",
			label: "主页名片已准备好",
			description: `${displayName} · ${handleText}`,
			duration: 1600,
		});
	};
	const handleSignOut = () => {
		authClient.signOut();
		queryClient.clear();
		setIsLogoutOpen(false);
		setProfileHint("已退出登录。");
		toast.show({ label: "已退出登录" });
	};
	const showProfileHint = (label: string) => {
		setProfileHint(label);
		toast.show({ label, duration: 1200 });
	};
	const applyProfileTemplate = (
		template: (typeof profileTemplates)[number],
	) => {
		setName(template.name);
		setHandle(template.handle);
		setBio(template.bio);
		setImage(template.image);
		setProfileHint(`已套用「${template.label}」主页模板，可以继续微调后保存。`);
		toast.show({
			variant: "success",
			label: `已套用「${template.label}」`,
			description: "昵称、用户名、简介和头像已填好。",
			duration: 1400,
		});
	};

	return (
		<Surface variant="transparent" className="flex-1 bg-background p-0">
			<FlatList
				data={listData}
				keyExtractor={(item) => item.id}
				numColumns={2}
				contentInsetAdjustmentBehavior="automatic"
				columnWrapperClassName="gap-3 px-3"
				contentContainerClassName="gap-3 bg-background py-3"
				ListHeaderComponent={
					<Card.Body className="gap-4 p-0 px-3">
						<Card className="gap-4 rounded-3xl p-4">
							<Card.Header className="flex-row items-center gap-3 p-0">
								<ProfileAvatar
									name={profile?.name ?? session.data.user.name}
									image={profile?.image ?? null}
								/>
								<Card.Body className="min-w-0 flex-1 gap-1 p-0">
									<Card.Title className="font-semibold text-foreground text-xl">
										{profile?.name ?? session.data.user.name}
									</Card.Title>
									{profile?.handle ? (
										<Text.Paragraph color="muted" type="body-xs">
											@{profile.handle}
										</Text.Paragraph>
									) : null}
									<Text.Paragraph color="muted" type="body-sm">
										{profile?.bio || "记录生活，也收藏灵感"}
									</Text.Paragraph>
								</Card.Body>
								<Button
									size="sm"
									variant={profilePercent === 100 ? "primary" : "danger-soft"}
									feedbackVariant="scale-ripple"
									onPress={() =>
										showProfileHint(
											`资料完整度 ${profilePercent}%，补全后主页更真实。`,
										)
									}
								>
									<Ionicons
										name={
											profilePercent === 100
												? "checkmark-circle"
												: "sparkles-outline"
										}
										size={13}
										color={profilePercent === 100 ? "#ffffff" : "#f43f5e"}
									/>
									<Button.Label>{profilePercent}%</Button.Label>
								</Button>
								<Button
									size="sm"
									variant="secondary"
									isIconOnly
									feedbackVariant="scale-ripple"
									onPress={() => setIsProfileActionsOpen(true)}
								>
									<Ionicons
										name="ellipsis-horizontal"
										size={17}
										color="#8a8a8a"
									/>
								</Button>
							</Card.Header>
							<Card.Footer className="flex-row gap-2 p-0">
								<Button
									size="sm"
									variant="primary"
									className="flex-1"
									feedbackVariant="scale-ripple"
									onPress={() => {
										setIsEditing((value) => !value);
										setProfileHint(
											isEditing
												? "已收起资料编辑。"
												: "可以开始编辑昵称、头像和简介。",
										);
										toast.show({
											label: isEditing ? "已收起编辑" : "可以编辑资料了",
											duration: 1200,
										});
									}}
								>
									<Ionicons
										name={isEditing ? "close" : "create-outline"}
										size={16}
										color="#ffffff"
									/>
									<Button.Label>
										{isEditing ? "收起编辑" : "编辑资料"}
									</Button.Label>
								</Button>
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-ripple"
									onPress={() => setIsLogoutOpen(true)}
								>
									<Ionicons name="log-out-outline" size={16} color="#8a8a8a" />
									<Button.Label>退出</Button.Label>
								</Button>
							</Card.Footer>
							<Card.Footer className="flex-row gap-2 p-0">
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-highlight"
									className="flex-1"
									onPress={goToPublicProfile}
								>
									<Ionicons
										name="person-circle-outline"
										size={16}
										color="#8a8a8a"
									/>
									<Button.Label>主页</Button.Label>
								</Button>
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-highlight"
									className="flex-1"
									onPress={refreshProfile}
									isDisabled={me.isFetching}
								>
									{me.isFetching ? (
										<Spinner size="sm" />
									) : (
										<Ionicons
											name="refresh-outline"
											size={16}
											color="#8a8a8a"
										/>
									)}
									<Button.Label>刷新</Button.Label>
								</Button>
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-highlight"
									className="flex-1"
									onPress={openProfileShare}
								>
									<Ionicons
										name="share-social-outline"
										size={16}
										color="#8a8a8a"
									/>
									<Button.Label>分享</Button.Label>
								</Button>
							</Card.Footer>
							<Surface
								variant="secondary"
								className="flex-row justify-around rounded-2xl p-3"
							>
								<Stat
									label="图文"
									value={profile?.noteCount ?? 0}
									onPress={() => {
										setActiveShelf("notes");
										showProfileHint("已切到你的公开图文。");
									}}
								/>
								<Stat
									label="粉丝"
									value={profile?.followerCount ?? 0}
									onPress={() =>
										showProfileHint("粉丝数据会随关注互动同步更新。")
									}
								/>
								<Stat
									label="关注"
									value={profile?.followingCount ?? 0}
									onPress={() =>
										showProfileHint("关注数据来自你关注过的作者。")
									}
								/>
								<Stat
									label="获赞"
									value={profile?.likedCount ?? 0}
									onPress={() =>
										showProfileHint("获赞会统计你发布图文收到的喜欢。")
									}
								/>
							</Surface>
							<Surface variant="secondary" className="gap-2 rounded-2xl p-3">
								<Surface
									variant="transparent"
									className="flex-row items-center justify-between p-0"
								>
									<Text.Paragraph weight="medium" type="body-sm">
										资料完整度
									</Text.Paragraph>
									<Text.Paragraph color="muted" type="body-xs">
										{profileFields}/4
									</Text.Paragraph>
								</Surface>
								<Surface className="h-2 overflow-hidden rounded-full bg-content3 p-0">
									<Surface
										className="h-full rounded-full bg-danger p-0"
										style={{ width: `${profilePercent}%` }}
									/>
								</Surface>
								<Text.Paragraph color="muted" type="body-xs">
									补全昵称、用户名、简介和头像后，个人页会更像真实主页。
								</Text.Paragraph>
							</Surface>
							<Surface
								variant="tertiary"
								className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
							>
								<Ionicons name="sparkles-outline" size={15} color="#f43f5e" />
								<Text.Paragraph type="body-sm" className="flex-1">
									{profileHint}
								</Text.Paragraph>
							</Surface>
						</Card>

						<Card className="gap-3 rounded-3xl p-4">
							<Card.Header className="flex-row items-center justify-between p-0">
								<Card.Body className="gap-0.5 p-0">
									<Text.Paragraph weight="semibold" type="body-sm">
										快速开始
									</Text.Paragraph>
									<Text.Paragraph color="muted" type="body-xs">
										继续发布、找灵感或整理收藏
									</Text.Paragraph>
								</Card.Body>
								<Ionicons name="sparkles-outline" size={18} color="#f43f5e" />
							</Card.Header>
							<Card.Footer className="flex-row gap-2 p-0">
								<Button
									variant="danger-soft"
									size="sm"
									className="flex-1"
									feedbackVariant="scale-ripple"
									onPress={goToCreate}
								>
									<Ionicons
										name="add-circle-outline"
										size={16}
										color="#f43f5e"
									/>
									<Button.Label>发布</Button.Label>
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="flex-1"
									feedbackVariant="scale-ripple"
									onPress={goToSearch}
								>
									<Ionicons name="search-outline" size={16} color="#8a8a8a" />
									<Button.Label>找灵感</Button.Label>
								</Button>
							</Card.Footer>
							<Card.Footer className="flex-row gap-2 p-0">
								<QuickAction
									icon="bookmark-outline"
									label="看收藏"
									active={activeShelf === "collections"}
									onPress={() => switchShelf("collections")}
								/>
								<QuickAction
									icon="images-outline"
									label="看作品"
									active={activeShelf === "notes"}
									onPress={() => switchShelf("notes")}
								/>
								<QuickAction
									icon="refresh-outline"
									label="同步"
									onPress={refreshProfile}
								/>
							</Card.Footer>
						</Card>

						{isEditing ? (
							<Card className="gap-4 rounded-3xl p-4">
								<Card.Title className="font-semibold text-base text-foreground">
									编辑资料
								</Card.Title>
								<Surface variant="secondary" className="gap-3 rounded-2xl p-3">
									<Surface
										variant="transparent"
										className="flex-row items-center justify-between p-0"
									>
										<Surface variant="transparent" className="gap-0.5 p-0">
											<Text.Paragraph weight="semibold" type="body-sm">
												主页模板
											</Text.Paragraph>
											<Text.Paragraph color="muted" type="body-xs">
												点一下，先把主页变得完整
											</Text.Paragraph>
										</Surface>
										<Ionicons
											name="color-wand-outline"
											size={17}
											color="#f43f5e"
										/>
									</Surface>
									<Surface
										variant="transparent"
										className="flex-row flex-wrap gap-2 p-0"
									>
										{profileTemplates.map((template) => (
											<Button
												key={template.label}
												size="sm"
												variant="secondary"
												feedbackVariant="scale-ripple"
												className="min-w-[31%] flex-1"
												onPress={() => applyProfileTemplate(template)}
											>
												<Ionicons
													name={template.icon}
													size={14}
													color="#f43f5e"
												/>
												<Button.Label>{template.label}</Button.Label>
											</Button>
										))}
									</Surface>
								</Surface>
								<TextField isRequired>
									<Label>昵称</Label>
									<Input value={name} onChangeText={setName} maxLength={50} />
								</TextField>
								<TextField>
									<Label>用户名</Label>
									<Input
										value={handle}
										onChangeText={setHandle}
										autoCapitalize="none"
										placeholder="例如 lin_daily"
										maxLength={30}
									/>
								</TextField>
								<TextField>
									<Label>头像链接</Label>
									<Input
										value={image}
										onChangeText={setImage}
										autoCapitalize="none"
										placeholder="https://..."
									/>
								</TextField>
								<TextField>
									<Label>简介</Label>
									<TextArea
										value={bio}
										onChangeText={setBio}
										placeholder="写一句介绍自己"
										className="min-h-24"
										maxLength={160}
									/>
								</TextField>
								<Surface variant="transparent" className="flex-row gap-2 p-0">
									<Button
										variant="secondary"
										className="flex-1"
										feedbackVariant="scale-ripple"
										onPress={() => {
											setIsEditing(false);
											setProfileHint("已取消编辑，资料保持原样。");
											toast.show({ label: "已取消编辑", duration: 1200 });
										}}
									>
										<Button.Label>取消</Button.Label>
									</Button>
									<Button
										variant="primary"
										feedbackVariant="scale-ripple"
										className="flex-1"
										isDisabled={!name.trim() || updateProfile.isPending}
										onPress={() =>
											updateProfile.mutate({
												name: name.trim(),
												handle: handle.trim(),
												bio: bio.trim(),
												image: image.trim(),
												gender,
											})
										}
									>
										{updateProfile.isPending ? <Spinner size="sm" /> : null}
										<Button.Label>
											{updateProfile.isPending ? "保存中" : "保存"}
										</Button.Label>
									</Button>
								</Surface>
							</Card>
						) : null}

						<Card.Header className="flex-row items-center justify-between px-1">
							<Tabs
								value={activeShelf}
								onValueChange={switchShelf}
								variant="secondary"
								className="flex-1"
							>
								<Tabs.List>
									<Tabs.Indicator />
									<Tabs.Trigger value="notes">
										<Tabs.Label
											className={
												activeShelf === "notes"
													? "font-semibold text-danger"
													: "text-muted"
											}
										>
											作品 {notesCount}
										</Tabs.Label>
									</Tabs.Trigger>
									<Tabs.Trigger value="collections">
										<Tabs.Label
											className={
												activeShelf === "collections"
													? "font-semibold text-danger"
													: "text-muted"
											}
										>
											收藏 {collectionsCount}
										</Tabs.Label>
									</Tabs.Trigger>
								</Tabs.List>
							</Tabs>
							{me.isFetching ? <Spinner size="sm" /> : null}
						</Card.Header>
					</Card.Body>
				}
				renderItem={({ item }) => <NoteCard note={item} />}
				ListEmptyComponent={
					me.isLoading ? (
						<FeedSkeleton />
					) : me.isError ? (
						<ErrorState
							title="个人页加载失败"
							description="个人数据暂时没有拿到，请稍后重试。"
							onRetry={() => me.refetch()}
						/>
					) : activeShelf === "collections" ? (
						<EmptyState
							icon="bookmark-outline"
							title="还没有收藏"
							description="看到喜欢的图文，点收藏就会出现在这里。"
							actionLabel="去找灵感"
							onAction={goToSearch}
						/>
					) : (
						<EmptyState
							icon="add-circle-outline"
							title="还没有发布图文"
							description="去发布页写第一篇图文，提交后后台审核。"
							actionLabel="发布图文"
							onAction={goToCreate}
						/>
					)
				}
			/>
			{isLogoutOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 justify-end bg-black/40 p-4"
				>
					<Card className="gap-5 rounded-3xl p-5">
						<Surface variant="transparent" className="gap-1 p-0">
							<Text.Heading type="h4">退出当前账号？</Text.Heading>
							<Text.Paragraph color="muted" type="body-sm">
								退出后仍可浏览内容，发布和互动需要重新登录。
							</Text.Paragraph>
						</Surface>
						<Surface variant="transparent" className="flex-row gap-2 p-0">
							<Button
								variant="secondary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								onPress={() => setIsLogoutOpen(false)}
							>
								<Button.Label>再看看</Button.Label>
							</Button>
							<Button
								variant="danger"
								className="flex-1"
								feedbackVariant="scale-ripple"
								onPress={handleSignOut}
							>
								<Button.Label>退出</Button.Label>
							</Button>
						</Surface>
					</Card>
				</Surface>
			) : null}
			{isProfileActionsOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 justify-end bg-black/40 p-4"
				>
					<Button
						variant="ghost"
						className="absolute inset-0 rounded-none"
						feedbackVariant="none"
						onPress={() => setIsProfileActionsOpen(false)}
					/>
					<Card className="gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between">
							<Card.Body className="min-w-0 flex-1 gap-1 p-0">
								<Card.Title>个人页操作</Card.Title>
								<Card.Description>
									{profile?.name ?? session.data.user.name} · 作品 {notesCount}
								</Card.Description>
							</Card.Body>
							<Button
								size="sm"
								variant="secondary"
								isIconOnly
								feedbackVariant="scale-highlight"
								onPress={() => setIsProfileActionsOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card.Body className="gap-2">
							{profileActions.map((action) => (
								<Button
									key={action.label}
									variant={
										action.label === "退出账号" ? "danger-soft" : "secondary"
									}
									feedbackVariant="scale-ripple"
									className="justify-start"
									onPress={() => handleProfileAction(action)}
								>
									<Ionicons
										name={action.icon}
										size={18}
										color={action.label === "退出账号" ? "#f43f5e" : "#8a8a8a"}
									/>
									<Card.Body className="gap-0">
										<Button.Label>{action.label}</Button.Label>
										<Text.Paragraph color="muted" type="body-xs">
											{action.description}
										</Text.Paragraph>
									</Card.Body>
								</Button>
							))}
						</Card.Body>
					</Card>
				</Surface>
			) : null}
			{isProfileShareOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 justify-end bg-black/40 p-4"
				>
					<Button
						variant="ghost"
						className="absolute inset-0 rounded-none"
						feedbackVariant="none"
						onPress={() => setIsProfileShareOpen(false)}
					/>
					<Card className="gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between p-0">
							<Card.Body className="min-w-0 flex-1 gap-1 p-0">
								<Card.Title>分享我的主页</Card.Title>
								<Card.Description>
									{profile?.name ?? currentUser.name} · {notesCount} 篇作品
								</Card.Description>
							</Card.Body>
							<Button
								size="sm"
								variant="secondary"
								isIconOnly
								feedbackVariant="scale-highlight"
								onPress={() => setIsProfileShareOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card variant="secondary" className="gap-3 rounded-3xl p-3">
							<Card.Header className="flex-row items-center gap-3 p-0">
								<ProfileAvatar
									name={profile?.name ?? currentUser.name}
									image={profile?.image ?? null}
								/>
								<Card.Body className="min-w-0 gap-1 p-0">
									<Card.Title numberOfLines={1}>
										{profile?.name ?? currentUser.name}
									</Card.Title>
									<Card.Description numberOfLines={2}>
										{profile?.handle ? `@${profile.handle}` : "还没有用户名"} ·{" "}
										{profile?.bio || "记录生活，也收藏灵感"}
									</Card.Description>
								</Card.Body>
							</Card.Header>
							<Card.Footer className="flex-row gap-2 p-0">
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-ripple"
									className="flex-1"
									onPress={() => showProfileHint(`${notesCount} 篇公开作品`)}
								>
									<Button.Label>{notesCount} 作品</Button.Label>
								</Button>
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-ripple"
									className="flex-1"
									onPress={() =>
										showProfileHint(`${collectionsCount} 条收藏灵感`)
									}
								>
									<Button.Label>{collectionsCount} 收藏</Button.Label>
								</Button>
							</Card.Footer>
						</Card>
						<Card.Body className="gap-2 p-0">
							{profileShareActions.map((action) => (
								<Button
									key={action.label}
									variant={
										action.action === "profile" ? "primary" : "secondary"
									}
									feedbackVariant="scale-ripple"
									className="justify-start"
									onPress={() => handleProfileShareAction(action)}
								>
									<Ionicons
										name={action.icon}
										size={18}
										color={action.action === "profile" ? "#ffffff" : "#8a8a8a"}
									/>
									<Card.Body className="items-start gap-0 p-0">
										<Button.Label>{action.label}</Button.Label>
										<Text.Paragraph color="muted" type="body-xs">
											{action.description}
										</Text.Paragraph>
									</Card.Body>
								</Button>
							))}
						</Card.Body>
					</Card>
				</Surface>
			) : null}
		</Surface>
	);
}

function ProfileAvatar({
	name,
	image,
}: {
	name: string;
	image: string | null;
}) {
	return (
		<Avatar size="lg" color="accent" className="size-20">
			{image ? <Avatar.Image source={{ uri: image }} /> : null}
			<Avatar.Fallback>{name.slice(0, 1)}</Avatar.Fallback>
		</Avatar>
	);
}

function Stat({
	label,
	value,
	onPress,
}: {
	label: string;
	value: number;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant="ghost"
			feedbackVariant="scale-highlight"
			className="h-auto flex-1 flex-col gap-1 px-1 py-1"
			onPress={onPress}
		>
			<Text.Paragraph weight="semibold" className="text-lg tabular-nums">
				{value}
			</Text.Paragraph>
			<Text.Paragraph color="muted" type="body-xs">
				{label}
			</Text.Paragraph>
		</Button>
	);
}

function QuickAction({
	icon,
	label,
	active,
	onPress,
}: {
	icon: "bookmark-outline" | "images-outline" | "refresh-outline";
	label: string;
	active?: boolean;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant={active ? "primary" : "secondary"}
			feedbackVariant="scale-highlight"
			className="flex-1"
			onPress={onPress}
		>
			<Ionicons name={icon} size={15} color={active ? "#ffffff" : "#8a8a8a"} />
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
