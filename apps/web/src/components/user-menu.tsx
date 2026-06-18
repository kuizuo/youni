import { Button, Skeleton } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";

import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
	const navigate = useNavigate();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-9 w-24 rounded-2xl" />;
	}

	if (!session) {
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

	return (
		<div className="flex items-center gap-2">
			<div className="hidden text-right text-sm sm:block">
				<div className="font-medium text-foreground">{session.user.name}</div>
				<div className="text-muted text-xs">{session.user.email}</div>
			</div>
			<Button
				size="sm"
				variant="danger"
				onPress={() => {
					authClient.signOut({
						fetchOptions: {
							onSuccess: () => {
								navigate({
									to: "/",
								});
							},
						},
					});
				}}
			>
				Sign Out
			</Button>
		</div>
	);
}
