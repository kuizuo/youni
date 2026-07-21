import { Button, Card } from "@heroui/react";
import type {
	AdminLoginDevice,
	AdminUserListItem,
} from "@youni/api/contracts/admin";
import type {
	AdminHydratedContentNote as AdminNoteListItem,
	AdminUserReference,
} from "@youni/api/contracts/shared";
import {
	AnonymousUserBadge,
	UserRoleBadge,
	UserStatusBadge,
} from "@/components/admin-status";
import { AppAvatar } from "@/components/app-avatar";

import { NoteTable } from "../-admin-notes/note-table";
import { toUserRole, toUserStatus } from "./types";

export function UserDetailView({
	followers,
	following,
	isFetching,
	loginDevices,
	notes,
	onBack,
	onOpenNote,
	onOpenUser,
	user,
}: {
	followers: AdminUserReference[];
	following: AdminUserReference[];
	isFetching: boolean;
	loginDevices: AdminLoginDevice[];
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
								{user.isAnonymous ? <AnonymousUserBadge /> : null}
								<UserRoleBadge role={toUserRole(user.role)} />
								<UserStatusBadge status={toUserStatus(user.status)} />
							</div>
							<p className="mt-1 text-muted text-sm">
								{user.isAnonymous ? "未绑定邮箱" : user.email}
							</p>
							{user.isAnonymous ? (
								<p className="mt-1 break-all text-muted text-sm">
									匿名编号 {user.id}
								</p>
							) : null}
							{user.handle ? (
								<p className="mt-1 text-muted text-sm">@{user.handle}</p>
							) : null}
							<p className="mt-1 text-muted text-sm">
								创建时间 {new Date(user.createdAt).toLocaleString()}
							</p>
							{user.lastLoginMethod ? (
								<p className="mt-1 text-muted text-sm">
									最近登录方式 {formatLoginMethod(user.lastLoginMethod)}
								</p>
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

			<LoginDeviceList devices={loginDevices} />

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

function LoginDeviceList({ devices }: { devices: AdminLoginDevice[] }) {
	return (
		<Card>
			<Card.Header>
				<Card.Title>登录设备</Card.Title>
				<Card.Description>最近 20 条登录记录</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-2 p-4">
				{devices.length > 0 ? (
					devices.map((device) => {
						const isActive = new Date(device.expiresAt).getTime() > Date.now();
						const deviceName = formatDeviceName(device.userAgent);
						return (
							<div
								className="grid gap-2 rounded-lg bg-surface-secondary p-3 md:grid-cols-[minmax(0,1fr)_auto]"
								key={device.id}
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium">{deviceName}</span>
										<span
											className={
												isActive ? "text-success text-xs" : "text-muted text-xs"
											}
										>
											{isActive ? "当前有效" : "已过期"}
										</span>
									</div>
									<div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-muted text-xs">
										<span>
											登录时间 {new Date(device.createdAt).toLocaleString()}
										</span>
										{device.ipAddress ? (
											<span>IP {device.ipAddress}</span>
										) : null}
									</div>
								</div>
								<div className="text-muted text-xs tabular-nums md:text-right">
									<div>最近活动</div>
									<div>{new Date(device.updatedAt).toLocaleString()}</div>
								</div>
							</div>
						);
					})
				) : (
					<p className="text-muted text-sm">暂无登录设备记录</p>
				)}
			</Card.Content>
		</Card>
	);
}

function formatDeviceName(userAgent: string | null) {
	if (!userAgent) return "未知设备";
	if (userAgent.includes("CFNetwork")) return "iPhone / iPad";
	if (userAgent.includes("okhttp")) return "Android 设备";
	if (userAgent.includes("Windows")) return "Windows 浏览器";
	if (userAgent.includes("Macintosh")) return "Mac 浏览器";
	return userAgent;
}

function formatLoginMethod(method: string) {
	if (method === "email") return "邮箱";
	if (method === "google") return "Google";
	return method;
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
	users: AdminUserReference[];
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
