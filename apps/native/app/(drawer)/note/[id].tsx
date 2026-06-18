import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	Card,
	Avatar as HeroAvatar,
	Input,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	TextField,
	useToast,
} from "heroui-native";
import { useRef, useState } from "react";
import { Image, ScrollView, useWindowDimensions } from "react-native";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const quickComments = [
	{ text: "想去这里", icon: "location-outline" },
	{ text: "求路线", icon: "map-outline" },
	{ text: "太好看了", icon: "sparkles-outline" },
	{ text: "收藏备用", icon: "bookmark-outline" },
] as const;
const shareTargets = [
	{ id: "forward", label: "转发给好友", icon: "paper-plane-outline" },
	{ id: "card", label: "生成分享卡", icon: "image-outline" },
	{ id: "copy", label: "复制图文标题", icon: "copy-outline" },
	{ id: "mute", label: "不感兴趣", icon: "eye-off-outline" },
] as const;
const detailActions = [
	{
		label: "搜同款",
		description: "继续看相似话题",
		icon: "search-outline",
		action: "search",
	},
	{
		label: "写同款",
		description: "去发布你的版本",
		icon: "create-outline",
		action: "create",
	},
	{
		label: "看大图",
		description: "沉浸查看图片",
		icon: "scan-outline",
		action: "preview",
	},
	{
		label: "关注作者",
		description: "之后更容易找回",
		icon: "person-add-outline",
		action: "follow",
	},
] as const;
const commentTools = [
	{
		label: "帮我润色",
		description: "把当前评论变得更自然",
		icon: "sparkles-outline",
		action: "polish",
	},
	{
		label: "带上话题",
		description: "把图文话题加进评论",
		icon: "pricetag-outline",
		action: "topic",
	},
	{
		label: "问问作者",
		description: "生成一句适合继续互动的问题",
		icon: "chatbubbles-outline",
		action: "question",
	},
] as const;

export default function NoteDetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const session = authClient.useSession();
	const { toast } = useToast();
	const [commentText, setCommentText] = useState("");
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(
		null,
	);
	const [isShareOpen, setIsShareOpen] = useState(false);
	const [isSuggestionMuted, setIsSuggestionMuted] = useState(false);
	const [shareResult, setShareResult] = useState<{
		description: string;
		icon: keyof typeof Ionicons.glyphMap;
		label: string;
		tone: "accent" | "warning" | "success";
	} | null>(null);
	const [showHeartBurst, setShowHeartBurst] = useState(false);
	const [reactionHint, setReactionHint] = useState<string | null>(null);
	const [detailHint, setDetailHint] = useState(
		"双击图片可点赞，点作者头像可进主页。",
	);
	const [commentHint, setCommentHint] = useState(
		"选一句快捷评论，或直接写下你的想法。",
	);
	const [lastImageTapAt, setLastImageTapAt] = useState(0);
	const { width } = useWindowDimensions();
	const imageScrollerRef = useRef<ScrollView>(null);
	const note = useQuery({
		...orpc.social.byId.queryOptions({ input: { id } }),
		enabled: !!id,
	});
	const authorProfile = useQuery({
		...orpc.social.profile.queryOptions({
			input: { userId: note.data?.author.id ?? "" },
		}),
		enabled: !!note.data?.author.id,
	});

	const likeMutation = useMutation(
		orpc.social.toggleLike.mutationOptions({
			onSuccess: (result) => {
				note.refetch();
				setDetailHint(result.liked ? "已喜欢这篇图文。" : "已取消喜欢。");
				toast.show({ label: result.liked ? "已点赞" : "已取消点赞" });
			},
		}),
	);
	const collectMutation = useMutation(
		orpc.social.toggleCollect.mutationOptions({
			onSuccess: (result) => {
				note.refetch();
				setDetailHint(
					result.collected ? "已收藏，之后可在我的页面找回。" : "已取消收藏。",
				);
				toast.show({ label: result.collected ? "已收藏" : "已取消收藏" });
			},
		}),
	);
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: (result) => {
				authorProfile.refetch();
				setDetailHint(
					result.following
						? "已关注作者，后续更容易找回她的新图文。"
						: "已取消关注作者。",
				);
				toast.show({ label: result.following ? "已关注作者" : "已取消关注" });
			},
			onError: (error) => {
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const commentMutation = useMutation(
		orpc.social.addComment.mutationOptions({
			onSuccess: () => {
				setCommentText("");
				setCommentHint("评论已发布，评论区已刷新。");
				note.refetch();
				toast.show({ variant: "success", label: "评论已发布" });
			},
			onError: (error) => {
				setCommentHint(error.message);
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	const requireLogin = () => {
		if (!session.data?.user) {
			toast.show({
				variant: "warning",
				label: "请先登录",
				description: "到“我的”页面登录后即可互动。",
				actionLabel: "去登录",
				onActionPress: () => {
					router.push("/me" as Href);
				},
			});
			return false;
		}
		return true;
	};

	if (note.isLoading) {
		return (
			<Surface
				variant="transparent"
				className="flex-1 items-center justify-center bg-background"
			>
				<Spinner className="mb-3" />
				<Text.Paragraph color="muted">正在加载图文</Text.Paragraph>
			</Surface>
		);
	}

	if (note.isError || !note.data) {
		return (
			<Surface
				variant="transparent"
				className="flex-1 items-center justify-center bg-background px-6"
			>
				<Text.Paragraph align="center" color="muted">
					{note.isError ? "图文暂时加载失败" : "图文不存在或还没有发布"}
				</Text.Paragraph>
			</Surface>
		);
	}

	const liked = note.data.liked;
	const collected = note.data.collected;
	const isAuthorSelf = session.data?.user?.id === note.data.author.id;
	const isFollowingAuthor = authorProfile.data?.profile.isFollowing;
	const previewImage =
		previewImageIndex === null ? null : note.data.images[previewImageIndex];
	const trimmedComment = commentText.trim();
	const showReactionHint = (message: string) => {
		setReactionHint(message);
		setTimeout(() => setReactionHint(null), 1200);
	};
	const submitComment = () => {
		if (!trimmedComment) {
			setCommentHint("先写点内容，或点一条快捷评论。");
			toast.show({ label: "先写点内容", duration: 900 });
			return;
		}
		if (!requireLogin()) {
			setCommentHint("登录后可以发布评论。");
			return;
		}
		setCommentHint("正在发送评论。");
		setDetailHint("正在发布评论，评论区稍后刷新。");
		commentMutation.mutate({
			noteId: note.data.id,
			content: trimmedComment,
		});
	};
	const fillQuickComment = (item: (typeof quickComments)[number]) => {
		const active = commentText.trim() === item.text;
		setCommentText(active ? "" : item.text);
		setCommentHint(
			active ? "已清空快捷评论。" : `已填入「${item.text}」，可以直接发送。`,
		);
		toast.show({
			label: active ? "已清空快捷评论" : `已填入「${item.text}」`,
			duration: 900,
		});
	};
	const applyCommentTool = (tool: (typeof commentTools)[number]) => {
		if (tool.action === "polish") {
			const base = commentText.trim() || "太好看了";
			const nextComment = base.endsWith("！")
				? base
				: `${base}！想收藏起来慢慢参考`;
			setCommentText(nextComment);
			setCommentHint("已帮你把评论改得更像真实互动，可以直接发送。");
			toast.show({ variant: "success", label: "评论已润色", duration: 1000 });
			return;
		}
		if (tool.action === "topic") {
			const topic = note.data.topics[0];
			if (!topic) {
				setCommentHint("这篇图文还没有话题，可以先写一句感受。");
				toast.show({ label: "暂无可带入的话题", duration: 900 });
				return;
			}
			const nextComment = commentText.trim()
				? `${commentText.trim()} #${topic}`
				: `#${topic} 这个方向我也想试试`;
			setCommentText(nextComment);
			setCommentHint(`已带上 #${topic}，评论更贴近这篇图文。`);
			toast.show({ label: `已带上 #${topic}`, duration: 1000 });
			return;
		}
		const question = "想问问具体是怎么安排路线和时间的？";
		setCommentText(question);
		setCommentHint("已生成一个适合继续互动的问题。");
		toast.show({ label: "已生成互动问题", duration: 1000 });
	};
	const toggleLike = () => {
		if (!requireLogin()) return;
		likeMutation.mutate({ id: note.data.id });
		showReactionHint(liked ? "已收回点赞" : "点赞成功");
	};
	const toggleCollect = () => {
		if (!requireLogin()) return;
		collectMutation.mutate({ id: note.data.id });
		showReactionHint(collected ? "已取消收藏" : "已加入收藏");
	};
	const handleImagePress = () => {
		const now = Date.now();
		if (now - lastImageTapAt > 280) {
			setLastImageTapAt(now);
			return;
		}

		setLastImageTapAt(0);
		setShowHeartBurst(true);
		setTimeout(() => setShowHeartBurst(false), 650);

		if (!liked && requireLogin()) {
			likeMutation.mutate({ id: note.data.id });
			showReactionHint("双击点赞成功");
		} else if (liked) {
			toast.show({ label: "已经点过赞了" });
		}
	};
	const showPreviousPreview = () => {
		setPreviewImageIndex((index) => {
			if (index === null) return null;
			return index === 0 ? note.data.images.length - 1 : index - 1;
		});
	};
	const showNextPreview = () => {
		setPreviewImageIndex((index) => {
			if (index === null) return null;
			return index === note.data.images.length - 1 ? 0 : index + 1;
		});
	};
	const selectImage = (index: number) => {
		setActiveImageIndex(index);
		imageScrollerRef.current?.scrollTo({ x: width * index, animated: true });
		showReactionHint(`已切换到第 ${index + 1} 张`);
		setDetailHint(`正在看第 ${index + 1} 张图。`);
	};
	const openCommentComposer = () => {
		setCommentHint(
			session.data?.user
				? "可以直接写评论，也可以先选一句快捷评论。"
				: "登录后可以发布评论。",
		);
		toast.show({
			label: session.data?.user ? "评论输入在下方" : "登录后可以评论",
			duration: 1000,
		});
	};
	const openImagePreview = () => {
		setPreviewImageIndex(activeImageIndex);
		setDetailHint("已打开大图预览，可以左右切换图片。");
		toast.show({ label: "已打开大图预览", duration: 900 });
	};
	const openShareSheet = () => {
		setIsShareOpen(true);
		setDetailHint("已打开分享面板，可以转发或减少类似推荐。");
		toast.show({ label: "打开分享面板", duration: 900 });
	};
	const restoreSuggestion = () => {
		setIsSuggestionMuted(false);
		setShareResult({
			description: "这类图文会继续出现在你的推荐里。",
			icon: "sparkles-outline",
			label: "已恢复推荐",
			tone: "accent",
		});
		setDetailHint("已恢复类似图文推荐。");
		toast.show({ label: "已恢复推荐", duration: 1000 });
	};
	const handleShareAction = (item: (typeof shareTargets)[number]) => {
		setIsShareOpen(false);
		if (item.id === "mute") {
			setIsSuggestionMuted(true);
			setShareResult({
				description: "之后会少看到这类图文，也可以随时恢复。",
				icon: "eye-off-outline",
				label: "已减少类似推荐",
				tone: "warning",
			});
			setDetailHint("已减少类似推荐，你仍然可以继续看当前图文。");
			toast.show({
				variant: "warning",
				label: "已减少类似推荐",
				description: "这个反馈会保留在图文下方。",
				actionLabel: "恢复",
				onActionPress: ({ hide }) => {
					hide();
					restoreSuggestion();
				},
			});
			return;
		}
		const nextResult =
			item.id === "forward"
				? {
						description: "可以把这篇图文发给朋友，一起看细节。",
						icon: item.icon,
						label: "转发已准备好",
						tone: "success" as const,
					}
				: item.id === "card"
					? {
							description: "封面、标题和作者信息已整理成分享提示。",
							icon: item.icon,
							label: "分享卡已准备好",
							tone: "success" as const,
						}
					: {
							description: `已复制「${note.data.title}」。`,
							icon: item.icon,
							label: "标题已复制",
							tone: "accent" as const,
						};
		setShareResult(nextResult);
		setDetailHint(`${nextResult.label}，可以继续收藏或评论。`);
		toast.show({
			variant: nextResult.tone === "accent" ? "accent" : "success",
			label: nextResult.label,
			description: nextResult.description,
		});
	};
	const handleDetailAction = (action: (typeof detailActions)[number]) => {
		if (action.action === "search") {
			const topic = note.data.topics[0];
			setDetailHint(topic ? `正在找 #${topic} 的相似图文。` : "正在打开搜索。");
			toast.show({
				variant: "accent",
				label: topic ? `正在找 #${topic}` : "去搜索更多灵感",
				description: "可以继续筛选相似图文。",
			});
			router.push("/search" as Href);
			return;
		}
		if (action.action === "create") {
			setDetailHint("正在打开发布页，已带入同款图文结构。");
			toast.show({ label: "去写同款", duration: 900 });
			router.push({
				pathname: "/create",
				params: {
					action: "same-style",
					actionAt: String(Date.now()),
					source: "note",
				},
			} as Href);
			return;
		}
		if (action.action === "preview") {
			openImagePreview();
			return;
		}
		if (isAuthorSelf) {
			setDetailHint("这是你自己的图文。");
			toast.show({ label: "这是你自己的图文", duration: 1000 });
			return;
		}
		if (requireLogin()) {
			followMutation.mutate({ userId: note.data.author.id });
		}
	};

	return (
		<Surface variant="transparent" className="flex-1 bg-background p-0">
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 pb-56"
			>
				<Surface variant="transparent" className="relative p-0">
					<ScrollView
						ref={imageScrollerRef}
						horizontal
						pagingEnabled
						showsHorizontalScrollIndicator={false}
						onMomentumScrollEnd={(event) => {
							setActiveImageIndex(
								Math.round(event.nativeEvent.contentOffset.x / width),
							);
						}}
					>
						{note.data.images.map((image, index) => (
							<PressableFeedback
								key={image}
								animation={{ scale: { value: 0.995 } }}
								onPress={handleImagePress}
							>
								<PressableFeedback.Highlight
									animation={{
										backgroundColor: { value: "rgba(246, 44, 85, 0.12)" },
										opacity: { value: [0, 0.12] },
									}}
								/>
								<Image
									source={{ uri: image }}
									className="h-[460px] bg-content3"
									resizeMode="cover"
									style={{ width }}
								/>
								{showHeartBurst && index === activeImageIndex ? (
									<Surface
										variant="transparent"
										className="absolute inset-0 items-center justify-center p-0"
									>
										<Surface className="size-24 items-center justify-center rounded-full bg-black/20 p-0">
											<Ionicons name="heart" size={72} color="#ffffff" />
										</Surface>
									</Surface>
								) : null}
							</PressableFeedback>
						))}
					</ScrollView>
					<Surface
						variant="transparent"
						className="absolute top-4 right-4 left-4 flex-row items-center justify-between p-0"
					>
						<Button
							isIconOnly
							size="sm"
							variant="secondary"
							feedbackVariant="scale-ripple"
							className="bg-black/45"
							onPress={() => router.back()}
						>
							<Ionicons name="chevron-back" size={18} color="#ffffff" />
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant="secondary"
							feedbackVariant="scale-ripple"
							className="bg-black/45"
							onPress={openShareSheet}
						>
							<Ionicons name="share-outline" size={17} color="#ffffff" />
						</Button>
					</Surface>
					{note.data.images.length > 1 ? (
						<Surface className="absolute top-16 right-4 rounded-full bg-black/45 px-3 py-1.5">
							<Text className="font-semibold text-white text-xs">
								{activeImageIndex + 1}/{note.data.images.length}
							</Text>
						</Surface>
					) : null}
					{note.data.images.length > 1 ? (
						<Surface
							variant="transparent"
							className="absolute right-4 bottom-16 left-4 p-0"
						>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								<Surface
									variant="transparent"
									className="flex-row gap-2 rounded-2xl bg-black/35 p-2"
								>
									{note.data.images.map((image, index) => {
										const active = index === activeImageIndex;
										return (
											<Button
												key={image}
												isIconOnly
												size="sm"
												variant={active ? "primary" : "secondary"}
												feedbackVariant="scale-ripple"
												accessibilityLabel={`查看第 ${index + 1} 张图片`}
												className={`size-14 overflow-hidden rounded-xl border-2 p-0 ${
													active ? "border-white" : "border-white/25"
												}`}
												onPress={() => selectImage(index)}
											>
												<Image
													source={{ uri: image }}
													className="size-full bg-content3"
													resizeMode="cover"
												/>
											</Button>
										);
									})}
								</Surface>
							</ScrollView>
						</Surface>
					) : null}
					<Button
						size="sm"
						variant="secondary"
						feedbackVariant="scale-ripple"
						className="absolute right-4 bottom-4 bg-black/45"
						onPress={openImagePreview}
					>
						<Ionicons name="scan-outline" size={15} color="#ffffff" />
						<Button.Label className="text-white">查看大图</Button.Label>
					</Button>
				</Surface>
				<Surface variant="transparent" className="gap-4 p-0 px-4">
					<Card className="gap-4 rounded-3xl p-4">
						<Surface
							variant="transparent"
							className="flex-row items-center gap-2 p-0"
						>
							<Link
								href={
									{
										pathname: "/user/[id]",
										params: { id: note.data.author.id },
									} as unknown as Href
								}
								asChild
							>
								<Button
									variant="ghost"
									feedbackVariant="scale-highlight"
									className="flex-1 justify-start px-0"
									onPress={() => setDetailHint("正在打开作者主页。")}
								>
									<Avatar
										name={note.data.author.name}
										image={note.data.author.image}
									/>
									<Surface variant="transparent" className="flex-1 gap-0.5 p-0">
										<Text.Paragraph weight="semibold" type="body-sm">
											{note.data.author.name}
										</Text.Paragraph>
										<Text.Paragraph color="muted" type="body-xs">
											查看主页
										</Text.Paragraph>
									</Surface>
									<Ionicons name="chevron-forward" size={16} color="#8a8a8a" />
								</Button>
							</Link>
							{!isAuthorSelf ? (
								<Button
									size="sm"
									variant={isFollowingAuthor ? "secondary" : "primary"}
									feedbackVariant="scale-ripple"
									isDisabled={
										followMutation.isPending || authorProfile.isLoading
									}
									onPress={() => {
										if (requireLogin()) {
											followMutation.mutate({ userId: note.data.author.id });
										}
									}}
								>
									{followMutation.isPending ? (
										<Spinner size="sm" />
									) : (
										<Ionicons
											name={isFollowingAuthor ? "checkmark" : "add"}
											size={16}
											color={isFollowingAuthor ? "#8a8a8a" : "#ffffff"}
										/>
									)}
									<Button.Label>
										{isFollowingAuthor ? "已关注" : "关注"}
									</Button.Label>
								</Button>
							) : null}
						</Surface>
						<Card.Title
							selectable
							className="font-semibold text-foreground text-xl leading-7"
						>
							{note.data.title}
						</Card.Title>
						<Text.Paragraph selectable type="body" className="leading-7">
							{note.data.content}
						</Text.Paragraph>
						<Surface
							variant="transparent"
							className="flex-row flex-wrap gap-2 p-0"
						>
							{note.data.topics.map((topic) => (
								<Button
									key={topic}
									size="md"
									variant="outline"
									feedbackVariant="scale-ripple"
									onPress={() =>
										toast.show({
											label: `正在看 #${topic}`,
											description: "可以到搜索页继续筛选相关图文。",
											actionLabel: "去搜索",
											onActionPress: () => router.push("/search" as Href),
										})
									}
								>
									<Ionicons name="pricetag-outline" size={14} color="#f43f5e" />
									<Button.Label>#{topic}</Button.Label>
								</Button>
							))}
						</Surface>
						<Surface
							variant="tertiary"
							className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
						>
							<Ionicons name="sparkles-outline" size={15} color="#f43f5e" />
							<Text.Paragraph type="body-sm" className="flex-1">
								{detailHint}
							</Text.Paragraph>
						</Surface>
						{shareResult ? (
							<Surface
								variant="secondary"
								className="gap-3 rounded-2xl border border-border px-3 py-3"
							>
								<Card.Footer className="flex-row items-center gap-2 p-0">
									<Surface
										variant="transparent"
										className={`size-9 items-center justify-center rounded-full p-0 ${
											shareResult.tone === "warning"
												? "bg-warning-soft"
												: "bg-accent-soft"
										}`}
									>
										<Ionicons
											name={shareResult.icon}
											size={17}
											color={
												shareResult.tone === "warning" ? "#f59e0b" : "#f43f5e"
											}
										/>
									</Surface>
									<Card.Body className="min-w-0 flex-1 gap-0.5 p-0">
										<Text.Paragraph weight="semibold" type="body-sm">
											{shareResult.label}
										</Text.Paragraph>
										<Text.Paragraph color="muted" type="body-xs">
											{shareResult.description}
										</Text.Paragraph>
									</Card.Body>
								</Card.Footer>
								<Card.Footer className="flex-row gap-2 p-0">
									{isSuggestionMuted ? (
										<Button
											size="sm"
											variant="secondary"
											feedbackVariant="scale-ripple"
											className="flex-1"
											onPress={restoreSuggestion}
										>
											<Ionicons
												name="refresh-outline"
												size={14}
												color="#8a8a8a"
											/>
											<Button.Label>恢复推荐</Button.Label>
										</Button>
									) : null}
									<Button
										size="sm"
										variant={isSuggestionMuted ? "primary" : "secondary"}
										feedbackVariant="scale-ripple"
										className="flex-1"
										onPress={() => {
											setDetailHint("正在打开搜索，继续找相似灵感。");
											router.push("/search" as Href);
										}}
									>
										<Ionicons
											name="search-outline"
											size={14}
											color={isSuggestionMuted ? "#ffffff" : "#8a8a8a"}
										/>
										<Button.Label>找相似</Button.Label>
									</Button>
									<Button
										size="sm"
										variant="ghost"
										feedbackVariant="scale-highlight"
										className="flex-1"
										onPress={() => {
											setShareResult(null);
											setDetailHint("已收起分享反馈。");
										}}
									>
										<Button.Label>收起</Button.Label>
									</Button>
								</Card.Footer>
							</Surface>
						) : null}
						<Surface
							variant="secondary"
							className="flex-row items-center justify-between rounded-2xl px-3 py-3"
						>
							<EngagementPill
								active={liked}
								icon={liked ? "heart" : "heart-outline"}
								label={liked ? "已喜欢" : "喜欢"}
								loading={likeMutation.isPending}
								onPress={toggleLike}
								value={note.data.likedCount}
							/>
							<EngagementPill
								active={collected}
								icon={collected ? "bookmark" : "bookmark-outline"}
								label={collected ? "已收藏" : "收藏"}
								loading={collectMutation.isPending}
								onPress={toggleCollect}
								value={note.data.collectedCount}
							/>
							<EngagementPill
								icon="chatbubble-outline"
								label="评论"
								onPress={openCommentComposer}
								value={note.data.commentCount}
							/>
						</Surface>
					</Card>

					<Card className="gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between p-0">
							<Card.Body className="gap-0.5 p-0">
								<Text.Paragraph weight="semibold">看完之后</Text.Paragraph>
								<Text.Paragraph color="muted" type="body-sm">
									继续找同款、写自己的版本，或把作者留下来
								</Text.Paragraph>
							</Card.Body>
							<Surface
								variant="secondary"
								className="rounded-full bg-danger-soft px-3 py-1"
							>
								<Text.Paragraph
									type="body-xs"
									weight="semibold"
									className="text-danger"
								>
									灵感
								</Text.Paragraph>
							</Surface>
						</Card.Header>
						<Surface
							variant="transparent"
							className="flex-row flex-wrap gap-2 p-0"
						>
							{detailActions.map((action) => {
								const isFollowAction = action.action === "follow";
								const active = isFollowAction && !!isFollowingAuthor;
								const label = isFollowAction
									? isAuthorSelf
										? "我的图文"
										: isFollowingAuthor
											? "已关注"
											: action.label
									: action.label;
								const description = isFollowAction
									? isAuthorSelf
										? "可以继续完善主页"
										: isFollowingAuthor
											? "再次点按可取消"
											: action.description
									: action.description;

								return (
									<Button
										key={action.action}
										size="lg"
										variant={active ? "primary" : "secondary"}
										feedbackVariant="scale-ripple"
										className="min-h-20 min-w-[47%] flex-1 justify-start rounded-2xl px-3 py-3"
										isDisabled={isFollowAction && followMutation.isPending}
										onPress={() => handleDetailAction(action)}
									>
										{isFollowAction && followMutation.isPending ? (
											<Spinner size="sm" />
										) : (
											<Surface
												variant="transparent"
												className="size-9 items-center justify-center rounded-full bg-danger-soft p-0"
											>
												<Ionicons
													name={
														isFollowAction && active
															? "checkmark-circle"
															: action.icon
													}
													size={18}
													color={active ? "#ffffff" : "#f43f5e"}
												/>
											</Surface>
										)}
										<Surface
											variant="transparent"
											className="flex-1 items-start gap-0.5 p-0"
										>
											<Button.Label>{label}</Button.Label>
											<Text.Paragraph
												color={active ? "default" : "muted"}
												type="body-xs"
												numberOfLines={2}
											>
												{description}
											</Text.Paragraph>
										</Surface>
									</Button>
								);
							})}
						</Surface>
					</Card>

					<Card className="gap-3 rounded-3xl p-4">
						<Surface
							variant="transparent"
							className="flex-row items-center justify-between p-0"
						>
							<Text.Paragraph weight="semibold">
								评论 {note.data.commentCount}
							</Text.Paragraph>
							<Text.Paragraph color="muted" type="body-xs">
								一起聊聊体验
							</Text.Paragraph>
						</Surface>
						<Surface variant="transparent" className="gap-3 p-0">
							{note.data.comments.map((item) => (
								<Button
									key={item.id}
									variant="secondary"
									feedbackVariant="scale-highlight"
									className="h-auto items-start rounded-2xl p-3"
									onPress={() => {
										setCommentText(`@${item.authorName} `);
										setCommentHint(`正在回复 ${item.authorName}。`);
										setDetailHint(`已选中 ${item.authorName} 的评论。`);
										toast.show({
											label: `回复 ${item.authorName}`,
											duration: 1000,
										});
									}}
								>
									<Card.Body className="w-full gap-2 p-0">
										<Card.Footer className="flex-row items-center justify-between p-0">
											<Text.Paragraph weight="medium" type="body-sm">
												{item.authorName}
											</Text.Paragraph>
											<Text.Paragraph color="muted" type="body-xs">
												点按回复
											</Text.Paragraph>
										</Card.Footer>
										<Text.Paragraph
											selectable
											type="body-sm"
											className="leading-5"
										>
											{item.content}
										</Text.Paragraph>
									</Card.Body>
								</Button>
							))}
							{note.data.comments.length === 0 ? (
								<Surface
									variant="secondary"
									className="items-center gap-3 rounded-2xl px-4 py-8"
								>
									<Ionicons
										name="chatbubble-ellipses-outline"
										size={24}
										color="#8a8a8a"
									/>
									<Text.Paragraph color="muted" type="body-sm" className="mt-2">
										还没有评论，来写第一条
									</Text.Paragraph>
									<Button
										size="sm"
										variant="primary"
										feedbackVariant="scale-ripple"
										onPress={openCommentComposer}
									>
										<Ionicons
											name="chatbubble-outline"
											size={14}
											color="#ffffff"
										/>
										<Button.Label>写评论</Button.Label>
									</Button>
								</Surface>
							) : null}
						</Surface>
					</Card>
				</Surface>
			</ScrollView>

			<Surface className="absolute right-0 bottom-0 left-0 gap-3 border-content3 border-t bg-background/95 p-3">
				{reactionHint ? (
					<Surface
						variant="secondary"
						className="self-center rounded-full bg-accent-soft px-4 py-2"
					>
						<Text.Paragraph
							type="body-xs"
							weight="semibold"
							className="text-accent"
						>
							{reactionHint}
						</Text.Paragraph>
					</Surface>
				) : null}
				<Card.Header className="flex-row items-center justify-between px-1">
					<Text.Paragraph color="muted" type="body-xs">
						{session.data?.user
							? `以 ${session.data.user.name} 的身份互动`
							: "登录后可评论、点赞和收藏"}
					</Text.Paragraph>
					<Surface
						variant="transparent"
						className="flex-row items-center gap-2 p-0"
					>
						{commentText.trim() ? (
							<Surface
								variant="secondary"
								className="rounded-full bg-accent-soft px-2 py-1"
							>
								<Text.Paragraph
									type="body-xs"
									weight="semibold"
									className="text-accent"
								>
									{commentText.trim().length} 字
								</Text.Paragraph>
							</Surface>
						) : null}
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							feedbackVariant="scale-ripple"
							onPress={openShareSheet}
						>
							<Ionicons name="share-outline" size={16} color="#8a8a8a" />
						</Button>
					</Surface>
				</Card.Header>
				<Surface
					variant="secondary"
					className="flex-row items-center gap-2 rounded-2xl bg-danger-soft px-3 py-2"
				>
					<Ionicons
						name="chatbubble-ellipses-outline"
						size={15}
						color="#f43f5e"
					/>
					<Text.Paragraph
						type="body-sm"
						weight="semibold"
						className="flex-1 text-danger"
						numberOfLines={2}
					>
						{commentHint}
					</Text.Paragraph>
					{commentText.trim() ? (
						<Button
							size="sm"
							variant="ghost"
							feedbackVariant="scale-ripple"
							onPress={() => {
								setCommentText("");
								setCommentHint("已清空评论内容。");
								toast.show({ label: "已清空评论", duration: 800 });
							}}
						>
							<Button.Label>清空</Button.Label>
						</Button>
					) : null}
				</Surface>
				<Card.Footer className="flex-row flex-wrap gap-2">
					{commentTools.map((tool) => (
						<Button
							key={tool.action}
							size="sm"
							variant="outline"
							feedbackVariant="scale-ripple"
							onPress={() => applyCommentTool(tool)}
						>
							<Ionicons name={tool.icon} size={14} color="#f43f5e" />
							<Button.Label>{tool.label}</Button.Label>
						</Button>
					))}
				</Card.Footer>
				<Card.Footer className="flex-row flex-wrap gap-2">
					{quickComments.map((item) => (
						<Button
							key={item.text}
							size="sm"
							variant={
								commentText.trim() === item.text ? "primary" : "secondary"
							}
							feedbackVariant="scale-ripple"
							onPress={() => fillQuickComment(item)}
						>
							<Ionicons
								name={item.icon}
								size={14}
								color={commentText.trim() === item.text ? "#ffffff" : "#8a8a8a"}
							/>
							<Button.Label>{item.text}</Button.Label>
						</Button>
					))}
				</Card.Footer>
				<Card.Footer className="flex-row gap-2">
					<TextField className="flex-1">
						<Input
							value={commentText}
							onChangeText={setCommentText}
							placeholder="说点什么..."
							className="rounded-full"
							returnKeyType="send"
							onSubmitEditing={submitComment}
						/>
					</TextField>
					<Button
						size="md"
						variant={trimmedComment ? "primary" : "secondary"}
						feedbackVariant="scale-ripple"
						isDisabled={commentMutation.isPending}
						onPress={submitComment}
					>
						{commentMutation.isPending ? <Spinner size="sm" /> : null}
						<Button.Label>
							{commentMutation.isPending ? "发送中" : "发送"}
						</Button.Label>
					</Button>
				</Card.Footer>
				<Card.Footer className="flex-row justify-around">
					<ActionButton
						active={liked}
						icon={liked ? "heart" : "heart-outline"}
						label={liked ? "已喜欢" : "点赞"}
						value={note.data.likedCount}
						loading={likeMutation.isPending}
						onPress={toggleLike}
					/>
					<ActionButton
						active={collected}
						icon={collected ? "bookmark" : "bookmark-outline"}
						label={collected ? "已收藏" : "收藏"}
						value={note.data.collectedCount}
						loading={collectMutation.isPending}
						onPress={toggleCollect}
					/>
					<ActionButton
						icon="chatbubble-outline"
						label="评论"
						value={note.data.commentCount}
						onPress={openCommentComposer}
					/>
				</Card.Footer>
			</Surface>
			{isShareOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-end bg-black/45 p-4"
				>
					<Card className="gap-5 rounded-3xl p-5">
						<Card.Header className="flex-row items-center justify-between p-0">
							<Card.Body className="gap-0.5 p-0">
								<Text.Heading type="h4">分享图文</Text.Heading>
								<Text.Paragraph color="muted" type="body-sm">
									把这篇内容转发、生成卡片，或减少类似推荐。
								</Text.Paragraph>
							</Card.Body>
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								feedbackVariant="scale-ripple"
								onPress={() => setIsShareOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card.Footer className="flex-row flex-wrap gap-2 p-0">
							{shareTargets.map((item) => (
								<Button
									key={item.label}
									variant={
										item.label === "不感兴趣" ? "danger-soft" : "secondary"
									}
									size="sm"
									feedbackVariant="scale-ripple"
									className="min-w-[47%] flex-1"
									onPress={() => handleShareAction(item)}
								>
									<Ionicons
										name={item.icon}
										size={16}
										color={item.label === "不感兴趣" ? "#f43f5e" : "#8a8a8a"}
									/>
									<Button.Label>{item.label}</Button.Label>
								</Button>
							))}
						</Card.Footer>
					</Card>
				</Surface>
			) : null}
			{previewImage ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-between bg-black/95 p-4"
				>
					<Surface
						variant="transparent"
						className="flex-row items-center justify-between p-0 pt-2"
					>
						<Text.Paragraph className="text-white" weight="semibold">
							{(previewImageIndex ?? 0) + 1}/{note.data.images.length}
						</Text.Paragraph>
						<Button
							isIconOnly
							size="sm"
							variant="secondary"
							feedbackVariant="scale-ripple"
							className="bg-white/15"
							onPress={() => setPreviewImageIndex(null)}
						>
							<Ionicons name="close" size={18} color="#ffffff" />
						</Button>
					</Surface>
					<Surface
						variant="transparent"
						className="min-h-0 flex-1 justify-center p-0 py-5"
					>
						<Image
							source={{ uri: previewImage }}
							className="h-full w-full rounded-3xl bg-black"
							resizeMode="contain"
						/>
					</Surface>
					<Surface
						variant="transparent"
						className="flex-row items-center justify-between gap-3 p-0 pb-2"
					>
						<Button
							variant="secondary"
							className="flex-1 bg-white/15"
							feedbackVariant="scale-ripple"
							onPress={showPreviousPreview}
						>
							<Ionicons name="chevron-back" size={16} color="#ffffff" />
							<Button.Label className="text-white">上一张</Button.Label>
						</Button>
						<Button
							variant="secondary"
							className="flex-1 bg-white/15"
							feedbackVariant="scale-ripple"
							onPress={showNextPreview}
						>
							<Button.Label className="text-white">下一张</Button.Label>
							<Ionicons name="chevron-forward" size={16} color="#ffffff" />
						</Button>
					</Surface>
				</Surface>
			) : null}
		</Surface>
	);
}

function ActionButton({
	active = false,
	icon,
	label,
	loading = false,
	onPress,
	value,
}: {
	active?: boolean;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	loading?: boolean;
	onPress: () => void;
	value: number;
}) {
	return (
		<Button
			size="sm"
			variant={active ? "primary" : "ghost"}
			feedbackVariant="scale-ripple"
			isDisabled={loading}
			onPress={onPress}
		>
			{loading ? (
				<Spinner size="sm" />
			) : (
				<Ionicons
					name={icon}
					size={18}
					color={active ? "#ffffff" : "#f43f5e"}
				/>
			)}
			<Button.Label>
				{label} {value}
			</Button.Label>
		</Button>
	);
}

function EngagementPill({
	active = false,
	icon,
	label,
	loading = false,
	onPress,
	value,
}: {
	active?: boolean;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	loading?: boolean;
	onPress?: () => void;
	value: number;
}) {
	return (
		<Button
			variant={active ? "primary" : "ghost"}
			feedbackVariant="scale-ripple"
			isDisabled={loading}
			className="min-w-0 flex-1 flex-col gap-1 rounded-2xl py-3"
			onPress={onPress}
		>
			{loading ? (
				<Spinner size="sm" />
			) : (
				<Surface
					variant={active ? "default" : "transparent"}
					className={`size-10 items-center justify-center rounded-full p-0 ${
						active ? "bg-white/20" : "bg-transparent"
					}`}
				>
					<Ionicons
						name={icon}
						size={18}
						color={active ? "#ffffff" : "#f43f5e"}
					/>
				</Surface>
			)}
			<Button.Label
				className={`text-xs ${active ? "text-white" : "text-muted-foreground"}`}
			>
				{label} {value}
			</Button.Label>
		</Button>
	);
}

function Avatar({ name, image }: { name: string; image: string | null }) {
	return (
		<HeroAvatar size="md" color="accent" alt={name}>
			{image ? <HeroAvatar.Image source={{ uri: image }} /> : null}
			<HeroAvatar.Fallback>{name.slice(0, 1)}</HeroAvatar.Fallback>
		</HeroAvatar>
	);
}
