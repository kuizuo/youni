import { Redirect } from "expo-router";
import { Spinner } from "heroui-native";
import type { ReactNode } from "react";
import { View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";

type AuthRequiredProps = {
	children: ReactNode;
	redirectTo: string;
};

export function AuthRequired({ children, redirectTo }: AuthRequiredProps) {
	const session = authClient.useSession();

	if (session.isPending) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<Spinner />
			</View>
		);
	}

	if (!session.data?.user) {
		return <Redirect href={getLoginHref(redirectTo)} />;
	}

	return children;
}
