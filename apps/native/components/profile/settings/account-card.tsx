import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	ListGroup,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

export function SettingsAccountCard({
	displayHandle,
	displayName,
	image,
	isLoading,
	onPress,
}: {
	displayHandle?: null | string;
	displayName: string;
	image?: null | string;
	isLoading: boolean;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<ListGroup className="overflow-hidden rounded-3xl">
			<ListGroup.Item
				accessibilityLabel="编辑个人资料"
				accessibilityRole="button"
				className="gap-3 px-4 py-4"
				onPress={onPress}
			>
				<ListGroup.ItemPrefix>
					<Avatar size="lg" alt={displayName}>
						{image ? <Avatar.Image source={{ uri: image }} /> : null}
						<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
					</Avatar>
				</ListGroup.ItemPrefix>
				<ListGroup.ItemContent>
					<Typography.Paragraph weight="bold" numberOfLines={1}>
						{displayName}
					</Typography.Paragraph>
					<Typography.Paragraph
						type="body-sm"
						color="muted"
						numberOfLines={1}
						selectable
					>
						{displayHandle ?? "登录账号"}
					</Typography.Paragraph>
				</ListGroup.ItemContent>
				<ListGroup.ItemSuffix>
					{isLoading ? (
						<Spinner size="sm" />
					) : (
						<View className="flex-row items-center gap-1.5">
							<Typography.Paragraph type="body-xs" color="muted">
								个人资料
							</Typography.Paragraph>
							<Ionicons name="chevron-forward" size={18} color={mutedColor} />
						</View>
					)}
				</ListGroup.ItemSuffix>
			</ListGroup.Item>
		</ListGroup>
	);
}
