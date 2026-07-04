import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	PressableFeedback,
	Skeleton,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import { Platform, Share, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import { AppHeading } from "@/components/shared/app-heading";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { client, queryClient } from "@/utils/orpc";

const PAGE_SIZE = 20;
const TOPIC_SORTS = [
	{ key: "hot", label: "最热" },
	{ key: "latest", label: "最新" },
] as const;

type TopicSort = (typeof TOPIC_SORTS)[number]["key"];
type TopicNote = Parameters<typeof NoteCard>[0]["note"];

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function TopicDetailScreen() {
	const params = useLocalSearchParams<{ id?: string | string[] }>();
	const id = getRouteParam(params.id) ?? "";
	const router = useRouter();
	const socialNavigation = useSocialNavigation();
	const insets = useSafeAreaInsets();
	const foregroundColor = useThemeColor("foreground");
	const accentColor = useThemeColor("accent");
	const [sort, setSort] = useState<TopicSort>("hot");
	const queryKey = useMemo(() => ["topic", id, sort] as const, [id, sort]);
	const topic = useInfiniteQuery({
		queryKey,
		queryFn: ({ pageParam }) =>
			client.topicDetail({
				id: id || "missing",
				limit: PAGE_SIZE,
				offset: Number(pageParam ?? 0),
				sort,
			}),
		initialPageParam: 0,
		getNextPageParam: (lastPage) => lastPage.notes.nextOffset ?? undefined,
		enabled: Boolean(id),
	});
	const topicInfo = topic.data?.pages[0]?.topic;
	const notes = useMemo(
		() => topic.data?.pages.flatMap((page) => page.notes.items) ?? [],
		[topic.data?.pages],
	) as TopicNote[];

	const goBack = () => {
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/search" as Href);
	};

	const shareTopic = async () => {
		if (!topicInfo?.name) return;
		await Share.share({ message: `#${topicInfo.name}` }).catch(() => undefined);
	};

	if (!id || (topic.isError && notes.length === 0)) {
		return (
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<TopicTopBar
					foregroundColor={foregroundColor}
					onBack={goBack}
					onShare={shareTopic}
				/>
				<ErrorState
					title="话题没有打开"
					description="话题可能不存在，或者网络暂时不可用。"
					onRetry={() => topic.refetch()}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<FlashList
				style={{ alignSelf: "center", flex: 1, width: "100%", maxWidth: 576 }}
				data={notes}
				keyExtractor={(item) => item.id}
				numColumns={2}
				masonry
				optimizeItemArrangement={false}
				showsVerticalScrollIndicator={false}
				refreshing={topic.isRefetching && !topic.isFetchingNextPage}
				onRefresh={() => {
					void queryClient.resetQueries({ queryKey });
				}}
				onEndReached={() => {
					if (
						topic.hasNextPage &&
						!topic.isFetchingNextPage &&
						!topic.isFetching
					) {
						void topic.fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.4}
				contentContainerStyle={{
					paddingHorizontal: 4,
					paddingBottom: Platform.OS === "ios" ? insets.bottom + 36 : 132,
				}}
				ListHeaderComponent={
					<TopicHeader
						accentColor={accentColor}
						foregroundColor={foregroundColor}
						isLoading={topic.isLoading}
						sort={sort}
						topicName={topicInfo?.name}
						discussionCount={topicInfo?.discussionCount ?? 0}
						noteCount={topicInfo?.noteCount ?? 0}
						topInset={insets.top}
						onBack={goBack}
						onShare={shareTopic}
						onSortChange={setSort}
					/>
				}
				renderItem={({ item }) => (
					<View className="px-1 pb-2">
						<NoteCard compact note={item} />
					</View>
				)}
				ListFooterComponent={
					<TopicFooter
						hasItems={notes.length > 0}
						hasMore={Boolean(topic.hasNextPage)}
						isLoading={topic.isFetchingNextPage}
					/>
				}
				ListEmptyComponent={
					topic.isLoading ? (
						<FeedSkeleton />
					) : (
						<EmptyState
							icon="images-outline"
							title="还没有相关图文"
							description="这个话题下有新内容后，会出现在这里。"
							actionLabel="去发布"
							onAction={socialNavigation.openPublish}
						/>
					)
				}
			/>

			<Button
				variant="primary"
				className="absolute self-center rounded-full px-7"
				style={{ bottom: insets.bottom + 18 }}
				feedbackVariant="scale-ripple"
				onPress={socialNavigation.openPublish}
			>
				<Ionicons name="add" size={24} color="#ffffff" />
				<Button.Label className="text-white">去发布</Button.Label>
			</Button>
		</View>
	);
}

function TopicHeader({
	accentColor,
	discussionCount,
	foregroundColor,
	isLoading,
	noteCount,
	onBack,
	onShare,
	onSortChange,
	sort,
	topInset,
	topicName,
}: {
	accentColor: string;
	discussionCount: number;
	foregroundColor: string;
	isLoading: boolean;
	noteCount: number;
	onBack: () => void;
	onShare: () => void;
	onSortChange: (sort: TopicSort) => void;
	sort: TopicSort;
	topInset: number;
	topicName?: string;
}) {
	return (
		<View className="bg-background" style={{ paddingTop: topInset }}>
			<View className="overflow-hidden">
				<View className="absolute top-10 right-6 size-36 rotate-12 items-center justify-center opacity-5">
					<Text.Heading type="h1" style={{ fontSize: 140, color: accentColor }}>
						#
					</Text.Heading>
				</View>

				<TopicTopBar
					foregroundColor={foregroundColor}
					onBack={onBack}
					onShare={onShare}
				/>

				<View className="gap-4 px-4 pt-8 pb-8">
					<View className="flex-row items-start justify-between gap-4">
						<View className="min-w-0 flex-1 gap-2">
							{isLoading && !topicName ? (
								<>
									<Skeleton className="h-9 w-44 rounded-full" />
									<Skeleton className="h-5 w-36 rounded-full" />
								</>
							) : (
								<>
									<AppHeading
										type="h2"
										weight="bold"
										numberOfLines={2}
										className="text-foreground"
									>
										# {topicName ?? "话题"}
									</AppHeading>
									<Text.Paragraph type="body-sm" color="muted">
										{formatCount(noteCount)} 篇图文
										{discussionCount > 0
											? `  |  ${formatCount(discussionCount)} 条讨论`
											: ""}
									</Text.Paragraph>
								</>
							)}
						</View>
					</View>
				</View>
			</View>

			<View className="h-16 flex-row items-center justify-between px-4">
				<View className="flex-row items-center gap-8">
					{TOPIC_SORTS.map((item) => {
						const active = item.key === sort;
						return (
							<PressableFeedback
								key={item.key}
								accessibilityRole="tab"
								accessibilityState={active ? { selected: true } : undefined}
								onPress={() => {
									fireHaptic();
									onSortChange(item.key);
								}}
							>
								<AppHeading
									type="h4"
									weight={active ? "bold" : "normal"}
									className={active ? "text-foreground" : "text-muted"}
								>
									{item.label}
								</AppHeading>
							</PressableFeedback>
						);
					})}
				</View>
				<View className="w-12" />
			</View>
		</View>
	);
}

function TopicTopBar({
	foregroundColor,
	onBack,
	onShare,
}: {
	foregroundColor: string;
	onBack: () => void;
	onShare: () => void;
}) {
	return (
		<View className="h-16 flex-row items-center justify-between px-2">
			<Button
				isIconOnly
				variant="ghost"
				className="h-12 w-12 rounded-full"
				feedbackVariant="scale-ripple"
				accessibilityLabel="返回"
				onPress={onBack}
			>
				<Ionicons name="chevron-back" size={28} color={foregroundColor} />
			</Button>
			<View className="flex-row items-center gap-3">
				<Button
					isIconOnly
					variant="ghost"
					className="h-12 w-12 rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="分享"
					onPress={onShare}
				>
					<Ionicons
						name="arrow-redo-outline"
						size={28}
						color={foregroundColor}
					/>
				</Button>
			</View>
		</View>
	);
}

function TopicFooter({
	hasItems,
	hasMore,
	isLoading,
}: {
	hasItems: boolean;
	hasMore: boolean;
	isLoading: boolean;
}) {
	if (!hasItems) return null;

	if (isLoading) {
		return (
			<View className="items-center py-5">
				<Spinner size="sm" />
			</View>
		);
	}

	if (!hasMore) {
		return (
			<View className="items-center py-5">
				<Text.Paragraph type="body-xs" color="muted">
					没有更多了
				</Text.Paragraph>
			</View>
		);
	}

	return <View className="h-5" />;
}

function formatCount(value: number) {
	if (value >= 10000) {
		const formatted =
			value >= 100000
				? String(Math.round(value / 10000))
				: (value / 10000).toFixed(1).replace(/\.0$/, "");
		return `${formatted}万`;
	}
	return String(value);
}
