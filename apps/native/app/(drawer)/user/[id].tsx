import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Card,
	Spinner,
	Surface,
	Text,
	useToast,
} from "heroui-native";
import { useState } from "react";
import { FlatList } from "react-native";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const profileActions = [
	{
		id: "share",
		label: "转发主页",
		description: "把这个作者主页分享给朋友",
		icon: "share-social-outline",
	},
	{
		id: "similar",
		label: "找相似内容",
		description: "去搜索更多同类生活灵感",
		icon: "search-outline",
	},
	{
		id: "save",
		label: "收藏灵感",
		description: "先把这个主页记在灵感清单里",
		icon: "bookmark-outline",
	},
	{
		id: "mute",
		label: "减少推荐",
		description: "之后少看这类主页推荐",
		icon: "eye-off-outline",
	},
] as const;

type ProfileAction = (typeof profileActions)[number];

export default function UserProfileScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useToast();
	const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
	const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
	const [isProfileSaved, setIsProfileSaved] = useState(false);
	const [isProfileMuted, setIsProfileMuted] = useState(false);
	const [profileHint, setProfileHint] = useState(
		"点关注、统计或更多操作，继续了解这个作者。",
	);
	const profile = useQuery({
		...orpc.social.profile.queryOptions({ input: { userId: id } }),
		enabled: !!id,
	});
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: (result) => {
				profile.refetch();
				setProfileHint(
					result.following
						? "已关注，之后更容易找回这个作者。"
						: "已取消关注。",
				);
				toast.show({ label: result.following ? "已关注" : "已取消关注" });
			},
			onError: (error) => {
				setProfileHint("关注操作失败，请稍后再试。");
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const isSelf = session.data?.user?.id === id;
	const isFollowing = profile.data?.profile.isFollowing;
	const profileData = profile.data?.profile;
	const handle = profileData?.handle
		? `@${profileData.handle}`
		: "还没有小红书号";
	const relationText = isSelf
		? "我的公开主页"
		: isFollowing
			? "已关注她的更新"
			: "还未关注";
	const noteCount = profile.data?.notes.length ?? 0;

	function showLoginToast() {
		toast.show({
			variant: "warning",
			label: "请先登录",
			description: "到“我的”页面登录后即可继续。",
			actionLabel: "去登录",
			onActionPress: ({ hide }) => {
				hide();
				router.push("/me" as Href);
			},
		});
		setProfileHint("登录后才能关注作者和持续互动。");
	}

	function handleFollow() {
		if (!session.data?.user) {
			showLoginToast();
			return;
		}
		followMutation.mutate({ userId: id });
	}

	function restoreRecommendations() {
		setIsProfileMuted(false);
		setProfileHint("已恢复这个作者的推荐。");
		toast.show({ label: "已恢复推荐", duration: 1200 });
	}

	function handleProfileAction(action: ProfileAction) {
		setIsActionPanelOpen(false);
		if (action.id === "share") {
			setIsSharePanelOpen(true);
			setProfileHint(
				`${profileData?.name ?? "这个作者"}的主页已准备好，可以继续选择分享方式。`,
			);
			return;
		}
		if (action.id === "similar") {
			toast.show({
				variant: "accent",
				label: "正在打开搜索",
				description: "可以继续找相似作者和图文。",
			});
			router.push("/search" as Href);
			setProfileHint("已打开搜索，可以继续找相似内容。");
			return;
		}
		if (action.id === "save") {
			const nextSavedState = !isProfileSaved;
			setIsProfileSaved(nextSavedState);
			setProfileHint(
				nextSavedState
					? "已收藏这个主页，之后可以从灵感清单里找回。"
					: "已取消收藏这个主页。",
			);
			toast.show({
				variant: nextSavedState ? "success" : "warning",
				label: nextSavedState ? "已收藏主页" : "已取消收藏",
				description: nextSavedState
					? action.description
					: "这个主页已从灵感清单移除。",
			});
			return;
		}
		if (action.id === "mute") {
			if (isProfileMuted) {
				restoreRecommendations();
				return;
			}
			setIsProfileMuted(true);
			setProfileHint("已减少这类主页推荐，你仍然可以继续访问这个作者。");
			toast.show({
				variant: "warning",
				label: "已减少推荐",
				description: "这个作者会少出现在推荐里。",
				actionLabel: "恢复",
				onActionPress: ({ hide }) => {
					hide();
					restoreRecommendations();
				},
			});
		}
	}

	function handleShareAction(action: "open" | "card" | "similar") {
		setIsSharePanelOpen(false);
		if (action === "similar") {
			setProfileHint("已打开搜索，可以找相似作者和内容。");
			router.push("/search" as Href);
			return;
		}
		if (action === "open") {
			setProfileHint("已停留在这个公开主页，可以继续浏览作品。");
			toast.show({
				variant: "accent",
				label: "已打开主页",
				description: "当前就是可分享的公开主页。",
			});
			return;
		}
		setProfileHint("主页名片已准备好，可以复制给朋友。");
		toast.show({
			variant: "success",
			label: "主页名片已准备好",
			description: `${profileData?.name ?? "这个作者"} · ${handle}`,
		});
	}

	return (
		<Card.Body className="relative flex-1 bg-background p-0">
			<FlatList
				data={profile.data?.notes ?? []}
				keyExtractor={(item) => item.id}
				numColumns={2}
				contentInsetAdjustmentBehavior="automatic"
				columnWrapperClassName="gap-3 px-3"
				contentContainerClassName="mx-auto w-full max-w-3xl gap-3 bg-background py-3"
				ListHeaderComponent={
					<Card.Body className="gap-4 px-3">
						<Card className="gap-4 overflow-hidden rounded-3xl p-4">
							<Surface className="-mx-4 -mt-4 h-24 bg-accent-soft p-0">
								<Card.Footer className="flex-row items-center justify-between p-3">
									<Button
										size="sm"
										variant="secondary"
										isIconOnly
										feedbackVariant="scale-ripple"
										onPress={() => router.back()}
									>
										<Ionicons name="chevron-back" size={18} color="#8a8a8a" />
									</Button>
									<Button
										size="sm"
										variant="secondary"
										isIconOnly
										feedbackVariant="scale-ripple"
										onPress={() => setIsActionPanelOpen(true)}
									>
										<Ionicons
											name="ellipsis-horizontal"
											size={18}
											color="#8a8a8a"
										/>
									</Button>
								</Card.Footer>
							</Surface>
							<Card.Header className="-mt-12 flex-row items-end gap-3">
								<ProfileAvatar
									name={profileData?.name ?? "用户"}
									image={profileData?.image ?? null}
								/>
								<Card.Body className="flex-1 gap-2 pb-1">
									<Card.Body className="gap-1">
										<Card.Title className="font-semibold text-foreground text-xl">
											{profileData?.name ?? "用户"}
										</Card.Title>
										<Text.Paragraph color="muted" type="body-sm">
											{handle}
										</Text.Paragraph>
									</Card.Body>
									<Card.Footer className="flex-row flex-wrap items-center gap-2">
										<Button
											size="sm"
											variant={isFollowing ? "primary" : "secondary"}
											feedbackVariant="scale-ripple"
											onPress={() => {
												setProfileHint(relationText);
												toast.show({ label: relationText, duration: 1200 });
											}}
										>
											<Ionicons
												name={
													isFollowing ? "checkmark-circle" : "person-outline"
												}
												size={13}
												color={isFollowing ? "#ffffff" : "#8a8a8a"}
											/>
											<Button.Label>{relationText}</Button.Label>
										</Button>
										{profile.isFetching ? (
											<Button
												size="sm"
												variant="secondary"
												feedbackVariant="scale-ripple"
												onPress={() => {
													setProfileHint("主页正在同步最新内容。");
													toast.show({ label: "同步中", duration: 1000 });
												}}
											>
												<Spinner size="sm" />
												<Button.Label>同步中</Button.Label>
											</Button>
										) : null}
									</Card.Footer>
								</Card.Body>
								{!isSelf ? (
									<Button
										size="sm"
										variant={isFollowing ? "secondary" : "primary"}
										feedbackVariant="scale-ripple"
										isDisabled={followMutation.isPending || !profile.data}
										onPress={handleFollow}
									>
										{followMutation.isPending ? (
											<Spinner size="sm" />
										) : (
											<Ionicons
												name={isFollowing ? "checkmark" : "add"}
												size={16}
												color={isFollowing ? "#8a8a8a" : "#ffffff"}
											/>
										)}
										<Button.Label>
											{isFollowing ? "已关注" : "关注"}
										</Button.Label>
									</Button>
								) : null}
							</Card.Header>
							<Card.Body className="gap-2">
								<Text.Paragraph color="muted" type="body-sm" numberOfLines={3}>
									{profileData?.bio ||
										"还没有简介，等她写下最近喜欢的生活片段。"}
								</Text.Paragraph>
								<Surface
									variant="secondary"
									className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
								>
									<Ionicons
										name={
											isProfileMuted
												? "eye-off-outline"
												: isProfileSaved
													? "bookmark"
													: isFollowing || isSelf
														? "sparkles"
														: "heart-outline"
										}
										size={16}
										color="#f43f5e"
									/>
									<Text.Paragraph
										color="muted"
										type="body-xs"
										className="flex-1"
									>
										{isProfileMuted
											? "已减少这类推荐，但仍可继续查看这个作者的公开内容。"
											: isProfileSaved
												? "已收藏这个主页，之后可以把她当作灵感参考。"
												: isSelf
													? "这里会展示你公开发布的图文。"
													: isFollowing
														? "已关注，之后可以更快找回这个作者的新分享。"
														: "关注后，可以更快找回这个作者的穿搭、美食和生活灵感。"}
									</Text.Paragraph>
								</Surface>
							</Card.Body>
							<Surface
								variant="secondary"
								className="flex-row justify-around rounded-2xl p-3"
							>
								<Stat
									label="图文"
									value={profileData?.noteCount ?? 0}
									onPress={() => {
										setProfileHint(
											`这里有 ${profileData?.noteCount ?? 0} 篇公开图文。`,
										);
										toast.show({ label: "继续往下看作品", duration: 1200 });
									}}
								/>
								<Stat
									label="粉丝"
									value={profileData?.followerCount ?? 0}
									onPress={() => {
										setProfileHint("粉丝数会随关注互动同步变化。");
										toast.show({ label: "粉丝数据已查看", duration: 1200 });
									}}
								/>
								<Stat
									label="关注"
									value={profileData?.followingCount ?? 0}
									onPress={() => {
										setProfileHint("关注数表示这个作者关注的主页数量。");
										toast.show({ label: "关注数据已查看", duration: 1200 });
									}}
								/>
								<Stat
									label="获赞"
									value={profileData?.likedCount ?? 0}
									onPress={() => {
										setProfileHint("获赞来自公开图文收到的喜欢。");
										toast.show({ label: "获赞数据已查看", duration: 1200 });
									}}
								/>
							</Surface>
							<Card.Footer className="flex-row gap-2">
								<Button
									variant={isSelf ? "secondary" : "primary"}
									feedbackVariant="scale-ripple"
									className="flex-1"
									onPress={() => {
										if (isSelf) {
											setProfileHint("回到我的页面编辑资料。");
											router.push("/me" as Href);
											return;
										}
										handleFollow();
									}}
									isDisabled={
										!isSelf && (followMutation.isPending || !profile.data)
									}
								>
									{!isSelf && followMutation.isPending ? (
										<Spinner size="sm" />
									) : (
										<Ionicons
											name={isSelf ? "create-outline" : "heart-outline"}
											size={17}
											color={isSelf || isFollowing ? "#8a8a8a" : "#ffffff"}
										/>
									)}
									<Button.Label>
										{isSelf ? "编辑资料" : isFollowing ? "已关注" : "关注她"}
									</Button.Label>
								</Button>
								<Button
									variant="secondary"
									feedbackVariant="scale-highlight"
									className="flex-1"
									onPress={() => setIsActionPanelOpen(true)}
								>
									<Ionicons name="share-outline" size={17} color="#8a8a8a" />
									<Button.Label>分享</Button.Label>
								</Button>
							</Card.Footer>
						</Card>
						<Surface variant="secondary" className="gap-3 rounded-3xl p-3">
							<Card.Footer className="items-center gap-2">
								<Button
									size="sm"
									variant="secondary"
									feedbackVariant="scale-ripple"
									onPress={() => {
										setProfileHint("主页概览会根据作品和关注状态变化。");
										toast.show({ label: "主页概览", duration: 1000 });
									}}
								>
									<Ionicons name="sparkles-outline" size={13} color="#f43f5e" />
									<Button.Label>主页概览</Button.Label>
								</Button>
								<Text.Paragraph color="muted" type="body-xs" className="flex-1">
									{isSelf
										? "继续完善资料，会让你的图文更容易被记住。"
										: noteCount > 0
											? `当前有 ${noteCount} 篇公开图文，可以继续往下逛。`
											: "这个作者还没有公开内容，可以先去发现页看看。"}
								</Text.Paragraph>
							</Card.Footer>
							<Surface
								variant="tertiary"
								className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
							>
								<Ionicons name="sparkles-outline" size={15} color="#f43f5e" />
								<Text.Paragraph type="body-sm" className="flex-1">
									{profileHint}
								</Text.Paragraph>
							</Surface>
							{isProfileSaved || isProfileMuted ? (
								<Surface
									variant="default"
									className="gap-2 rounded-2xl border border-border px-3 py-2"
								>
									{isProfileSaved ? (
										<Card.Footer className="flex-row items-center gap-2">
											<Ionicons name="bookmark" size={15} color="#f43f5e" />
											<Text.Paragraph type="body-xs" className="flex-1">
												已加入灵感清单
											</Text.Paragraph>
											<Button
												size="sm"
												variant="ghost"
												feedbackVariant="scale-highlight"
												onPress={() => {
													setIsProfileSaved(false);
													setProfileHint("已取消收藏这个主页。");
												}}
											>
												<Button.Label>取消收藏</Button.Label>
											</Button>
										</Card.Footer>
									) : null}
									{isProfileMuted ? (
										<Card.Footer className="flex-row items-center gap-2">
											<Ionicons
												name="eye-off-outline"
												size={15}
												color="#8a8a8a"
											/>
											<Text.Paragraph type="body-xs" className="flex-1">
												已减少这类推荐
											</Text.Paragraph>
											<Button
												size="sm"
												variant="ghost"
												feedbackVariant="scale-highlight"
												onPress={restoreRecommendations}
											>
												<Button.Label>恢复推荐</Button.Label>
											</Button>
										</Card.Footer>
									) : null}
								</Surface>
							) : null}
							<Card.Footer className="flex-row gap-2">
								<QuickAction
									icon={isSelf ? "add-circle-outline" : "search-outline"}
									label={isSelf ? "去发布" : "搜同款"}
									onPress={() => {
										setProfileHint(
											isSelf ? "去发布新的图文。" : "去搜索相似内容。",
										);
										router.push(isSelf ? "/create" : "/search");
									}}
								/>
								<QuickAction
									icon="refresh"
									label="刷新"
									onPress={() => {
										setProfileHint("正在刷新主页内容。");
										profile.refetch();
										toast.show({ label: "主页已刷新" });
									}}
								/>
								<QuickAction
									icon="ellipsis-horizontal"
									label="更多"
									onPress={() => setIsActionPanelOpen(true)}
								/>
							</Card.Footer>
						</Surface>
						<Card.Footer className="flex-row items-center justify-between">
							<Card.Body className="gap-0.5">
								<Text.Paragraph weight="semibold">发布</Text.Paragraph>
								<Text.Paragraph color="muted" type="body-xs">
									{noteCount} 篇公开图文
								</Text.Paragraph>
							</Card.Body>
							<Button
								size="sm"
								variant="ghost"
								feedbackVariant="scale-highlight"
								onPress={() => {
									setProfileHint("正在同步主页内容。");
									profile.refetch();
									toast.show({ label: "正在同步主页内容" });
								}}
							>
								<Ionicons name="refresh" size={15} color="#8a8a8a" />
								<Button.Label>刷新</Button.Label>
							</Button>
						</Card.Footer>
					</Card.Body>
				}
				renderItem={({ item }) => <NoteCard note={item} />}
				ListEmptyComponent={
					profile.isLoading ? (
						<FeedSkeleton />
					) : profile.isError ? (
						<ErrorState
							title="个人页加载失败"
							description="这个用户的数据暂时没有拿到。"
							onRetry={() => profile.refetch()}
						/>
					) : (
						<EmptyState
							icon="person-circle-outline"
							title="还没有公开图文"
							description="关注后可以回来看看对方的新分享。"
							actionLabel={isSelf ? "去发布" : "找相似内容"}
							onAction={() => {
								setProfileHint(
									isSelf
										? "正在打开发布页，写一篇公开图文。"
										: "正在打开搜索，找相似作者和内容。",
								);
								router.push((isSelf ? "/create" : "/search") as Href);
							}}
						/>
					)
				}
			/>
			{isActionPanelOpen ? (
				<Surface className="absolute inset-0 justify-end bg-black/35 p-3">
					<Button
						variant="ghost"
						className="absolute inset-0 rounded-none"
						feedbackVariant="none"
						onPress={() => setIsActionPanelOpen(false)}
					/>
					<Card className="gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between">
							<Card.Body className="gap-1">
								<Card.Title>主页操作</Card.Title>
								<Card.Description>
									{profileData?.name ?? "这个作者"} · {handle}
								</Card.Description>
							</Card.Body>
							<Button
								size="sm"
								variant="secondary"
								isIconOnly
								feedbackVariant="scale-highlight"
								onPress={() => setIsActionPanelOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card.Body className="gap-2">
							{profileActions.map((action) => (
								<Button
									key={action.id}
									variant="secondary"
									feedbackVariant="scale-highlight"
									className="justify-start"
									onPress={() => handleProfileAction(action)}
								>
									<Ionicons
										name={
											action.id === "save" && isProfileSaved
												? "bookmark"
												: action.id === "mute" && isProfileMuted
													? "eye-outline"
													: action.icon
										}
										size={18}
										color="#8a8a8a"
									/>
									<Card.Body className="gap-0">
										<Button.Label>
											{action.id === "save" && isProfileSaved
												? "取消收藏"
												: action.id === "mute" && isProfileMuted
													? "恢复推荐"
													: action.label}
										</Button.Label>
										<Text.Paragraph color="muted" type="body-xs">
											{action.id === "save" && isProfileSaved
												? "从灵感清单里移除这个主页"
												: action.id === "mute" && isProfileMuted
													? "继续在推荐里看到这个作者"
													: action.description}
										</Text.Paragraph>
									</Card.Body>
								</Button>
							))}
						</Card.Body>
					</Card>
				</Surface>
			) : null}
			{isSharePanelOpen ? (
				<Surface className="absolute inset-0 justify-end bg-black/35 p-3">
					<Button
						variant="ghost"
						className="absolute inset-0 rounded-none"
						feedbackVariant="none"
						onPress={() => setIsSharePanelOpen(false)}
					/>
					<Card className="gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between">
							<Card.Body className="gap-1">
								<Card.Title>分享主页</Card.Title>
								<Card.Description>
									{profileData?.name ?? "这个作者"} · {handle}
								</Card.Description>
							</Card.Body>
							<Button
								size="sm"
								variant="secondary"
								isIconOnly
								feedbackVariant="scale-highlight"
								onPress={() => setIsSharePanelOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Surface
							variant="secondary"
							className="flex-row items-center gap-3 rounded-2xl p-3"
						>
							<ProfileAvatar
								name={profileData?.name ?? "用户"}
								image={profileData?.image ?? null}
							/>
							<Card.Body className="gap-1">
								<Text.Paragraph weight="semibold">
									{profileData?.name ?? "用户"}
								</Text.Paragraph>
								<Text.Paragraph color="muted" type="body-xs">
									{noteCount} 篇公开图文 · {handle}
								</Text.Paragraph>
							</Card.Body>
						</Surface>
						<Card.Footer className="flex-row gap-2">
							<Button
								variant="secondary"
								feedbackVariant="scale-highlight"
								className="flex-1"
								onPress={() => handleShareAction("open")}
							>
								<Ionicons name="open-outline" size={16} color="#8a8a8a" />
								<Button.Label>打开主页</Button.Label>
							</Button>
							<Button
								variant="secondary"
								feedbackVariant="scale-highlight"
								className="flex-1"
								onPress={() => handleShareAction("card")}
							>
								<Ionicons name="copy-outline" size={16} color="#8a8a8a" />
								<Button.Label>主页名片</Button.Label>
							</Button>
							<Button
								variant="primary"
								feedbackVariant="scale-ripple"
								className="flex-1"
								onPress={() => handleShareAction("similar")}
							>
								<Ionicons name="search-outline" size={16} color="#ffffff" />
								<Button.Label>找相似</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}
		</Card.Body>
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
		<Avatar size="lg" color="accent" alt={name} className="size-20">
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
	onPress,
}: {
	icon:
		| (typeof profileActions)[number]["icon"]
		| "add-circle-outline"
		| "ellipsis-horizontal"
		| "refresh";
	label: string;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant="secondary"
			feedbackVariant="scale-highlight"
			className="flex-1"
			onPress={onPress}
		>
			<Ionicons name={icon} size={16} color="#8a8a8a" />
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
