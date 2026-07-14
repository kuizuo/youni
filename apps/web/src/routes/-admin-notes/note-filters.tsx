import { Funnel, Magnifier, Xmark } from "@gravity-ui/icons";
import { Button, Dropdown, Label, SearchField } from "@heroui/react";
import type { ContentNoteStatus } from "@youni/api/contracts/shared";

import { noteStatusLabel } from "@/components/admin-status";

import { noteStatusOptions } from "./types";

export function NoteFilters({
	keyword,
	onClearKeyword,
	onKeywordChange,
	onKeywordSubmit,
	onStatusChange,
	statusFilter,
}: {
	keyword: string;
	onClearKeyword: () => void;
	onKeywordChange: (value: string) => void;
	onKeywordSubmit: (value: string) => void;
	onStatusChange: (value: ContentNoteStatus | "") => void;
	statusFilter: ContentNoteStatus | "";
}) {
	const selectedStatusLabel = statusFilter
		? noteStatusLabel[statusFilter]
		: "状态";

	return (
		<div className="flex flex-wrap items-center gap-2">
			<div className="flex w-full gap-2 sm:w-auto">
				<SearchField
					aria-label="搜索图文"
					className="min-w-0 flex-1 sm:w-80"
					name="notes-search"
					value={keyword}
					variant="secondary"
					onChange={onKeywordChange}
					onClear={onClearKeyword}
					onSubmit={onKeywordSubmit}
				>
					<SearchField.Group className="md:h-8">
						<SearchField.SearchIcon>
							<Magnifier className="size-4" />
						</SearchField.SearchIcon>
						<SearchField.Input placeholder="搜索图文..." />
						<SearchField.ClearButton />
					</SearchField.Group>
				</SearchField>
				<Button
					size="sm"
					variant="secondary"
					onPress={() => onKeywordSubmit(keyword)}
				>
					搜索
				</Button>
			</div>

			<Dropdown>
				<Button size="sm" variant="secondary">
					<Funnel className="size-4" />
					{selectedStatusLabel}
				</Button>
				<Dropdown.Popover>
					<Dropdown.Menu
						selectionMode="single"
						selectedKeys={statusFilter ? [statusFilter] : []}
						onAction={(key) => onStatusChange(key as ContentNoteStatus)}
					>
						{noteStatusOptions.map((value) => (
							<Dropdown.Item
								key={value}
								id={value}
								textValue={noteStatusLabel[value]}
							>
								<Label>{noteStatusLabel[value]}</Label>
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>
			{statusFilter ? (
				<Button
					size="sm"
					variant="tertiary"
					isIconOnly
					aria-label="清除状态筛选"
					onPress={() => onStatusChange("")}
				>
					<Xmark className="size-4" />
				</Button>
			) : null}
		</div>
	);
}
