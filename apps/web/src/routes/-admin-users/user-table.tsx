import { ArrowsRotateLeft, Ban, Pencil, TrashBin } from "@gravity-ui/icons";
import type { SortDescriptor } from "@heroui/react";
import { Button, Pagination, Popover, Table } from "@heroui/react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { UserRoleBadge, UserStatusBadge } from "@/components/admin-status";
import { AppAvatar } from "@/components/app-avatar";

import {
	type AdminUserListItem,
	canManageItem,
	toUserRole,
	toUserStatus,
	type UserRole,
	type UserStatus,
} from "./types";

const pageSize = 5;

const columnHelper = createColumnHelper<AdminUserListItem>();

const columnMinWidth: Record<string, number> = {
	name: 280,
	role: 110,
	status: 110,
	bio: 260,
	stats: 140,
	createdAt: 180,
	actions: 140,
};

function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
	const first = sorting[0];
	if (!first) return undefined;
	return {
		column: first.id,
		direction: first.desc ? "descending" : "ascending",
	};
}

function toSortingState(descriptor: SortDescriptor): SortingState {
	return [
		{
			desc: descriptor.direction === "descending",
			id: String(descriptor.column),
		},
	];
}

export function UserTable({
	currentRole,
	currentUserId,
	isDeletePending,
	isFetching,
	isStatusBusy,
	onEdit,
	onOpenUser,
	onUpdateStatus,
	users,
}: {
	currentRole?: UserRole;
	currentUserId?: string;
	isDeletePending: boolean;
	isFetching: boolean;
	isStatusBusy: boolean;
	onEdit: (item: AdminUserListItem) => void;
	onOpenUser?: (item: AdminUserListItem) => void;
	onUpdateStatus: (
		item: AdminUserListItem,
		status: UserStatus,
	) => Promise<void> | void;
	users: AdminUserListItem[];
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				cell: (info) => (
					<UserIdentityCell user={info.row.original} onOpenUser={onOpenUser} />
				),
				header: "用户",
			}),
			columnHelper.accessor("role", {
				cell: (info) => <UserRoleBadge role={toUserRole(info.getValue())} />,
				header: "角色",
			}),
			columnHelper.accessor("status", {
				cell: (info) => (
					<UserStatusBadge status={toUserStatus(info.getValue())} />
				),
				header: "状态",
			}),
			columnHelper.accessor("bio", {
				cell: (info) => (
					<span className="line-clamp-2 text-muted">
						{info.getValue() || "暂无简介"}
					</span>
				),
				header: "简介",
			}),
			columnHelper.display({
				cell: (info) => <UserStatsCell user={info.row.original} />,
				enableSorting: false,
				header: "数据",
				id: "stats",
			}),
			columnHelper.accessor((row) => new Date(row.createdAt).getTime(), {
				cell: (info) => (
					<span className="text-muted tabular-nums">
						{new Date(info.row.original.createdAt).toLocaleString()}
					</span>
				),
				header: "创建时间",
				id: "createdAt",
			}),
			columnHelper.display({
				cell: (info) => {
					const item = info.row.original;
					const canManage = canManageItem(currentRole, item.role);
					const isSelf = item.id === currentUserId;
					const isDeleted = item.status === "deleted";
					const nextStatus = item.status === "active" ? "disabled" : "active";

					return (
						<UserActionsCell
							canManage={canManage}
							isDeletePending={isDeletePending}
							isDeleted={isDeleted}
							isSelf={isSelf}
							isStatusBusy={isStatusBusy}
							item={item}
							nextStatus={nextStatus}
							onEdit={onEdit}
							onUpdateStatus={onUpdateStatus}
						/>
					);
				},
				enableSorting: false,
				header: "操作",
				id: "actions",
			}),
		],
		[
			currentRole,
			currentUserId,
			isDeletePending,
			isStatusBusy,
			onEdit,
			onOpenUser,
			onUpdateStatus,
		],
	);
	const table = useReactTable({
		columns,
		data: users,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: { pagination: { pageSize } },
		onSortingChange: setSorting,
		state: { sorting },
	});
	const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);
	const { pageIndex } = table.getState().pagination;
	const pageCount = table.getPageCount();
	const pages = useMemo(
		() => Array.from({ length: pageCount }, (_, index) => index + 1),
		[pageCount],
	);
	const start = users.length === 0 ? 0 : pageIndex * pageSize + 1;
	const end = Math.min((pageIndex + 1) * pageSize, users.length);
	const currentPage = pageIndex + 1;
	const totalPages = Math.max(pageCount, 1);

	return (
		<Table>
			<Table.ScrollContainer className="overflow-x-auto">
				<Table.Content
					aria-label="用户列表"
					className="min-w-[1320px]"
					sortDescriptor={sortDescriptor}
					onSortChange={(descriptor) => setSorting(toSortingState(descriptor))}
				>
					<Table.Header>
						{table.getFlatHeaders().map((header) => (
							<Table.Column
								id={header.column.id}
								isRowHeader={header.column.id === "name"}
								key={header.id}
								allowsSorting={header.column.getCanSort()}
								minWidth={columnMinWidth[header.column.id]}
							>
								{({ sortDirection }) =>
									header.column.getCanSort() ? (
										<Table.SortableColumnHeader sortDirection={sortDirection}>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
										</Table.SortableColumnHeader>
									) : (
										flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)
									)
								}
							</Table.Column>
						))}
					</Table.Header>
					<Table.Body
						renderEmptyState={() => (
							<span className="text-muted text-sm">
								{isFetching ? "正在加载用户" : "暂无用户"}
							</span>
						)}
					>
						{table.getRowModel().rows.map((row) => (
							<Table.Row id={row.original.id} key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<Table.Cell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.ScrollContainer>
			<Table.Footer className="flex flex-col gap-3 border-border border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-3 text-muted text-sm">
					<Pagination.Summary>
						{users.length > 0
							? `显示 ${start}-${end}，共 ${users.length} 个用户`
							: "暂无用户"}
					</Pagination.Summary>
					<span className="hidden h-4 w-px bg-border sm:block" />
					<span className="tabular-nums">
						第 {currentPage} / {totalPages} 页
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="secondary"
						isDisabled={!table.getCanPreviousPage()}
						onPress={() => table.previousPage()}
					>
						上一页
					</Button>
					<div className="flex items-center gap-1">
						{pages.map((page) => (
							<Button
								key={page}
								size="sm"
								variant={pageIndex === page - 1 ? "primary" : "tertiary"}
								isIconOnly
								aria-label={`第 ${page} 页`}
								onPress={() => table.setPageIndex(page - 1)}
							>
								{page}
							</Button>
						))}
					</div>
					<Button
						size="sm"
						variant="secondary"
						isDisabled={!table.getCanNextPage()}
						onPress={() => table.nextPage()}
					>
						下一页
					</Button>
				</div>
			</Table.Footer>
		</Table>
	);
}

function UserIdentityCell({
	onOpenUser,
	user,
}: {
	onOpenUser?: (item: AdminUserListItem) => void;
	user: AdminUserListItem;
}) {
	return (
		<div className="flex items-center gap-3">
			<AppAvatar
				alt={user.name}
				className="size-10"
				fallback={user.name.slice(0, 1)}
				src={user.image}
			/>
			<div className="min-w-0">
				{onOpenUser ? (
					<button
						type="button"
						className="truncate font-medium text-accent hover:underline"
						onClick={() => onOpenUser(user)}
					>
						{user.name}
					</button>
				) : (
					<div className="truncate font-medium">{user.name}</div>
				)}
				<div className="truncate text-muted text-xs">{user.email}</div>
				{user.handle ? (
					<div className="truncate text-muted text-xs">@{user.handle}</div>
				) : null}
			</div>
		</div>
	);
}

function UserStatsCell({ user }: { user: AdminUserListItem }) {
	return (
		<div className="text-muted text-sm">
			<div>图文 {user.noteCount}</div>
			<div>粉丝 {user.followerCount}</div>
			<div>关注 {user.followingCount}</div>
		</div>
	);
}

function UserActionsCell({
	canManage,
	isDeletePending,
	isDeleted,
	isSelf,
	isStatusBusy,
	item,
	nextStatus,
	onEdit,
	onUpdateStatus,
}: {
	canManage: boolean;
	isDeletePending: boolean;
	isDeleted: boolean;
	isSelf: boolean;
	isStatusBusy: boolean;
	item: AdminUserListItem;
	nextStatus: UserStatus;
	onEdit: (item: AdminUserListItem) => void;
	onUpdateStatus: (
		item: AdminUserListItem,
		status: UserStatus,
	) => Promise<void> | void;
}) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const statusActionLabel = isDeleted
		? "恢复"
		: item.status === "active"
			? "禁用"
			: "恢复";
	const StatusActionIcon = item.status === "active" ? Ban : ArrowsRotateLeft;

	return (
		<div className="flex justify-end gap-2">
			<Button
				size="sm"
				variant="tertiary"
				isIconOnly
				aria-label="编辑"
				isDisabled={!canManage}
				onPress={() => onEdit(item)}
			>
				<Pencil className="size-4" />
			</Button>
			<Button
				size="sm"
				variant={item.status === "active" ? "outline" : "secondary"}
				isIconOnly
				aria-label={statusActionLabel}
				isDisabled={!canManage || isSelf || isStatusBusy}
				isPending={isStatusBusy}
				onPress={() => onUpdateStatus(item, nextStatus)}
			>
				<StatusActionIcon className="size-4" />
			</Button>
			<Popover isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<Popover.Trigger>
					<Button
						size="sm"
						variant="danger"
						isIconOnly
						aria-label="删除"
						isDisabled={!canManage || isSelf || isDeleted || isStatusBusy}
						isPending={isDeletePending}
					>
						<TrashBin className="size-4" />
					</Button>
				</Popover.Trigger>
				<Popover.Content className="w-72" placement="top" offset={10}>
					<Popover.Arrow />
					<Popover.Dialog aria-label="确认删除用户" className="space-y-3 p-3">
						<div>
							<Popover.Heading className="font-medium text-sm">
								确认删除用户
							</Popover.Heading>
							<p className="mt-1 text-muted text-sm">
								{`将软删除用户「${item.name}」，删除后该账号将不能再登录。历史内容不会被清空。`}
							</p>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								size="sm"
								variant="tertiary"
								onPress={() => setIsDeleteOpen(false)}
							>
								取消
							</Button>
							<Button
								size="sm"
								variant="danger"
								isPending={isDeletePending}
								onPress={async () => {
									await onUpdateStatus(item, "deleted");
									setIsDeleteOpen(false);
								}}
							>
								确认删除
							</Button>
						</div>
					</Popover.Dialog>
				</Popover.Content>
			</Popover>
		</div>
	);
}
