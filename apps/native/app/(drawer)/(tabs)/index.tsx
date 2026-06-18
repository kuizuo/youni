import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Card,
	Avatar as HeroAvatar,
	Spinner,
	Surface,
	Tabs,
	Text,
	useToast,
} from "heroui-native";
import { useMemo, useState } from "react";
import { FlatList } from "react-native";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { orpc } from "@/utils/orpc";

const feedTabs = ["推荐", "穿搭", "美食", "旅行", "好物"];
const moodTags = ["今日灵感", "城市散步", "咖啡", "拍照姿势", "周末计划"];
const creatorPicks = [
	{
		name: "鹿鹿",
		initials: "鹿",
		topic: "穿搭",
		description: "通勤穿搭",
		color: "danger",
	},
	{
		name: "阿漫",
		initials: "漫",
		topic: "旅行",
		description: "城市散步",
		color: "accent",
	},
	{
		name: "小禾",
		initials: "禾",
		topic: "美食",
		description: "咖啡地图",
		color: "warning",
	},
	{
		name: "Youni",
		initials: "Y",
		topic: "好物",
		description: "生活清单",
		color: "success",
	},
] as const;
const inspirationShortcuts = [
	{
		label: "拍同款",
		icon: "camera-outline",
		action: "create",
		hint: "去发布页写一篇自己的同款图文。",
	},
	{
		label: "找路线",
		icon: "map-outline",
		action: "travel",
		hint: "已切到旅行频道，继续找城市路线。",
	},
	{
		label: "看清单",
		icon: "bag-handle-outline",
		action: "goods",
		hint: "已切到好物频道，继续看大家的清单。",
	},
] as const;
const feedDescriptions: Record<string, { title: string; description: string }> =
	{
		推荐: {
			title: "为你推荐",
			description: "混合展示社区里最新的公开图文",
		},
		穿搭: {
			title: "穿搭频道",
			description: "看近期高频出现的穿搭笔记和灵感",
		},
		美食: {
			title: "美食频道",
			description: "筛选咖啡、餐厅和日常菜单分享",
		},
		旅行: {
			title: "旅行频道",
			description: "收藏城市散步、周末路线和出片地点",
		},
		好物: {
			title: "好物频道",
			description: "整理大家正在推荐的清单和使用体验",
		},
	};

export default function Home() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("推荐");
	const [isQuickPanelOpen, setIsQuickPanelOpen] = useState(false);
	const [isCreatorPanelOpen, setIsCreatorPanelOpen] = useState(false);
	const [activeCreator, setActiveCreator] = useState("Youni");
	const [followedCreators, setFollowedCreators] = useState<string[]>([]);
	const [homeHint, setHomeHint] = useState(
		"点频道、热门词或图文卡片，继续发现生活灵感。",
	);
	const { toast } = useToast();
	const input = useMemo(
		() => ({
			keyword: activeTab === "推荐" ? undefined : activeTab,
			limit: 40,
		}),
		[activeTab],
	);
	const feed = useQuery(orpc.social.feed.queryOptions({ input }));

	const showFeedback = (label: string) => {
		setHomeHint(label);
		toast.show({ label, duration: 1200 });
	};

	const selectTab = (tab: string) => {
		if (activeTab === tab) {
			showFeedback(`正在看${tab}`);
			return;
		}
		setActiveTab(tab);
		showFeedback(`已切到${tab}`);
	};

	const selectMood = (tag: string) => {
		const matchedTab = feedTabs.find((tab) => tag.includes(tab));
		if (matchedTab) {
			selectTab(matchedTab);
			return;
		}
		showFeedback(`已关注「${tag}」`);
	};

	const selectCreator = (creator: (typeof creatorPicks)[number]) => {
		setActiveCreator(creator.name);
		if (feedTabs.includes(creator.topic)) {
			setActiveTab(creator.topic);
		}
		setIsCreatorPanelOpen(true);
		showFeedback(`已打开 ${creator.name} 的灵感卡片`);
	};
	const toggleCreatorFollow = (creator: (typeof creatorPicks)[number]) => {
		const isFollowed = followedCreators.includes(creator.name);
		setFollowedCreators((items) =>
			isFollowed
				? items.filter((item) => item !== creator.name)
				: [creator.name, ...items],
		);
		const label = isFollowed
			? `已取消关注 ${creator.name}`
			: `已关注 ${creator.name}`;
		setHomeHint(label);
		toast.show({
			variant: isFollowed ? "default" : "success",
			label,
			description: isFollowed
				? "可以继续浏览其他达人。"
				: `之后可以继续看 ${creator.description}。`,
			duration: 1200,
		});
	};
	const searchCreatorTopic = (creator: (typeof creatorPicks)[number]) => {
		setIsCreatorPanelOpen(false);
		setHomeHint(`去搜索 ${creator.name} 的 #${creator.topic} 灵感。`);
		toast.show({
			variant: "accent",
			label: `搜索 #${creator.topic}`,
			description: `继续看 ${creator.name} 风格的${creator.description}。`,
			duration: 1000,
		});
		router.push({
			pathname: "/search",
			params: {
				keyword: creator.topic,
				source: "home-creator",
				actionAt: String(Date.now()),
			},
		} as unknown as Href);
	};
	const createFromCreator = (creator: (typeof creatorPicks)[number]) => {
		setIsCreatorPanelOpen(false);
		setHomeHint(`去写一篇 ${creator.description} 同款图文。`);
		toast.show({
			label: "去写同款",
			description: `从 ${creator.name} 的 #${creator.topic} 灵感开始。`,
			duration: 1000,
		});
		router.push({
			pathname: "/create",
			params: {
				source: "tabbar",
				action: "search-starter",
				actionAt: String(Date.now()),
			},
		} as unknown as Href);
	};
	const focusCreatorTopic = (creator: (typeof creatorPicks)[number]) => {
		setActiveTab(creator.topic);
		setIsCreatorPanelOpen(false);
		showFeedback(`只看 ${creator.name} 的 #${creator.topic} 灵感`);
	};

	const selectShortcut = (shortcut: (typeof inspirationShortcuts)[number]) => {
		if (shortcut.action === "create") {
			setHomeHint(shortcut.hint);
			toast.show({ label: "去写同款", description: shortcut.hint });
			router.push("/create" as Href);
			return;
		}
		if (shortcut.action === "travel") {
			setActiveTab("旅行");
			showFeedback(shortcut.hint);
			return;
		}
		setActiveTab("好物");
		showFeedback(shortcut.hint);
	};

	const openQuickPanel = () => {
		setHomeHint("已打开发现更多，可以切频道、搜索或发布。");
		setIsQuickPanelOpen(true);
	};

	const switchToNextChannel = () => {
		const currentIndex = feedTabs.indexOf(activeTab);
		const nextTab = feedTabs[(currentIndex + 1) % feedTabs.length] ?? "推荐";
		setIsQuickPanelOpen(false);
		selectTab(nextTab);
	};

	const refreshFeed = () => {
		setHomeHint("正在刷新首页内容。");
		toast.show({ label: "正在刷新", duration: 900 });
		void feed.refetch().then(() => {
			toast.show({ variant: "success", label: "内容已更新", duration: 1200 });
			setHomeHint("内容已更新，可以继续浏览推荐图文。");
		});
	};

	const openSearch = () => {
		setIsQuickPanelOpen(false);
		toast.show({ label: "去搜索更多灵感", duration: 900 });
		router.push("/search" as Href);
	};

	const openCreate = () => {
		setIsQuickPanelOpen(false);
		toast.show({ label: "去发布你的图文", duration: 900 });
		router.push("/create" as Href);
	};

	const activeCopy = feedDescriptions[activeTab] ?? feedDescriptions.推荐;
	const activeCreatorData =
		creatorPicks.find((creator) => creator.name === activeCreator) ??
		creatorPicks[0];
	const isActiveCreatorFollowed = followedCreators.includes(
		activeCreatorData.name,
	);
	const noteCount = feed.data?.length ?? 0;

	return (
		<Surface variant="transparent" className="flex-1 bg-background p-0">
			<FlatList
				data={feed.data ?? []}
				keyExtractor={(item) => item.id}
				numColumns={2}
				contentInsetAdjustmentBehavior="automatic"
				ListHeaderComponent={
					<Card.Body className="gap-4 px-3 pt-4 pb-2">
						<Card className="gap-4 rounded-3xl p-4">
							<Card.Header className="p-0">
								<Card.Body className="gap-1 p-0">
									<Text.Heading type="h2">发现</Text.Heading>
									<Text.Paragraph color="muted" type="body-sm">
										看看大家最近分享的灵感、清单和生活方式。
									</Text.Paragraph>
								</Card.Body>
							</Card.Header>
							<Card.Footer className="flex-row gap-2 p-0">
								<Button
									size="md"
									variant="secondary"
									feedbackVariant="scale-ripple"
									accessibilityLabel="发现更多"
									className="flex-1 justify-start"
									onPress={openQuickPanel}
								>
									<Ionicons name="sparkles-outline" size={16} color="#f43f5e" />
									<Button.Label>发现更多</Button.Label>
								</Button>
								<Button
									size="md"
									variant="secondary"
									feedbackVariant="scale-ripple"
									accessibilityLabel="刷新首页"
									className="flex-1 justify-start"
									isDisabled={feed.isRefetching}
									onPress={refreshFeed}
								>
									{feed.isRefetching ? (
										<Spinner size="sm" />
									) : (
										<Ionicons
											name="refresh-outline"
											size={15}
											color="#8a8a8a"
										/>
									)}
									<Button.Label>
										{feed.isRefetching ? "刷新中" : "刷新"}
									</Button.Label>
								</Button>
							</Card.Footer>
							<Surface
								variant="secondary"
								className="flex-row items-center gap-2 rounded-2xl bg-accent-soft px-3 py-2"
							>
								<Ionicons name="checkmark-circle" size={15} color="#f43f5e" />
								<Text.Paragraph
									type="body-sm"
									weight="semibold"
									className="flex-1 text-accent"
									numberOfLines={2}
								>
									{homeHint}
								</Text.Paragraph>
								<Button
									size="sm"
									variant="ghost"
									feedbackVariant="scale-ripple"
									onPress={openSearch}
								>
									<Button.Label>去搜索</Button.Label>
								</Button>
							</Surface>
							<Card.Footer className="flex-row gap-2">
								<Button
									variant="secondary"
									feedbackVariant="scale-ripple"
									className="flex-1 flex-col items-start rounded-2xl px-3 py-3"
									onPress={openQuickPanel}
								>
									<Text.Paragraph color="muted" type="body-xs">
										当前频道
									</Text.Paragraph>
									<Button.Label className="font-semibold text-foreground text-sm">
										{activeTab}
									</Button.Label>
								</Button>
								<Button
									variant="secondary"
									feedbackVariant="scale-ripple"
									className="flex-1 flex-col items-start rounded-2xl px-3 py-3"
									isDisabled={feed.isRefetching}
									onPress={refreshFeed}
								>
									<Text.Paragraph color="muted" type="body-xs">
										正在展示
									</Text.Paragraph>
									<Button.Label className="font-semibold text-foreground text-sm">
										{noteCount} 篇
									</Button.Label>
								</Button>
							</Card.Footer>
						</Card>
						<Card className="gap-4 rounded-3xl p-4">
							<Card.Header className="flex-row items-center justify-between p-0">
								<Card.Body className="gap-0.5 p-0">
									<Text.Paragraph weight="medium" type="body-sm">
										正在被大家点开
									</Text.Paragraph>
									<Text.Paragraph color="muted" type="body-xs">
										达人、话题和同款灵感都可以直接点
									</Text.Paragraph>
								</Card.Body>
								<Button
									size="sm"
									variant="ghost"
									feedbackVariant="scale-ripple"
									onPress={openCreate}
								>
									<Ionicons
										name="add-circle-outline"
										size={15}
										color="#f43f5e"
									/>
									<Button.Label>发图文</Button.Label>
								</Button>
							</Card.Header>
							<Card.Footer className="flex-row flex-wrap gap-2 p-0">
								{creatorPicks.map((creator) => {
									const isActive = activeCreator === creator.name;

									return (
										<Button
											key={creator.name}
											size="md"
											variant={isActive ? "primary" : "secondary"}
											feedbackVariant="scale-ripple"
											className="min-w-[47%] flex-1 justify-start rounded-2xl px-3 py-3"
											onPress={() => selectCreator(creator)}
										>
											<HeroAvatar
												size="sm"
												color={creator.color}
												variant={isActive ? "default" : "soft"}
												alt={creator.name}
											>
												<HeroAvatar.Fallback>
													{creator.initials}
												</HeroAvatar.Fallback>
											</HeroAvatar>
											<Surface
												variant="transparent"
												className="flex-1 items-start gap-0.5 p-0"
											>
												<Button.Label>{creator.name}</Button.Label>
												<Text.Paragraph
													color={isActive ? "default" : "muted"}
													type="body-xs"
													numberOfLines={1}
												>
													#{creator.topic} · {creator.description}
												</Text.Paragraph>
											</Surface>
											{isActive ? (
												<Ionicons
													name="checkmark-circle"
													size={16}
													color="#fff"
												/>
											) : null}
										</Button>
									);
								})}
							</Card.Footer>
							<Surface variant="transparent" className="flex-row gap-2 p-0">
								{inspirationShortcuts.map((shortcut) => (
									<Button
										key={shortcut.label}
										size="md"
										variant="outline"
										feedbackVariant="scale-ripple"
										accessibilityLabel={shortcut.label}
										className="min-h-11 flex-1"
										onPress={() => selectShortcut(shortcut)}
									>
										<Ionicons name={shortcut.icon} size={14} color="#f43f5e" />
										<Button.Label>{shortcut.label}</Button.Label>
									</Button>
								))}
							</Surface>
							<Card variant="secondary" className="gap-3 rounded-3xl p-3">
								<Card.Header className="flex-row items-center gap-3 p-0">
									<HeroAvatar
										size="md"
										color={activeCreatorData.color}
										variant="default"
										alt={activeCreatorData.name}
									>
										<HeroAvatar.Fallback>
											{activeCreatorData.initials}
										</HeroAvatar.Fallback>
									</HeroAvatar>
									<Card.Body className="min-w-0 flex-1 gap-0.5 p-0">
										<Card.Title>{activeCreatorData.name}</Card.Title>
										<Card.Description numberOfLines={1}>
											#{activeCreatorData.topic} · {activeCreatorData.description}
										</Card.Description>
									</Card.Body>
									<Button
										size="sm"
										variant={isActiveCreatorFollowed ? "secondary" : "primary"}
										feedbackVariant="scale-ripple"
										onPress={() => toggleCreatorFollow(activeCreatorData)}
									>
										<Ionicons
											name={
												isActiveCreatorFollowed
													? "checkmark-circle"
													: "add-circle-outline"
											}
											size={14}
											color={isActiveCreatorFollowed ? "#16a34a" : "#ffffff"}
										/>
										<Button.Label>
											{isActiveCreatorFollowed ? "已关注" : "关注"}
										</Button.Label>
									</Button>
								</Card.Header>
								<Card.Footer className="flex-row gap-2 p-0">
									<Button
										size="sm"
										variant="primary"
										feedbackVariant="scale-ripple"
										className="flex-1"
										onPress={() => searchCreatorTopic(activeCreatorData)}
									>
										<Ionicons name="search-outline" size={14} color="#ffffff" />
										<Button.Label>搜同款</Button.Label>
									</Button>
									<Button
										size="sm"
										variant="secondary"
										feedbackVariant="scale-ripple"
										className="flex-1"
										onPress={() => createFromCreator(activeCreatorData)}
									>
										<Ionicons name="create-outline" size={14} color="#8a8a8a" />
										<Button.Label>写同款</Button.Label>
									</Button>
								</Card.Footer>
							</Card>
						</Card>
						<Tabs
							value={activeTab}
							onValueChange={selectTab}
							variant="secondary"
						>
							<Tabs.List>
								<Tabs.ScrollView
									scrollAlign="center"
									showsHorizontalScrollIndicator={false}
									contentContainerClassName="gap-1 pr-6"
								>
									<Tabs.Indicator />
									{feedTabs.map((tab) => (
										<Tabs.Trigger key={tab} value={tab} className="px-1">
											{({ isSelected }) => (
												<Tabs.Label
													className={
														isSelected
															? "font-semibold text-danger"
															: "text-muted"
													}
												>
													{tab}
												</Tabs.Label>
											)}
										</Tabs.Trigger>
									))}
								</Tabs.ScrollView>
							</Tabs.List>
						</Tabs>
						<Card className="gap-3 rounded-3xl p-4">
							<Card.Header className="flex-row items-center justify-between gap-3">
								<Card.Body className="min-w-0 flex-1 gap-0.5 p-0">
									<Text.Paragraph weight="medium" type="body-sm">
										{activeCopy.title}
									</Text.Paragraph>
									<Text.Paragraph color="muted" type="body-xs">
										{activeCopy.description}
									</Text.Paragraph>
								</Card.Body>
								<Button
									size="sm"
									variant="danger-soft"
									feedbackVariant="scale-ripple"
									onPress={refreshFeed}
									isDisabled={feed.isRefetching}
								>
									{feed.isRefetching ? (
										<Spinner size="sm" />
									) : (
										<Ionicons
											name="sparkles-outline"
											size={14}
											color="#f43f5e"
										/>
									)}
									<Button.Label>{noteCount} 篇</Button.Label>
								</Button>
							</Card.Header>
							<Card.Footer className="flex-row flex-wrap gap-2">
								{moodTags.map((tag) => (
									<Button
										key={tag}
										size="sm"
										variant={tag.includes(activeTab) ? "primary" : "secondary"}
										feedbackVariant="scale-ripple"
										onPress={() => selectMood(tag)}
									>
										<Ionicons
											name={
												tag.includes(activeTab)
													? "checkmark-circle"
													: "flame-outline"
											}
											size={14}
											color={tag.includes(activeTab) ? "#ffffff" : "#f43f5e"}
										/>
										<Button.Label>{tag}</Button.Label>
									</Button>
								))}
							</Card.Footer>
						</Card>
						<Card.Header className="flex-row items-center justify-between px-1">
							<Card.Body className="gap-0.5 p-0">
								<Text.Paragraph weight="medium" type="body-sm">
									最新图文
								</Text.Paragraph>
								<Text.Paragraph color="muted" type="body-xs">
									双列瀑布流，点卡片进入详情
								</Text.Paragraph>
							</Card.Body>
							<Text.Paragraph color="muted" type="body-xs">
								{noteCount} 篇
							</Text.Paragraph>
						</Card.Header>
						{feed.isFetching && !feed.isLoading ? (
							<Surface
								variant="secondary"
								className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
							>
								<Spinner size="sm" />
								<Text.Paragraph color="muted" type="body-sm">
									正在更新内容
								</Text.Paragraph>
							</Surface>
						) : null}
					</Card.Body>
				}
				columnWrapperClassName="gap-2 px-2"
				contentContainerClassName="mx-auto w-full max-w-3xl bg-background pb-4"
				renderItem={({ item }) => <NoteCard note={item} />}
				ListEmptyComponent={
					feed.isLoading ? (
						<FeedSkeleton />
					) : feed.isError ? (
						<ErrorState onRetry={() => feed.refetch()} />
					) : (
						<EmptyState
							icon="images-outline"
							title="还没有内容"
							description="等第一批图文审核通过后，这里会出现新的灵感。"
							actionLabel="先发一篇"
							onAction={openCreate}
						/>
					)
				}
			/>
			{isQuickPanelOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-end bg-black/45 p-4"
				>
					<Button
						variant="ghost"
						feedbackVariant="none"
						className="absolute inset-0 rounded-none"
						accessibilityLabel="关闭发现更多"
						onPress={() => {
							setIsQuickPanelOpen(false);
							showFeedback("已收起发现更多");
						}}
					/>
					<Card className="gap-5 rounded-3xl p-5">
						<Card.Header className="flex-row items-center justify-between p-0">
							<Card.Body className="gap-0.5 p-0">
								<Text.Heading type="h4">发现更多</Text.Heading>
								<Text.Paragraph color="muted" type="body-sm">
									切换频道、搜索灵感，或发布自己的图文。
								</Text.Paragraph>
							</Card.Body>
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								feedbackVariant="scale-ripple"
								accessibilityLabel="关闭发现更多"
								onPress={() => setIsQuickPanelOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card variant="secondary" className="gap-3 rounded-3xl p-3">
							<Card.Header className="flex-row items-center justify-between p-0">
								<Card.Body className="gap-0.5 p-0">
									<Card.Title>{activeCopy.title}</Card.Title>
									<Card.Description>{activeCopy.description}</Card.Description>
								</Card.Body>
								<Surface
									variant="secondary"
									className="rounded-full bg-danger-soft px-3 py-1"
								>
									<Text.Paragraph
										type="body-xs"
										weight="semibold"
										className="text-danger"
									>
										{noteCount} 篇
									</Text.Paragraph>
								</Surface>
							</Card.Header>
						</Card>
						<Card.Footer className="flex-row flex-wrap gap-2 p-0">
							<Button
								variant="primary"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								onPress={openSearch}
							>
								<Ionicons name="search-outline" size={16} color="#ffffff" />
								<Button.Label>去搜索</Button.Label>
							</Button>
							<Button
								variant="secondary"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								onPress={openCreate}
							>
								<Ionicons name="add-circle-outline" size={16} color="#8a8a8a" />
								<Button.Label>发图文</Button.Label>
							</Button>
							<Button
								variant="secondary"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								onPress={switchToNextChannel}
							>
								<Ionicons name="shuffle-outline" size={16} color="#8a8a8a" />
								<Button.Label>换频道</Button.Label>
							</Button>
							<Button
								variant="secondary"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={feed.isRefetching}
								onPress={() => {
									setIsQuickPanelOpen(false);
									refreshFeed();
								}}
							>
								{feed.isRefetching ? (
									<Spinner size="sm" />
								) : (
									<Ionicons name="refresh-outline" size={16} color="#8a8a8a" />
								)}
								<Button.Label>
									{feed.isRefetching ? "刷新中" : "刷新"}
								</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}
		</Surface>
	);
}
