import { Card } from "@heroui/react";
import { createFileRoute, Navigate } from "@tanstack/react-router";

import SignInForm from "@/components/sign-in-form";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_public/login")({
	component: RouteComponent,
});

function RouteComponent() {
	const session = authClient.useSession();

	if (session.data?.user) {
		return <Navigate replace to="/admin" />;
	}

	return (
		<main className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
			<img
				alt=""
				aria-hidden
				className="absolute inset-0 size-full object-cover opacity-80"
				src="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr"
			/>

			<Card className="relative w-full max-w-lg gap-0 border border-separator bg-surface/90 p-7 shadow-xl backdrop-blur sm:p-10">
				<div className="mb-8">
					<img
						alt="Youni"
						className="mx-auto h-12 w-auto"
						src="/youni-logo.svg"
					/>
				</div>
				<Card.Header className="mb-8 gap-2 p-0 text-center">
					<Card.Title className="text-3xl tracking-tight">欢迎回来</Card.Title>
				</Card.Header>
				<Card.Content className="p-0">
					<SignInForm />
				</Card.Content>
			</Card>
		</main>
	);
}
