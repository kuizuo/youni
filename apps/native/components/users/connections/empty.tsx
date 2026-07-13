import type { ProfileConnectionType } from "@youni/api/contracts/profiles";
import { Spinner } from "heroui-native";
import { View } from "react-native";

import { EmptyState, ErrorState } from "@/components/social-states";

export function ConnectionsEmptyState({
	activeType,
	isError,
	isLoading,
	onRetry,
}: {
	activeType: ProfileConnectionType;
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
		return <ErrorState onRetry={onRetry} />;
	}
	return (
		<EmptyState
			icon="people-outline"
			title={
				activeType === "following"
					? "关注的人会出现在这里，去发现吧"
					: "有新朋友关注你时，会显示在这里"
			}
		/>
	);
}
