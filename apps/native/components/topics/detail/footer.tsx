import { Spinner, Typography } from "heroui-native";
import { View } from "react-native";

export function TopicFooter({
	hasItems,
	hasMore,
	isLoading,
}: {
	hasItems: boolean;
	hasMore: boolean;
	isLoading: boolean;
}) {
	if (!hasItems) return null;

	if (isLoading) {
		return (
			<View className="items-center py-5">
				<Spinner size="sm" />
			</View>
		);
	}

	if (!hasMore) {
		return (
			<View className="items-center py-5">
				<Typography.Paragraph type="body-xs" color="muted">
					没有更多了
				</Typography.Paragraph>
			</View>
		);
	}

	return <View className="h-5" />;
}
