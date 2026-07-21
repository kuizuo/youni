import { Ionicons } from "@expo/vector-icons";
import type { NotesOutputs } from "@youni/api/contracts/notes";
import type { HydratedContentNote } from "@youni/api/contracts/shared";
import { Link, usePathname, useRouter } from "expo-router";
import {
	Card,
	Chip,
	Avatar as HeroAvatar,
	PressableFeedback,
	Surface,
	Typography,
	useThemeColor,
} from "heroui-native";
import type { ComponentProps } from "react";
import { Image, View } from "react-native";

import {
	getNoteTransitionStyle,
	startNoteViewTransition,
} from "@/lib/note-view-transition";
import {
	getUserProfileIntent,
	toSocialHref,
} from "@/lib/social/navigation-intents";
import { useSocialActions } from "@/lib/social/use-social-actions";
import { formatCount } from "@/utils/format";
import { orpc, queryClient } from "@/utils/orpc";

const DEFAULT_IMAGE_ASPECT_RATIO = 1;

export type NoteCardNote = HydratedContentNote & {
	feedContext?: NotesOutputs["feed"]["items"][number]["feedContext"];
	viewCount?: number | null;
};

type NoteCardProps = {
	compact?: boolean;
	note: NoteCardNote;
	onLongPress?: (note: NoteCardNote) => void;
	onOpenDiscoverActions?: (note: NoteCardNote) => void;
	onRecordDiscoverEvent?: (note: NoteCardNote, type: "like" | "open") => void;
	showViewCount?: boolean;
};

export function NoteCard({
	compact = false,
	note,
	onLongPress,
	onOpenDiscoverActions,
	onRecordDiscoverEvent,
	showViewCount = false,
}: NoteCardProps) {
	const router = useRouter();
	const pathname = usePathname();
	const socialActions = useSocialActions();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const likeState = socialActions.optimistic.like(
		note.id,
		note.liked,
		note.likedCount,
	);
	const liked = likeState.active;
	const likedCount = likeState.count ?? note.likedCount;
	const coverImageMeta = note.imageMetas?.find(
		(item) => item.url === note.cover,
	);
	const imageAspectRatio =
		coverImageMeta?.width && coverImageMeta.height
			? coverImageMeta.width / coverImageMeta.height
			: DEFAULT_IMAGE_ASPECT_RATIO;
	const noteHref = toSocialHref({
		type: "note",
		id: note.id,
		feedImpressionId: note.feedContext?.impressionId,
	});
	const noteQuery = orpc.notes.byId.queryOptions({ input: { id: note.id } });
	const transitionStyle = pathname.startsWith("/note/")
		? undefined
		: getNoteTransitionStyle(note.id);

	const openDetail: NonNullable<ComponentProps<typeof Link>["onPress"]> = (
		event,
	) => {
		onRecordDiscoverEvent?.(note, "open");
		queryClient.setQueryData(noteQuery.queryKey, note, { updatedAt: 0 });

		if (
			isPlainWebPress(event) &&
			startNoteViewTransition(() => router.push(noteHref))
		) {
			event.preventDefault();
		}
	};

	const openAuthor = () => {
		socialActions.goTo(getUserProfileIntent(note.author));
	};

	const openActions = () => {
		(onLongPress ?? onOpenDiscoverActions)?.(note);
	};

	const toggleLike = () => {
		if (!socialActions.requireLogin("/")) return;
		socialActions.toggleLike(
			{ active: liked, count: likedCount, id: note.id },
			{
				redirectTo: "/",
				onSuccess: (result) => {
					if (result.liked) onRecordDiscoverEvent?.(note, "like");
				},
			},
		);
	};

	return (
		<Link href={noteHref} asChild onPress={openDetail}>
			<Link.Trigger withAppleZoom>
				<PressableFeedback
					accessibilityLabel={note.title}
					accessibilityRole="link"
					delayLongPress={onLongPress ? 350 : undefined}
					onLongPress={
						onLongPress || onOpenDiscoverActions ? openActions : undefined
					}
				>
					<Card
						variant="transparent"
						style={transitionStyle}
						className={
							compact
								? "overflow-hidden rounded-lg p-0 shadow-none"
								: "overflow-hidden rounded-xl p-0 shadow-none"
						}
					>
						<Card.Header className="relative p-0">
							<View className="w-full bg-content2">
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
							</View>
							<NoteStatusChip status={note.status} />
							{showViewCount ? (
								<NoteViewCountChip value={note.viewCount ?? 0} />
							) : null}
						</Card.Header>

						<Card.Body
							className={compact ? "px-2.5 pt-2 pb-1.5" : "px-3 pt-3 pb-2"}
						>
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
						</Card.Body>

						<Card.Body className={compact ? "px-2.5 pb-3" : "px-3 pb-3"}>
							<Card.Footer className="flex-row items-center justify-between gap-3 p-0">
								<PressableFeedback
									onPress={(event) => {
										event.stopPropagation();
										event.preventDefault();
										openAuthor();
									}}
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
									onPress={(event) => {
										event.stopPropagation();
										event.preventDefault();
										toggleLike();
									}}
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
				</PressableFeedback>
			</Link.Trigger>
		</Link>
	);
}

function isPlainWebPress(event: unknown) {
	if (process.env.EXPO_OS !== "web") return false;
	const nativeEvent = (event as { nativeEvent?: Record<string, unknown> })
		.nativeEvent;
	if (!nativeEvent) return true;

	return (
		(nativeEvent.button === undefined || nativeEvent.button === 0) &&
		!nativeEvent.altKey &&
		!nativeEvent.ctrlKey &&
		!nativeEvent.metaKey &&
		!nativeEvent.shiftKey
	);
}

function NoteViewCountChip({ value }: { value: number }) {
	return (
		<Chip
			pointerEvents="none"
			size="sm"
			variant="primary"
			color="default"
			className="absolute bottom-2 left-2 z-10 bg-black/60"
		>
			<Ionicons name="eye-outline" size={12} color="#ffffff" />
			<Chip.Label className="text-white">{formatCount(value)}</Chip.Label>
		</Chip>
	);
}

function NoteStatusChip({ status }: { status: NoteCardNote["status"] }) {
	if (status !== "audit" && status !== "rejected") return null;

	return (
		<Chip
			pointerEvents="none"
			size="sm"
			variant="soft"
			color={status === "rejected" ? "danger" : "warning"}
			className="absolute top-2 left-2 z-10"
		>
			<Chip.Label>{status === "rejected" ? "已拒绝" : "审核中"}</Chip.Label>
		</Chip>
	);
}
