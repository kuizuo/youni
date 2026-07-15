import { Funnel, Xmark } from "@gravity-ui/icons";
import { Button, Dropdown, Label } from "@heroui/react";
import type { ContentNoteStatus } from "@youni/api/contracts/shared";

import { AdminSearchField } from "@/components/admin-search-field";
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
			<AdminSearchField
				ariaLabel="搜索图文"
				keyword={keyword}
				name="notes-search"
				placeholder="搜索图文..."
				onChange={onKeywordChange}
				onClear={onClearKeyword}
				onSubmit={onKeywordSubmit}
			/>

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
