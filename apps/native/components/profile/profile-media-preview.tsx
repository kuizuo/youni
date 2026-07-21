import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Button, Spinner, Typography, useThemeColor } from "heroui-native";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";

type PreviewAction = {
	isLoading: boolean;
	label: string;
	loadingLabel: string;
	onPress: () => void;
};

export function ProfileCoverPreview({
	action,
	image,
	insetsBottom,
	insetsTop,
	isVisible,
	onClose,
}: {
	action?: PreviewAction;
	image?: null | string;
	insetsBottom: number;
	insetsTop: number;
	isVisible: boolean;
	onClose: () => void;
}) {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const dimensions = useWindowDimensions();
	const previewWidth = dimensions.width;
	const previewHeight = Math.min(dimensions.height * 0.5, previewWidth * 0.62);

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			transparent
			visible={isVisible}
		>
			<View className="flex-1 bg-black">
				<Pressable className="absolute inset-0" onPress={onClose} />
				<PreviewCloseButton
					accessibilityLabel="关闭背景图预览"
					insetsTop={insetsTop}
					onClose={onClose}
				/>

				<View className="flex-1 items-center justify-center">
					{image ? (
						<Image
							source={{ uri: image }}
							contentFit="cover"
							className="bg-white/10"
							style={{ height: previewHeight, width: previewWidth }}
						/>
					) : null}
				</View>

				{action ? (
					<View
						className="absolute right-4 left-4"
						style={{ bottom: Math.max(insetsBottom, 16) }}
					>
						<Button
							variant="primary"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							isDisabled={action.isLoading}
							onPress={action.onPress}
						>
							{action.isLoading ? (
								<Spinner size="sm" color={accentForegroundColor} />
							) : null}
							<Button.Label>
								{action.isLoading ? action.loadingLabel : action.label}
							</Button.Label>
						</Button>
					</View>
				) : null}
			</View>
		</Modal>
	);
}

export function ProfileAvatarPreview({
	action,
	displayName,
	image,
	initial,
	insetsBottom,
	insetsTop,
	isVisible,
	onClose,
}: {
	action?: PreviewAction;
	displayName: string;
	image?: null | string;
	initial: string;
	insetsBottom: number;
	insetsTop: number;
	isVisible: boolean;
	onClose: () => void;
}) {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const dimensions = useWindowDimensions();
	const previewSize = Math.min(dimensions.width - 48, 320);

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			transparent
			visible={isVisible}
		>
			<View className="flex-1 bg-black">
				<Pressable className="absolute inset-0" onPress={onClose} />
				<PreviewCloseButton
					accessibilityLabel="关闭头像预览"
					insetsTop={insetsTop}
					onClose={onClose}
				/>

				<View className="flex-1 items-center justify-center px-6">
					{image ? (
						<Image
							source={{ uri: image }}
							contentFit="cover"
							className="bg-white/10"
							style={{
								borderRadius: previewSize / 2,
								height: previewSize,
								width: previewSize,
							}}
						/>
					) : (
						<View
							accessibilityLabel={displayName}
							className="items-center justify-center bg-white/10"
							style={{
								borderRadius: previewSize / 2,
								height: previewSize,
								width: previewSize,
							}}
						>
							<Typography.Paragraph
								weight="bold"
								style={{ color: "#ffffff", fontSize: 88, lineHeight: 104 }}
							>
								{initial}
							</Typography.Paragraph>
						</View>
					)}
				</View>

				{action ? (
					<View
						className="absolute right-4 left-4"
						style={{ bottom: Math.max(insetsBottom, 16) }}
					>
						<Button
							variant="primary"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							isDisabled={action.isLoading}
							onPress={action.onPress}
						>
							{action.isLoading ? (
								<Spinner size="sm" color={accentForegroundColor} />
							) : (
								<Ionicons
									name="camera-outline"
									size={18}
									color={accentForegroundColor}
								/>
							)}
							<Button.Label>
								{action.isLoading ? action.loadingLabel : action.label}
							</Button.Label>
						</Button>
					</View>
				) : null}
			</View>
		</Modal>
	);
}

function PreviewCloseButton({
	accessibilityLabel,
	insetsTop,
	onClose,
}: {
	accessibilityLabel: string;
	insetsTop: number;
	onClose: () => void;
}) {
	return (
		<View
			className="absolute right-4 left-4 z-10 flex-row justify-end"
			style={{ top: insetsTop + 12 }}
		>
			<Button
				isIconOnly
				variant="ghost"
				className="rounded-full bg-white/15"
				accessibilityLabel={accessibilityLabel}
				onPress={onClose}
			>
				<Ionicons name="close" size={22} color="#ffffff" />
			</Button>
		</View>
	);
}
