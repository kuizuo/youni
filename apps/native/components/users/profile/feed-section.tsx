import { Ionicons } from "@expo/vector-icons";
import { Typography, useThemeColor } from "heroui-native";
import { useWindowDimensions, View } from "react-native";

import { NoteCard, type NoteCardNote } from "@/components/note-card";
import { PROFILE_TAB_BAR_HEIGHT } from "@/components/profile/profile-tabs";
import { EmptyState, FeedSkeleton } from "@/components/social-states";

const FEED_MAX_WIDTH = 576;
const FEED_HORIZONTAL_PADDING = 24;
const FEED_COLUMN_GAP = 12;
const FEED_ITEM_GAP = 12;
const COMPACT_CARD_BODY_HEIGHT = 82;

export function UserProfileFeedSection({
	isLoading,
	notes,
}: {
	isLoading: boolean;
	notes: NoteCardNote[];
}) {
	const dimensions = useWindowDimensions();
	const feedWidth = Math.min(dimensions.width, FEED_MAX_WIDTH);
	const cardWidth = Math.max(
		1,
		(feedWidth - FEED_HORIZONTAL_PADDING - FEED_COLUMN_GAP) / 2,
	);
	const masonryColumns = createMasonryColumns(notes, cardWidth);

	return (
		<View className="mx-auto w-full max-w-xl pt-1">
			{isLoading ? (
				<FeedSkeleton />
			) : notes.length > 0 ? (
				<View className="flex-row items-start gap-3 px-3">
					{masonryColumns.map((column, index) => (
						<View
							key={index === 0 ? "left-column" : "right-column"}
							className="flex-1 gap-3"
						>
							{column.map((item) => (
								<FeedCell key={item.id} item={item} />
							))}
						</View>
					))}
				</View>
			) : (
				<EmptyState icon="images-outline" title="这位用户还没分享公开图文" />
			)}
		</View>
	);
}

export function UserProfileFeedHeader({
	elevated,
	noteCount,
}: {
	elevated: boolean;
	noteCount: number;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View
			className="bg-background"
			style={{
				boxShadow: elevated ? "0 1px 0 rgba(0, 0, 0, 0.04)" : undefined,
				height: PROFILE_TAB_BAR_HEIGHT,
			}}
		>
			<View className="mx-auto h-full w-full max-w-xl flex-row items-center justify-between px-4">
				<Typography.Paragraph weight="semibold" className="text-foreground">
					公开图文
				</Typography.Paragraph>
				<View className="flex-row items-center gap-1">
					<Ionicons name="images-outline" size={15} color={mutedColor} />
					<Typography.Paragraph type="body-xs" color="muted">
						{noteCount} 篇
					</Typography.Paragraph>
				</View>
			</View>
		</View>
	);
}

function FeedCell({ item }: { item: NoteCardNote }) {
	return <NoteCard compact note={item} />;
}

function createMasonryColumns(items: NoteCardNote[], cardWidth: number) {
	const left: NoteCardNote[] = [];
	const right: NoteCardNote[] = [];
	let leftHeight = 0;
	let rightHeight = 0;

	for (const item of items) {
		const estimatedHeight =
			estimateCompactNoteCardHeight(item, cardWidth) + FEED_ITEM_GAP;
		if (leftHeight <= rightHeight) {
			left.push(item);
			leftHeight += estimatedHeight;
		} else {
			right.push(item);
			rightHeight += estimatedHeight;
		}
	}

	return [left, right];
}

function estimateCompactNoteCardHeight(item: NoteCardNote, cardWidth: number) {
	const coverImageMeta = item.imageMetas?.find(
		(meta) => meta.url === item.cover,
	);
	const imageAspectRatio =
		coverImageMeta?.width && coverImageMeta.height
			? coverImageMeta.width / coverImageMeta.height
			: 1;
	const imageHeight = cardWidth / imageAspectRatio;
	return imageHeight + COMPACT_CARD_BODY_HEIGHT;
}
