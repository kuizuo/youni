import { Funnel, Plus, Xmark } from "@gravity-ui/icons";
import { Button, Dropdown, Label, SearchField } from "@heroui/react";

import { userStatusLabel } from "@/components/admin-status";
import { statusOptions, type UserStatus } from "./types";

export function UserFilters({
	keyword,
	onCreateUser,
	onKeywordChange,
	onStatusChange,
	statusFilter,
}: {
	keyword: string;
	onCreateUser: () => void;
	onKeywordChange: (value: string) => void;
	onStatusChange: (value: UserStatus | "") => void;
	statusFilter: UserStatus | "";
}) {
	const selectedStatusLabel = statusFilter
		? userStatusLabel[statusFilter]
		: "状态";

	return (
		<div className="flex flex-wrap items-center justify-between gap-2">
			<div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
							selectedKeys={statusFilter ? [statusFilter] : []}
							onAction={(key) => onStatusChange(key as UserStatus)}
						>
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

			<Button onPress={onCreateUser}>
				<Plus className="size-4" />
				新建用户
			</Button>
		</div>
	);
}
