import { Check, EyeSlash, TrashBin, Xmark } from "@gravity-ui/icons";
import type { SortDescriptor } from "@heroui/react";
import { Button, Chip, Pagination, Popover, Table } from "@heroui/react";
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

import { NoteStatusBadge } from "@/components/admin-status";

import { type AdminNoteListItem, type NoteStatus, toNoteStatus } from "./types";

const pageSize = 5;

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
	onUpdateStatus,
}: {
	isDeletePending?: boolean;
	isFetching: boolean;
	isStatusBusy?: boolean;
	notes: AdminNoteListItem[];
	onDelete?: (item: AdminNoteListItem) => Promise<void> | void;
	onOpenNote?: (item: AdminNoteListItem) => void;
	onOpenUser?: (userId: string) => void;
	onUpdateStatus?: (
		item: AdminNoteListItem,
		status: NoteStatus,
		rejectionReason?: string,
	) => Promise<void> | void;
}) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [sorting, setSorting] = useState<SortingState>([]);
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
	const start = notes.length === 0 ? 0 : pageIndex * pageSize + 1;
	const end = Math.min((pageIndex + 1) * pageSize, notes.length);
	const currentPage = pageIndex + 1;
	const totalPages = Math.max(pageCount, 1);

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
							<span className="text-muted text-sm">
								{isFetching ? "正在加载图文" : "暂无图文"}
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
						{notes.length > 0
							? `显示 ${start}-${end}，共 ${notes.length} 篇图文`
							: "暂无图文"}
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
		status: NoteStatus,
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
