import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { Button, PressableFeedback, Text, useThemeColor } from "heroui-native";
import { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { orpc } from "@/utils/orpc";

const HOME_TABS = [
	{ id: "following", label: "关注" },
	{ id: "discover", label: "发现" },
] as const;
type HomeTab = (typeof HOME_TABS)[number]["id"];

export default function HomeScreen() {
	const socialNavigation = useSocialNavigation();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const [activeTab, setActiveTab] = useState<HomeTab>("discover");
	const input = useMemo(() => ({ limit: 30 }), []);
	const discoverFeed = useQuery(orpc.social.feed.queryOptions({ input }));
	const followingFeed = useQuery({
		...orpc.social.followingFeed.queryOptions({ input }),
		enabled:
			activeTab === "following" && Boolean(socialNavigation.session.data?.user),
	});
	const activeFeed = activeTab === "following" ? followingFeed : discoverFeed;
	const notes = activeFeed.data ?? [];
	const isFollowingGuest =
		activeTab === "following" && !socialNavigation.session.data?.user;
	const topBar = (
		<View
			className="bg-background px-2 pb-3"
			style={{ paddingTop: Math.max(insets.top, 8) }}
		>
			<View className="mx-auto h-14 w-full max-w-xl flex-row items-center justify-between">
				<View className="w-12" />
				<View className="flex-row items-center gap-9">
					{HOME_TABS.map((item) => {
						const active = item.id === activeTab;
						return (
							<PressableFeedback
								key={item.id}
								accessibilityRole="tab"
								accessibilityState={active ? { selected: true } : undefined}
								className="h-14 items-center justify-center px-1"
								onPress={() => setActiveTab(item.id)}
							>
								<Text.Heading
									type="h4"
									weight={active ? "bold" : "normal"}
									className={active ? "text-foreground" : "text-muted"}
								>
									{item.label}
								</Text.Heading>
								<View
									className={
										active
											? "mt-1 h-1 w-8 rounded-full bg-accent"
											: "mt-1 h-1 w-8 rounded-full bg-transparent"
									}
								/>
							</PressableFeedback>
						);
					})}
				</View>
				<Button
					isIconOnly
					variant="ghost"
					className="h-12 w-12 rounded-full"
					feedbackVariant="scale-ripple"
					accessibilityLabel="搜索"
					onPress={() => socialNavigation.goTo({ type: "search" })}
				>
					<Ionicons
						name="search-outline"
						size={30}
						color={activeTab === "discover" ? foregroundColor : mutedColor}
					/>
				</Button>
			</View>
		</View>
	);

	return (
		<View className="flex-1 bg-background">
			{topBar}
			<FlashList
				style={{ alignSelf: "center", flex: 1, width: "100%", maxWidth: 576 }}
				data={notes}
				keyExtractor={(item) => item.id}
				numColumns={2}
				masonry
				optimizeItemArrangement={false}
				renderItem={({ item }) => (
					<View className="px-1 pb-2">
						<NoteCard compact note={item} />
					</View>
				)}
				contentInsetAdjustmentBehavior="automatic"
				showsVerticalScrollIndicator={false}
				refreshing={activeFeed.isRefetching}
				onRefresh={() => {
					activeFeed.refetch();
				}}
				contentContainerStyle={{
					paddingTop: 8,
					paddingBottom: Platform.OS === "ios" ? 32 : 128,
					paddingHorizontal: 4,
				}}
				ListEmptyComponent={
					activeFeed.isLoading ? (
						<FeedSkeleton />
					) : activeFeed.isError ? (
						<ErrorState
							description="内容暂时没有加载出来，请检查网络后重试。"
							onRetry={() => activeFeed.refetch()}
						/>
					) : isFollowingGuest ? (
						<EmptyState
							icon="person-add-outline"
							title="登录后查看关注"
							description="关注博主后，这里会显示他们的新内容。"
							actionLabel="去登录"
							onAction={() =>
								socialNavigation.goTo({ type: "login", redirectTo: "/" })
							}
						/>
					) : (
						<EmptyState
							icon={
								activeTab === "following"
									? "people-outline"
									: "sparkles-outline"
							}
							title={
								activeTab === "following" ? "还没有关注动态" : "还没有内容"
							}
							description={
								activeTab === "following"
									? "关注几个感兴趣的博主后，这里会显示他们的新内容。"
									: "发布第一篇图文后，这里会出现新的灵感。"
							}
							actionLabel={activeTab === "following" ? "去发现" : "去发布"}
							onAction={() =>
								activeTab === "following"
									? setActiveTab("discover")
									: socialNavigation.openPublish()
							}
						/>
					)
				}
			/>
		</View>
	);
}
