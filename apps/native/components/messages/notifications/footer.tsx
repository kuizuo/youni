import { Spinner } from "heroui-native";
import { View } from "react-native";

export function NotificationListFooter({ isLoading }: { isLoading: boolean }) {
	if (!isLoading) return null;

	return (
		<View className="items-center py-5">
			<Spinner />
		</View>
	);
}
