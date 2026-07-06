import { Ionicons } from "@expo/vector-icons";
import { Text, useThemeColor } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { NoteCard } from "@/components/note-card";
import { EmptyState, FeedSkeleton } from "@/components/social-states";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";

import type { UserFeedItem, UserFeedNote } from "./types";

export function UserProfileFeedSection({
	isLoading,
	notes,
}: {
	isLoading: boolean;
	notes: UserFeedNote[];
}) {
	const mutedColor = useThemeColor("muted");
	const feedItems = createTwoColumnFeed(notes);

	return (
		<>
			<View className="-mt-5 overflow-hidden rounded-t-3xl bg-background pt-0">
				<View className="mx-auto h-16 w-full max-w-xl flex-row items-center justify-between px-4">
					<Text.Paragraph weight="semibold" className="text-foreground">
						公开图文
					</Text.Paragraph>
					<View className="flex-row items-center gap-1">
						<Ionicons name="images-outline" size={15} color={mutedColor} />
						<Text.Paragraph type="body-xs" color="muted">
							{notes.length} 篇
						</Text.Paragraph>
					</View>
				</View>
			</View>

			<View className="mx-auto w-full max-w-xl pt-3">
				{isLoading ? (
					<FeedSkeleton />
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
					<EmptyState
						icon="images-outline"
						title="还没有公开图文"
						description="有新内容发布后，会出现在这里。"
					/>
				)}
			</View>
		</>
	);
}

function FeedCell({ item }: { item: UserFeedItem }) {
	return (
		<View className="flex-1 basis-0">
			{item.type === "item" ? <NoteCard compact note={item.item} /> : null}
		</View>
	);
}
