import { Ionicons } from "@expo/vector-icons";
import {
	Avatar,
	PressableFeedback,
	Spinner,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

export function EditableAvatar({
	alt,
	image,
	initial,
	isDisabled = false,
	isUploading,
	onPress,
}: {
	alt: string;
	image?: null | string;
	initial: string;
	isDisabled?: boolean;
	isUploading: boolean;
	onPress: () => void;
}) {
	const accentColor = useThemeColor("accent");
	const accentForegroundColor = useThemeColor("accent-foreground");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel="更换头像"
			isDisabled={isDisabled || isUploading}
			onPress={onPress}
		>
			<View className="relative">
				<Avatar size="md" alt={alt}>
					{image ? <Avatar.Image source={{ uri: image }} /> : null}
					<Avatar.Fallback>{initial}</Avatar.Fallback>
				</Avatar>
				<View
					className="absolute -right-1 -bottom-1 size-6 items-center justify-center rounded-full border-2 border-background"
					style={{ backgroundColor: accentColor }}
				>
					{isUploading ? (
						<Spinner size="sm" color={accentForegroundColor} />
					) : (
						<Ionicons
							name="camera-outline"
							size={14}
							color={accentForegroundColor}
						/>
					)}
				</View>
			</View>
		</PressableFeedback>
	);
}
