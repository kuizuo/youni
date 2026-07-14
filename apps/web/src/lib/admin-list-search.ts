import type { SortingState } from "@tanstack/react-table";

export const adminPageSizeOptions = [10, 20, 50, 100, 200] as const;
export const adminNoteSortFields = [
	"title",
	"author",
	"status",
	"createdAt",
] as const;
export const adminUserSortFields = [
	"name",
	"role",
	"status",
	"createdAt",
] as const;
export const adminTopicSortFields = ["name", "noteCount", "createdAt"] as const;

export type AdminPageSize = (typeof adminPageSizeOptions)[number];
export type AdminSortDirection = "asc" | "desc";
export type AdminSort<TField extends string> =
	`${TField}.${AdminSortDirection}`;

export type AdminListSearch<TField extends string> = {
	page: number;
	pageSize: AdminPageSize;
	q: string;
	sort: AdminSort<TField>;
};

export const adminListSearchDefaults = {
	page: 1,
	pageSize: 10,
	q: "",
	sort: "createdAt.desc",
} as const satisfies AdminListSearch<"createdAt">;

function parsePositiveInteger(value: unknown) {
	const number = typeof value === "string" ? Number(value) : value;
	return typeof number === "number" && Number.isInteger(number) && number > 0
		? number
		: null;
}

function isPageSize(value: number): value is AdminPageSize {
	return adminPageSizeOptions.includes(value as AdminPageSize);
}

export function parseAdminListSearch<const TFields extends readonly string[]>(
	search: Record<string, unknown>,
	sortFields: TFields,
): AdminListSearch<TFields[number]> {
	const parsedPage = parsePositiveInteger(search.page);
	const parsedPageSize = parsePositiveInteger(search.pageSize);
	const q = typeof search.q === "string" ? search.q.trim() : "";
	const sort = typeof search.sort === "string" ? search.sort : "";
	const [sortField, sortDirection, extra] = sort.split(".");
	const isValidSort =
		!extra &&
		typeof sortField === "string" &&
		sortFields.includes(sortField) &&
		(sortDirection === "asc" || sortDirection === "desc");

	return {
		page: parsedPage ?? adminListSearchDefaults.page,
		pageSize:
			parsedPageSize && isPageSize(parsedPageSize)
				? parsedPageSize
				: adminListSearchDefaults.pageSize,
		q,
		sort: (isValidSort ? sort : adminListSearchDefaults.sort) as AdminSort<
			TFields[number]
		>,
	};
}

export function splitAdminSort<TField extends string>(sort: AdminSort<TField>) {
	const [sortBy, sortDirection] = sort.split(".") as [
		TField,
		AdminSortDirection,
	];
	return { sortBy, sortDirection };
}

export function adminSortToState<TField extends string>(
	sort: AdminSort<TField>,
): SortingState {
	const { sortBy, sortDirection } = splitAdminSort(sort);
	return [{ desc: sortDirection === "desc", id: sortBy }];
}

export function adminSortingStateToSort<TField extends string>(
	sorting: SortingState | undefined,
): AdminSort<TField> | undefined {
	const first = sorting?.[0];
	if (!first) return undefined;
	return `${first.id}.${first.desc ? "desc" : "asc"}` as AdminSort<TField>;
}

export function parseAdminSearchOption<
	const TOptions extends readonly string[],
>(value: unknown, options: TOptions): TOptions[number] | "" {
	return typeof value === "string" && options.includes(value) ? value : "";
}
