import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, Spinner, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, View } from "react-native";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";
import { createTwoColumnFeed } from "@/lib/utils/two-column-feed";
import { orpc } from "@/utils/orpc";

const CHANNELS = ["推荐", "穿搭", "美食", "旅行", "好物"] as const;

export default function HomeScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const mutedColor = useThemeColor("muted");
	const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("推荐");
	const input = useMemo(
		() => ({
			keyword: channel === "推荐" ? undefined : channel,
			limit: 30,
		}),
		[channel],
	);
	const feed = useQuery(orpc.social.feed.queryOptions({ input }));
	const notes = feed.data ?? [];
	const feedItems = useMemo(() => createTwoColumnFeed(notes), [notes]);

	return (
		<View className="flex-1 bg-background">
			<FlatList
				className="mx-auto w-full max-w-xl"
				data={feedItems}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperClassName="gap-3 px-3"
				renderItem={({ item }) => (
					<View className="flex-1 basis-0">
						{item.type === "item" ? (
							<NoteCard compact note={item.item} />
						) : null}
					</View>
				)}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={feed.isRefetching}
						onRefresh={feed.refetch}
					/>
				}
				contentContainerClassName="bg-background pt-3 pb-32"
				ListHeaderComponent={
					<View className="gap-3 px-3 pb-3">
						<View className="flex-row items-center gap-3">
							<Button
								variant="secondary"
								className="h-11 flex-1 justify-start rounded-full px-4"
								feedbackVariant="scale-ripple"
								onPress={() => router.push("/search" as Href)}
							>
								<Ionicons name="search-outline" size={18} color={mutedColor} />
								<Button.Label className="text-muted">
									搜索图文和话题
								</Button.Label>
							</Button>
							<Button
								isIconOnly
								variant="secondary"
								className="h-11 w-11 rounded-full"
								feedbackVariant="scale-ripple"
								accessibilityLabel="刷新首页"
								isDisabled={feed.isRefetching}
								onPress={() => feed.refetch()}
							>
								{feed.isRefetching ? (
									<Spinner size="sm" />
								) : (
									<Ionicons
										name="refresh-outline"
										size={18}
										color={mutedColor}
									/>
								)}
							</Button>
						</View>

						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerClassName="gap-2 pr-3"
						>
							{CHANNELS.map((item) => {
								const active = item === channel;
								return (
									<Button
										key={item}
										size="sm"
										variant={active ? "primary" : "secondary"}
										className="rounded-full px-4"
										feedbackVariant="scale-ripple"
										onPress={() => setChannel(item)}
									>
										<Button.Label>{item}</Button.Label>
									</Button>
								);
							})}
						</ScrollView>
					</View>
				}
				ListEmptyComponent={
					feed.isLoading ? (
						<FeedSkeleton />
					) : feed.isError ? (
						<ErrorState
							description="内容暂时没有加载出来，请检查网络后重试。"
							onRetry={() => feed.refetch()}
						/>
					) : (
						<EmptyState
							icon="sparkles-outline"
							title="还没有内容"
							description="发布第一篇图文后，这里会出现新的灵感。"
							actionLabel="去发布"
							onAction={() =>
								router.push(
									session.data?.user
										? ("/publish" as Href)
										: getLoginHref("/publish"),
								)
							}
						/>
					)
				}
			/>
		</View>
	);
}
