import { Button, Card } from "@heroui/react";
import { UserRoleBadge, UserStatusBadge } from "@/components/admin-status";
import { AppAvatar } from "@/components/app-avatar";

import { NoteTable } from "../-admin-notes/note-table";
import type { AdminNoteListItem } from "../-admin-notes/types";
import {
	type AdminUserListItem,
	type AdminUserRelationItem,
	toUserRole,
	toUserStatus,
} from "./types";

export function UserDetailView({
	followers,
	following,
	isFetching,
	notes,
	onBack,
	onOpenNote,
	onOpenUser,
	user,
}: {
	followers: AdminUserRelationItem[];
	following: AdminUserRelationItem[];
	isFetching: boolean;
	notes: AdminNoteListItem[];
	onBack: () => void;
	onOpenNote: (item: AdminNoteListItem) => void;
	onOpenUser: (userId: string) => void;
	user: AdminUserListItem;
}) {
	return (
		<div className="grid gap-4">
			<div>
				<Button size="sm" variant="tertiary" onPress={onBack}>
					返回用户
				</Button>
			</div>

			<Card>
				<Card.Content className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px]">
					<div className="flex min-w-0 items-start gap-4">
						<AppAvatar
							alt={user.name}
							className="size-16"
							fallback={user.name.slice(0, 1)}
							src={user.image}
						/>
						<div className="min-w-0">
							<div className="flex flex-wrap items-center gap-2">
								<h2 className="font-semibold text-2xl">{user.name}</h2>
								<UserRoleBadge role={toUserRole(user.role)} />
								<UserStatusBadge status={toUserStatus(user.status)} />
							</div>
							<p className="mt-1 text-muted text-sm">{user.email}</p>
							{user.handle ? (
								<p className="mt-1 text-muted text-sm">@{user.handle}</p>
							) : null}
							<p className="mt-3 text-sm">{user.bio || "暂无简介"}</p>
						</div>
					</div>

					<div className="grid grid-cols-3 gap-2">
						<StatBox label="图文" value={user.noteCount} />
						<StatBox label="粉丝" value={user.followerCount} />
						<StatBox label="关注" value={user.followingCount} />
					</div>
				</Card.Content>
			</Card>

			<div className="grid gap-4 lg:grid-cols-2">
				<RelationList
					emptyText="暂无粉丝"
					title="最近粉丝"
					users={followers}
					onOpenUser={onOpenUser}
				/>
				<RelationList
					emptyText="暂无关注"
					title="最近关注"
					users={following}
					onOpenUser={onOpenUser}
				/>
			</div>

			<NoteTable
				isFetching={isFetching}
				notes={notes}
				onOpenNote={onOpenNote}
				onOpenUser={onOpenUser}
			/>
		</div>
	);
}

function StatBox({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg bg-surface-secondary p-3">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-1 font-semibold text-xl tabular-nums">{value}</div>
		</div>
	);
}

function RelationList({
	emptyText,
	onOpenUser,
	title,
	users,
}: {
	emptyText: string;
	onOpenUser: (userId: string) => void;
	title: string;
	users: AdminUserRelationItem[];
}) {
	return (
		<Card>
			<Card.Header>
				<Card.Title>{title}</Card.Title>
			</Card.Header>
			<Card.Content className="grid gap-2 p-4">
				{users.length > 0 ? (
					users.map((user) => (
						<button
							key={user.userId}
							type="button"
							className="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-surface-secondary"
							onClick={() => onOpenUser(user.userId)}
						>
							<AppAvatar
								alt={user.name}
								className="size-8"
								fallback={user.name.slice(0, 1)}
								src={user.image}
							/>
							<div className="min-w-0">
								<div className="truncate font-medium text-sm">{user.name}</div>
								<div className="truncate text-muted text-xs">{user.email}</div>
							</div>
						</button>
					))
				) : (
					<p className="text-muted text-sm">{emptyText}</p>
				)}
			</Card.Content>
		</Card>
	);
}
