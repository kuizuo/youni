import { Gear, Persons, ShieldCheck } from "@gravity-ui/icons";
import { Button, Card, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { AdminPage } from "@/components/admin-shell";
import { UserRoleBadge, UserStatusBadge } from "@/components/admin-status";
import { AppAvatar } from "@/components/app-avatar";
import { orpc } from "@/utils/orpc";
import {
	genderLabel,
	toGender,
	toUserRole,
	toUserStatus,
} from "./-admin-users/types";

export const Route = createFileRoute("/admin/profile")({
	component: AdminProfileRoute,
});

function AdminProfileRoute() {
	const navigate = useNavigate();
	const profile = useQuery(orpc.admin.me.queryOptions());
	const user = profile.data?.user;

	if (profile.isLoading || !user) {
		return (
			<AdminPage title="个人主页">
				<ProfileSkeleton />
			</AdminPage>
		);
	}

	const role = toUserRole(user.role);
	const status = toUserStatus(user.status);
	const name = user.name || "管理员";
	const handle = user.handle ? `@${user.handle}` : "未设置用户名";
	const bio = user.bio || "暂未填写简介";
	const gender = genderLabel[toGender(user.gender)];
	const createdAt = user.createdAt
		? new Date(user.createdAt).toLocaleString()
		: "暂无记录";
	const updatedAt = user.updatedAt
		? new Date(user.updatedAt).toLocaleString()
		: "暂无记录";

	return (
		<AdminPage
			title="个人主页"
			actions={
				<Button
					size="sm"
					variant="secondary"
					onPress={() => navigate({ to: "/admin/settings" })}
				>
					<Gear className="size-4" />
					编辑资料
				</Button>
			}
		>
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
				<Card className="overflow-hidden p-0">
					<div className="bg-surface-secondary px-5 py-5">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex min-w-0 items-center gap-4">
								<AppAvatar
									alt={name}
									className="size-16"
									fallback={getInitials(name)}
									src={user.image}
								/>
								<div className="min-w-0">
									<div className="truncate font-semibold text-foreground text-xl">
										{name}
									</div>
									<div className="mt-1 truncate text-muted text-sm">
										{handle}
									</div>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								<UserRoleBadge role={role} />
								<UserStatusBadge status={status} />
							</div>
						</div>
					</div>

					<Card.Content className="grid gap-5 p-5">
						<div className="rounded-2xl bg-surface-secondary p-4">
							<div className="mb-2 flex items-center gap-2 font-medium text-sm">
								<Persons className="size-4 text-accent" />
								公开资料
							</div>
							<p className="text-muted text-sm leading-6">{bio}</p>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<ProfileField label="昵称" value={name} />
							<ProfileField label="用户名" value={handle} />
							<ProfileField label="邮箱" value={user.email ?? "未绑定邮箱"} />
							<ProfileField label="性别" value={gender} />
							<ProfileField label="创建时间" value={createdAt} />
							<ProfileField label="更新时间" value={updatedAt} />
						</div>
					</Card.Content>
				</Card>

				<div className="grid gap-4">
					<Card>
						<Card.Header>
							<Card.Title>后台权限</Card.Title>
							<Card.Description>
								角色和状态只在这里展示，需要由其他管理员在用户管理里处理。
							</Card.Description>
						</Card.Header>
						<Card.Content className="grid gap-3">
							<ProfileField label="角色">
								<UserRoleBadge role={role} />
							</ProfileField>
							<ProfileField label="状态">
								<UserStatusBadge status={status} />
							</ProfileField>
							<div className="flex items-start gap-3 rounded-2xl bg-success-soft p-3">
								<ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
								<p className="text-sm text-success-soft-foreground leading-6">
									{role === "admin"
										? "你可以管理内容、话题、用户和后台账号。"
										: "你可以处理内容、话题和普通用户，不能调整管理员账号。"}
								</p>
							</div>
						</Card.Content>
					</Card>

					<Card>
						<Card.Header>
							<Card.Title>资料维护</Card.Title>
							<Card.Description>
								个人主页只展示当前账号信息，不在这里直接修改。
							</Card.Description>
						</Card.Header>
						<Card.Content className="grid gap-2 text-muted text-sm leading-6">
							<p>头像、昵称、用户名、简介和性别可以在设置页更新。</p>
							<p>邮箱、角色和账号状态不能由自己在设置页修改。</p>
						</Card.Content>
					</Card>
				</div>
			</div>
		</AdminPage>
	);
}

function ProfileField({
	children,
	label,
	value,
}: {
	children?: ReactNode;
	label: string;
	value?: string;
}) {
	return (
		<div className="min-w-0 rounded-2xl bg-surface-secondary p-3">
			<div className="text-muted text-xs">{label}</div>
			<div className="mt-2 truncate font-medium text-foreground text-sm">
				{children ?? value}
			</div>
		</div>
	);
}

function ProfileSkeleton() {
	return (
		<div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
			<Skeleton className="h-[460px] rounded-2xl" />
			<div className="grid gap-4">
				<Skeleton className="h-56 rounded-2xl" />
				<Skeleton className="h-40 rounded-2xl" />
			</div>
		</div>
	);
}

function getInitials(source: string) {
	const parts = source.trim().split(/\s+/);

	if (parts.length > 1) {
		return parts
			.slice(0, 2)
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	}

	return source.slice(0, 2).toUpperCase();
}
