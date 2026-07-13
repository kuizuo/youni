import {
	Bars,
	Bell,
	ChartColumn,
	Check,
	Comment,
	FileText,
	Gear,
	Hashtag,
	Magnifier,
	Persons,
	SquareBars,
	Xmark,
} from "@gravity-ui/icons";
import {
	Button,
	Chip,
	Drawer,
	Modal,
	Skeleton,
	Tooltip,
	useOverlayState,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { AdminPermissionRequest } from "@youni/auth/permissions";
import type { ComponentPropsWithRef, ComponentType, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import UserMenu from "@/components/user-menu";
import { checkAdminRolePermission } from "@/lib/admin-permissions";
import { orpc } from "@/utils/orpc";

type AdminRouteTo =
	| "/admin"
	| "/admin/analytics"
	| "/admin/notes"
	| "/admin/profile"
	| "/admin/settings"
	| "/admin/topics"
	| "/admin/users";

type AdminNavItem = {
	readonly href: AdminRouteTo;
	readonly label: string;
	readonly icon: ComponentType<{ className?: string }>;
	readonly permission: AdminPermissionRequest;
	readonly badge?: string;
};

type AdminUser = {
	readonly name?: string | null;
	readonly email?: string | null;
	readonly image?: string | null;
	readonly role?: string | null;
};

type AdminSearchItem = AdminNavItem & {
	readonly description?: string;
	readonly keywords: string;
};

const NAV_ITEMS: readonly AdminNavItem[] = [
	{
		href: "/admin",
		icon: ChartColumn,
		label: "概览",
		permission: { dashboard: ["view"] },
	},
	{
		href: "/admin/analytics",
		icon: Magnifier,
		label: "推荐与搜索",
		permission: { analytics: ["view"] },
	},
	{
		href: "/admin/notes",
		icon: FileText,
		label: "图文",
		permission: { note: ["list"] },
	},
	{
		href: "/admin/topics",
		icon: Hashtag,
		label: "话题",
		permission: { topic: ["list"] },
	},
	{
		href: "/admin/users",
		icon: Persons,
		label: "用户",
		permission: { user: ["list"] },
	},
	{
		href: "/admin/settings",
		icon: Gear,
		label: "设置",
		permission: { profile: ["view"] },
	},
] as const;

const SEARCH_ITEMS = [
	{
		description: "查看指标、最近图文和运营提示。",
		href: "/admin",
		icon: ChartColumn,
		keywords: "dashboard overview 指标 数据 最近图文",
		label: "概览",
		permission: { dashboard: ["view"] },
	},
	{
		description: "查看发现页效果、搜索趋势和无结果关键词。",
		href: "/admin/analytics",
		icon: Magnifier,
		keywords: "recommendation search analytics trend 推荐 搜索 趋势",
		label: "推荐与搜索",
		permission: { analytics: ["view"] },
	},
	{
		description: "搜索、筛选、审核、隐藏或删除图文。",
		href: "/admin/notes",
		icon: FileText,
		keywords: "notes posts audit review publish hidden delete 图文 审核",
		label: "图文管理",
		permission: { note: ["list"] },
	},
	{
		description: "新增、编辑、删除话题并查看使用量。",
		href: "/admin/topics",
		icon: Hashtag,
		keywords: "topics hashtag edit create delete 话题",
		label: "话题管理",
		permission: { topic: ["list"] },
	},
	{
		description: "查看用户资料、内容数据和账号状态。",
		href: "/admin/users",
		icon: Persons,
		keywords: "users accounts status disabled active 用户 账号",
		label: "用户管理",
		permission: { user: ["list"] },
	},
	{
		description: "查看当前账号资料和后台权限。",
		href: "/admin/settings",
		icon: Gear,
		keywords: "settings profile permission status logout 设置 账号 权限",
		label: "设置",
		permission: { profile: ["view"] },
	},
	{
		href: "/admin/profile",
		icon: Persons,
		keywords: "profile account avatar bio handle personal 个人 主页 资料",
		label: "个人主页",
		permission: { profile: ["view"] },
	},
] as const satisfies readonly AdminSearchItem[];

const ROUTE_LABELS = new Map<string, string>([
	...NAV_ITEMS.map((item) => [item.href, item.label] as const),
	["/admin/profile", "个人主页"] as const,
]);

function getAdminRouteLabel(pathname: string) {
	const exactLabel = ROUTE_LABELS.get(pathname);
	if (exactLabel) return exactLabel;
	if (pathname.startsWith("/admin/notes/")) return "图文详情";
	if (pathname.startsWith("/admin/topics/")) return "话题详情";
	if (pathname.startsWith("/admin/users/")) return "用户详情";
	return "Youni 工作台";
}

type AdminShellProps = {
	user: AdminUser;
	children: ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const visibleNavItems = useMemo(
		() =>
			NAV_ITEMS.filter((item) =>
				checkAdminRolePermission(user.role, item.permission),
			),
		[user.role],
	);
	const title = useMemo(() => getAdminRouteLabel(pathname), [pathname]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
				event.preventDefault();
				if (window.matchMedia("(max-width: 767px)").matches) {
					setIsMobileSidebarOpen((value) => !value);
				} else {
					setIsSidebarOpen((value) => !value);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	useEffect(() => {
		if (pathname.length > 0) {
			setIsMobileSidebarOpen(false);
		}
	}, [pathname]);

	return (
		<div className="flex h-dvh min-h-0 overflow-hidden bg-background">
			<div
				aria-hidden={!isSidebarOpen}
				className={`hidden h-dvh shrink-0 overflow-hidden transition-[width] duration-200 motion-reduce:transition-none md:block ${isSidebarOpen ? "visible w-60" : "invisible w-0"}`}
			>
				<DashboardSidebar items={visibleNavItems} pathname={pathname} />
			</div>

			<Drawer>
				<Drawer.Backdrop
					isDismissable
					isOpen={isMobileSidebarOpen}
					variant="blur"
					onOpenChange={setIsMobileSidebarOpen}
				>
					<Drawer.Content placement="left">
						<Drawer.Dialog
							aria-label="后台导航"
							className="h-dvh w-[min(240px,85vw)] p-0"
						>
							<DashboardSidebar
								items={visibleNavItems}
								pathname={pathname}
								onNavigate={() => setIsMobileSidebarOpen(false)}
							/>
						</Drawer.Dialog>
					</Drawer.Content>
				</Drawer.Backdrop>
			</Drawer>

			<section className="flex min-w-0 flex-1 flex-col">
				<DashboardNavbar
					isSidebarOpen={isSidebarOpen}
					title={title}
					user={user}
					onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
					onToggleSidebar={() => setIsSidebarOpen((value) => !value)}
				/>
				<main
					aria-label="后台内容"
					className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
				>
					<div className="min-h-full bg-background">{children}</div>
				</main>
			</section>
		</div>
	);
}

type AdminPageProps = {
	title: string;
	description?: string;
	children: ReactNode;
	actions?: ReactNode;
};

export function AdminPage({
	title,
	description,
	children,
	actions,
}: AdminPageProps) {
	return (
		<main className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 pt-4 pb-10">
			<section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
					<h1 className="sr-only">{title}</h1>
					{description ? (
						<p className="text-muted text-sm">{description}</p>
					) : null}
				</div>
				{actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
			</section>
			{children}
		</main>
	);
}

function DashboardNavbar({
	isSidebarOpen,
	onOpenMobileSidebar,
	onToggleSidebar,
	title,
	user,
}: {
	isSidebarOpen: boolean;
	onOpenMobileSidebar: () => void;
	onToggleSidebar: () => void;
	title: string;
	user: AdminUser;
}) {
	const navigate = useNavigate();
	const searchState = useOverlayState();
	const overview = useQuery(orpc.admin.overview.queryOptions());
	const visibleSearchItems = useMemo(
		() =>
			SEARCH_ITEMS.filter((item) =>
				checkAdminRolePermission(user.role, item.permission),
			),
		[user.role],
	);
	const navigateToAdminRoute = useCallback(
		(href: AdminRouteTo) => {
			void navigate({ to: href });
		},
		[navigate],
	);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				searchState.open();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [searchState.open]);

	return (
		<>
			<header className="h-16 shrink-0 border-separator border-b bg-background">
				<nav
					aria-label="后台工具栏"
					className="flex h-full w-full items-center gap-4 px-4 md:px-6"
				>
					<IconButton
						className="-ml-2 md:hidden"
						label="打开导航"
						size="sm"
						variant="ghost"
						onPress={onOpenMobileSidebar}
					>
						<Bars className="size-4" />
					</IconButton>
					<IconButton
						aria-expanded={isSidebarOpen}
						className="-ml-2 hidden md:inline-flex"
						label={isSidebarOpen ? "收起导航" : "展开导航"}
						size="sm"
						variant="ghost"
						onPress={onToggleSidebar}
					>
						<SquareBars className="size-4" />
					</IconButton>
					<h2 className="truncate font-semibold text-foreground text-xl">
						{title}
					</h2>
					<div aria-hidden className="flex-1" />
					<div className="flex items-center gap-2">
						{visibleSearchItems.length > 0 ? (
							<IconButton
								label="搜索"
								size="sm"
								tooltip="搜索后台页面"
								variant="tertiary"
								onPress={searchState.open}
							>
								<Magnifier className="size-4" />
							</IconButton>
						) : null}
						<NotificationButton
							isLoading={overview.isLoading}
							navigateTo={navigateToAdminRoute}
							overview={overview.data}
							role={user.role}
						/>
						<div className="border-separator border-l pl-2">
							<UserMenu user={user} />
						</div>
					</div>
				</nav>
			</header>
			<AdminSearchCommand
				isOpen={searchState.isOpen}
				items={visibleSearchItems}
				navigateTo={navigateToAdminRoute}
				onOpenChange={searchState.setOpen}
			/>
		</>
	);
}

function DashboardSidebar({
	items,
	onNavigate,
	pathname,
}: {
	items: readonly AdminNavItem[];
	onNavigate?: () => void;
	pathname: string;
}) {
	return (
		<aside className="flex h-full w-60 shrink-0 flex-col border-separator border-r bg-background">
			<SidebarContents
				items={items}
				pathname={pathname}
				onNavigate={onNavigate}
			/>
		</aside>
	);
}

function SidebarContents({
	items,
	onNavigate,
	pathname,
}: {
	items: readonly AdminNavItem[];
	onNavigate?: () => void;
	pathname: string;
}) {
	return (
		<>
			<div className="px-3 py-4">
				<div className="flex items-center gap-3 px-1 py-1">
					<img
						alt="Youni"
						className="size-9 shrink-0 rounded-2xl"
						src="/favicon.svg"
					/>
					<div className="flex min-w-0 flex-col">
						<span className="truncate font-medium text-foreground text-sm leading-tight">
							Youni 工作台
						</span>
						<span className="truncate font-medium text-muted text-xs leading-tight">
							内容审核与社区运营
						</span>
					</div>
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
				<nav aria-label="后台导航" className="grid gap-1">
					{items.map((item) => (
						<SidebarNavItem
							key={item.href}
							item={item}
							pathname={pathname}
							onNavigate={onNavigate}
						/>
					))}
				</nav>
			</div>
		</>
	);
}

function SidebarNavItem({
	item,
	onNavigate,
	pathname,
}: {
	item: AdminNavItem;
	onNavigate?: () => void;
	pathname: string;
}) {
	const Icon = item.icon;
	const isCurrent =
		item.href === "/admin"
			? pathname === "/admin"
			: pathname === item.href || pathname.startsWith(`${item.href}/`);

	return (
		<Link
			aria-current={isCurrent ? "page" : undefined}
			className={`flex h-9 w-full items-center gap-3 rounded-2xl px-2.5 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${isCurrent ? "bg-default text-foreground" : "text-muted hover:bg-surface-secondary hover:text-foreground"}`}
			to={item.href}
			onClick={onNavigate}
		>
			<span className="flex size-4 shrink-0 items-center justify-center">
				<Icon className="size-4" />
			</span>
			<span className="min-w-0 flex-1 truncate">{item.label}</span>
			{item.badge ? (
				<span className="shrink-0">
					<Chip color="success" size="sm" variant="soft">
						{item.badge}
					</Chip>
				</span>
			) : null}
		</Link>
	);
}

type IconButtonProps = Omit<
	ComponentPropsWithRef<typeof Button>,
	"children" | "isIconOnly"
> & {
	children: ReactNode;
	label: string;
	tooltip?: ReactNode;
};

export function IconButton({
	children,
	label,
	tooltip,
	...buttonProps
}: IconButtonProps) {
	return (
		<Tooltip>
			<Button isIconOnly aria-label={label} {...buttonProps}>
				{children}
			</Button>
			<Tooltip.Content>{tooltip ?? label}</Tooltip.Content>
		</Tooltip>
	);
}

function AdminSearchCommand({
	isOpen,
	items,
	navigateTo,
	onOpenChange,
}: {
	isOpen: boolean;
	items: readonly AdminSearchItem[];
	navigateTo: (href: AdminRouteTo) => void;
	onOpenChange: (isOpen: boolean) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(0);
	const normalizedQuery = normalizeSearchText(query.trim());
	const filteredItems = useMemo(
		() =>
			normalizedQuery
				? items.filter((item) =>
						normalizeSearchText(
							`${item.label} ${item.description ?? ""} ${item.keywords}`,
						).includes(normalizedQuery),
					)
				: items,
		[items, normalizedQuery],
	);
	const resolvedActiveIndex =
		filteredItems.length === 0
			? -1
			: Math.min(activeIndex, filteredItems.length - 1);
	const activeItem = filteredItems[resolvedActiveIndex];

	useEffect(() => {
		if (isOpen) {
			setQuery("");
			setActiveIndex(0);
		}
	}, [isOpen]);

	const selectItem = (href: AdminRouteTo) => {
		onOpenChange(false);
		navigateTo(href);
	};

	return (
		<Modal>
			<Modal.Backdrop
				isDismissable
				isOpen={isOpen}
				variant="blur"
				onOpenChange={onOpenChange}
			>
				<Modal.Container className="pt-24" placement="top" size="lg">
					<Modal.Dialog
						aria-label="搜索后台页面"
						className="max-h-[min(32rem,calc(100dvh-3rem))] overflow-hidden p-0"
					>
						<div className="flex h-13 items-center gap-2 border-separator border-b px-4">
							<Magnifier className="size-4 shrink-0 text-muted" />
							<input
								aria-activedescendant={
									activeItem ? getSearchItemId(activeItem.href) : undefined
								}
								aria-controls="admin-search-results"
								aria-expanded={isOpen}
								aria-label="搜索后台页面"
								autoComplete="off"
								autoFocus
								className="min-w-0 flex-1 bg-transparent text-foreground text-sm outline-none placeholder:text-muted"
								placeholder="搜索后台页面或功能"
								ref={inputRef}
								role="combobox"
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
									setActiveIndex(0);
								}}
								onKeyDown={(event) => {
									switch (event.key) {
										case "ArrowDown":
											event.preventDefault();
											if (filteredItems.length > 0) {
												setActiveIndex((value) =>
													value >= filteredItems.length - 1 ? 0 : value + 1,
												);
											}
											break;
										case "ArrowUp":
											event.preventDefault();
											if (filteredItems.length > 0) {
												setActiveIndex((value) =>
													value <= 0 ? filteredItems.length - 1 : value - 1,
												);
											}
											break;
										case "Enter":
											if (activeItem) {
												event.preventDefault();
												selectItem(activeItem.href);
											}
											break;
										case "Escape":
											event.preventDefault();
											onOpenChange(false);
											break;
									}
								}}
							/>
							{query ? (
								<Button
									isIconOnly
									aria-label="清空搜索"
									size="sm"
									variant="ghost"
									onPress={() => {
										setQuery("");
										setActiveIndex(0);
										inputRef.current?.focus();
									}}
								>
									<Xmark className="size-4" />
								</Button>
							) : (
								<span aria-hidden className="size-8 shrink-0" />
							)}
						</div>

						<div
							aria-label="后台页面"
							className="max-h-[min(24rem,60dvh)] overflow-y-auto p-2"
							id="admin-search-results"
							role="listbox"
						>
							<div className="px-2 pt-1 pb-2 font-medium text-muted text-xs">
								后台页面
							</div>
							{filteredItems.length === 0 ? (
								<div className="px-3 py-10 text-center text-muted text-sm">
									没有匹配的页面
								</div>
							) : (
								<div className="grid gap-1">
									{filteredItems.map((item, index) => {
										const Icon = item.icon;
										const isActive = index === resolvedActiveIndex;

										return (
											<button
												aria-selected={isActive}
												className={`flex w-full min-w-0 items-center gap-3 rounded-2xl px-2 py-2 text-left outline-none transition-colors ${isActive ? "bg-default" : "hover:bg-surface-secondary"}`}
												id={getSearchItemId(item.href)}
												key={item.href}
												role="option"
												type="button"
												onClick={() => selectItem(item.href)}
												onFocus={() => setActiveIndex(index)}
												onMouseEnter={() => setActiveIndex(index)}
											>
												<span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
													<Icon className="size-4" />
												</span>
												<span className="min-w-0">
													<span className="block truncate font-medium text-sm">
														{item.label}
													</span>
													{item.description ? (
														<span className="block truncate text-muted text-xs">
															{item.description}
														</span>
													) : null}
												</span>
											</button>
										);
									})}
								</div>
							)}
						</div>
					</Modal.Dialog>
				</Modal.Container>
			</Modal.Backdrop>
		</Modal>
	);
}

function normalizeSearchText(value: string) {
	return value.normalize("NFKD").toLocaleLowerCase();
}

function getSearchItemId(href: AdminRouteTo) {
	return `admin-search-${href.replaceAll("/", "-")}`;
}

type NotificationOverview = {
	readonly auditCount?: number;
	readonly noteCount?: number;
	readonly userCount?: number;
};

type NotificationTone = "accent" | "success" | "warning";

type AdminNotificationItem = {
	readonly description: string;
	readonly href: AdminRouteTo;
	readonly icon: ComponentType<{ className?: string }>;
	readonly id: string;
	readonly label: string;
	readonly permission: AdminPermissionRequest;
	readonly tone: NotificationTone;
};

const notificationToneClassName: Record<NotificationTone, string> = {
	accent: "bg-accent/10 text-accent",
	success: "bg-success/10 text-success",
	warning: "bg-warning/10 text-warning",
};

function NotificationButton({
	isLoading,
	navigateTo,
	overview,
	role,
}: {
	isLoading: boolean;
	navigateTo: (href: AdminRouteTo) => void;
	overview?: NotificationOverview;
	role?: string | null;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const notifications = useMemo(
		() =>
			getNotifications(overview).filter((item) =>
				checkAdminRolePermission(role, item.permission),
			),
		[overview, role],
	);
	const pendingCount = checkAdminRolePermission(role, { note: ["list"] })
		? (overview?.auditCount ?? 0)
		: 0;

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handlePointerDown = (event: PointerEvent) => {
			if (
				event.target instanceof Node &&
				!rootRef.current?.contains(event.target)
			) {
				setIsOpen(false);
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen]);

	return (
		<div ref={rootRef} className="relative">
			<IconButton
				aria-controls={isOpen ? "admin-notifications" : undefined}
				aria-expanded={isOpen}
				label="通知"
				size="sm"
				tooltip="查看通知"
				variant="tertiary"
				onPress={() => setIsOpen((value) => !value)}
			>
				<span className="relative flex">
					<Bell className="size-4" />
					{pendingCount > 0 ? (
						<span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-danger ring-2 ring-background" />
					) : null}
				</span>
			</IconButton>

			{isOpen ? (
				<div
					aria-label="通知"
					className="absolute top-full right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-background p-2 shadow-xl"
					id="admin-notifications"
					role="dialog"
				>
					<div className="px-3 py-2">
						<div className="font-medium text-foreground text-sm">通知</div>
						<div className="text-muted text-xs">
							{pendingCount > 0
								? `${pendingCount} 篇图文等待审核`
								: "当前没有待审核内容"}
						</div>
					</div>
					<div className="grid gap-1">
						{isLoading
							? ["audit", "notes", "users"].map((key) => (
									<Skeleton key={key} className="h-16 rounded-2xl" />
								))
							: notifications.map((item) => {
									const Icon = item.icon;

									return (
										<button
											className="flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
											key={item.id}
											type="button"
											onClick={() => {
												setIsOpen(false);
												navigateTo(item.href);
											}}
										>
											<span
												className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl ${notificationToneClassName[item.tone]}`}
											>
												<Icon className="size-4" />
											</span>
											<span className="min-w-0">
												<span className="block truncate font-medium text-foreground text-sm">
													{item.label}
												</span>
												<span className="line-clamp-2 text-muted text-xs">
													{item.description}
												</span>
											</span>
										</button>
									);
								})}
					</div>
				</div>
			) : null}
		</div>
	);
}

function getNotifications(
	overview?: NotificationOverview,
): AdminNotificationItem[] {
	const auditCount = overview?.auditCount ?? 0;
	const noteCount = overview?.noteCount ?? 0;
	const userCount = overview?.userCount ?? 0;

	return [
		auditCount > 0
			? {
					description: "进入图文列表处理通过、拒绝或隐藏。",
					href: "/admin/notes",
					icon: FileText,
					id: "audit",
					label: `${auditCount} 篇图文待审核`,
					permission: { note: ["list"] },
					tone: "warning",
				}
			: {
					description: "图文管理里没有待处理审核。",
					href: "/admin/notes",
					icon: Check,
					id: "audit-clear",
					label: "审核队列已清空",
					permission: { note: ["list"] },
					tone: "success",
				},
		{
			description: "查看内容状态、互动数据和详情。",
			href: "/admin/notes",
			icon: Comment,
			id: "notes",
			label: `共 ${noteCount} 篇图文`,
			permission: { note: ["list"] },
			tone: "accent",
		},
		{
			description: "新增、编辑或删除社区话题。",
			href: "/admin/topics",
			icon: Hashtag,
			id: "topics",
			label: "话题维护",
			permission: { topic: ["list"] },
			tone: "accent",
		},
		{
			description: "查看账号状态、资料和内容数据。",
			href: "/admin/users",
			icon: Persons,
			id: "users",
			label: `共 ${userCount} 位用户`,
			permission: { user: ["list"] },
			tone: "accent",
		},
	];
}
