import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { buttonVariants } from "@youni/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@youni/ui/components/card";
import { Skeleton } from "@youni/ui/components/skeleton";
import { cn } from "@youni/ui/lib/utils";
import { BarChart3, FileText, Hash, Users } from "lucide-react";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const navItems = [
	{ to: "/admin", label: "概览", icon: BarChart3 },
	{ to: "/admin/notes", label: "图文", icon: FileText },
	{ to: "/admin/topics", label: "话题", icon: Hash },
	{ to: "/admin/users", label: "用户", icon: Users },
] as const;

type AdminShellProps = {
	title: string;
	description: string;
	children: ReactNode;
};

export function AdminShell({ title, description, children }: AdminShellProps) {
	const session = authClient.useSession();
	const admin = useQuery({
		...orpc.admin.me.queryOptions(),
		enabled: !!session.data?.user,
		retry: false,
	});

	if (session.isPending || admin.isLoading) {
		return (
			<main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6">
				<Skeleton className="h-10 w-56" />
				<Skeleton className="h-96 w-full" />
			</main>
		);
	}

	if (!session.data?.user || admin.isError) {
		return (
			<main className="mx-auto flex min-h-[70svh] w-full max-w-md items-center px-4">
				<Card>
					<CardHeader>
						<CardTitle>无法进入后台</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-3 text-muted-foreground text-sm">
						<p>请使用管理员邮箱登录后再访问后台。</p>
						<Link to="/login" className={cn(buttonVariants())}>
							去登录
						</Link>
					</CardContent>
				</Card>
			</main>
		);
	}

	return (
		<main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-[180px_1fr]">
			<aside className="rounded-none border bg-card p-2">
				<nav className="grid gap-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.to}
								to={item.to}
								activeProps={{ "data-active": true }}
								className="flex h-9 items-center gap-2 px-3 text-muted-foreground text-sm transition hover:bg-muted hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
							>
								<Icon data-icon="inline-start" />
								{item.label}
							</Link>
						);
					})}
				</nav>
			</aside>
			<section className="grid min-w-0 gap-4">
				<div>
					<h1 className="font-semibold text-2xl">{title}</h1>
					<p className="text-muted-foreground text-sm">{description}</p>
				</div>
				{children}
			</section>
		</main>
	);
}
