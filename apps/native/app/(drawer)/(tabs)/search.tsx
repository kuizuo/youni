import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	Card,
	SearchField,
	Spinner,
	Surface,
	Tabs,
	Text,
	useToast,
} from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";

import { NoteCard } from "@/components/note-card";
import {
	EmptyState,
	ErrorState,
	FeedSkeleton,
} from "@/components/social-states";
import { orpc } from "@/utils/orpc";

const hotKeywords = ["穿搭", "咖啡", "周末", "旅行", "好物", "灵感"];
const searchScenarios = [
	{
		label: "今天穿什么",
		keyword: "穿搭",
		description: "通勤、低饱和、初夏配色",
		icon: "shirt-outline",
	},
	{
		label: "周末去哪",
		keyword: "旅行",
		description: "城市散步、出片地点、短途路线",
		icon: "map-outline",
	},
	{
		label: "吃点什么",
		keyword: "咖啡",
		description: "咖啡馆、早午餐、轻食清单",
		icon: "cafe-outline",
	},
	{
		label: "想买好物",
		keyword: "好物",
		description: "生活清单、真实体验、收藏款",
		icon: "bag-handle-outline",
	},
] as const;
const trendCards = [
	{ label: "城市散步", keyword: "旅行", count: "32k", icon: "walk-outline" },
	{ label: "冰拿铁", keyword: "咖啡", count: "18k", icon: "cafe-outline" },
	{ label: "蓝白衬衫", keyword: "穿搭", count: "12k", icon: "shirt-outline" },
] as const;
const searchModes = [
	{
		value: "comprehensive",
		label: "综合",
		description: "优先看相关度和近期内容",
		icon: "sparkles-outline",
	},
	{
		value: "latest",
		label: "最新",
		description: "按发布时间从新到旧",
		icon: "time-outline",
	},
	{
		value: "liked",
		label: "高赞",
		description: "优先看互动更高的图文",
		icon: "heart-outline",
	},
	{
		value: "collected",
		label: "收藏",
		description: "优先看更容易被收藏的内容",
		icon: "bookmark-outline",
	},
] as const;

type SearchMode = (typeof searchModes)[number]["value"];

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function SearchScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		keyword?: string | string[];
		source?: string | string[];
		actionAt?: string | string[];
	}>();
	const handledExternalSearch = useRef<string | null>(null);
	const [keyword, setKeyword] = useState("");
	const [recentKeywords, setRecentKeywords] = useState<string[]>([]);
	const [savedKeywords, setSavedKeywords] = useState<string[]>([]);
	const [activePanel, setActivePanel] = useState<"discover" | "results">(
		"discover",
	);
	const [searchMode, setSearchMode] = useState<SearchMode>("comprehensive");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [searchHint, setSearchHint] = useState(
		"热门词、话题和生活场景都在这里。",
	);
	const { toast } = useToast();
	const trimmedKeyword = keyword.trim();
	const input = useMemo(
		() => ({ keyword: trimmedKeyword || undefined, limit: 40 }),
		[trimmedKeyword],
	);
	const notes = useQuery(orpc.social.feed.queryOptions({ input }));
	const topics = useQuery(
		orpc.social.topics.queryOptions({
			input: { keyword: trimmedKeyword || undefined, limit: 12 },
		}),
	);
	const sortedNotes = useMemo(() => {
		const items = [...(notes.data ?? [])];
		if (searchMode === "latest") {
			return items.sort(
				(a, b) =>
					new Date(b.publishedAt ?? b.createdAt).getTime() -
					new Date(a.publishedAt ?? a.createdAt).getTime(),
			);
		}
		if (searchMode === "liked") {
			return items.sort((a, b) => b.likedCount - a.likedCount);
		}
		if (searchMode === "collected") {
			return items.sort(
				(a, b) => (b.collectedCount ?? 0) - (a.collectedCount ?? 0),
			);
		}
		return items;
	}, [notes.data, searchMode]);
	const activeMode =
		searchModes.find((item) => item.value === searchMode) ?? searchModes[0];
	const isSearchSaved = trimmedKeyword
		? savedKeywords.includes(trimmedKeyword)
		: false;

	const showFeedback = (label: string, description?: string) => {
		setSearchHint(description ?? label);
		toast.show({ label, description, duration: 1300 });
	};
	const handleKeywordChange = (value: string) => {
		setKeyword(value);
		if (!value.trim()) {
			setActivePanel("discover");
			setSearchHint("热门词、话题和生活场景都在这里。");
			return;
		}
		setSearchHint(`正在输入「${value.trim()}」，按搜索查看结果。`);
	};
	const rememberKeyword = (value: string) => {
		const nextKeyword = value.trim();
		if (!nextKeyword) return;
		setRecentKeywords((items) =>
			[nextKeyword, ...items.filter((item) => item !== nextKeyword)].slice(
				0,
				6,
			),
		);
	};
	const activateKeyword = (value: string) => {
		setKeyword(value);
		setActivePanel("results");
		rememberKeyword(value);
		showFeedback(
			`正在看「${value}」`,
			"已切到搜索结果，图文会按当前排序展示。",
		);
	};
	useEffect(() => {
		const nextKeyword = getRouteParam(params.keyword)?.trim();
		if (!nextKeyword) return;
		const source = getRouteParam(params.source) ?? "external";
		const actionAt = getRouteParam(params.actionAt) ?? "";
		const actionKey = `${source}:${nextKeyword}:${actionAt}`;
		if (handledExternalSearch.current === actionKey) return;
		handledExternalSearch.current = actionKey;

		setKeyword(nextKeyword);
		setActivePanel("results");
		setRecentKeywords((items) =>
			[nextKeyword, ...items.filter((item) => item !== nextKeyword)].slice(
				0,
				6,
			),
		);
		const sourceLabel =
			source === "note-topic"
				? "从图文话题进入"
				: source === "similar"
					? "正在找相似内容"
					: "已带入搜索";
		setSearchHint(`${sourceLabel}，正在看「${nextKeyword}」。`);
		toast.show({
			variant: "accent",
			label: sourceLabel,
			description: `已为你筛选「${nextKeyword}」相关图文。`,
			duration: 1300,
		});
	}, [params.actionAt, params.keyword, params.source, toast]);
	const activateScenario = (scenario: (typeof searchScenarios)[number]) => {
		setKeyword(scenario.keyword);
		setActivePanel("results");
		rememberKeyword(scenario.keyword);
		showFeedback(
			`正在看「${scenario.label}」`,
			`${scenario.description} · 已按「${scenario.keyword}」筛选`,
		);
	};
	const activateTrend = (trend: (typeof trendCards)[number]) => {
		setKeyword(trend.keyword);
		setActivePanel("results");
		rememberKeyword(trend.keyword);
		showFeedback(
			`正在看 ${trend.label}`,
			`${trend.count} 人在看 · 已按「${trend.keyword}」筛选`,
		);
	};
	const selectSearchMode = (value: SearchMode) => {
		setSearchMode(value);
		const mode = searchModes.find((item) => item.value === value);
		setSearchHint(mode?.description ?? "已更新排序方式。");
		toast.show({
			variant: "accent",
			label: `已切到${mode?.label ?? "综合"}`,
			description: mode?.description,
			duration: 1400,
		});
	};

	const selectTopic = (name: string) => {
		const active = trimmedKeyword === name;
		setKeyword(active ? "" : name);
		setActivePanel(active ? "discover" : "results");
		if (!active) rememberKeyword(name);
		showFeedback(
			active ? "已清空筛选" : `正在看 #${name}`,
			active ? "回到热门发现。" : "已按话题筛选图文和相关内容。",
		);
	};

	const submitSearch = () => {
		if (!trimmedKeyword) {
			showFeedback("输入关键词开始搜索", "也可以直接点下方热门词。");
			return;
		}
		setActivePanel("results");
		rememberKeyword(trimmedKeyword);
		showFeedback(
			`正在搜索「${trimmedKeyword}」`,
			"搜索结果会同时匹配图文和话题。",
		);
		notes.refetch();
		topics.refetch();
	};

	const clearKeyword = () => {
		setKeyword("");
		setActivePanel("discover");
		showFeedback("已清空搜索", "可以重新选择热门词或话题。");
	};
	const clearRecent = () => {
		setRecentKeywords([]);
		showFeedback("已清空最近搜索", "最近搜索记录已恢复为空。");
	};
	const clearSavedSearches = () => {
		setSavedKeywords([]);
		showFeedback("已清空收藏搜索", "可以重新收藏常看的灵感方向。");
	};
	const toggleSavedSearch = () => {
		if (!trimmedKeyword) {
			showFeedback("先选一个关键词", "点热门词或输入内容后再收藏搜索。");
			return;
		}
		const nextSaved = !isSearchSaved;
		setSavedKeywords((items) =>
			nextSaved
				? [trimmedKeyword, ...items.filter((item) => item !== trimmedKeyword)]
				: items.filter((item) => item !== trimmedKeyword),
		);
		showFeedback(
			nextSaved ? "已收藏这个搜索" : "已取消收藏搜索",
			nextSaved
				? `之后可以继续找「${trimmedKeyword}」相关灵感。`
				: `「${trimmedKeyword}」已从收藏搜索移除。`,
		);
	};
	const startCreateFromSearch = () => {
		if (!trimmedKeyword) {
			showFeedback("先找一个灵感方向", "选择热门词后再写同款更自然。");
			return;
		}
		showFeedback("去写同款", `把「${trimmedKeyword}」整理成自己的图文。`);
		router.push("/create" as Href);
	};

	const refreshResults = async () => {
		showFeedback("正在刷新结果", "正在同步最新图文和话题。");
		await Promise.all([notes.refetch(), topics.refetch()]);
		toast.show({ variant: "success", label: "搜索结果已更新", duration: 1300 });
		setSearchHint("搜索结果已更新。");
	};

	return (
		<Card.Body className="relative flex-1 bg-background p-0">
			<FlatList
				data={sortedNotes}
				keyExtractor={(item) => item.id}
				numColumns={2}
				contentInsetAdjustmentBehavior="automatic"
				columnWrapperClassName="gap-3 px-3"
				contentContainerClassName="mx-auto w-full max-w-3xl gap-3 bg-background py-3"
				ListHeaderComponent={
					<Card.Body className="gap-4 px-3 pb-1">
						<Card className="gap-4 rounded-3xl p-4">
							<Card.Header className="flex-row items-start justify-between gap-3">
								<Card.Body className="flex-1 gap-1">
									<Text.Heading type="h2">搜索</Text.Heading>
									<Text.Paragraph color="muted" type="body-sm">
										找图文、话题和生活灵感。
									</Text.Paragraph>
								</Card.Body>
								<Button
									size="sm"
									variant="ghost"
									feedbackVariant="scale-ripple"
									isDisabled={notes.isRefetching || topics.isRefetching}
									onPress={refreshResults}
								>
									{notes.isRefetching || topics.isRefetching ? (
										<Spinner size="sm" />
									) : null}
									<Button.Label>
										{notes.isRefetching || topics.isRefetching
											? "刷新中"
											: "刷新"}
									</Button.Label>
								</Button>
							</Card.Header>
							<SearchField value={keyword} onChange={handleKeywordChange}>
								<SearchField.Group className="rounded-full bg-content2">
									<SearchField.SearchIcon />
									<SearchField.Input
										placeholder="搜索图文或话题"
										className="rounded-full bg-transparent"
										returnKeyType="search"
										onSubmitEditing={submitSearch}
									/>
									<SearchField.ClearButton
										variant="ghost"
										size="sm"
										onPress={clearKeyword}
									/>
								</SearchField.Group>
							</SearchField>
							<Card.Footer className="flex-row gap-2">
								<Button
									variant="secondary"
									feedbackVariant="scale-ripple"
									className="flex-1"
									onPress={submitSearch}
								>
									<Ionicons name="search-outline" size={16} color="#8a8a8a" />
									<Button.Label>搜索</Button.Label>
								</Button>
								<Button
									variant="secondary"
									feedbackVariant="scale-ripple"
									className="flex-1"
									onPress={() => {
										setIsFilterOpen(true);
										showFeedback("打开搜索筛选", "选择你想优先看的内容顺序。");
									}}
								>
									<Ionicons name="options-outline" size={16} color="#8a8a8a" />
									<Button.Label>{activeMode.label}</Button.Label>
								</Button>
							</Card.Footer>
							<Surface
								variant="secondary"
								className="flex-row items-center gap-2 rounded-2xl bg-danger-soft px-3 py-2"
							>
								<Ionicons name={activeMode.icon} size={15} color="#f43f5e" />
								<Text.Paragraph
									type="body-sm"
									weight="semibold"
									className="flex-1 text-danger"
									numberOfLines={2}
								>
									{searchHint}
								</Text.Paragraph>
							</Surface>
							<Card.Footer className="flex-row flex-wrap gap-2">
								{searchModes.map((item) => (
									<Button
										key={item.value}
										size="sm"
										variant={
											searchMode === item.value ? "primary" : "secondary"
										}
										feedbackVariant="scale-ripple"
										onPress={() => selectSearchMode(item.value)}
									>
										<Ionicons
											name={item.icon}
											size={14}
											color={searchMode === item.value ? "#ffffff" : "#8a8a8a"}
										/>
										<Button.Label>{item.label}</Button.Label>
									</Button>
								))}
							</Card.Footer>
							<Card.Footer className="flex-row flex-wrap gap-2">
								{hotKeywords.map((item) => (
									<Button
										key={item}
										size="sm"
										variant={trimmedKeyword === item ? "primary" : "outline"}
										feedbackVariant="scale-ripple"
										onPress={() => activateKeyword(item)}
									>
										<Ionicons
											name="flame-outline"
											size={14}
											color={trimmedKeyword === item ? "#ffffff" : "#f43f5e"}
										/>
										<Button.Label>{item}</Button.Label>
									</Button>
								))}
							</Card.Footer>
							{trimmedKeyword ? (
								<Surface
									variant="secondary"
									className="flex-row items-center justify-between rounded-2xl px-3 py-2"
								>
									<Text.Paragraph
										className="flex-1"
										type="body-sm"
										numberOfLines={1}
									>
										当前搜索：{trimmedKeyword}
									</Text.Paragraph>
									<Button
										size="sm"
										variant="ghost"
										feedbackVariant="scale-ripple"
										onPress={clearKeyword}
									>
										<Button.Label>清空搜索</Button.Label>
									</Button>
								</Surface>
							) : null}
							{trimmedKeyword ? (
								<Surface
									variant="secondary"
									className="gap-3 rounded-2xl border border-border px-3 py-3"
								>
									<Card.Footer className="flex-row items-center gap-2 p-0">
										<Surface className="size-9 items-center justify-center rounded-full bg-danger-soft p-0">
											<Ionicons
												name={isSearchSaved ? "bookmark" : "sparkles-outline"}
												size={17}
												color="#f43f5e"
											/>
										</Surface>
										<Card.Body className="min-w-0 flex-1 gap-0.5 p-0">
											<Text.Paragraph weight="semibold" type="body-sm">
												{isSearchSaved ? "已收藏这个搜索" : "继续处理这次搜索"}
											</Text.Paragraph>
											<Text.Paragraph color="muted" type="body-xs">
												{sortedNotes.length} 篇图文 · {activeMode.description}
											</Text.Paragraph>
										</Card.Body>
									</Card.Footer>
									<Card.Footer className="flex-row gap-2 p-0">
										<Button
											size="sm"
											variant={isSearchSaved ? "primary" : "secondary"}
											feedbackVariant="scale-ripple"
											className="flex-1"
											onPress={toggleSavedSearch}
										>
											<Ionicons
												name={isSearchSaved ? "bookmark" : "bookmark-outline"}
												size={14}
												color={isSearchSaved ? "#ffffff" : "#8a8a8a"}
											/>
											<Button.Label>
												{isSearchSaved ? "已收藏" : "收藏搜索"}
											</Button.Label>
										</Button>
										<Button
											size="sm"
											variant="primary"
											feedbackVariant="scale-ripple"
											className="flex-1"
											onPress={startCreateFromSearch}
										>
											<Ionicons
												name="create-outline"
												size={14}
												color="#ffffff"
											/>
											<Button.Label>写同款</Button.Label>
										</Button>
										<Button
											size="sm"
											variant="secondary"
											feedbackVariant="scale-ripple"
											className="flex-1"
											onPress={() => {
												setIsFilterOpen(true);
												showFeedback(
													"打开排序",
													"可以按最新、高赞或收藏重新看结果。",
												);
											}}
										>
											<Ionicons
												name="options-outline"
												size={14}
												color="#8a8a8a"
											/>
											<Button.Label>换排序</Button.Label>
										</Button>
									</Card.Footer>
								</Surface>
							) : null}
						</Card>
						<Card className="gap-4 rounded-3xl p-4">
							<Card.Header className="flex-row items-center justify-between p-0">
								<Card.Body className="gap-0.5 p-0">
									<Text.Paragraph weight="medium" type="body-sm">
										今天想搜什么
									</Text.Paragraph>
									<Text.Paragraph color="muted" type="body-xs">
										按生活场景整理的灵感入口
									</Text.Paragraph>
								</Card.Body>
								<Button
									size="sm"
									variant="ghost"
									feedbackVariant="scale-ripple"
									onPress={() => {
										setKeyword("");
										setActivePanel("discover");
										showFeedback(
											"已回到灵感发现",
											"可以重新选择一个搜索场景。",
										);
									}}
								>
									<Ionicons name="refresh-outline" size={14} color="#f43f5e" />
									<Button.Label>重选</Button.Label>
								</Button>
							</Card.Header>
							<Surface
								variant="transparent"
								className="flex-row flex-wrap gap-2 p-0"
							>
								{searchScenarios.map((scenario) => {
									const active = trimmedKeyword === scenario.keyword;

									return (
										<Button
											key={scenario.label}
											size="lg"
											variant={active ? "primary" : "secondary"}
											feedbackVariant="scale-ripple"
											className="min-h-20 min-w-[47%] flex-1 justify-start rounded-2xl px-3 py-3"
											onPress={() => activateScenario(scenario)}
										>
											<Surface
												variant="transparent"
												className="size-9 items-center justify-center rounded-full bg-danger-soft p-0"
											>
												<Ionicons
													name={scenario.icon}
													size={18}
													color={active ? "#ffffff" : "#f43f5e"}
												/>
											</Surface>
											<Surface
												variant="transparent"
												className="flex-1 items-start gap-0.5 p-0"
											>
												<Button.Label>{scenario.label}</Button.Label>
												<Text.Paragraph
													color={active ? "default" : "muted"}
													type="body-xs"
													numberOfLines={2}
												>
													{scenario.description}
												</Text.Paragraph>
											</Surface>
										</Button>
									);
								})}
							</Surface>
						</Card>
						<Card className="gap-3 rounded-3xl p-4">
							<Card.Header className="flex-row items-center justify-between p-0">
								<Card.Body className="gap-0.5 p-0">
									<Text.Paragraph weight="medium" type="body-sm">
										实时趋势
									</Text.Paragraph>
									<Text.Paragraph color="muted" type="body-xs">
										大家正在搜这些
									</Text.Paragraph>
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
										热
									</Text.Paragraph>
								</Surface>
							</Card.Header>
							<Surface
								variant="transparent"
								className="flex-row flex-wrap gap-2 p-0"
							>
								{trendCards.map((trend, index) => {
									const active = trimmedKeyword === trend.keyword;

									return (
										<Button
											key={trend.label}
											size="md"
											variant={active ? "primary" : "outline"}
											feedbackVariant="scale-ripple"
											className="min-w-[31%] flex-1 flex-col items-start rounded-2xl px-3 py-3"
											onPress={() => activateTrend(trend)}
										>
											<Surface
												variant="transparent"
												className="flex-row items-center gap-1 p-0"
											>
												<Text.Paragraph
													type="body-xs"
													weight="bold"
													className={active ? "text-white" : "text-danger"}
												>
													{index + 1}
												</Text.Paragraph>
												<Ionicons
													name={trend.icon}
													size={14}
													color={active ? "#ffffff" : "#f43f5e"}
												/>
											</Surface>
											<Button.Label>{trend.label}</Button.Label>
											<Text.Paragraph
												color={active ? "default" : "muted"}
												type="body-xs"
											>
												{trend.count} 正在看
											</Text.Paragraph>
										</Button>
									);
								})}
							</Surface>
						</Card>
						{recentKeywords.length > 0 ? (
							<Card className="gap-3 rounded-3xl p-4">
								<Card.Header className="flex-row items-center justify-between">
									<Card.Body className="gap-0.5">
										<Text.Paragraph weight="semibold">最近搜索</Text.Paragraph>
										<Text.Paragraph color="muted" type="body-xs">
											点一下就能继续看
										</Text.Paragraph>
									</Card.Body>
									<Button
										size="sm"
										variant="ghost"
										feedbackVariant="scale-ripple"
										onPress={clearRecent}
									>
										<Button.Label>清空记录</Button.Label>
									</Button>
								</Card.Header>
								<Card.Footer className="flex-row flex-wrap gap-2">
									{recentKeywords.map((item) => (
										<Button
											key={item}
											size="md"
											variant={
												trimmedKeyword === item ? "primary" : "secondary"
											}
											feedbackVariant="scale-ripple"
											onPress={() => activateKeyword(item)}
										>
											<Ionicons
												name="time-outline"
												size={14}
												color={trimmedKeyword === item ? "#ffffff" : "#8a8a8a"}
											/>
											<Button.Label>{item}</Button.Label>
										</Button>
									))}
								</Card.Footer>
							</Card>
						) : null}
						{savedKeywords.length > 0 ? (
							<Card className="gap-3 rounded-3xl p-4">
								<Card.Header className="flex-row items-center justify-between">
									<Card.Body className="gap-0.5">
										<Text.Paragraph weight="semibold">
											收藏的搜索
										</Text.Paragraph>
										<Text.Paragraph color="muted" type="body-xs">
											常看的方向可以从这里继续进入
										</Text.Paragraph>
									</Card.Body>
									<Button
										size="sm"
										variant="ghost"
										feedbackVariant="scale-ripple"
										onPress={clearSavedSearches}
									>
										<Ionicons name="trash-outline" size={14} color="#8a8a8a" />
										<Button.Label>清空收藏</Button.Label>
									</Button>
								</Card.Header>
								<Card.Footer className="flex-row flex-wrap gap-2">
									{savedKeywords.map((item) => (
										<Button
											key={item}
											size="md"
											variant={
												trimmedKeyword === item ? "primary" : "secondary"
											}
											feedbackVariant="scale-ripple"
											onPress={() => activateKeyword(item)}
										>
											<Ionicons
												name={
													trimmedKeyword === item
														? "bookmark"
														: "bookmark-outline"
												}
												size={14}
												color={trimmedKeyword === item ? "#ffffff" : "#f59e0b"}
											/>
											<Button.Label>{item}</Button.Label>
										</Button>
									))}
								</Card.Footer>
							</Card>
						) : null}
						<Tabs
							value={activePanel}
							onValueChange={(value) => {
								if (value === "discover" || value === "results") {
									setActivePanel(value);
									showFeedback(value === "discover" ? "查看发现" : "查看结果");
								}
							}}
							variant="primary"
						>
							<Tabs.List>
								<Tabs.Indicator />
								<Tabs.Trigger value="discover">
									<Tabs.Label>发现</Tabs.Label>
								</Tabs.Trigger>
								<Tabs.Trigger value="results">
									<Tabs.Label>结果</Tabs.Label>
								</Tabs.Trigger>
							</Tabs.List>
						</Tabs>
						<Card className="gap-3 rounded-3xl p-4">
							<Card.Header className="flex-row items-center justify-between">
								<Text.Paragraph weight="medium" type="body-sm">
									{activePanel === "discover" ? "热门话题" : "相关话题"}
								</Text.Paragraph>
								{topics.isFetching ? <Spinner size="sm" /> : null}
							</Card.Header>
							<Card.Footer className="flex-row flex-wrap gap-2">
								{topics.isError ? (
									<Text.Paragraph color="muted" type="body-xs">
										话题暂时加载失败
									</Text.Paragraph>
								) : null}
								{topics.data?.map((item) => {
									const active = trimmedKeyword === item.name;
									return (
										<Button
											key={item.id}
											size="md"
											variant={active ? "primary" : "secondary"}
											feedbackVariant="scale-ripple"
											onPress={() => selectTopic(item.name)}
										>
											<Ionicons
												name={active ? "checkmark-circle" : "pricetag-outline"}
												size={14}
												color={active ? "#ffffff" : "#f43f5e"}
											/>
											<Button.Label>
												#{item.name} · {item.noteCount}
											</Button.Label>
										</Button>
									);
								})}
							</Card.Footer>
						</Card>
						<Card.Header className="flex-row items-center justify-between px-1">
							<Text.Paragraph weight="medium" type="body-sm">
								{activePanel === "discover" && !trimmedKeyword
									? "推荐内容"
									: "搜索结果"}
							</Text.Paragraph>
							<Text.Paragraph color="muted" type="body-xs">
								{sortedNotes.length} 篇 · {activeMode.label}
							</Text.Paragraph>
						</Card.Header>
						<Surface
							variant="secondary"
							className="flex-row items-center justify-between rounded-2xl px-3 py-2"
						>
							<Card.Body className="gap-0.5">
								<Text.Paragraph weight="medium" type="body-sm">
									{trimmedKeyword
										? `正在看「${trimmedKeyword}」`
										: "先从热门话题开始"}
								</Text.Paragraph>
								<Text.Paragraph color="muted" type="body-xs">
									{trimmedKeyword
										? `图文和话题会一起刷新 · ${activeMode.description}`
										: `点话题或输入关键词都能快速筛选 · ${activeMode.label}`}
								</Text.Paragraph>
							</Card.Body>
							{notes.isFetching || topics.isFetching ? (
								<Spinner size="sm" />
							) : null}
						</Surface>
						{notes.isFetching && !notes.isLoading ? (
							<Surface
								variant="secondary"
								className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
							>
								<Spinner size="sm" />
								<Text.Paragraph color="muted" type="body-sm">
									正在更新结果
								</Text.Paragraph>
							</Surface>
						) : null}
					</Card.Body>
				}
				renderItem={({ item }) => <NoteCard note={item} />}
				ListEmptyComponent={
					notes.isLoading ? (
						<FeedSkeleton />
					) : notes.isError ? (
						<ErrorState
							title="搜索失败"
							description="暂时找不到结果，请检查网络后重试。"
							onRetry={() => notes.refetch()}
						/>
					) : (
						<EmptyState
							icon="search-outline"
							title="没有匹配内容"
							description="换个关键词试试，或者点一个热门话题。"
							actionLabel="看旅行灵感"
							onAction={() => activateKeyword("旅行")}
						/>
					)
				}
			/>
			{isFilterOpen ? (
				<Surface className="absolute inset-0 justify-end bg-black/35 p-3">
					<Button
						variant="ghost"
						className="absolute inset-0 rounded-none"
						feedbackVariant="none"
						onPress={() => setIsFilterOpen(false)}
					/>
					<Card className="gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between">
							<Card.Body className="min-w-0 flex-1 gap-1 p-0">
								<Card.Title>搜索筛选</Card.Title>
								<Card.Description>
									选择你想看的结果顺序，搜索页会立即重排。
								</Card.Description>
							</Card.Body>
							<Button
								isIconOnly
								size="sm"
								variant="secondary"
								feedbackVariant="scale-highlight"
								onPress={() => setIsFilterOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card.Body className="gap-2">
							{searchModes.map((item) => (
								<Button
									key={item.value}
									variant={searchMode === item.value ? "primary" : "secondary"}
									feedbackVariant="scale-ripple"
									className="justify-start"
									onPress={() => {
										selectSearchMode(item.value);
										setIsFilterOpen(false);
									}}
								>
									<Ionicons
										name={item.icon}
										size={18}
										color={searchMode === item.value ? "#ffffff" : "#8a8a8a"}
									/>
									<Card.Body className="gap-0">
										<Button.Label>{item.label}</Button.Label>
										<Text.Paragraph color="muted" type="body-xs">
											{item.description}
										</Text.Paragraph>
									</Card.Body>
								</Button>
							))}
						</Card.Body>
						<Card.Footer className="flex-row gap-2">
							<Button
								variant="secondary"
								feedbackVariant="scale-highlight"
								className="flex-1"
								onPress={() => {
									setSearchMode("comprehensive");
									setIsFilterOpen(false);
									showFeedback("已恢复综合排序");
								}}
							>
								<Button.Label>恢复默认</Button.Label>
							</Button>
							<Button
								variant="primary"
								feedbackVariant="scale-ripple"
								className="flex-1"
								onPress={() => {
									setIsFilterOpen(false);
									submitSearch();
								}}
							>
								<Button.Label>应用搜索</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}
		</Card.Body>
	);
}
