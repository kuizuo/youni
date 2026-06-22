import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Avatar as HeroAvatar,
	PressableFeedback,
	Text,
	useThemeColor,
	useToast,
} from "heroui-native";
import { type ComponentProps, useEffect, useState } from "react";
import { Image, Modal, Platform, View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

type NoteCardProps = {
	compact?: boolean;
	note: {
		author: {
			handle?: null | string;
			id: string;
			image: null | string;
			isFollowing?: boolean;
			name: string;
		};
		commentCount?: number;
		collected?: boolean;
		collectedCount?: number;
		cover: string;
		id: string;
		liked?: boolean;
		likedCount: number;
		status?: "audit" | "hidden" | "published" | "rejected";
		title: string;
		topics?: string[];
	};
};

function getStatusLabel(status?: NoteCardProps["note"]["status"]) {
	if (status === "audit") return "审核中";
	if (status === "rejected") return "未通过";
	if (status === "hidden") return "已隐藏";
	return null;
}

export function NoteCard({ compact = false, note }: NoteCardProps) {
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [liked, setLiked] = useState(Boolean(note.liked));
	const [likedCount, setLikedCount] = useState(note.likedCount);
	const [collected, setCollected] = useState(Boolean(note.collected));
	const [collectedCount, setCollectedCount] = useState(
		note.collectedCount ?? 0,
	);
	const [authorFollowing, setAuthorFollowing] = useState(
		Boolean(note.author.isFollowing),
	);
	const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

	useEffect(() => {
		setLiked(Boolean(note.liked));
		setLikedCount(note.likedCount);
		setCollected(Boolean(note.collected));
		setCollectedCount(note.collectedCount ?? 0);
		setAuthorFollowing(Boolean(note.author.isFollowing));
	}, [
		note.author.isFollowing,
		note.collected,
		note.collectedCount,
		note.liked,
		note.likedCount,
	]);

	const openDetail = () => {
		router.push({
			pathname: "/note/[id]",
			params: { id: note.id },
		} as unknown as Href);
	};

	const openAuthor = () => {
		router.push({
			pathname: "/user/[id]",
			params: { id: note.author.id },
		} as unknown as Href);
	};

	const requireLogin = (label: string) => {
		if (session.data?.user) return true;
		toast.show({
			variant: "warning",
			label,
			description: "登录后可以继续互动。",
			actionLabel: "去登录",
			onActionPress: () => router.push("/me" as Href),
		});
		return false;
	};

	const likeMutation = useMutation(
		orpc.social.toggleLike.mutationOptions({
			onSuccess: (result) => {
				setLiked(result.liked);
				setLikedCount(result.likedCount);
				queryClient.refetchQueries();
			},
			onError: (error) => {
				setLiked(Boolean(note.liked));
				setLikedCount(note.likedCount);
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const collectMutation = useMutation(
		orpc.social.toggleCollect.mutationOptions({
			onSuccess: (result) => {
				setCollected(result.collected);
				setCollectedCount(result.collectedCount);
				queryClient.refetchQueries();
				toast.show({ label: result.collected ? "已收藏" : "已取消收藏" });
			},
			onError: (error) => {
				setCollected(Boolean(note.collected));
				setCollectedCount(note.collectedCount ?? 0);
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const followMutation = useMutation(
		orpc.social.toggleFollow.mutationOptions({
			onSuccess: (result) => {
				setAuthorFollowing(result.following);
				queryClient.refetchQueries();
				toast.show({ label: result.following ? "已关注" : "已取消关注" });
			},
			onError: (error) => {
				setAuthorFollowing(Boolean(note.author.isFollowing));
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	const toggleLike = () => {
		if (!requireLogin("先登录再点赞")) return;
		const nextLiked = !liked;
		setLiked(nextLiked);
		setLikedCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
		likeMutation.mutate({ id: note.id });
	};

	const openActionMenu = () => {
		setIsActionMenuOpen(true);
	};

	const handleFeedback = (label: string) => {
		setIsActionMenuOpen(false);
		toast.show({
			label: "已收到反馈",
			description: label,
		});
	};

	const toggleCollect = () => {
		setIsActionMenuOpen(false);
		if (!requireLogin("先登录再收藏")) return;
		const nextCollected = !collected;
		setCollected(nextCollected);
		setCollectedCount((count) => Math.max(0, count + (nextCollected ? 1 : -1)));
		collectMutation.mutate({ id: note.id });
	};

	const toggleFollow = () => {
		setIsActionMenuOpen(false);
		if (!requireLogin("先登录再关注")) return;
		setAuthorFollowing((value) => !value);
		followMutation.mutate({ userId: note.author.id });
	};

	const statusLabel = getStatusLabel(note.status);
	const visibleTopics = note.topics?.slice(0, 3) ?? [];
	const isSelf = session.data?.user?.id === note.author.id;
	const contextMenuProps =
		Platform.OS === "web"
			? {
					onContextMenu: (event: { preventDefault?: () => void }) => {
						event.preventDefault?.();
						openActionMenu();
					},
				}
			: {};

	return (
		<View
			{...contextMenuProps}
			className={
				compact
					? "overflow-hidden rounded-xl bg-surface"
					: "overflow-hidden rounded-2xl bg-surface"
			}
		>
			<PressableFeedback
				onLongPress={openActionMenu}
				onPress={openDetail}
				className="bg-content2"
			>
				<Image
					source={{ uri: note.cover }}
					resizeMode="cover"
					className={
						compact ? "h-48 w-full bg-content2" : "h-72 w-full bg-content2"
					}
				/>
			</PressableFeedback>
			<View className={compact ? "gap-2 p-3" : "gap-3 p-4"}>
				<View className="flex-row flex-wrap gap-1">
					{statusLabel ? (
						<Text.Paragraph
							type="body-xs"
							weight="semibold"
							className="text-warning-soft-foreground"
						>
							{statusLabel}
						</Text.Paragraph>
					) : null}
					{visibleTopics.map((topic) => (
						<Text.Paragraph key={topic} type="body-xs" color="muted">
							#{topic}
						</Text.Paragraph>
					))}
				</View>

				<PressableFeedback onLongPress={openActionMenu} onPress={openDetail}>
					<Text.Paragraph
						weight="semibold"
						className={
							compact
								? "text-foreground text-sm leading-5"
								: "text-foreground text-lg leading-6"
						}
						numberOfLines={2}
					>
						{note.title}
					</Text.Paragraph>
				</PressableFeedback>

				<View className="flex-row items-center justify-between gap-3">
					<PressableFeedback
						onPress={openAuthor}
						className="min-w-0 flex-1 flex-row items-center gap-2"
					>
						<HeroAvatar
							size="sm"
							className={compact ? "size-7" : "size-8"}
							alt={note.author.name}
						>
							{note.author.image ? (
								<HeroAvatar.Image source={{ uri: note.author.image }} />
							) : null}
							<HeroAvatar.Fallback>
								{note.author.name.slice(0, 1)}
							</HeroAvatar.Fallback>
						</HeroAvatar>
						<Text.Paragraph
							type={compact ? "body-xs" : "body-sm"}
							color="muted"
							numberOfLines={1}
							className="min-w-0 flex-1"
						>
							{note.author.handle ? `@${note.author.handle}` : note.author.name}
						</Text.Paragraph>
					</PressableFeedback>

					<PressableFeedback
						accessibilityLabel={liked ? "取消点赞" : "点赞"}
						accessibilityRole="button"
						className="min-h-8 flex-row items-center gap-1 pl-2"
						hitSlop={8}
						onPress={toggleLike}
					>
						<Ionicons
							name={liked ? "heart" : "heart-outline"}
							size={18}
							color={liked ? dangerColor : mutedColor}
						/>
						<Text.Paragraph
							type="body-xs"
							weight={liked ? "semibold" : undefined}
							style={{ color: liked ? dangerColor : mutedColor }}
						>
							{likedCount}
						</Text.Paragraph>
					</PressableFeedback>
				</View>
			</View>

			<ActionMenuDialog
				authorName={note.author.name}
				collected={collected}
				collectedCount={collectedCount}
				collectPending={collectMutation.isPending}
				following={authorFollowing}
				followPending={followMutation.isPending}
				isSelf={isSelf}
				noteTitle={note.title}
				onClose={() => setIsActionMenuOpen(false)}
				onCollect={toggleCollect}
				onFeedback={handleFeedback}
				onFollow={toggleFollow}
				onOpenAuthor={() => {
					setIsActionMenuOpen(false);
					openAuthor();
				}}
				onOpenDetail={() => {
					setIsActionMenuOpen(false);
					openDetail();
				}}
				visible={isActionMenuOpen}
			/>
		</View>
	);
}

function ActionMenuDialog({
	authorName,
	collected,
	collectedCount,
	collectPending,
	following,
	followPending,
	isSelf,
	noteTitle,
	onClose,
	onCollect,
	onFeedback,
	onFollow,
	onOpenAuthor,
	onOpenDetail,
	visible,
}: {
	authorName: string;
	collected: boolean;
	collectedCount: number;
	collectPending: boolean;
	following: boolean;
	followPending: boolean;
	isSelf: boolean;
	noteTitle: string;
	onClose: () => void;
	onCollect: () => void;
	onFeedback: (label: string) => void;
	onFollow: () => void;
	onOpenAuthor: () => void;
	onOpenDetail: () => void;
	visible: boolean;
}) {
	const dangerColor = useThemeColor("danger");
	const accentColor = useThemeColor("accent");

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			transparent
			visible={visible}
		>
			<View className="flex-1 justify-end bg-black/35 px-3 pb-6">
				<View className="w-full max-w-sm self-center rounded-3xl bg-surface p-3">
					<View className="gap-1 px-2 pt-1 pb-3">
						<Text.Paragraph weight="semibold" className="text-foreground">
							更多操作
						</Text.Paragraph>
						<Text.Paragraph type="body-sm" color="muted" numberOfLines={2}>
							{noteTitle}
						</Text.Paragraph>
					</View>

					<View className="gap-1">
						<ActionMenuItem
							icon="open-outline"
							label="打开详情"
							onPress={onOpenDetail}
						/>
						<ActionMenuItem
							icon="person-circle-outline"
							label={`查看 ${authorName}`}
							onPress={onOpenAuthor}
						/>
						{isSelf ? null : (
							<ActionMenuItem
								icon={following ? "checkmark-circle" : "person-add-outline"}
								label={following ? "取消关注" : "关注作者"}
								loading={followPending}
								onPress={onFollow}
								tintColor={following ? accentColor : undefined}
							/>
						)}
						<ActionMenuItem
							icon={collected ? "bookmark" : "bookmark-outline"}
							label={collected ? "取消收藏" : "收藏图文"}
							description={
								collectedCount > 0 ? `${collectedCount} 人收藏` : undefined
							}
							loading={collectPending}
							onPress={onCollect}
							tintColor={collected ? accentColor : undefined}
						/>
						<ActionMenuItem
							icon="remove-circle-outline"
							label="减少类似内容"
							onPress={() => onFeedback("减少类似内容")}
						/>
						<ActionMenuItem
							icon="alert-circle-outline"
							label="内容质量不佳"
							onPress={() => onFeedback("内容质量不佳")}
						/>
						<ActionMenuItem
							icon="flag-outline"
							label="举报内容"
							onPress={() => onFeedback("已标记为需要审核")}
							tintColor={dangerColor}
						/>
					</View>

					<Button
						variant="ghost"
						feedbackVariant="scale-ripple"
						onPress={onClose}
					>
						<Button.Label>取消</Button.Label>
					</Button>
				</View>
			</View>
		</Modal>
	);
}

function ActionMenuItem({
	description,
	icon,
	label,
	loading = false,
	onPress,
	tintColor,
}: {
	description?: string;
	icon: ComponentProps<typeof Ionicons>["name"];
	label: string;
	loading?: boolean;
	onPress: () => void;
	tintColor?: string;
}) {
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const iconColor = tintColor ?? foregroundColor;

	return (
		<PressableFeedback
			accessibilityRole="button"
			className="min-h-12 flex-row items-center gap-3 rounded-2xl px-3 py-2"
			onPress={onPress}
		>
			<View className="size-8 items-center justify-center rounded-full bg-content2">
				<Ionicons
					name={loading ? "sync-outline" : icon}
					size={18}
					color={iconColor}
				/>
			</View>
			<View className="min-w-0 flex-1">
				<Text.Paragraph
					type="body-sm"
					weight="semibold"
					numberOfLines={1}
					style={{ color: tintColor ?? foregroundColor }}
				>
					{label}
				</Text.Paragraph>
				{description ? (
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{description}
					</Text.Paragraph>
				) : null}
			</View>
			<Ionicons name="chevron-forward" size={15} color={mutedColor} />
		</PressableFeedback>
	);
}
