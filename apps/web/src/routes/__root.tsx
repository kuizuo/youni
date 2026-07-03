import { Button, Card } from "@heroui/react";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { orpc } from "@/utils/orpc";

import "../index.css";

export interface RouterAppContext {
	orpc: typeof orpc;
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	component: RootComponent,
	head: () => ({
		meta: [
			{
				title: "Youni",
			},
			{
				name: "description",
				content: "Youni is a web application",
			},
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
		],
	}),
	notFoundComponent: NotFoundComponent,
});

function RootComponent() {
	return (
		<>
			<HeadContent />
			<Outlet />
			<TanStackRouterDevtools position="bottom-left" />
			<ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
		</>
	);
}

function NotFoundComponent() {
	const navigate = useNavigate();

	return (
		<main className="mx-auto flex min-h-svh w-full max-w-md items-center px-4">
			<Card>
				<Card.Header>
					<Card.Title>页面不存在</Card.Title>
					<Card.Description>这个页面已经移除或地址不正确。</Card.Description>
				</Card.Header>
				<Card.Content>
					<Button fullWidth onPress={() => navigate({ to: "/admin" })}>
						返回后台
					</Button>
				</Card.Content>
			</Card>
		</main>
	);
}
