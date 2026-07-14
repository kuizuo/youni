import { Button, Dropdown, Label, Pagination } from "@heroui/react";
import type {
	PaginationState,
	Table as ReactTable,
	Updater,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";

import { adminPageSizeOptions } from "@/lib/admin-list-search";

export function normalizeTablePaginationUpdater(
	updater: Updater<PaginationState>,
	current: PaginationState,
) {
	const next = typeof updater === "function" ? updater(current) : updater;
	return {
		...next,
		pageIndex: next.pageSize === current.pageSize ? next.pageIndex : 0,
	};
}

export function AdminTablePagination<TData>({
	canCorrectPageIndex = true,
	emptyText,
	itemLabel,
	onPageIndexChange,
	onPageIndexCorrection,
	onPageSizeChange,
	table,
	total,
}: {
	canCorrectPageIndex?: boolean;
	emptyText: string;
	itemLabel: string;
	onPageIndexChange?: (pageIndex: number) => void;
	onPageIndexCorrection?: (pageIndex: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	table: ReactTable<TData>;
	total: number;
}) {
	const { pageIndex, pageSize } = table.getState().pagination;
	const pageCount = Math.max(table.getPageCount(), 1);
	const safePageIndex = Math.min(pageIndex, pageCount - 1);
	const currentPage = safePageIndex + 1;
	const pages = useMemo(
		() => getVisiblePages(currentPage, pageCount),
		[currentPage, pageCount],
	);
	const start = total === 0 ? 0 : safePageIndex * pageSize + 1;
	const end = Math.min((safePageIndex + 1) * pageSize, total);
	const canPreviousPage = safePageIndex > 0;
	const canNextPage = safePageIndex < pageCount - 1;

	useEffect(() => {
		if (canCorrectPageIndex && pageIndex > pageCount - 1) {
			(onPageIndexCorrection ?? onPageIndexChange)?.(pageCount - 1);
		}
	}, [
		canCorrectPageIndex,
		onPageIndexChange,
		onPageIndexCorrection,
		pageCount,
		pageIndex,
	]);

	const setPageIndex = (nextPageIndex: number) => {
		if (onPageIndexChange) {
			onPageIndexChange(nextPageIndex);
			return;
		}

		table.setPageIndex(nextPageIndex);
	};

	const setPageSize = (nextPageSize: number) => {
		if (onPageSizeChange) {
			onPageSizeChange(nextPageSize);
			return;
		}

		table.setPageSize(nextPageSize);
	};

	return (
		<TableFooter>
			<div className="flex flex-wrap items-center gap-3 text-muted text-sm">
				<Pagination.Summary>
					{total > 0
						? `显示 ${start}-${end}，共 ${total} ${itemLabel}`
						: emptyText}
				</Pagination.Summary>
				<span className="hidden h-4 w-px bg-border sm:block" />
				<span className="tabular-nums">
					第 {currentPage} / {pageCount} 页
				</span>
				<PageSizeSelect pageSize={pageSize} onPageSizeChange={setPageSize} />
			</div>
			<div className="flex items-center gap-2">
				<PaginationButton
					isDisabled={!canPreviousPage}
					onClick={() => setPageIndex(Math.max(safePageIndex - 1, 0))}
				>
					上一页
				</PaginationButton>
				<div className="flex items-center gap-1">
					{pages.map((page) =>
						typeof page === "number" ? (
							<PaginationButton
								key={page}
								isActive={safePageIndex === page - 1}
								isIconOnly
								aria-label={`第 ${page} 页`}
								onClick={() => setPageIndex(page - 1)}
							>
								{page}
							</PaginationButton>
						) : (
							<span
								key={page}
								className="flex size-8 items-center justify-center text-muted text-sm"
							>
								...
							</span>
						),
					)}
				</div>
				<PaginationButton
					isDisabled={!canNextPage}
					onClick={() =>
						setPageIndex(Math.min(safePageIndex + 1, pageCount - 1))
					}
				>
					下一页
				</PaginationButton>
			</div>
		</TableFooter>
	);
}

function PaginationButton({
	"aria-label": ariaLabel,
	children,
	isActive,
	isDisabled,
	isIconOnly,
	onClick,
}: {
	"aria-label"?: string;
	children: ReactNode;
	isActive?: boolean;
	isDisabled?: boolean;
	isIconOnly?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-current={isActive ? "page" : undefined}
			aria-label={ariaLabel}
			disabled={isDisabled}
			className={[
				"inline-flex h-8 items-center justify-center rounded-md border font-medium text-sm transition",
				isIconOnly ? "w-8 px-0" : "min-w-16 px-3",
				isActive
					? "border-accent bg-accent text-accent-foreground"
					: "border-border bg-surface text-foreground hover:bg-surface-secondary",
				"disabled:cursor-not-allowed disabled:opacity-50",
			].join(" ")}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

function TableFooter({ children }: { children: ReactNode }) {
	return (
		<div className="flex flex-col gap-3 border-border border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			{children}
		</div>
	);
}

function PageSizeSelect({
	onPageSizeChange,
	pageSize,
}: {
	onPageSizeChange: (value: number) => void;
	pageSize: number;
}) {
	return (
		<Dropdown>
			<Button size="sm" variant="secondary">
				{pageSize} 条/页
			</Button>
			<Dropdown.Popover>
				<Dropdown.Menu
					selectionMode="single"
					selectedKeys={[String(pageSize)]}
					onAction={(key) => onPageSizeChange(Number(key))}
				>
					{adminPageSizeOptions.map((value) => (
						<Dropdown.Item
							key={value}
							id={String(value)}
							textValue={`${value}`}
						>
							<Label>{value} 条/页</Label>
						</Dropdown.Item>
					))}
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}

function getVisiblePages(currentPage: number, pageCount: number) {
	if (pageCount <= 7) {
		return Array.from({ length: pageCount }, (_, index) => index + 1);
	}

	const pages: Array<number | string> = [1];
	const start = Math.max(2, currentPage - 1);
	const end = Math.min(pageCount - 1, currentPage + 1);

	if (start > 2) {
		pages.push("start-ellipsis");
	}

	for (let page = start; page <= end; page += 1) {
		pages.push(page);
	}

	if (end < pageCount - 1) {
		pages.push("end-ellipsis");
	}

	pages.push(pageCount);
	return pages;
}
