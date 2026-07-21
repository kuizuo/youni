import { ArrowsRotateLeft, Ban, Pencil, TrashBin } from "@gravity-ui/icons";
import { Button, Popover, Table } from "@heroui/react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import type {
	AdminUserRole,
	AdminUserStatus,
} from "@youni/api/admin-user-governance";
import type { AdminUserListItem } from "@youni/api/contracts/admin";
import { useCallback, useMemo, useState } from "react";
import {
	AnonymousUserBadge,
	UserRoleBadge,
	UserStatusBadge,
} from "@/components/admin-status";
import {
	AdminTablePagination,
	normalizeTablePaginationUpdater,
} from "@/components/admin-table-pagination";
import {
	sortDescriptorToState,
	sortingStateToDescriptor,
} from "@/components/admin-table-sorting";
import { AdminTableEmptyState } from "@/components/admin-table-state";
import { AppAvatar } from "@/components/app-avatar";

import { canManageItem, toUserRole, toUserStatus } from "./types";

const columnHelper = createColumnHelper<AdminUserListItem>();

const columnMinWidth: Record<string, number> = {
	name: 190,
	role: 76,
	status: 80,
	bio: 170,
	stats: 120,
	createdAt: 144,
	actions: 116,
};

const columnClassName: Record<string, string> = {
	name: "w-[19%]",
	role: "w-[7%] whitespace-nowrap",
	status: "w-[7%] whitespace-nowrap",
	bio: "w-[18%]",
	stats: "w-[12%] whitespace-nowrap",
	createdAt: "w-36 whitespace-nowrap",
	actions: "w-32 whitespace-nowrap text-end",
};

export function UserTable({
	canBanUsers = true,
	canDeleteUsers = true,
	canRestoreUsers = true,
	canUpdateUsers = true,
	currentRole,
	currentUserId,
	isDeletePending,
	isFetching,
	isStatusBusy,
	loadError,
	onEdit,
	onOpenUser,
	onPaginationChange,
	onPageIndexCorrection,
	onRetry,
	onSortingChange,
	onUpdateStatus,
	pagination,
	sorting,
	total,
	users,
}: {
	canBanUsers?: boolean;
	canDeleteUsers?: boolean;
	canRestoreUsers?: boolean;
	canUpdateUsers?: boolean;
	currentRole?: AdminUserRole;
	currentUserId?: string;
	isDeletePending: boolean;
	isFetching: boolean;
	isStatusBusy: boolean;
	loadError?: string | null;
	onEdit: (item: AdminUserListItem) => void;
	onOpenUser?: (item: AdminUserListItem) => void;
	onPaginationChange: (pagination: PaginationState) => void;
	onPageIndexCorrection?: (pageIndex: number) => void;
	onRetry?: () => unknown;
	onSortingChange: (sorting: SortingState) => void;
	onUpdateStatus: (
		item: AdminUserListItem,
		status: AdminUserStatus,
	) => Promise<void> | void;
	pagination: PaginationState;
	sorting: SortingState;
	total: number;
	users: AdminUserListItem[];
}) {
	const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
		(updater) => {
			const next = normalizeTablePaginationUpdater(updater, pagination);
			onPaginationChange(next);
		},
		[onPaginationChange, pagination],
	);
	const hasUserActions =
		canUpdateUsers || canBanUsers || canDeleteUsers || canRestoreUsers;
	const columns = useMemo(() => {
		const baseColumns = [
			columnHelper.accessor("name", {
				header: "用户",
			}),
			columnHelper.accessor("role", {
				header: "角色",
			}),
			columnHelper.accessor("status", {
				header: "状态",
			}),
			columnHelper.accessor("bio", {
				enableSorting: false,
				header: "简介",
			}),
			columnHelper.display({
				enableSorting: false,
				header: "数据",
				id: "stats",
			}),
			columnHelper.accessor((row) => new Date(row.createdAt).getTime(), {
				header: "创建时间",
				id: "createdAt",
			}),
		];

		if (!hasUserActions) {
			return baseColumns;
		}

		return [
			...baseColumns,
			columnHelper.display({
				enableSorting: false,
				header: "操作",
				id: "actions",
			}),
		];
	}, [hasUserActions]);
	const table = useReactTable({
		columns,
		data: users,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		manualPagination: true,
		manualSorting: true,
		onPaginationChange: handlePaginationChange,
		onSortingChange: (updater) =>
			onSortingChange(
				typeof updater === "function" ? updater(sorting) : updater,
			),
		pageCount: Math.max(Math.ceil(total / pagination.pageSize), 1),
		state: { pagination, sorting },
	});
	const sortDescriptor = sortingStateToDescriptor(sorting);

	return (
		<Table>
			<Table.ScrollContainer className="overflow-x-auto">
				<Table.Content
					aria-label="用户列表"
					className="min-w-[940px] table-fixed"
					sortDescriptor={sortDescriptor}
					onSortChange={(descriptor) =>
						onSortingChange(sortDescriptorToState(descriptor))
					}
				>
					<Table.Header>
						{table.getFlatHeaders().map((header) => (
							<Table.Column
								id={header.column.id}
								isRowHeader={header.column.id === "name"}
								key={header.id}
								allowsSorting={header.column.getCanSort()}
								className={columnClassName[header.column.id]}
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
						items={isFetching || loadError ? [] : users}
						renderEmptyState={() => (
							<AdminTableEmptyState
								emptyText="暂无用户"
								errorMessage={loadError}
								isLoading={isFetching}
								onRetry={onRetry}
							/>
						)}
					>
						{(user) => (
							<UserTableRow
								canBanUsers={canBanUsers}
								canDeleteUsers={canDeleteUsers}
								canRestoreUsers={canRestoreUsers}
								canUpdateUsers={canUpdateUsers}
								currentRole={currentRole}
								currentUserId={currentUserId}
								hasUserActions={hasUserActions}
								isDeletePending={isDeletePending}
								isStatusBusy={isStatusBusy}
								user={user}
								onEdit={onEdit}
								onOpenUser={onOpenUser}
								onUpdateStatus={onUpdateStatus}
							/>
						)}
					</Table.Body>
				</Table.Content>
			</Table.ScrollContainer>
			<AdminTablePagination
				canCorrectPageIndex={!isFetching && !loadError}
				emptyText="暂无用户"
				itemLabel="个用户"
				onPageIndexChange={(pageIndex) =>
					handlePaginationChange({ ...pagination, pageIndex })
				}
				onPageIndexCorrection={onPageIndexCorrection}
				onPageSizeChange={(pageSize) =>
					handlePaginationChange({ pageIndex: 0, pageSize })
				}
				table={table}
				total={total}
			/>
		</Table>
	);
}

function UserTableRow({
	canBanUsers,
	canDeleteUsers,
	canRestoreUsers,
	canUpdateUsers,
	currentRole,
	currentUserId,
	hasUserActions,
	isDeletePending,
	isStatusBusy,
	onEdit,
	onOpenUser,
	onUpdateStatus,
	user,
}: {
	canBanUsers: boolean;
	canDeleteUsers: boolean;
	canRestoreUsers: boolean;
	canUpdateUsers: boolean;
	currentRole?: AdminUserRole;
	currentUserId?: string;
	hasUserActions: boolean;
	isDeletePending: boolean;
	isStatusBusy: boolean;
	onEdit: (item: AdminUserListItem) => void;
	onOpenUser?: (item: AdminUserListItem) => void;
	onUpdateStatus: (
		item: AdminUserListItem,
		status: AdminUserStatus,
	) => Promise<void> | void;
	user: AdminUserListItem;
}) {
	const isDeleted = user.status === "deleted";

	return (
		<Table.Row id={user.id}>
			<Table.Cell>
				<UserIdentityCell user={user} onOpenUser={onOpenUser} />
			</Table.Cell>
			<Table.Cell>
				<span className="inline-flex whitespace-nowrap">
					<UserRoleBadge role={toUserRole(user.role)} />
				</span>
			</Table.Cell>
			<Table.Cell>
				<span className="inline-flex whitespace-nowrap">
					<UserStatusBadge status={toUserStatus(user.status)} />
				</span>
			</Table.Cell>
			<Table.Cell>
				<span className="line-clamp-2 text-muted">
					{user.bio || "暂无简介"}
				</span>
			</Table.Cell>
			<Table.Cell>
				<UserStatsCell user={user} />
			</Table.Cell>
			<Table.Cell>
				<span className="whitespace-nowrap text-muted text-sm tabular-nums">
					{new Date(user.createdAt).toLocaleString()}
				</span>
			</Table.Cell>
			{hasUserActions ? (
				<Table.Cell>
					<UserActionsCell
						canChangeStatus={isDeleted ? canRestoreUsers : canBanUsers}
						canDelete={canDeleteUsers}
						canManage={canManageItem(currentRole, user.role)}
						canUpdate={canUpdateUsers}
						isDeletePending={isDeletePending}
						isDeleted={isDeleted}
						isSelf={user.id === currentUserId}
						isStatusBusy={isStatusBusy}
						item={user}
						nextStatus={user.status === "active" ? "disabled" : "active"}
						onEdit={onEdit}
						onUpdateStatus={onUpdateStatus}
					/>
				</Table.Cell>
			) : null}
		</Table.Row>
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
				<div className="flex min-w-0 items-center gap-2">
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
					{user.isAnonymous ? <AnonymousUserBadge /> : null}
				</div>
				<div className="truncate text-muted text-xs">
					{user.isAnonymous ? "未绑定邮箱" : user.email}
				</div>
				{user.isAnonymous ? (
					<div className="truncate text-muted text-xs">匿名编号 {user.id}</div>
				) : null}
				{user.handle ? (
					<div className="truncate text-muted text-xs">@{user.handle}</div>
				) : null}
			</div>
		</div>
	);
}

function UserStatsCell({ user }: { user: AdminUserListItem }) {
	return (
		<dl className="grid grid-cols-3 gap-2 text-center text-sm">
			<CompactStat label="图文" value={user.noteCount} />
			<CompactStat label="粉丝" value={user.followerCount} />
			<CompactStat label="关注" value={user.followingCount} />
		</dl>
	);
}

function CompactStat({ label, value }: { label: string; value: number }) {
	return (
		<div className="grid gap-0.5">
			<dt className="whitespace-nowrap text-muted text-xs">{label}</dt>
			<dd className="font-medium text-foreground tabular-nums">{value}</dd>
		</div>
	);
}

function UserActionsCell({
	canChangeStatus,
	canDelete,
	canManage,
	canUpdate,
	isDeletePending,
	isDeleted,
	isSelf,
	isStatusBusy,
	item,
	nextStatus,
	onEdit,
	onUpdateStatus,
}: {
	canChangeStatus: boolean;
	canDelete: boolean;
	canManage: boolean;
	canUpdate: boolean;
	isDeletePending: boolean;
	isDeleted: boolean;
	isSelf: boolean;
	isStatusBusy: boolean;
	item: AdminUserListItem;
	nextStatus: AdminUserStatus;
	onEdit: (item: AdminUserListItem) => void;
	onUpdateStatus: (
		item: AdminUserListItem,
		status: AdminUserStatus,
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
		<div className="flex justify-end gap-1">
			{canUpdate && !item.isAnonymous ? (
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
			) : null}
			{canChangeStatus ? (
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
			) : null}
			{canDelete && !isDeleted ? (
				<Popover isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
					<Popover.Trigger>
						<Button
							size="sm"
							variant="danger"
							isIconOnly
							aria-label="删除"
							isDisabled={!canManage || isSelf || isStatusBusy}
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
			) : null}
		</div>
	);
}
