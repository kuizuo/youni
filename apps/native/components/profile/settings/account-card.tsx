import { Avatar, Spinner, Surface, Text } from "heroui-native";
import { View } from "react-native";

export function SettingsAccountCard({
	displayHandle,
	displayName,
	image,
	isLoading,
}: {
	displayHandle?: null | string;
	displayName: string;
	image?: null | string;
	isLoading: boolean;
}) {
	return (
		<Surface className="gap-4 rounded-3xl p-4">
			<View className="flex-row items-center gap-3">
				<Avatar size="lg" alt={displayName}>
					{image ? <Avatar.Image source={{ uri: image }} /> : null}
					<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
				</Avatar>
				<View className="min-w-0 flex-1">
					<Text.Paragraph weight="bold" numberOfLines={1}>
						{displayName}
					</Text.Paragraph>
					<Text.Paragraph
						type="body-sm"
						color="muted"
						numberOfLines={1}
						selectable
					>
						{displayHandle ?? "登录账号"}
					</Text.Paragraph>
				</View>
				{isLoading ? <Spinner size="sm" /> : null}
			</View>
		</Surface>
	);
}
