import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Card,
	Avatar as HeroAvatar,
	Menu,
	Portal,
	PressableFeedback,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { type ComponentProps, useEffect, useState } from "react";
import { Image, Platform } from "react-native";

import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";
import { useAppToast } from "@/utils/app-toast";
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
		cover: null | string;
		id: string;
		liked?: boolean;
		likedCount: number;
		status?: "audit" | "draft" | "hidden" | "published" | "rejected";
		title: string;
		topics?: string[];
	};
};

function getStatusLabel(status?: NoteCardProps["note"]["status"]) {
	if (status === "audit") return "审核中";
	if (status === "draft") return "草稿";
	if (status === "rejected") return "未通过";
	if (status === "hidden") return "已隐藏";
	return null;
}

export function NoteCard({ compact = false, note }: NoteCardProps) {
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useAppToast();
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

	const requireLogin = () => {
		if (session.data?.user) return true;
		router.push(getLoginHref("/"));
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
		if (!requireLogin()) return;
		const nextLiked = !liked;
		setLiked(nextLiked);
		setLikedCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
		likeMutation.mutate({ id: note.id });
	};

	const openActionMenu = () => {
		setIsActionMenuOpen(true);
	};

	const closeActionMenu = () => {
		setIsActionMenuOpen(false);
	};

	const handleFeedback = (label: string) => {
		closeActionMenu();
		toast.show({
			label: "已收到反馈",
			description: label,
		});
	};

	const toggleCollect = () => {
		closeActionMenu();
		if (!requireLogin()) return;
		const nextCollected = !collected;
		setCollected(nextCollected);
		setCollectedCount((count) => Math.max(0, count + (nextCollected ? 1 : -1)));
		collectMutation.mutate({ id: note.id });
	};

	const toggleFollow = () => {
		closeActionMenu();
		if (!requireLogin()) return;
		setAuthorFollowing((value) => !value);
		followMutation.mutate({ userId: note.author.id });
	};

	const openActionMenuDetail = () => {
		closeActionMenu();
		openDetail();
	};

	const openActionMenuAuthor = () => {
		closeActionMenu();
		openAuthor();
	};

	const statusLabel = getStatusLabel(note.status);
	const visibleTopics = note.topics?.slice(0, 3) ?? [];
	const isSelf = session.data?.user?.id === note.author.id;
	const isWeb = Platform.OS === "web";
	const contextMenuProps = isWeb
		? {
				onContextMenu: (event: { preventDefault?: () => void }) => {
					event.preventDefault?.();
					openActionMenu();
				},
			}
		: {};
	const actionButton = (
		<Button
			accessibilityLabel="更多操作"
			className="size-8"
			isIconOnly
			onPress={isWeb ? openActionMenu : undefined}
			size="sm"
			variant="ghost"
		>
			<Ionicons name="ellipsis-horizontal" size={18} color={mutedColor} />
		</Button>
	);
	const card = (
		<Card
			{...contextMenuProps}
			className={
				compact
					? "overflow-hidden rounded-xl bg-surface p-0"
					: "overflow-hidden rounded-2xl bg-surface p-0"
			}
		>
			<Card.Header className="p-0">
				<PressableFeedback
					onLongPress={openActionMenu}
					onPress={openDetail}
					className="bg-content2"
				>
					{note.cover ? (
						<Image
							source={{ uri: note.cover }}
							resizeMode="cover"
							className={
								compact ? "h-48 w-full bg-content2" : "h-72 w-full bg-content2"
							}
						/>
					) : (
						<Surface
							variant="secondary"
							className={
								compact
									? "h-48 w-full items-center justify-center gap-1 rounded-none"
									: "h-72 w-full items-center justify-center gap-1 rounded-none"
							}
						>
							<Ionicons
								name="document-text-outline"
								size={32}
								color={mutedColor}
							/>
							<Text.Paragraph type="body-xs" color="muted">
								暂无封面
							</Text.Paragraph>
						</Surface>
					)}
				</PressableFeedback>
			</Card.Header>

			<Card.Body className={compact ? "gap-2 p-3" : "gap-3 p-4"}>
				<Card.Header className="flex-row flex-wrap gap-1 p-0">
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
				</Card.Header>

				<PressableFeedback onLongPress={openActionMenu} onPress={openDetail}>
					<Card.Title
						className={
							compact
								? "text-foreground text-sm leading-5"
								: "text-foreground text-lg leading-6"
						}
						numberOfLines={2}
					>
						{note.title}
					</Card.Title>
				</PressableFeedback>

				<Card.Footer className="flex-row items-center justify-between gap-3 p-0">
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

					<Card.Footer className="flex-row items-center gap-1 p-0">
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

						{isWeb ? (
							actionButton
						) : (
							<Menu.Trigger asChild>{actionButton}</Menu.Trigger>
						)}
					</Card.Footer>
				</Card.Footer>
			</Card.Body>
		</Card>
	);

	if (isWeb) {
		return (
			<>
				{card}
				{isActionMenuOpen ? (
					<Portal name={`note-action-menu-${note.id}`}>
						<WebActionMenuPanel
							authorName={note.author.name}
							collected={collected}
							collectedCount={collectedCount}
							collectPending={collectMutation.isPending}
							following={authorFollowing}
							followPending={followMutation.isPending}
							isSelf={isSelf}
							noteTitle={note.title}
							onClose={closeActionMenu}
							onCollect={toggleCollect}
							onFeedback={handleFeedback}
							onFollow={toggleFollow}
							onOpenAuthor={openActionMenuAuthor}
							onOpenDetail={openActionMenuDetail}
						/>
					</Portal>
				) : null}
			</>
		);
	}

	return (
		<Menu
			isOpen={isActionMenuOpen}
			onOpenChange={setIsActionMenuOpen}
			presentation="bottom-sheet"
		>
			{card}
			<ActionMenuContent
				authorName={note.author.name}
				collected={collected}
				collectedCount={collectedCount}
				collectPending={collectMutation.isPending}
				following={authorFollowing}
				followPending={followMutation.isPending}
				isSelf={isSelf}
				noteTitle={note.title}
				onClose={closeActionMenu}
				onCollect={toggleCollect}
				onFeedback={handleFeedback}
				onFollow={toggleFollow}
				onOpenAuthor={openActionMenuAuthor}
				onOpenDetail={openActionMenuDetail}
			/>
		</Menu>
	);
}

function ActionMenuContent({
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
}) {
	const dangerColor = useThemeColor("danger");
	const accentColor = useThemeColor("accent");
	const content = (
		<>
			<Menu.Label className="ml-2 px-0 pt-1 pb-0 text-foreground">
				更多操作
			</Menu.Label>
			<Text.Paragraph
				type="body-sm"
				color="muted"
				numberOfLines={2}
				className="px-2 pb-3"
			>
				{noteTitle}
			</Text.Paragraph>

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
				variant="danger"
			/>
			<Button variant="ghost" feedbackVariant="scale-ripple" onPress={onClose}>
				<Button.Label>取消</Button.Label>
			</Button>
		</>
	);

	return (
		<Menu.Portal>
			<Menu.Overlay className="bg-black/35" />
			<Menu.Content
				presentation="bottom-sheet"
				className="mx-auto w-full max-w-sm gap-1 rounded-3xl bg-surface p-3"
			>
				{content}
			</Menu.Content>
		</Menu.Portal>
	);
}

function WebActionMenuPanel({
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
}) {
	const dangerColor = useThemeColor("danger");
	const accentColor = useThemeColor("accent");

	return (
		<Surface className="absolute inset-0 z-50 bg-black/35 px-4 pt-20">
			<Surface className="mx-auto w-full max-w-sm gap-0.5 rounded-2xl p-2 shadow-overlay">
				<Card.Header className="gap-0.5 px-2 pt-1 pb-1">
					<Text.Paragraph
						type="body-sm"
						weight="semibold"
						className="text-foreground"
					>
						更多操作
					</Text.Paragraph>
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{noteTitle}
					</Text.Paragraph>
				</Card.Header>
				<WebActionMenuItem
					icon="open-outline"
					label="打开详情"
					onPress={onOpenDetail}
				/>
				<WebActionMenuItem
					icon="person-circle-outline"
					label={`查看 ${authorName}`}
					onPress={onOpenAuthor}
				/>
				{isSelf ? null : (
					<WebActionMenuItem
						icon={following ? "checkmark-circle" : "person-add-outline"}
						label={following ? "取消关注" : "关注作者"}
						loading={followPending}
						onPress={onFollow}
						tintColor={following ? accentColor : undefined}
					/>
				)}
				<WebActionMenuItem
					icon={collected ? "bookmark" : "bookmark-outline"}
					label={collected ? "取消收藏" : "收藏图文"}
					description={
						collectedCount > 0 ? `${collectedCount} 人收藏` : undefined
					}
					loading={collectPending}
					onPress={onCollect}
					tintColor={collected ? accentColor : undefined}
				/>
				<WebActionMenuItem
					icon="remove-circle-outline"
					label="减少类似内容"
					onPress={() => onFeedback("减少类似内容")}
				/>
				<WebActionMenuItem
					icon="alert-circle-outline"
					label="内容质量不佳"
					onPress={() => onFeedback("内容质量不佳")}
				/>
				<WebActionMenuItem
					icon="flag-outline"
					label="举报内容"
					onPress={() => onFeedback("已标记为需要审核")}
					tintColor={dangerColor}
				/>
				<Button
					size="sm"
					variant="ghost"
					feedbackVariant="scale-ripple"
					onPress={onClose}
				>
					<Button.Label>取消</Button.Label>
				</Button>
			</Surface>
		</Surface>
	);
}

function WebActionMenuItem({
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
			accessibilityRole="menuitem"
			className="min-h-8 flex-row items-center gap-2 rounded-xl px-2 py-1"
			onPress={onPress}
		>
			<Surface
				variant="secondary"
				className="size-7 items-center justify-center rounded-full"
			>
				<Ionicons
					name={loading ? "sync-outline" : icon}
					size={15}
					color={iconColor}
				/>
			</Surface>
			<Card.Body className="min-w-0 flex-1 p-0">
				<Text.Paragraph
					type="body-xs"
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
			</Card.Body>
			<Ionicons name="chevron-forward" size={13} color={mutedColor} />
		</PressableFeedback>
	);
}

function ActionMenuItem({
	description,
	icon,
	label,
	loading = false,
	onPress,
	tintColor,
	variant,
}: {
	description?: string;
	icon: ComponentProps<typeof Ionicons>["name"];
	label: string;
	loading?: boolean;
	onPress: () => void;
	tintColor?: string;
	variant?: "danger" | "default";
}) {
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const iconColor = tintColor ?? foregroundColor;

	return (
		<Menu.Item className="min-h-12 gap-3" onPress={onPress} variant={variant}>
			<Surface
				variant="secondary"
				className="size-8 items-center justify-center rounded-full"
			>
				<Ionicons
					name={loading ? "sync-outline" : icon}
					size={18}
					color={iconColor}
				/>
			</Surface>
			<Card.Body className="min-w-0 flex-1 p-0">
				<Menu.ItemTitle
					numberOfLines={1}
					style={tintColor ? { color: tintColor } : undefined}
				>
					{label}
				</Menu.ItemTitle>
				{description ? (
					<Menu.ItemDescription numberOfLines={1}>
						{description}
					</Menu.ItemDescription>
				) : null}
			</Card.Body>
			<Ionicons name="chevron-forward" size={15} color={mutedColor} />
		</Menu.Item>
	);
}
