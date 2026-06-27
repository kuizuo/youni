import { Funnel } from "@gravity-ui/icons";
import { Button, Dropdown, Label, SearchField } from "@heroui/react";

import { userStatusLabel } from "@/components/admin-status";
import { statusOptions, type UserStatus } from "./types";

export function UserFilters({
	keyword,
	onKeywordChange,
	onStatusChange,
	statusFilter,
}: {
	keyword: string;
	onKeywordChange: (value: string) => void;
	onStatusChange: (value: UserStatus | "") => void;
	statusFilter: UserStatus | "";
}) {
	const selectedStatusLabel = statusFilter
		? userStatusLabel[statusFilter]
		: "未删除";

	return (
		<div className="flex flex-wrap items-center gap-2">
			<SearchField
				aria-label="搜索用户"
				className="w-full sm:w-[260px]"
				name="users-search"
				value={keyword}
				variant="secondary"
				onChange={onKeywordChange}
			>
				<SearchField.Group>
					<SearchField.SearchIcon />
					<SearchField.Input placeholder="搜索用户..." />
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
						selectedKeys={[statusFilter || "notDeleted"]}
						onAction={(key) =>
							onStatusChange(key === "notDeleted" ? "" : (key as UserStatus))
						}
					>
						<Dropdown.Item id="notDeleted" textValue="未删除">
							<Label>未删除</Label>
						</Dropdown.Item>
						{statusOptions.map((value) => (
							<Dropdown.Item
								key={value}
								id={value}
								textValue={userStatusLabel[value]}
							>
								<Label>{userStatusLabel[value]}</Label>
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown.Popover>
			</Dropdown>
		</div>
	);
}
