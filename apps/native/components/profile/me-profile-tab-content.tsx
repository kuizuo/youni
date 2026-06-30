import { PressableFeedback, Text, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { Platform, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import {
	PROFILE_TAB_BAR_HEIGHT,
	PROFILE_TABS,
	type ProfileTabKey,
} from "@/components/profile/profile-tabs";
import { ErrorState, FeedSkeleton } from "@/components/social-states";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";

export type ProfileFeedNote = Parameters<typeof NoteCard>[0]["note"];
export type ProfileFeedItem = ReturnType<
	typeof createTwoColumnFeed<ProfileFeedNote>
>[number];

export function createProfileFeedItems(notes: ProfileFeedNote[]) {
	return createTwoColumnFeed(notes);
}

export function ProfileTabBar({
	accentColor,
	activeTab,
	backgroundColor,
	elevated,
	foregroundColor,
	mutedColor,
	onSelect,
}: {
	accentColor: string;
	activeTab: ProfileTabKey;
	backgroundColor: string;
	elevated: boolean;
	foregroundColor: string;
	mutedColor: string;
	onSelect: (tab: ProfileTabKey) => void;
}) {
	return (
		<View
			style={{
				backgroundColor,
				height: PROFILE_TAB_BAR_HEIGHT,
				boxShadow: elevated ? "0 1px 0 rgba(0, 0, 0, 0.07)" : undefined,
			}}
		>
			<View className="mx-auto h-full w-full max-w-xl flex-row items-center">
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
								style={{ color: selected ? foregroundColor : mutedColor }}
							>
								{tab.label}
							</Text.Paragraph>
							<View
								className="absolute bottom-0 h-1 w-24 rounded-full"
								style={{
									backgroundColor: selected ? accentColor : "transparent",
								}}
							/>
						</PressableFeedback>
					);
				})}
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
					<View className="gap-3 px-3">
						{feedItems.reduce<ReactNode[]>((rows, item, index) => {
							if (index % 2 === 1) return rows;
							const nextItem = feedItems[index + 1];
							rows.push(
								<View
									key={`row-${item.id}`}
									className="flex-row items-start gap-3"
								>
									<FeedCell item={item} />
									{nextItem ? (
										<FeedCell item={nextItem} />
									) : (
										<View className="flex-1 basis-0" />
									)}
								</View>,
							);
							return rows;
						}, [])}
					</View>
				) : (
					emptyState
				)}
			</View>
		</View>
	);
}

function FeedCell({ item }: { item: ProfileFeedItem }) {
	return (
		<View className="flex-1 basis-0">
			{item.type === "item" ? <NoteCard compact note={item.item} /> : null}
		</View>
	);
}
