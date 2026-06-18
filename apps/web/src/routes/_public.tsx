import { createFileRoute, Outlet } from "@tanstack/react-router";

import Header from "@/components/header";

export const Route = createFileRoute("/_public")({
	component: PublicLayoutRoute,
});

function PublicLayoutRoute() {
	return (
		<div className="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			<Outlet />
		</div>
	);
}
