import { PressableFeedback, Text, useThemeColor } from "heroui-native";
import { type ReactNode, useState } from "react";
import { Platform, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

import { NoteCard } from "@/components/note-card";
import {
	PROFILE_TAB_BAR_HEIGHT,
	PROFILE_TABS,
	type ProfileTabKey,
} from "@/components/profile/profile-tabs";
import { ErrorState, FeedSkeleton } from "@/components/social-states";

const TAB_INDICATOR_MAX_WIDTH = 96;
const FEED_HORIZONTAL_PADDING = 24;
const FEED_COLUMN_GAP = 12;
const FEED_ITEM_GAP = 12;
const COMPACT_CARD_BODY_HEIGHT = 82;

export type ProfileFeedNote = Parameters<typeof NoteCard>[0]["note"];
export type ProfileFeedItem = ProfileFeedNote;

export function createProfileFeedItems(notes: ProfileFeedNote[]) {
	return notes;
}

export function ProfileTabBar({
	accentColor,
	activeTab,
	backgroundColor,
	elevated,
	foregroundColor,
	mutedColor,
	onSelect,
	pageWidth,
	pagerScrollX,
}: {
	accentColor: string;
	activeTab: ProfileTabKey;
	backgroundColor: string;
	elevated: boolean;
	foregroundColor: string;
	mutedColor: string;
	onSelect: (tab: ProfileTabKey) => void;
	pageWidth: number;
	pagerScrollX: SharedValue<number>;
}) {
	const [barWidth, setBarWidth] = useState(0);
	const tabWidth = barWidth / PROFILE_TABS.length;
	const indicatorWidth = Math.min(TAB_INDICATOR_MAX_WIDTH, tabWidth * 0.72);

	const indicatorStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateX:
					(pageWidth ? pagerScrollX.value / pageWidth : 0) * tabWidth +
					(tabWidth - indicatorWidth) / 2,
			},
		],
	}));

	return (
		<View
			style={{
				backgroundColor,
				height: PROFILE_TAB_BAR_HEIGHT,
				boxShadow: elevated ? "0 1px 0 rgba(0, 0, 0, 0.07)" : undefined,
			}}
		>
			<View
				className="relative mx-auto h-full w-full max-w-xl flex-row items-center"
				onLayout={(event) => {
					const nextWidth = Math.ceil(event.nativeEvent.layout.width);
					setBarWidth((current) =>
						current === nextWidth ? current : nextWidth,
					);
				}}
			>
				{PROFILE_TABS.map((tab) => {
					const selected = tab.key === activeTab;
					return (
						<PressableFeedback
							key={tab.key}
							accessibilityRole="tab"
							accessibilityState={selected ? { selected: true } : undefined}
							className="h-full flex-1 items-center justify-center"
							onPress={() => onSelect(tab.key)}
						>
							<Text.Paragraph
								weight="bold"
								style={{
									color: selected ? foregroundColor : mutedColor,
									fontSize: 14,
									lineHeight: 18,
								}}
							>
								{tab.label}
							</Text.Paragraph>
						</PressableFeedback>
					);
				})}
				{barWidth ? (
					<Animated.View
						pointerEvents="none"
						className="absolute bottom-0 left-0 h-1 rounded-full"
						style={[
							{
								backgroundColor: accentColor,
								width: indicatorWidth,
							},
							indicatorStyle,
						]}
					/>
				) : null}
			</View>
		</View>
	);
}

export function ProfileTabPane({ children }: { children: ReactNode }) {
	return <>{children}</>;
}

export function ProfileTabPage({
	emptyState,
	feedItems,
	isError,
	isLoading,
	onRetry,
	width,
}: {
	emptyState: ReactNode;
	feedItems: ProfileFeedItem[];
	isError: boolean;
	isLoading: boolean;
	onRetry: () => void;
	width: number;
}) {
	const backgroundColor = useThemeColor("background");
	const cardWidth = Math.max(
		1,
		(width - FEED_HORIZONTAL_PADDING - FEED_COLUMN_GAP) / 2,
	);
	const masonryColumns = createMasonryColumns(feedItems, cardWidth);

	return (
		<View style={{ backgroundColor }}>
			<View
				style={{
					backgroundColor,
					paddingBottom: Platform.OS === "ios" ? 40 : 132,
					paddingTop: 12,
					width,
				}}
			>
				{isLoading ? (
					<FeedSkeleton />
				) : isError ? (
					<ErrorState
						description="个人页暂时没有加载出来，请稍后重试。"
						onRetry={onRetry}
					/>
				) : feedItems.length > 0 ? (
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
					emptyState
				)}
			</View>
		</View>
	);
}

function FeedCell({ item }: { item: ProfileFeedItem }) {
	return <NoteCard compact note={item} />;
}

function createMasonryColumns(items: ProfileFeedItem[], cardWidth: number) {
	const left: ProfileFeedItem[] = [];
	const right: ProfileFeedItem[] = [];
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

function estimateCompactNoteCardHeight(
	item: ProfileFeedItem,
	cardWidth: number,
) {
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
