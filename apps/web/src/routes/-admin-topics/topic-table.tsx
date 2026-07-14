import { Pencil, TrashBin } from "@gravity-ui/icons";
import type { SortDescriptor } from "@heroui/react";
import { Button, Popover, Table } from "@heroui/react";
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
import type { AdminTopicListItem } from "@youni/api/contracts/admin";
import { useCallback, useMemo, useState } from "react";
import {
	AdminTablePagination,
	defaultTablePagination,
	normalizeTablePaginationUpdater,
} from "@/components/admin-table-pagination";
import { AdminTableEmptyState } from "@/components/admin-table-state";

const columnHelper = createColumnHelper<AdminTopicListItem>();

const columnMinWidth: Record<string, number> = {
	name: 260,
	noteCount: 120,
	createdAt: 160,
	actions: 108,
};

const columnClassName: Record<string, string> = {
	name: "w-[46%]",
	noteCount: "w-[18%] whitespace-nowrap",
	createdAt: "w-40 whitespace-nowrap",
	actions: "w-28 whitespace-nowrap text-end",
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
	onPaginationChange,
	pagination,
	topics,
	total,
}: {
	isDeletePending: boolean;
	isFetching: boolean;
	onDelete: (item: AdminTopicListItem) => Promise<void> | void;
	onEdit: (item: AdminTopicListItem) => void;
	onOpenTopic?: (item: AdminTopicListItem) => void;
	onPaginationChange?: (pagination: PaginationState) => void;
	pagination?: PaginationState;
	topics: AdminTopicListItem[];
	total?: number;
}) {
	const [localPagination, setLocalPagination] = useState<PaginationState>(
		defaultTablePagination,
	);
	const [sorting, setSorting] = useState<SortingState>([]);
	const isPaginationControlled =
		Boolean(pagination && onPaginationChange) && typeof total === "number";
	const currentPagination = pagination ?? localPagination;
	const totalItems = total ?? topics.length;
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
					<span className="whitespace-nowrap text-muted text-sm tabular-nums">
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
					aria-label="话题列表"
					className="min-w-[680px] table-fixed"
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
						renderEmptyState={() => (
							<AdminTableEmptyState
								emptyText="暂无话题"
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
				emptyText="暂无话题"
				itemLabel="个话题"
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
		<div className="flex justify-end gap-1">
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
