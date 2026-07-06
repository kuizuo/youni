import {
	focusManager,
	onlineManager,
	QueryClientProvider,
	type QueryKey,
	useQueryClient,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { useFocusEffect } from "expo-router";
import {
	type PropsWithChildren,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { AppState, type AppStateStatus, Platform } from "react-native";

import { queryClient } from "@/lib/query/query-client";

let hasOnlineManagerListener = false;

function getIsOnline(state: Network.NetworkState): boolean {
	return state.isInternetReachable ?? state.isConnected ?? true;
}

function configureOnlineManager(): void {
	if (hasOnlineManagerListener) {
		return;
	}

	hasOnlineManagerListener = true;

	onlineManager.setEventListener((setOnline) => {
		let hasNetworkEvent = false;

		const subscription = Network.addNetworkStateListener((state) => {
			hasNetworkEvent = true;
			setOnline(getIsOnline(state));
		});

		Network.getNetworkStateAsync()
			.then((state) => {
				if (!hasNetworkEvent) {
					setOnline(getIsOnline(state));
				}
			})
			.catch(() => {});

		return () => subscription.remove();
	});
}

function onAppStateChange(status: AppStateStatus): void {
	if (Platform.OS !== "web") {
		focusManager.setFocused(status === "active");
	}
}

function QueryLifecycleBridge() {
	useEffect(() => {
		configureOnlineManager();

		if (Platform.OS === "web") {
			return;
		}

		onAppStateChange(AppState.currentState);
		const subscription = AppState.addEventListener("change", onAppStateChange);

		return () => subscription.remove();
	}, []);

	return null;
}

export function ReactNativeQueryProvider({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<QueryLifecycleBridge />
			{children}
		</QueryClientProvider>
	);
}

export function useRefreshOnFocus(queryKey?: QueryKey): void {
	const firstFocusRef = useRef(true);
	const client = useQueryClient();

	useFocusEffect(
		useCallback(() => {
			if (firstFocusRef.current) {
				firstFocusRef.current = false;
				return;
			}

			client.refetchQueries({
				queryKey,
				stale: true,
				type: "active",
			});
		}, [client, queryKey]),
	);
}

export function useFocusedQuerySubscription(): { subscribed: boolean } {
	const [isFocused, setIsFocused] = useState(false);

	useFocusEffect(
		useCallback(() => {
			setIsFocused(true);

			return () => setIsFocused(false);
		}, []),
	);

	return useMemo(() => ({ subscribed: isFocused }), [isFocused]);
}
