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
					<img
						alt="Youni"
						className="mx-auto mb-3 h-14 w-auto"
						src="/youni-logo.svg"
					/>
				</div>
				<SignInForm />
			</Card>
		</main>
	);
}
