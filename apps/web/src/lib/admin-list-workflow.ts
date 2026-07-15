import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import type { AdminListSearch, AdminSort } from "@/lib/admin-list-search";
import {
	adminSortingStateToSort,
	adminSortToState,
	splitAdminSort,
} from "@/lib/admin-list-search";

type AdminListNavigate<TSearch> = (options: {
	replace?: boolean;
	resetScroll: boolean;
	search: (current: TSearch) => TSearch;
	to: ".";
}) => unknown;

type AdminListRoute<TSearch> = {
	useNavigate: () => AdminListNavigate<TSearch>;
	useSearch: () => TSearch;
};

type SearchSortField<TSearch> =
	TSearch extends AdminListSearch<infer TField> ? TField : never;

export function useAdminListWorkflow<TSearch extends AdminListSearch<string>>(
	route: AdminListRoute<TSearch>,
) {
	const navigate = route.useNavigate();
	const search = route.useSearch();
	const sort = search.sort as AdminSort<SearchSortField<TSearch>>;
	const [keyword, setKeyword] = useState(search.q);
	const { sortBy, sortDirection } = splitAdminSort(sort);

	useEffect(() => {
		setKeyword(search.q);
	}, [search.q]);

	const updateSearch = (
		patch: Partial<TSearch>,
		options: { replace?: boolean; resetPage?: boolean } = {},
	) => {
		void navigate({
			to: ".",
			replace: options.replace,
			resetScroll: false,
			search: (current) => ({
				...current,
				...patch,
				...(options.resetPage ? { page: 1 } : {}),
			}),
		});
	};

	const submitKeyword = (value = keyword) => {
		const normalized = value.trim();
		setKeyword(normalized);
		if (normalized === search.q) return;
		updateSearch({ q: normalized } as Partial<TSearch>, {
			replace: true,
			resetPage: true,
		});
	};

	const clearKeyword = () => {
		setKeyword("");
		if (!search.q) return;
		updateSearch({ q: "" } as Partial<TSearch>, {
			replace: true,
			resetPage: true,
		});
	};

	const pagination: PaginationState = {
		pageIndex: search.page - 1,
		pageSize: search.pageSize,
	};
	const sorting = adminSortToState(sort);

	const setPagination = (next: PaginationState) => {
		updateSearch({
			page: next.pageIndex + 1,
			pageSize: next.pageSize,
		} as Partial<TSearch>);
	};

	const correctPageIndex = (pageIndex: number) => {
		updateSearch({ page: pageIndex + 1 } as Partial<TSearch>, {
			replace: true,
		});
	};

	const setSorting = (next: SortingState) => {
		const nextSort = adminSortingStateToSort<SearchSortField<TSearch>>(next);
		if (!nextSort || nextSort === search.sort) return;
		updateSearch({ sort: nextSort } as Partial<TSearch>, { resetPage: true });
	};

	const paginationInput = useMemo(
		() => ({
			keyword: search.q || undefined,
			limit: search.pageSize,
			offset: (search.page - 1) * search.pageSize,
			sortBy,
			sortDirection,
		}),
		[search.page, search.pageSize, search.q, sortBy, sortDirection],
	);

	return {
		clearKeyword,
		correctPageIndex,
		keyword,
		pagination,
		paginationInput,
		search,
		setPagination,
		setSorting,
		sorting,
		submitKeyword,
		updateKeyword: setKeyword,
		updateSearch,
	};
}
