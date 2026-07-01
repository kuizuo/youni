import type { PaginationState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

import { defaultTablePagination } from "@/components/admin-table-pagination";

export type AdminListPaginationInput = {
	keyword?: string;
	limit: number;
	offset: number;
};

export type AdminListQueryInput<TStatus extends string> =
	AdminListPaginationInput & {
		status?: TStatus;
	};

export type AdminListRefetchable = {
	refetch: () => Promise<unknown>;
};

export function useAdminListWorkflow<TStatus extends string = never>() {
	const [keyword, setKeyword] = useState("");
	const [statusFilter, setStatusFilter] = useState<TStatus | "">("");
	const [pagination, setPagination] = useState<PaginationState>(
		defaultTablePagination,
	);

	const resetPage = useCallback(() => {
		setPagination((current) => ({ ...current, pageIndex: 0 }));
	}, []);

	const updateKeyword = useCallback(
		(value: string) => {
			setKeyword(value);
			resetPage();
		},
		[resetPage],
	);

	const updateStatusFilter = useCallback(
		(value: TStatus | "") => {
			setStatusFilter(value);
			resetPage();
		},
		[resetPage],
	);

	const paginationInput = useMemo(
		() => ({
			keyword: keyword.trim() || undefined,
			limit: pagination.pageSize,
			offset: pagination.pageIndex * pagination.pageSize,
		}),
		[keyword, pagination.pageIndex, pagination.pageSize],
	);

	const queryInput = useMemo(
		() => ({
			...paginationInput,
			status: statusFilter || undefined,
		}),
		[paginationInput, statusFilter],
	);

	const refetchList = useCallback(async (query: AdminListRefetchable) => {
		await query.refetch();
	}, []);

	return useMemo(
		() => ({
			keyword,
			pagination,
			paginationInput,
			queryInput: queryInput as AdminListQueryInput<TStatus>,
			refetchList,
			resetPage,
			setPagination,
			statusFilter,
			updateKeyword,
			updateStatusFilter,
		}),
		[
			keyword,
			pagination,
			paginationInput,
			queryInput,
			refetchList,
			resetPage,
			statusFilter,
			updateKeyword,
			updateStatusFilter,
		],
	);
}
