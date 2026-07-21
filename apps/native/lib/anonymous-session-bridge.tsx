import * as Network from "expo-network";
import { useEffect } from "react";
import { AppState } from "react-native";

import { ensureAnonymousSession } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import { isNetworkRequestError } from "@/utils/request-timeout";

async function establishAnonymousSession(refetch: () => Promise<unknown>) {
	try {
		await ensureAnonymousSession();
		await refetch();
	} catch (error) {
		if (!isNetworkRequestError(error)) {
			console.warn("Anonymous session setup failed", error);
		}
	}
}

export function AnonymousSessionBridge() {
	const session = authClient.useSession();

	useEffect(() => {
		if (session.isPending || session.data?.user) return;

		void establishAnonymousSession(session.refetch);
	}, [session.data?.user, session.isPending, session.refetch]);

	useEffect(() => {
		const subscription = AppState.addEventListener("change", (state) => {
			if (state !== "active") return;
			void establishAnonymousSession(session.refetch);
		});

		return () => subscription.remove();
	}, [session.refetch]);

	useEffect(() => {
		const subscription = Network.addNetworkStateListener((state) => {
			if (!state.isConnected || state.isInternetReachable === false) return;
			void establishAnonymousSession(session.refetch);
		});

		return () => subscription.remove();
	}, [session.refetch]);

	return null;
}
