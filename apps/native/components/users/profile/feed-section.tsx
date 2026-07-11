import { Ionicons } from "@expo/vector-icons";
import { Typography, useThemeColor } from "heroui-native";
import { useWindowDimensions, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import { EmptyState, FeedSkeleton } from "@/components/social-states";

import type { UserFeedNote } from "./types";

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
	notes: UserFeedNote[];
}) {
	const mutedColor = useThemeColor("muted");
	const dimensions = useWindowDimensions();
	const feedWidth = Math.min(dimensions.width, FEED_MAX_WIDTH);
	const cardWidth = Math.max(
		1,
		(feedWidth - FEED_HORIZONTAL_PADDING - FEED_COLUMN_GAP) / 2,
	);
	const masonryColumns = createMasonryColumns(notes, cardWidth);

	return (
		<>
			<View className="-mt-5 overflow-hidden rounded-t-3xl bg-background pt-0">
				<View className="mx-auto h-16 w-full max-w-xl flex-row items-center justify-between px-4">
					<Typography.Paragraph weight="semibold" className="text-foreground">
						公开图文
					</Typography.Paragraph>
					<View className="flex-row items-center gap-1">
						<Ionicons name="images-outline" size={15} color={mutedColor} />
						<Typography.Paragraph type="body-xs" color="muted">
							{notes.length} 篇
						</Typography.Paragraph>
					</View>
				</View>
			</View>

			<View className="mx-auto w-full max-w-xl pt-3">
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
					<EmptyState icon="images-outline" title="还没有公开图文" />
				)}
			</View>
		</>
	);
}

function FeedCell({ item }: { item: UserFeedNote }) {
	return <NoteCard compact note={item} />;
}

function createMasonryColumns(items: UserFeedNote[], cardWidth: number) {
	const left: UserFeedNote[] = [];
	const right: UserFeedNote[] = [];
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

function estimateCompactNoteCardHeight(item: UserFeedNote, cardWidth: number) {
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
