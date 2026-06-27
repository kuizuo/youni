import { Card } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";

import SignInForm from "@/components/sign-in-form";

export const Route = createFileRoute("/_public/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="relative flex min-h-[calc(100svh-48px)] items-center justify-center overflow-hidden px-4 py-10">
			<img
				src="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr"
				alt=""
				className="absolute inset-0 size-full object-cover opacity-80"
			/>
			<Card className="relative w-full max-w-md bg-surface/90 backdrop-blur">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-accent font-semibold text-accent-foreground">
						Y
					</div>
					<h1 className="font-semibold text-2xl">Youni Admin</h1>
					<p className="mt-1 text-muted text-sm">内容审核与社区运营后台</p>
				</div>
				<SignInForm />
			</Card>
		</main>
	);
}
