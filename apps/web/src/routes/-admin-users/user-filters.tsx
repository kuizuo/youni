import { Funnel, Plus, Xmark } from "@gravity-ui/icons";
import { Button, Dropdown, Label, SearchField } from "@heroui/react";
import type { AdminUserStatus } from "@youni/api/admin-user-governance";

import { userStatusLabel } from "@/components/admin-status";
import {
	accountTypeLabel,
	accountTypeOptions,
	statusOptions,
	type UserAccountType,
} from "./types";

export function UserFilters({
	accountTypeFilter,
	canCreateUser = true,
	keyword,
	onAccountTypeChange,
	onCreateUser,
	onKeywordChange,
	onStatusChange,
	statusFilter,
}: {
	accountTypeFilter: UserAccountType | "";
	canCreateUser?: boolean;
	keyword: string;
	onAccountTypeChange: (value: UserAccountType | "") => void;
	onCreateUser: () => void;
	onKeywordChange: (value: string) => void;
	onStatusChange: (value: AdminUserStatus | "") => void;
	statusFilter: AdminUserStatus | "";
}) {
	const selectedStatusLabel = statusFilter
		? userStatusLabel[statusFilter]
		: "状态";
	const selectedAccountTypeLabel = accountTypeFilter
		? accountTypeLabel[accountTypeFilter]
		: "用户类型";

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
						{selectedAccountTypeLabel}
					</Button>
					<Dropdown.Popover>
						<Dropdown.Menu
							selectionMode="single"
							selectedKeys={accountTypeFilter ? [accountTypeFilter] : []}
							onAction={(key) => onAccountTypeChange(key as UserAccountType)}
						>
							{accountTypeOptions.map((value) => (
								<Dropdown.Item
									key={value}
									id={value}
									textValue={accountTypeLabel[value]}
								>
									<Label>{accountTypeLabel[value]}</Label>
								</Dropdown.Item>
							))}
						</Dropdown.Menu>
					</Dropdown.Popover>
				</Dropdown>
				{accountTypeFilter ? (
					<Button
						size="sm"
						variant="tertiary"
						isIconOnly
						aria-label="清除用户类型筛选"
						onPress={() => onAccountTypeChange("")}
					>
						<Xmark className="size-4" />
					</Button>
				) : null}

				<Dropdown>
					<Button size="sm" variant="secondary">
						<Funnel className="size-4" />
						{selectedStatusLabel}
					</Button>
					<Dropdown.Popover>
						<Dropdown.Menu
							selectionMode="single"
							selectedKeys={statusFilter ? [statusFilter] : []}
							onAction={(key) => onStatusChange(key as AdminUserStatus)}
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

			{canCreateUser ? (
				<Button onPress={onCreateUser}>
					<Plus className="size-4" />
					新建用户
				</Button>
			) : null}
		</div>
	);
}
