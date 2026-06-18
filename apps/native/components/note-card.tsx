import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Card,
	Avatar as HeroAvatar,
	PressableFeedback,
	Spinner,
	Surface,
	Text,
	useToast,
} from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Image } from "react-native";

import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

type NoteCardProps = {
	note: {
		id: string;
		title: string;
		cover: string;
		likedCount: number;
		liked?: boolean;
		collectedCount?: number;
		commentCount?: number;
		collected?: boolean;
		status?: "audit" | "published" | "rejected" | "hidden";
		topics?: string[];
		author: {
			id: string;
			name: string;
			image: string | null;
			handle?: string | null;
		};
	};
};

const cardActions = [
	{
		label: "分享",
		description: "把这篇图文发给朋友",
		icon: "share-social-outline",
	},
	{
		label: "看相似",
		description: "去搜索更多同类灵感",
		icon: "search-outline",
	},
	{
		label: "不感兴趣",
		description: "减少这类内容推荐",
		icon: "eye-off-outline",
	},
] as const;
const shareActions = [
	{
		label: "打开详情",
		description: "进入详情后再完整分享",
		icon: "open-outline",
		action: "detail",
	},
	{
		label: "复制标题",
		description: "先把标题拿去发给朋友",
		icon: "copy-outline",
		action: "copy",
	},
	{
		label: "生成分享卡",
		description: "用封面和标题生成分享提示",
		icon: "image-outline",
		action: "poster",
	},
] as const;

export function NoteCard({ note }: NoteCardProps) {
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useToast();
	const [liked, setLiked] = useState(!!note.liked);
	const [likedCount, setLikedCount] = useState(note.likedCount);
	const [collected, setCollected] = useState(!!note.collected);
	const [collectedCount, setCollectedCount] = useState(
		note.collectedCount ?? 0,
	);
	const [isActionPanelOpen, setIsActionPanelOpen] = useState(false);
	const [isSharePanelOpen, setIsSharePanelOpen] = useState(false);
	const [isHidden, setIsHidden] = useState(false);
	const [cardHint, setCardHint] = useState<string | null>(null);
	const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		setLiked(!!note.liked);
		setLikedCount(note.likedCount);
		setCollected(!!note.collected);
		setCollectedCount(note.collectedCount ?? 0);
	}, [note.collected, note.collectedCount, note.liked, note.likedCount]);
	useEffect(() => {
		return () => {
			if (hintTimer.current) {
				clearTimeout(hintTimer.current);
			}
		};
	}, []);

	const showCardHint = (message: string) => {
		setCardHint(message);
		if (hintTimer.current) {
			clearTimeout(hintTimer.current);
		}
		hintTimer.current = setTimeout(() => setCardHint(null), 1500);
	};

	const likeMutation = useMutation(
		orpc.social.toggleLike.mutationOptions({
			onSuccess: async (result) => {
				setLiked(result.liked);
				setLikedCount(result.likedCount);
				toast.show({ label: result.liked ? "已点赞" : "已取消点赞" });
				queryClient.refetchQueries();
			},
			onError: (error) => {
				setLiked(!!note.liked);
				setLikedCount(note.likedCount);
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const collectMutation = useMutation(
		orpc.social.toggleCollect.mutationOptions({
			onSuccess: async (result) => {
				setCollected(result.collected);
				setCollectedCount(result.collectedCount);
				toast.show({
					label: result.collected ? "已收藏到我的" : "已取消收藏",
				});
				queryClient.refetchQueries();
			},
			onError: (error) => {
				setCollected(!!note.collected);
				setCollectedCount(note.collectedCount ?? 0);
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	const openDetail = () => {
		router.push({
			pathname: "/note/[id]",
			params: { id: note.id },
		} as unknown as Href);
	};
	const openAuthor = () => {
		showCardHint("正在打开作者主页。");
		router.push({
			pathname: "/user/[id]",
			params: { id: note.author.id },
		} as unknown as Href);
	};
	const openSearchWithKeyword = (
		keyword: string,
		source: "note-topic" | "similar",
	) => {
		const nextKeyword = keyword.trim();
		if (!nextKeyword) return;
		router.push({
			pathname: "/search",
			params: {
				keyword: nextKeyword,
				source,
				actionAt: String(Date.now()),
			},
		} as unknown as Href);
	};

	const handleTopicPress = (topic: string) => {
		showCardHint(`正在看 #${topic}`);
		toast.show({
			variant: "accent",
			label: `正在看 #${topic}`,
			description: "已带着这个话题进入搜索页。",
			duration: 1100,
		});
		openSearchWithKeyword(topic, "note-topic");
	};

	const handleCardAction = (action: (typeof cardActions)[number]) => {
		setIsActionPanelOpen(false);
		showCardHint(`${action.label}已响应`);
		if (action.label === "分享") {
			setIsSharePanelOpen(true);
			toast.show({
				variant: "accent",
				label: "打开分享",
				description: "可以进详情、复制标题或生成分享卡。",
				duration: 1300,
			});
			return;
		}
		if (action.label === "看相似") {
			const keyword = note.topics?.[0] ?? note.title.slice(0, 12);
			toast.show({
				variant: "accent",
				label: `正在看「${keyword}」`,
				description: "已带着这篇图文的主题进入搜索页。",
			});
			openSearchWithKeyword(keyword, "similar");
			return;
		}
		if (action.label === "不感兴趣") {
			setIsHidden(true);
			setIsSharePanelOpen(false);
			toast.show({
				variant: "warning",
				label: "已减少这类推荐",
				description: "这张卡片已从当前列表收起。",
				duration: 1400,
			});
			return;
		}
	};

	const handleShareAction = (action: (typeof shareActions)[number]) => {
		setIsSharePanelOpen(false);
		if (action.action === "detail") {
			toast.show({ label: "进入详情继续分享", duration: 900 });
			openDetail();
			return;
		}
		if (action.action === "copy") {
			showCardHint("标题已准备好。");
			toast.show({
				variant: "success",
				label: "标题已准备好",
				description: note.title,
				duration: 1600,
			});
			return;
		}
		toast.show({
			variant: "success",
			label: "分享卡已准备好",
			description: "封面和标题已整理成分享提示。",
			duration: 1500,
		});
	};

	const toggleLike = () => {
		if (!session.data?.user) {
			toast.show({
				variant: "warning",
				label: "请先登录",
				description: "到“我的”页面登录后即可点赞。",
				actionLabel: "去登录",
				onActionPress: () => {
					router.push("/me" as Href);
				},
			});
			return;
		}
		const nextLiked = !liked;
		setLiked(nextLiked);
		setLikedCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
		showCardHint(nextLiked ? "已喜欢这篇图文。" : "已取消喜欢。");
		likeMutation.mutate({ id: note.id });
	};
	const toggleCollect = () => {
		if (!session.data?.user) {
			toast.show({
				variant: "warning",
				label: "请先登录",
				description: "到“我的”页面登录后即可收藏。",
				actionLabel: "去登录",
				onActionPress: () => {
					router.push("/me" as Href);
				},
			});
			return;
		}
		const nextCollected = !collected;
		setCollected(nextCollected);
		setCollectedCount((count) => Math.max(0, count + (nextCollected ? 1 : -1)));
		showCardHint(nextCollected ? "已收藏到我的灵感。" : "已取消收藏。");
		collectMutation.mutate({ id: note.id });
	};
	const statusLabel =
		note.status && note.status !== "published"
			? getStatusLabel(note.status)
			: null;

	if (isHidden) {
		return (
			<Card className="m-1 flex-1 gap-3 rounded-2xl border border-content3 p-3">
				<Card.Header className="flex-row items-start gap-2 p-0">
					<Surface className="size-9 items-center justify-center rounded-full bg-danger-soft p-0">
						<Ionicons name="eye-off-outline" size={17} color="#f43f5e" />
					</Surface>
					<Card.Body className="min-w-0 flex-1 gap-0.5 p-0">
						<Card.Title className="text-sm">已减少这类推荐</Card.Title>
						<Card.Description numberOfLines={2}>{note.title}</Card.Description>
					</Card.Body>
				</Card.Header>
				<Card.Footer className="flex-row gap-2 p-0">
					<Button
						size="sm"
						variant="secondary"
						feedbackVariant="scale-ripple"
						className="flex-1"
						onPress={() => {
							setIsHidden(false);
							showCardHint("已恢复这张图文。");
							toast.show({ label: "已恢复图文", duration: 1000 });
						}}
					>
						<Ionicons name="return-up-back-outline" size={15} color="#8a8a8a" />
						<Button.Label>撤回</Button.Label>
					</Button>
					<Button
						size="sm"
						variant="primary"
						feedbackVariant="scale-ripple"
						className="flex-1"
						onPress={() => router.push("/search" as Href)}
					>
						<Ionicons name="search-outline" size={15} color="#ffffff" />
						<Button.Label>看别的</Button.Label>
					</Button>
				</Card.Footer>
			</Card>
		);
	}

	return (
		<PressableFeedback
			className="m-1 flex-1 overflow-hidden rounded-2xl"
			onPress={openDetail}
		>
			<PressableFeedback.Ripple
				animation={{
					backgroundColor: { value: "rgba(246, 44, 85, 0.18)" },
					opacity: { value: [0, 0.18, 0] },
				}}
			/>
			<Card className="overflow-hidden rounded-2xl p-0 shadow-sm">
				<Card.Body className="relative p-0">
					<Image
						source={{ uri: note.cover }}
						className="h-52 w-full bg-content3"
						resizeMode="cover"
					/>
					<Card.Footer className="absolute right-2 bottom-2 left-2 flex-row items-center justify-between p-0">
						<Button
							size="sm"
							variant="ghost"
							feedbackVariant="scale-ripple"
							className="h-7 rounded-full bg-black/45 px-2"
							onPress={(event) => {
								event.stopPropagation();
								toast.show({ label: "进入详情查看评论", duration: 900 });
								openDetail();
							}}
						>
							<Ionicons name="chatbubble-outline" size={12} color="#ffffff" />
							<Button.Label className="text-white text-xs">
								{note.commentCount ?? 0} 评论
							</Button.Label>
						</Button>
						<Button
							isIconOnly
							size="sm"
							variant="secondary"
							feedbackVariant="scale-ripple"
							onPress={(event) => {
								event.stopPropagation();
								setIsActionPanelOpen((value) => !value);
								showCardHint(
									isActionPanelOpen ? "已收起更多操作。" : "已打开更多操作。",
								);
							}}
						>
							<Ionicons name="ellipsis-horizontal" size={16} color="#8a8a8a" />
						</Button>
					</Card.Footer>
					{statusLabel ? (
						<Button
							size="sm"
							variant="ghost"
							feedbackVariant="scale-ripple"
							className="absolute top-2 left-2 h-7 rounded-full bg-black/45 px-2"
							onPress={(event) => {
								event.stopPropagation();
								showCardHint(`当前状态：${statusLabel}`);
								toast.show({
									label: `当前状态：${statusLabel}`,
									duration: 1000,
								});
							}}
						>
							<Button.Label className="text-white text-xs">
								{statusLabel}
							</Button.Label>
						</Button>
					) : null}
					{cardHint ? (
						<Surface
							variant="transparent"
							className="absolute top-2 right-2 left-2 items-center p-0"
						>
							<Surface className="max-w-full rounded-full bg-white/95 px-3 py-1.5">
								<Text.Paragraph
									type="body-xs"
									weight="semibold"
									numberOfLines={1}
								>
									{cardHint}
								</Text.Paragraph>
							</Surface>
						</Surface>
					) : null}
					{isActionPanelOpen ? (
						<Surface className="absolute inset-0 justify-end gap-2 bg-black/45 p-2">
							<Card.Footer className="flex-row items-center justify-between p-0">
								<Surface className="rounded-full bg-white/90 px-2 py-1">
									<Text className="font-medium text-[10px] text-foreground">
										更多操作
									</Text>
								</Surface>
								<Button
									isIconOnly
									size="sm"
									variant="secondary"
									feedbackVariant="scale-highlight"
									onPress={(event) => {
										event.stopPropagation();
										setIsActionPanelOpen(false);
									}}
								>
									<Ionicons name="close" size={15} color="#8a8a8a" />
								</Button>
							</Card.Footer>
							<Card.Body className="gap-2 p-0">
								{cardActions.map((action) => (
									<Button
										key={action.label}
										size="sm"
										variant="secondary"
										feedbackVariant="scale-ripple"
										onPress={(event) => {
											event.stopPropagation();
											handleCardAction(action);
										}}
									>
										<Ionicons name={action.icon} size={15} color="#8a8a8a" />
										<Button.Label>{action.label}</Button.Label>
									</Button>
								))}
							</Card.Body>
						</Surface>
					) : null}
					{isSharePanelOpen ? (
						<Surface className="absolute inset-0 justify-end gap-2 bg-black/55 p-2">
							<Card.Footer className="flex-row items-center justify-between p-0">
								<Surface className="rounded-full bg-white/90 px-2 py-1">
									<Text className="font-medium text-[10px] text-foreground">
										分享给朋友
									</Text>
								</Surface>
								<Button
									isIconOnly
									size="sm"
									variant="secondary"
									feedbackVariant="scale-highlight"
									onPress={(event) => {
										event.stopPropagation();
										setIsSharePanelOpen(false);
									}}
								>
									<Ionicons name="close" size={15} color="#8a8a8a" />
								</Button>
							</Card.Footer>
							<Card className="gap-2 rounded-2xl bg-white/95 p-2">
								<Card.Description numberOfLines={1}>
									{note.title}
								</Card.Description>
								<Card.Footer className="flex-row gap-1 p-0">
									{shareActions.map((action) => (
										<Button
											key={action.label}
											size="sm"
											variant="secondary"
											feedbackVariant="scale-ripple"
											className="h-auto flex-1 flex-col gap-1 px-1 py-2"
											onPress={(event) => {
												event.stopPropagation();
												handleShareAction(action);
											}}
										>
											<Ionicons name={action.icon} size={15} color="#8a8a8a" />
											<Button.Label className="text-xs">
												{action.label}
											</Button.Label>
										</Button>
									))}
								</Card.Footer>
							</Card>
						</Surface>
					) : null}
				</Card.Body>
				<Card.Body className="gap-2 p-3">
					<Card.Title
						className="font-semibold text-foreground text-sm leading-5"
						numberOfLines={2}
					>
						{note.title}
					</Card.Title>
					{note.topics?.length ? (
						<Card.Footer className="flex-row flex-wrap gap-1 p-0">
							{note.topics.slice(0, 2).map((topic) => (
								<Button
									key={topic}
									size="sm"
									variant="outline"
									feedbackVariant="scale-ripple"
									onPress={() => handleTopicPress(topic)}
								>
									<Ionicons name="pricetag-outline" size={12} color="#f43f5e" />
									<Button.Label>#{topic}</Button.Label>
								</Button>
							))}
						</Card.Footer>
					) : null}
					<Card.Footer className="flex-row items-center justify-between gap-2 p-0">
						<Button
							size="sm"
							variant="ghost"
							feedbackVariant="scale-highlight"
							className="h-auto min-w-0 flex-1 justify-start gap-1.5 rounded-full px-0 py-1"
							onPress={(event) => {
								event.stopPropagation();
								openAuthor();
							}}
						>
							<Avatar name={note.author.name} image={note.author.image} />
							<Card.Body className="min-w-0 flex-1 gap-0 p-0">
								<Text.Paragraph color="muted" type="body-xs" numberOfLines={1}>
									{note.author.name}
								</Text.Paragraph>
								{note.author.handle ? (
									<Text.Paragraph
										color="muted"
										type="body-xs"
										numberOfLines={1}
									>
										@{note.author.handle}
									</Text.Paragraph>
								) : null}
							</Card.Body>
						</Button>
						<Card.Footer className="flex-row items-center gap-1 p-0">
							<Button
								size="sm"
								variant={liked ? "danger-soft" : "ghost"}
								feedbackVariant="scale-ripple"
								isDisabled={likeMutation.isPending}
								onPress={(event) => {
									event.stopPropagation();
									toggleLike();
								}}
							>
								{likeMutation.isPending ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name={liked ? "heart" : "heart-outline"}
										size={15}
										color="#f43f5e"
									/>
								)}
								<Button.Label className="tabular-nums">
									{likedCount}
								</Button.Label>
							</Button>
							<Button
								size="sm"
								variant={collected ? "secondary" : "ghost"}
								feedbackVariant="scale-ripple"
								isDisabled={collectMutation.isPending}
								onPress={(event) => {
									event.stopPropagation();
									toggleCollect();
								}}
							>
								{collectMutation.isPending ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name={collected ? "bookmark" : "bookmark-outline"}
										size={15}
										color={collected ? "#f59e0b" : "#8a8a8a"}
									/>
								)}
								<Button.Label className="tabular-nums">
									{collectedCount}
								</Button.Label>
							</Button>
						</Card.Footer>
					</Card.Footer>
				</Card.Body>
			</Card>
		</PressableFeedback>
	);
}

function getStatusLabel(status: NonNullable<NoteCardProps["note"]["status"]>) {
	const labels = {
		audit: "待审核",
		published: "已发布",
		rejected: "已拒绝",
		hidden: "已隐藏",
	};
	return labels[status];
}

function Avatar({ name, image }: { name: string; image: string | null }) {
	return (
		<HeroAvatar size="sm" color="accent" alt={name}>
			{image ? <HeroAvatar.Image source={{ uri: image }} /> : null}
			<HeroAvatar.Fallback>{name.slice(0, 1)}</HeroAvatar.Fallback>
		</HeroAvatar>
	);
}
