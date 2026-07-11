import { Spinner } from "heroui-native";
import { View } from "react-native";

import { EmptyState, ErrorState } from "@/components/social-states";

import type { ConnectionType } from "./types";

export function ConnectionsEmptyState({
	activeType,
	isError,
	isLoading,
	onRetry,
}: {
	activeType: ConnectionType;
	isError: boolean;
	isLoading: boolean;
	onRetry: () => void;
}) {
	if (isLoading) {
		return (
			<View className="items-center py-16">
				<Spinner />
			</View>
		);
	}
	if (isError) {
		return (
			<ErrorState
				description="列表暂时没有加载出来，请稍后重试。"
				onRetry={onRetry}
			/>
		);
	}
	return (
		<EmptyState
			icon="people-outline"
			title={activeType === "following" ? "还没有关注" : "还没有粉丝"}
		/>
	);
}
