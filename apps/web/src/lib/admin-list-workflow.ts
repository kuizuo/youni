import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";

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

	const updateSearch = useCallback(
		(
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
		},
		[navigate],
	);

	const updateKeyword = useCallback((value: string) => {
		setKeyword(value);
	}, []);

	const submitKeyword = useCallback(
		(value = keyword) => {
			const normalized = value.trim();
			setKeyword(normalized);
			if (normalized === search.q) return;
			updateSearch({ q: normalized } as Partial<TSearch>, {
				replace: true,
				resetPage: true,
			});
		},
		[keyword, search.q, updateSearch],
	);

	const clearKeyword = useCallback(() => {
		setKeyword("");
		if (!search.q) return;
		updateSearch({ q: "" } as Partial<TSearch>, {
			replace: true,
			resetPage: true,
		});
	}, [search.q, updateSearch]);

	const pagination = useMemo<PaginationState>(
		() => ({ pageIndex: search.page - 1, pageSize: search.pageSize }),
		[search.page, search.pageSize],
	);
	const sorting = useMemo<SortingState>(() => adminSortToState(sort), [sort]);

	const setPagination = useCallback(
		(next: PaginationState) => {
			updateSearch({
				page: next.pageIndex + 1,
				pageSize: next.pageSize,
			} as Partial<TSearch>);
		},
		[updateSearch],
	);

	const correctPageIndex = useCallback(
		(pageIndex: number) => {
			updateSearch({ page: pageIndex + 1 } as Partial<TSearch>, {
				replace: true,
			});
		},
		[updateSearch],
	);

	const setSorting = useCallback(
		(next: SortingState) => {
			const nextSort = adminSortingStateToSort<SearchSortField<TSearch>>(next);
			if (!nextSort || nextSort === search.sort) return;
			updateSearch({ sort: nextSort } as Partial<TSearch>, { resetPage: true });
		},
		[search.sort, updateSearch],
	);

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
		updateKeyword,
		updateSearch,
	};
}
