import { Button, Card, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin-shell";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin")({
	component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
	const navigate = useNavigate();
	const session = authClient.useSession();
	const admin = useQuery({
		...orpc.admin.me.queryOptions(),
		enabled: !!session.data?.user,
		retry: false,
	});

	if (session.isPending || admin.isLoading) {
		return <AdminLoadingScreen />;
	}

	if (!session.data?.user || admin.isError) {
		return (
			<main className="mx-auto flex min-h-svh w-full max-w-md items-center px-4">
				<Card>
					<Card.Header>
						<Card.Title>无法进入后台</Card.Title>
						<Card.Description>
							请使用管理员或运营账号登录后再访问后台。
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<Button fullWidth onPress={() => navigate({ to: "/login" })}>
							去登录
						</Button>
					</Card.Content>
				</Card>
			</main>
		);
	}

	return (
		<AdminShell user={session.data.user}>
			<Outlet />
		</AdminShell>
	);
}

function AdminLoadingScreen() {
	return (
		<main className="grid min-h-svh bg-background lg:grid-cols-[240px_minmax(0,1fr)]">
			<aside className="hidden border-separator border-r bg-surface px-3 py-4 lg:flex lg:flex-col">
				<div className="flex items-center gap-3 px-1 py-1">
					<Skeleton className="size-9 rounded-2xl" />
					<div className="grid flex-1 gap-2">
						<Skeleton className="h-4 w-28 rounded-lg" />
						<Skeleton className="h-3 w-24 rounded-lg" />
					</div>
				</div>
				<div className="mt-6 grid gap-2">
					{["overview", "notes", "topics", "users"].map((item) => (
						<div
							key={item}
							className="flex items-center gap-3 rounded-2xl px-2 py-2"
						>
							<Skeleton className="size-4 rounded-md" />
							<Skeleton className="h-4 w-20 rounded-lg" />
						</div>
					))}
				</div>
			</aside>
			<section className="flex min-w-0 flex-col">
				<header className="flex h-16 items-center gap-3 border-separator border-b px-5">
					<Skeleton className="size-7 rounded-lg lg:hidden" />
					<Skeleton className="h-6 w-24 rounded-lg" />
					<div className="ml-auto flex items-center gap-2">
						<Skeleton className="size-9 rounded-full" />
						<Skeleton className="size-9 rounded-full" />
						<Skeleton className="hidden h-9 w-28 rounded-full md:block" />
					</div>
				</header>
				<div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 pt-4 pb-10">
					<Skeleton className="h-4 w-64 rounded-lg" />
					<Card>
						<Card.Content className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
							{["notes", "audit", "users", "interactions"].map((item) => (
								<div key={item} className="grid gap-4">
									<div className="flex items-center gap-3">
										<Skeleton className="size-8 rounded-2xl" />
										<Skeleton className="h-4 w-20 rounded-lg" />
									</div>
									<Skeleton className="h-8 w-14 rounded-lg" />
								</div>
							))}
						</Card.Content>
					</Card>
					<Card>
						<Card.Content className="grid gap-3 p-4">
							<Skeleton className="h-5 w-24 rounded-lg" />
							<Skeleton className="h-4 w-56 rounded-lg" />
							<div className="mt-2 grid gap-2">
								{["header", "row-1", "row-2", "row-3"].map((item) => (
									<Skeleton key={item} className="h-12 rounded-xl" />
								))}
							</div>
						</Card.Content>
					</Card>
				</div>
			</section>
		</main>
	);
}
