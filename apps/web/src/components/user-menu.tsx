import { ArrowRightFromSquare, Gear } from "@gravity-ui/icons";
import { Avatar, Button, Dropdown, Label, Skeleton } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";

type UserMenuUser = {
	readonly name?: string | null;
	readonly email?: string | null;
	readonly image?: string | null;
};

type UserMenuProps = {
	readonly user?: UserMenuUser;
};

export default function UserMenu({ user }: UserMenuProps) {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();
	const currentUser = user ?? session?.user;

	if (isPending && !currentUser) {
		return <Skeleton className="size-9 rounded-full" />;
	}

	if (!currentUser) {
		return (
			<Button
				size="sm"
				variant="outline"
				onPress={() => navigate({ to: "/login" })}
			>
				Sign In
			</Button>
		);
	}

	const name = currentUser.name || "管理员";
	const email = currentUser.email || "未绑定邮箱";
	const fallback = getInitials(currentUser);

	return (
		<Dropdown>
			<Dropdown.Trigger aria-label="打开账号菜单" className="rounded-full">
				<MenuAvatar alt={name} fallback={fallback} image={currentUser.image} />
			</Dropdown.Trigger>
			<Dropdown.Popover className="min-w-60">
				<div className="px-3 pt-3 pb-1">
					<div className="flex items-center gap-2">
						<MenuAvatar
							alt={name}
							fallback={fallback}
							image={currentUser.image}
							size="sm"
						/>
						<div className="flex min-w-0 flex-col gap-0">
							<p className="truncate font-medium text-sm leading-5">{name}</p>
							<p className="truncate text-muted text-xs leading-none">
								{email}
							</p>
						</div>
					</div>
				</div>
				<Dropdown.Menu
					onAction={(key) => {
						switch (key) {
							case "profile":
								void navigate({ to: "/admin/profile" });
								break;
							case "settings":
								void navigate({ to: "/admin/settings" });
								break;
							case "logout":
								authClient.signOut({
									fetchOptions: {
										onSuccess: () => {
											navigate({ to: "/login" });
										},
									},
								});
								break;
						}
					}}
				>
					<Dropdown.Item id="profile" textValue="个人主页">
						<Label>个人主页</Label>
					</Dropdown.Item>
					<Dropdown.Item id="settings" textValue="设置">
						<div className="flex w-full items-center justify-between gap-2">
							<Label>设置</Label>
							<Gear className="size-3.5 text-muted" />
						</div>
					</Dropdown.Item>
					<Dropdown.Item id="logout" textValue="退出登录" variant="danger">
						<div className="flex w-full items-center justify-between gap-2">
							<Label>退出登录</Label>
							<ArrowRightFromSquare className="size-3.5 text-danger" />
						</div>
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}

function MenuAvatar({
	alt,
	fallback,
	image,
	size = "md",
}: {
	alt: string;
	fallback: ReactNode;
	image?: string | null;
	size?: "md" | "sm";
}) {
	const className =
		size === "sm"
			? "size-8 shrink-0 overflow-hidden rounded-full"
			: "size-9 shrink-0 overflow-hidden rounded-full";

	return (
		<Avatar className={className}>
			{image ? (
				<Avatar.Image
					alt={alt}
					className="size-full rounded-full object-cover"
					src={image}
				/>
			) : null}
			<Avatar.Fallback delayMs={600}>{fallback}</Avatar.Fallback>
		</Avatar>
	);
}

function getInitials(user: UserMenuUser) {
	const source = user.name || user.email || "管理员";
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
