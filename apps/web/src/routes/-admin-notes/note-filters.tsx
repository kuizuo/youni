import { Funnel, Magnifier, Xmark } from "@gravity-ui/icons";
import { Button, Dropdown, Label, SearchField } from "@heroui/react";

import { noteStatusLabel } from "@/components/admin-status";

import { type NoteStatus, noteStatusOptions } from "./types";

export function NoteFilters({
	keyword,
	onKeywordChange,
	onStatusChange,
	statusFilter,
}: {
	keyword: string;
	onKeywordChange: (value: string) => void;
	onStatusChange: (value: NoteStatus | "") => void;
	statusFilter: NoteStatus | "";
}) {
	const selectedStatusLabel = statusFilter
		? noteStatusLabel[statusFilter]
		: "状态";

	return (
		<div className="flex flex-wrap items-center gap-2">
			<SearchField
				aria-label="搜索图文"
				className="w-full sm:w-[260px]"
				name="notes-search"
				value={keyword}
				variant="secondary"
				onChange={onKeywordChange}
			>
				<SearchField.Group>
					<SearchField.SearchIcon>
						<Magnifier className="size-4" />
					</SearchField.SearchIcon>
					<SearchField.Input placeholder="搜索图文..." />
					<SearchField.ClearButton />
				</SearchField.Group>
			</SearchField>

			<Dropdown>
				<Button size="sm" variant="secondary">
					<Funnel className="size-4" />
					{selectedStatusLabel}
				</Button>
				<Dropdown.Popover>
					<Dropdown.Menu
						selectionMode="single"
						selectedKeys={statusFilter ? [statusFilter] : []}
						onAction={(key) => onStatusChange(key as NoteStatus)}
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
