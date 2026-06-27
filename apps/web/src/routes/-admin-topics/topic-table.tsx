import { Pencil, TrashBin } from "@gravity-ui/icons";
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

import type { AdminTopicListItem } from "./types";

const pageSize = 5;

const columnHelper = createColumnHelper<AdminTopicListItem>();

const columnMinWidth: Record<string, number> = {
	name: 280,
	noteCount: 140,
	createdAt: 180,
	actions: 120,
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

export function TopicTable({
	isDeletePending,
	isFetching,
	onDelete,
	onEdit,
	onOpenTopic,
	topics,
}: {
	isDeletePending: boolean;
	isFetching: boolean;
	onDelete: (item: AdminTopicListItem) => Promise<void> | void;
	onEdit: (item: AdminTopicListItem) => void;
	onOpenTopic?: (item: AdminTopicListItem) => void;
	topics: AdminTopicListItem[];
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				cell: (info) => (
					<TopicNameCell topic={info.row.original} onOpenTopic={onOpenTopic} />
				),
				header: "话题",
			}),
			columnHelper.accessor("noteCount", {
				cell: (info) => <span className="tabular-nums">{info.getValue()}</span>,
				header: "图文数量",
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
				cell: (info) => (
					<TopicActionsCell
						isDeletePending={isDeletePending}
						topic={info.row.original}
						onDelete={onDelete}
						onEdit={onEdit}
					/>
				),
				enableSorting: false,
				header: "操作",
				id: "actions",
			}),
		],
		[isDeletePending, onDelete, onEdit, onOpenTopic],
	);
	const table = useReactTable({
		columns,
		data: topics,
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
	const start = topics.length === 0 ? 0 : pageIndex * pageSize + 1;
	const end = Math.min((pageIndex + 1) * pageSize, topics.length);
	const currentPage = pageIndex + 1;
	const totalPages = Math.max(pageCount, 1);

	return (
		<Table>
			<Table.ScrollContainer className="overflow-x-auto">
				<Table.Content
					aria-label="话题列表"
					className="min-w-[760px]"
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
								{isFetching ? "正在加载话题" : "暂无话题"}
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
						{topics.length > 0
							? `显示 ${start}-${end}，共 ${topics.length} 个话题`
							: "暂无话题"}
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

function TopicNameCell({
	onOpenTopic,
	topic,
}: {
	onOpenTopic?: (item: AdminTopicListItem) => void;
	topic: AdminTopicListItem;
}) {
	if (!onOpenTopic) {
		return <span className="font-medium">#{topic.name}</span>;
	}

	return (
		<button
			type="button"
			className="font-medium text-accent hover:underline"
			onClick={() => onOpenTopic(topic)}
		>
			#{topic.name}
		</button>
	);
}

function TopicActionsCell({
	isDeletePending,
	onDelete,
	onEdit,
	topic,
}: {
	isDeletePending: boolean;
	onDelete: (item: AdminTopicListItem) => Promise<void> | void;
	onEdit: (item: AdminTopicListItem) => void;
	topic: AdminTopicListItem;
}) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	return (
		<div className="flex justify-end gap-2">
			<Button
				size="sm"
				variant="tertiary"
				isIconOnly
				aria-label="编辑"
				onPress={() => onEdit(topic)}
			>
				<Pencil className="size-4" />
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
					<Popover.Dialog aria-label="确认删除话题" className="space-y-3 p-3">
						<div>
							<Popover.Heading className="font-medium text-sm">
								确认删除话题
							</Popover.Heading>
							<p className="mt-1 text-muted text-sm">
								{`将删除话题「#${topic.name}」，关联图文将不再显示这个话题。`}
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
									await onDelete(topic);
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
