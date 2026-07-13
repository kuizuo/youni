import { Check, EyeSlash, TrashBin, Xmark } from "@gravity-ui/icons";
import type { SortDescriptor } from "@heroui/react";
import { Button, Chip, Popover, Table } from "@heroui/react";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type OnChangeFn,
	type PaginationState,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import type { AdminHydratedContentNote as AdminNoteListItem } from "@youni/api/contracts/shared";
import { useCallback, useMemo, useState } from "react";

import { NoteStatusBadge } from "@/components/admin-status";
import {
	AdminTablePagination,
	defaultTablePagination,
	normalizeTablePaginationUpdater,
} from "@/components/admin-table-pagination";
import { AdminTableEmptyState } from "@/components/admin-table-state";

import { type MutableNoteStatus, toNoteStatus } from "./types";

const columnHelper = createColumnHelper<AdminNoteListItem>();

const columnMinWidth: Record<string, number> = {
	cover: 120,
	content: 420,
	author: 220,
	status: 150,
	stats: 120,
	createdAt: 180,
	actions: 190,
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

export function NoteTable({
	isDeletePending,
	isFetching,
	isStatusBusy,
	notes,
	onDelete,
	onOpenNote,
	onOpenUser,
	onPaginationChange,
	onUpdateStatus,
	pagination,
	total,
}: {
	isDeletePending?: boolean;
	isFetching: boolean;
	isStatusBusy?: boolean;
	notes: AdminNoteListItem[];
	onDelete?: (item: AdminNoteListItem) => Promise<void> | void;
	onOpenNote?: (item: AdminNoteListItem) => void;
	onOpenUser?: (userId: string) => void;
	onPaginationChange?: (pagination: PaginationState) => void;
	onUpdateStatus?: (
		item: AdminNoteListItem,
		status: MutableNoteStatus,
		rejectionReason?: string,
	) => Promise<void> | void;
	pagination?: PaginationState;
	total?: number;
}) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [localPagination, setLocalPagination] = useState<PaginationState>(
		defaultTablePagination,
	);
	const [sorting, setSorting] = useState<SortingState>([]);
	const isPaginationControlled =
		Boolean(pagination && onPaginationChange) && typeof total === "number";
	const currentPagination = pagination ?? localPagination;
	const totalItems = total ?? notes.length;
	const handlePaginationChange = useCallback<OnChangeFn<PaginationState>>(
		(updater) => {
			const next = normalizeTablePaginationUpdater(updater, currentPagination);

			if (isPaginationControlled) {
				onPaginationChange?.(next);
				return;
			}

			setLocalPagination(next);
		},
		[currentPagination, isPaginationControlled, onPaginationChange],
	);
	const canMutate = Boolean(onDelete && onUpdateStatus);
	const columns = useMemo(() => {
		const tableColumns = [
			columnHelper.display({
				cell: (info) => <NoteCoverCell note={info.row.original} />,
				enableSorting: false,
				header: "封面",
				id: "cover",
			}),
			columnHelper.accessor("title", {
				cell: (info) => (
					<NoteContentCell
						activeId={activeId}
						note={info.row.original}
						onOpenNote={onOpenNote}
						onToggleActive={setActiveId}
					/>
				),
				header: "内容",
				id: "content",
			}),
			columnHelper.accessor("authorName", {
				cell: (info) => (
					<NoteAuthorCell note={info.row.original} onOpenUser={onOpenUser} />
				),
				header: "作者",
				id: "author",
			}),
			columnHelper.accessor("status", {
				cell: (info) => <NoteStatusCell note={info.row.original} />,
				header: "状态",
			}),
			columnHelper.display({
				cell: (info) => <NoteStatsCell note={info.row.original} />,
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
		];

		if (canMutate && onDelete && onUpdateStatus) {
			tableColumns.push(
				columnHelper.display({
					cell: (info) => (
						<NoteActionsCell
							isDeletePending={Boolean(isDeletePending)}
							isStatusBusy={Boolean(isStatusBusy)}
							note={info.row.original}
							onDelete={onDelete}
							onUpdateStatus={onUpdateStatus}
						/>
					),
					enableSorting: false,
					header: "操作",
					id: "actions",
				}),
			);
		}

		return tableColumns;
	}, [
		activeId,
		canMutate,
		isDeletePending,
		isStatusBusy,
		onDelete,
		onOpenNote,
		onOpenUser,
		onUpdateStatus,
	]);
	const table = useReactTable({
		columns,
		data: notes,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		manualPagination: isPaginationControlled,
		onPaginationChange: handlePaginationChange,
		onSortingChange: setSorting,
		pageCount: Math.max(Math.ceil(totalItems / currentPagination.pageSize), 1),
		state: { pagination: currentPagination, sorting },
	});
	const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

	return (
		<Table>
			<Table.ScrollContainer className="overflow-x-auto">
				<Table.Content
					aria-label="图文列表"
					className="min-w-[1400px]"
					sortDescriptor={sortDescriptor}
					onSortChange={(descriptor) => setSorting(toSortingState(descriptor))}
				>
					<Table.Header>
						{table.getFlatHeaders().map((header) => (
							<Table.Column
								id={header.column.id}
								isRowHeader={header.column.id === "content"}
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
							<AdminTableEmptyState
								emptyText="暂无图文"
								isLoading={isFetching}
							/>
						)}
					>
						{table.getRowModel().rows.map((row) => (
							<Table.Row id={row.original.id} key={row.original.id}>
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
			<AdminTablePagination
				emptyText="暂无图文"
				itemLabel="篇图文"
				onPageIndexChange={(pageIndex) =>
					handlePaginationChange({ ...currentPagination, pageIndex })
				}
				onPageSizeChange={(pageSize) =>
					handlePaginationChange({ pageIndex: 0, pageSize })
				}
				table={table}
				total={totalItems}
			/>
		</Table>
	);
}

function NoteCoverCell({ note }: { note: AdminNoteListItem }) {
	return note.cover ? (
		<img
			src={note.cover}
			alt=""
			className="size-20 rounded-lg object-cover ring-1 ring-border"
		/>
	) : (
		<div className="flex size-20 items-center justify-center rounded-lg bg-surface-secondary text-muted text-xs ring-1 ring-border">
			无封面
		</div>
	);
}

function NoteContentCell({
	activeId,
	note,
	onOpenNote,
	onToggleActive,
}: {
	activeId: string | null;
	note: AdminNoteListItem;
	onOpenNote?: (item: AdminNoteListItem) => void;
	onToggleActive: (id: string | null) => void;
}) {
	return (
		<div className="grid gap-2">
			<button
				type="button"
				className="line-clamp-1 text-left font-medium text-accent hover:underline"
				onClick={() => {
					if (onOpenNote) {
						onOpenNote(note);
						return;
					}
					onToggleActive(activeId === note.id ? null : note.id);
				}}
			>
				{note.title}
			</button>
			<p className="line-clamp-2 text-muted text-sm">{note.content}</p>
			<div className="flex flex-wrap gap-1">
				{note.topics.map((topic) => (
					<Chip key={topic} color="accent" size="sm" variant="soft">
						#{topic}
					</Chip>
				))}
				{note.locationName ? (
					<Chip color="default" size="sm" variant="soft">
						{note.locationName}
					</Chip>
				) : null}
				<Chip color="default" size="sm" variant="soft">
					{visibilityLabel(note.visibility)}
				</Chip>
			</div>
			{activeId === note.id ? (
				<div className="grid gap-2 rounded-xl bg-background p-3 text-muted text-sm ring-1 ring-border">
					<p>{note.content}</p>
					<p>
						组件 {note.components.length} 个 · 评论
						{note.advancedOptions?.allowComment ? "开启" : "关闭"} · 分享
						{note.advancedOptions?.allowShare ? "开启" : "关闭"}
					</p>
					{note.images.length > 0 ? (
						<div className="flex gap-2 overflow-x-auto">
							{note.images.map((image) => (
								<img
									key={image}
									src={image}
									alt=""
									className="size-24 rounded-md object-cover ring-1 ring-border"
								/>
							))}
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}

function NoteAuthorCell({
	note,
	onOpenUser,
}: {
	note: AdminNoteListItem;
	onOpenUser?: (userId: string) => void;
}) {
	const authorName = (
		<>
			<div className="font-medium">{note.authorName}</div>
			<div className="text-muted text-xs">{note.authorEmail}</div>
		</>
	);

	return (
		<div>
			{onOpenUser ? (
				<button
					type="button"
					className="text-left hover:text-accent"
					onClick={() => onOpenUser(note.userId)}
				>
					{authorName}
				</button>
			) : (
				authorName
			)}
		</div>
	);
}

function NoteStatusCell({ note }: { note: AdminNoteListItem }) {
	return (
		<div className="grid gap-1">
			<NoteStatusBadge status={toNoteStatus(note.status)} />
			{note.rejectionReason ? (
				<div className="text-danger text-xs">{note.rejectionReason}</div>
			) : null}
		</div>
	);
}

function NoteStatsCell({ note }: { note: AdminNoteListItem }) {
	return (
		<div className="text-muted text-sm">
			<div>赞 {note.likedCount}</div>
			<div>藏 {note.collectedCount}</div>
			<div>评 {note.commentCount}</div>
		</div>
	);
}

function NoteActionsCell({
	isDeletePending,
	isStatusBusy,
	note,
	onDelete,
	onUpdateStatus,
}: {
	isDeletePending: boolean;
	isStatusBusy: boolean;
	note: AdminNoteListItem;
	onDelete: (item: AdminNoteListItem) => Promise<void> | void;
	onUpdateStatus: (
		item: AdminNoteListItem,
		status: MutableNoteStatus,
		rejectionReason?: string,
	) => Promise<void> | void;
}) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	return (
		<div className="flex justify-end gap-2">
			<Button
				size="sm"
				variant="outline"
				isIconOnly
				aria-label="通过"
				isDisabled={isStatusBusy}
				isPending={isStatusBusy}
				onPress={() => onUpdateStatus(note, "published")}
			>
				<Check className="size-4" />
			</Button>
			<Button
				size="sm"
				variant="outline"
				isIconOnly
				aria-label="拒绝"
				isDisabled={isStatusBusy}
				isPending={isStatusBusy}
				onPress={() => onUpdateStatus(note, "rejected", "内容未通过审核")}
			>
				<Xmark className="size-4" />
			</Button>
			<Button
				size="sm"
				variant="outline"
				isIconOnly
				aria-label="隐藏"
				isDisabled={isStatusBusy}
				isPending={isStatusBusy}
				onPress={() => onUpdateStatus(note, "hidden")}
			>
				<EyeSlash className="size-4" />
			</Button>
			<Popover isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<Popover.Trigger>
					<Button
						size="sm"
						variant="danger"
						isIconOnly
						aria-label="删除"
						isDisabled={isDeletePending}
						isPending={isDeletePending}
					>
						<TrashBin className="size-4" />
					</Button>
				</Popover.Trigger>
				<Popover.Content className="w-72" placement="top" offset={10}>
					<Popover.Arrow />
					<Popover.Dialog aria-label="确认删除图文" className="space-y-3 p-3">
						<div>
							<Popover.Heading className="font-medium text-sm">
								确认删除图文
							</Popover.Heading>
							<p className="mt-1 text-muted text-sm">
								{`将删除图文「${note.title}」，该操作会移除这篇内容。`}
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
									await onDelete(note);
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

function visibilityLabel(visibility: string) {
	if (visibility === "public") return "公开可见";
	if (visibility === "followers") return "仅关注者";
	return "仅自己";
}
