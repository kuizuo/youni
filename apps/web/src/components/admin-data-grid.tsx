import { Table } from "@heroui/react";
import type { ReactNode } from "react";

export type AdminDataGridColumn<T extends object> = {
	readonly accessorKey?: keyof T & string;
	readonly cell?: (item: T) => ReactNode;
	readonly cellClassName?: string;
	readonly header: ReactNode;
	readonly headerClassName?: string;
	readonly id: string;
	readonly isRowHeader?: boolean;
	readonly minWidth?: number;
};

type AdminDataGridProps<T extends object> = {
	readonly "aria-label": string;
	readonly className?: string;
	readonly columns: readonly AdminDataGridColumn<T>[];
	readonly contentClassName?: string;
	readonly data: readonly T[];
	readonly getRowId: (item: T) => string | number;
	readonly renderEmptyState?: () => ReactNode;
};

export function AdminDataGrid<T extends object>({
	"aria-label": ariaLabel,
	className,
	columns,
	contentClassName,
	data,
	getRowId,
	renderEmptyState,
}: AdminDataGridProps<T>) {
	return (
		<Table className={className}>
			<Table.ScrollContainer className="overflow-x-auto">
				<Table.Content aria-label={ariaLabel} className={contentClassName}>
					<Table.Header>
						{columns.map((column) => (
							<Table.Column
								id={column.id}
								isRowHeader={column.isRowHeader}
								key={column.id}
								className={column.headerClassName}
								minWidth={column.minWidth}
							>
								{column.header}
							</Table.Column>
						))}
					</Table.Header>
					<Table.Body
						renderEmptyState={
							renderEmptyState
								? () => (
										<div className="flex justify-center py-12 text-muted text-sm">
											{renderEmptyState()}
										</div>
									)
								: undefined
						}
					>
						{data.map((item) => (
							<Table.Row id={getRowId(item)} key={getRowId(item)}>
								{columns.map((column) => (
									<Table.Cell className={column.cellClassName} key={column.id}>
										{renderCell(item, column)}
									</Table.Cell>
								))}
							</Table.Row>
						))}
					</Table.Body>
				</Table.Content>
			</Table.ScrollContainer>
		</Table>
	);
}

function renderCell<T extends object>(item: T, column: AdminDataGridColumn<T>) {
	if (column.cell) {
		return column.cell(item);
	}

	if (!column.accessorKey) {
		return null;
	}

	const value = item[column.accessorKey];
	return value === null || value === undefined ? null : String(value);
}
