import { Ionicons } from "@expo/vector-icons";
import {
	Card,
	Avatar as HeroAvatar,
	PressableFeedback,
	Surface,
	Typography,
	useThemeColor,
} from "heroui-native";
import { Image } from "react-native";

import { useSocialActions } from "@/lib/social/use-social-actions";

const DEFAULT_IMAGE_ASPECT_RATIO = 1;

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
		imageMetas?: Array<{ height: number; url: string; width: number }>;
		liked?: boolean;
		likedCount: number;
		status?: "audit" | "draft" | "hidden" | "published" | "rejected";
		title: string;
		topics?: string[];
	};
};

export function NoteCard({ compact = false, note }: NoteCardProps) {
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const liked = Boolean(note.liked);
	const likedCount = note.likedCount;
	const coverImageMeta = note.imageMetas?.find(
		(item) => item.url === note.cover,
	);
	const imageAspectRatio =
		coverImageMeta?.width && coverImageMeta.height
			? coverImageMeta.width / coverImageMeta.height
			: DEFAULT_IMAGE_ASPECT_RATIO;

	const openDetail = () => {
		socialActions.goTo({ type: "note", id: note.id });
	};

	const openAuthor = () => {
		socialActions.goTo({ type: "user", id: note.author.id });
	};

	const toggleLike = () => {
		if (socialActions.pending.like(note.id)) return;
		if (!socialActions.requireLogin("/")) return;
		socialActions.toggleLike(
			{ id: note.id },
			{
				redirectTo: "/",
			},
		);
	};

	return (
		<Card
			variant="transparent"
			className={
				compact
					? "overflow-hidden rounded-lg p-0 shadow-none"
					: "overflow-hidden rounded-xl p-0 shadow-none"
			}
		>
			<Card.Header className="p-0">
				<PressableFeedback onPress={openDetail} className="bg-content2">
					{note.cover ? (
						<Image
							source={{ uri: note.cover }}
							resizeMode="cover"
							className="w-full bg-content2"
							style={{ aspectRatio: imageAspectRatio }}
						/>
					) : (
						<Surface
							variant="secondary"
							className="w-full items-center justify-center gap-1 rounded-none"
							style={{ aspectRatio: DEFAULT_IMAGE_ASPECT_RATIO }}
						>
							<Ionicons
								name="document-text-outline"
								size={32}
								color={mutedColor}
							/>
							<Typography.Paragraph type="body-xs" color="muted">
								暂无封面
							</Typography.Paragraph>
						</Surface>
					)}
				</PressableFeedback>
			</Card.Header>

			<Card.Body className={compact ? "gap-1.5 px-2.5 pt-2 pb-3" : "gap-2 p-3"}>
				<PressableFeedback onPress={openDetail}>
					<Card.Title
						className={
							compact
								? "text-foreground text-sm leading-5"
								: "text-foreground text-lg leading-6"
						}
						ellipsizeMode="tail"
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
						<Typography.Paragraph
							type={compact ? "body-xs" : "body-sm"}
							color="muted"
							numberOfLines={1}
							className="min-w-0 flex-1 text-muted/90"
						>
							{note.author.name}
						</Typography.Paragraph>
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
						<Typography.Paragraph
							type="body-xs"
							weight={liked ? "semibold" : undefined}
							style={{ color: liked ? dangerColor : mutedColor }}
						>
							{likedCount}
						</Typography.Paragraph>
					</PressableFeedback>
				</Card.Footer>
			</Card.Body>
		</Card>
	);
}
