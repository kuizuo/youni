import { Ionicons } from "@expo/vector-icons";
import { Tabs as RouterTabs } from "expo-router";
import {
	Button,
	Separator,
	Surface,
	Text,
	useThemeColor,
	useToast,
} from "heroui-native";
import type { ComponentProps } from "react";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { queryClient } from "@/utils/orpc";

type RouterTabBarProps = Parameters<
	NonNullable<ComponentProps<typeof RouterTabs>["tabBar"]>
>[0];

const tabIcons: Record<
	string,
	{
		active: keyof typeof Ionicons.glyphMap;
		inactive: keyof typeof Ionicons.glyphMap;
	}
> = {
	index: { active: "home", inactive: "home-outline" },
	search: { active: "search", inactive: "search-outline" },
	create: { active: "add", inactive: "add" },
	me: { active: "person", inactive: "person-outline" },
};
const tabHints: Record<string, string> = {
	index: "发现新内容",
	search: "搜索灵感",
	create: "开始发布",
	me: "查看我的",
};
const tabSubtitles: Record<string, string> = {
	index: "刷新推荐、切到搜索或直接发布灵感。",
	search: "继续找关键词、看热门或回发现页。",
	create: "整理草稿、补图片或发布前再预览。",
	me: "查看收藏、作品和个人主页动作。",
};

type QuickAction = {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	description: string;
	target?: string;
	params?: Record<string, string>;
	action?: "refresh-feed";
	toast: string;
};

const tabQuickActions: Record<string, QuickAction[]> = {
	index: [
		{
			icon: "sparkles-outline",
			label: "换一组推荐",
			description: "立即刷新发现页内容。",
			action: "refresh-feed",
			toast: "已为发现页准备刷新",
		},
		{
			icon: "search-outline",
			label: "搜同款灵感",
			description: "去搜索页继续查话题、作者和图文。",
			target: "search",
			toast: "去搜索灵感",
		},
		{
			icon: "add-circle-outline",
			label: "发布新图文",
			description: "把刚看到的灵感变成自己的笔记。",
			target: "create",
			params: { source: "tabbar", action: "starter" },
			toast: "开始发布",
		},
	],
	search: [
		{
			icon: "flame-outline",
			label: "看热门搜索",
			description: "保留在搜索页，继续观察热门词。",
			toast: "热门搜索已在上方",
		},
		{
			icon: "home-outline",
			label: "回发现流",
			description: "回到瀑布流继续刷推荐内容。",
			target: "index",
			toast: "回到发现",
		},
		{
			icon: "create-outline",
			label: "带灵感发布",
			description: "把搜索到的方向写成一篇新图文。",
			target: "create",
			params: { source: "tabbar", action: "search-starter" },
			toast: "去发布灵感",
		},
	],
	create: [
		{
			icon: "image-outline",
			label: "继续补图",
			description: "留在发布页整理封面和图片顺序。",
			target: "create",
			params: { source: "tabbar", action: "add-image" },
			toast: "可以继续添加图片",
		},
		{
			icon: "search-outline",
			label: "找话题参考",
			description: "去搜索页看看近期流行话题。",
			target: "search",
			toast: "去找话题",
		},
		{
			icon: "home-outline",
			label: "先逛一逛",
			description: "回到发现流，继续看社区内容。",
			target: "index",
			toast: "回到发现",
		},
	],
	me: [
		{
			icon: "bookmark-outline",
			label: "看我的收藏",
			description: "留在个人页切换到收藏内容。",
			target: "me",
			params: { shelf: "collections", source: "tabbar" },
			toast: "收藏入口在个人页下方",
		},
		{
			icon: "albums-outline",
			label: "看我的作品",
			description: "回到作品列表，检查自己发布过的图文。",
			target: "me",
			params: { shelf: "notes", source: "tabbar" },
			toast: "作品入口在个人页下方",
		},
		{
			icon: "add-circle-outline",
			label: "继续发布",
			description: "从个人页快速进入发布流程。",
			target: "create",
			toast: "继续发布",
		},
	],
};

export default function TabLayout() {
	const themeColorForeground = useThemeColor("foreground");
	const themeColorBackground = useThemeColor("background");

	return (
		<RouterTabs
			screenOptions={{
				headerShown: false,
				headerStyle: {
					backgroundColor: themeColorBackground,
				},
				headerTintColor: themeColorForeground,
				headerTitleStyle: {
					color: themeColorForeground,
					fontWeight: "600",
				},
			}}
			tabBar={(props) => <SocialTabBar {...props} />}
		>
			<RouterTabs.Screen
				name="index"
				options={{
					title: "发现",
				}}
			/>
			<RouterTabs.Screen
				name="search"
				options={{
					title: "搜索",
				}}
			/>
			<RouterTabs.Screen
				name="create"
				options={{
					title: "发布",
				}}
			/>
			<RouterTabs.Screen
				name="me"
				options={{
					title: "我的",
				}}
			/>
		</RouterTabs>
	);
}

function SocialTabBar({ state, descriptors, navigation }: RouterTabBarProps) {
	const insets = useSafeAreaInsets();
	const { toast } = useToast();
	const muted = useThemeColor("muted");
	const accentForeground = useThemeColor("accent-foreground");
	const danger = useThemeColor("danger");
	const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
	const [activeRouteName, setActiveRouteName] = useState(
		state.routes[state.index]?.name ?? "index",
	);
	const activeRoute = state.routes.find(
		(route) => route.name === activeRouteName,
	);
	const activeOptions = activeRoute
		? descriptors[activeRoute.key]?.options
		: null;
	const activeLabel = activeOptions?.title ?? activeRouteName;
	const activeIcon = tabIcons[activeRouteName] ?? tabIcons.index;
	const activeActions =
		tabQuickActions[activeRouteName] ?? tabQuickActions.index;
	const openQuickActions = (routeName: string, label: string) => {
		setActiveRouteName(routeName);
		setIsActionSheetOpen(true);
		toast.show({ label: `${label}快捷动作`, duration: 900 });
	};
	const runQuickAction = (action: QuickAction) => {
		setIsActionSheetOpen(false);
		toast.show({ label: action.toast, duration: 1000 });
		if (action.action === "refresh-feed") {
			void queryClient.refetchQueries().then(() => {
				toast.show({ variant: "success", label: "推荐已更新", duration: 1200 });
			});
		}
		if (action.target) {
			const actionParams = action.params
				? { ...action.params, actionAt: String(Date.now()) }
				: undefined;
			navigation.navigate(action.target, actionParams);
		}
	};

	return (
		<Surface variant="transparent" className="p-0">
			<Surface
				variant="default"
				className="border-content3 border-t px-3 pt-2"
				style={{ paddingBottom: Math.max(insets.bottom, 8) }}
			>
				<Surface
					variant="transparent"
					className="flex-row items-end justify-between gap-1 p-0"
				>
					{state.routes.map((route, index) => {
						const { options } = descriptors[route.key];
						const focused = state.index === index;
						const label =
							typeof options.tabBarLabel === "string"
								? options.tabBarLabel
								: options.title || route.name;
						const isCreate = route.name === "create";
						const icon = tabIcons[route.name] ?? tabIcons.index;
						const hint = tabHints[route.name] ?? String(label);
						const iconColor = focused
							? isCreate
								? accentForeground
								: danger
							: muted;

						const onPress = () => {
							const event = navigation.emit({
								type: "tabPress",
								target: route.key,
								canPreventDefault: true,
							});

							if (!focused && !event.defaultPrevented) {
								navigation.navigate(route.name);
								toast.show({ label: hint, duration: 900 });
								return;
							}
							openQuickActions(route.name, String(label));
						};

						const onLongPress = () => {
							navigation.emit({
								type: "tabLongPress",
								target: route.key,
							});
							openQuickActions(route.name, String(label));
						};

						return (
							<Button
								key={route.key}
								variant={
									isCreate ? (focused ? "primary" : "danger-soft") : "ghost"
								}
								size={isCreate ? "md" : "sm"}
								feedbackVariant="scale-ripple"
								accessibilityLabel={options.tabBarAccessibilityLabel}
								onPress={onPress}
								onLongPress={onLongPress}
								className={
									isCreate
										? "-mt-7 h-16 min-w-20 rounded-full px-4 shadow-lg"
										: focused
											? "flex-1 rounded-3xl px-1"
											: "flex-1 rounded-2xl px-1"
								}
							>
								<Surface
									variant="transparent"
									className={
										isCreate ? "items-center gap-1 p-0" : "items-center p-0"
									}
								>
									{focused && !isCreate ? (
										<Surface className="mb-0.5 h-1 w-5 rounded-full bg-danger p-0" />
									) : null}
									<Ionicons
										name={focused ? icon.active : icon.inactive}
										size={isCreate ? 22 : 20}
										color={iconColor}
									/>
									<Text.Paragraph
										type="body-xs"
										weight={focused ? "semibold" : "medium"}
										className={focused && !isCreate ? "text-danger" : ""}
										color={focused && !isCreate ? "default" : "muted"}
									>
										{label}
									</Text.Paragraph>
									{isCreate ? (
										<Text.Paragraph
											type="body-xs"
											className="text-[10px] text-accent-foreground/80"
										>
											灵感
										</Text.Paragraph>
									) : null}
								</Surface>
							</Button>
						);
					})}
				</Surface>
			</Surface>

			{isActionSheetOpen ? (
				<Surface
					variant="default"
					className="border-content3 border-t px-3 py-3"
				>
					<Surface
						variant="secondary"
						className="gap-4 rounded-[28px] p-4 shadow-lg"
					>
						<Surface variant="transparent" className="gap-4 p-0">
							<Surface
								variant="transparent"
								className="flex-row items-start justify-between gap-3 p-0"
							>
								<Surface variant="transparent" className="flex-1 gap-1 p-0">
									<Surface className="mb-1 h-11 w-11 items-center justify-center rounded-full bg-danger-soft p-0">
										<Ionicons
											name={activeIcon.active}
											size={21}
											color={danger}
										/>
									</Surface>
									<Text.Paragraph
										weight="semibold"
										className="text-foreground text-xl"
									>
										{activeLabel}快捷动作
									</Text.Paragraph>
									<Text.Paragraph type="body-sm" color="muted">
										{tabSubtitles[activeRouteName] ?? "选择下一步操作。"}
									</Text.Paragraph>
								</Surface>
								<Button
									isIconOnly
									size="sm"
									variant="ghost"
									feedbackVariant="scale-ripple"
									accessibilityLabel="关闭快捷动作"
									onPress={() => {
										setIsActionSheetOpen(false);
										toast.show({ label: "已收起快捷动作", duration: 800 });
									}}
								>
									<Ionicons name="close" size={18} color={muted} />
								</Button>
							</Surface>

							<Separator />

							<Surface variant="transparent" className="gap-2 p-0">
								{activeActions.map((action) => (
									<Button
										key={action.label}
										variant="secondary"
										feedbackVariant="scale-ripple"
										onPress={() => runQuickAction(action)}
										className="min-h-16 justify-start rounded-3xl px-4 py-3"
									>
										<Surface className="h-10 w-10 items-center justify-center rounded-full bg-background p-0">
											<Ionicons name={action.icon} size={19} color={danger} />
										</Surface>
										<Surface
											variant="transparent"
											className="flex-1 items-start gap-0.5 p-0"
										>
											<Button.Label className="text-left">
												{action.label}
											</Button.Label>
											<Text.Paragraph
												type="body-xs"
												color="muted"
												className="text-left"
											>
												{action.description}
											</Text.Paragraph>
										</Surface>
										<Ionicons name="chevron-forward" size={16} color={muted} />
									</Button>
								))}
							</Surface>

							<Button
								variant="ghost"
								feedbackVariant="scale-ripple"
								onPress={() => {
									setIsActionSheetOpen(false);
									toast.show({ label: "继续浏览", duration: 800 });
								}}
							>
								<Button.Label>继续浏览</Button.Label>
							</Button>
						</Surface>
					</Surface>
				</Surface>
			) : null}
		</Surface>
	);
}
