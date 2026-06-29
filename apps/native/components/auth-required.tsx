import { useRouter } from "expo-router";
import { Spinner } from "heroui-native";
import { type ReactNode, useEffect } from "react";
import { View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";

type AuthRequiredProps = {
	children: ReactNode;
	redirectTo: string;
};

export function AuthRequired({ children, redirectTo }: AuthRequiredProps) {
	const router = useRouter();
	const session = authClient.useSession();

	useEffect(() => {
		if (!session.isPending && !session.data?.user) {
			router.replace(getLoginHref(redirectTo));
		}
	}, [redirectTo, router, session.data?.user, session.isPending]);

	if (session.isPending || !session.data?.user) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		);
	}

	return children;
}
