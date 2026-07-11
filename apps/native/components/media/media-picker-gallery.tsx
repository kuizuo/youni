import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Spinner, useThemeColor } from "heroui-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { mediaPickerStyles as styles } from "./media-picker-styles";

export function PickerHeader({
	isCompleting,
	onClose,
	onComplete,
	selectedCount,
}: {
	isCompleting: boolean;
	onClose: () => void;
	onComplete: () => void;
	selectedCount: number;
}) {
	const themeColor = useThemeColor("accent");
	const themeForegroundColor = useThemeColor("accent-foreground");

	return (
		<View style={styles.header}>
			<Pressable accessibilityLabel="关闭相册" hitSlop={12} onPress={onClose}>
				<Ionicons color="#fff" name="close" size={34} />
			</Pressable>
			<View />
			<Pressable
				accessibilityRole="button"
				disabled={selectedCount === 0 || isCompleting}
				onPress={onComplete}
				style={[
					styles.doneButton,
					{ backgroundColor: themeColor },
					selectedCount === 0 && styles.doneButtonDisabled,
				]}
			>
				<Text style={[styles.doneText, { color: themeForegroundColor }]}>
					{isCompleting
						? "处理中"
						: `完成${selectedCount ? `(${selectedCount})` : ""}`}
				</Text>
			</Pressable>
		</View>
	);
}

export function PermissionBanner({ onPress }: { onPress: () => void }) {
	return (
		<Pressable onPress={onPress} style={styles.permissionBanner}>
			<Ionicons color="#9d9d9d" name="information-circle-outline" size={22} />
			<Text numberOfLines={1} style={styles.permissionBannerText}>
				你已设置只能访问部分照片，建议允许访问「所有照片」
			</Text>
			<Ionicons color="#9d9d9d" name="chevron-forward" size={22} />
		</Pressable>
	);
}

export function PermissionMessage() {
	return (
		<View style={styles.permissionMessage}>
			<Ionicons color="#8a8a8a" name="images-outline" size={36} />
			<Text style={styles.permissionMessageTitle}>无法读取照片</Text>
			<Text style={styles.permissionMessageText}>
				你没有允许 Youni 访问照片，仍可切换到拍照添加图片。
			</Text>
		</View>
	);
}

export function AddMoreTile({
	isBusy,
	onPress,
	size,
}: {
	isBusy: boolean;
	onPress: () => void;
	size: number;
}) {
	return (
		<Pressable
			accessibilityLabel="添加更多可选照片"
			onPress={onPress}
			style={[styles.addMoreTile, { height: size, width: size }]}
		>
			{isBusy ? (
				<Spinner color="warning" size="sm" />
			) : (
				<Ionicons color="#8d8d8d" name="add" size={38} />
			)}
			<Text style={styles.addMoreText}>添加更多</Text>
			<Text style={styles.addMoreText}>可选照片</Text>
		</Pressable>
	);
}

export function PhotoTile({
	item,
	onPress,
	selectionNumber,
	size,
}: {
	item: { kind: "camera" | "library"; previewUri: string };
	onPress: () => void;
	selectionNumber: number;
	size: number;
}) {
	const selected = selectionNumber > 0;
	const themeColor = useThemeColor("accent");
	const themeForegroundColor = useThemeColor("accent-foreground");
	return (
		<Pressable
			accessibilityLabel={
				selected ? `已选择，第 ${selectionNumber} 张` : "选择照片"
			}
			onPress={onPress}
			style={{ height: size, width: size }}
		>
			<Image
				contentFit="cover"
				source={item.previewUri}
				style={StyleSheet.absoluteFill}
			/>
			{selected ? <View style={styles.selectedOverlay} /> : null}
			<View
				style={[
					styles.selectionBadge,
					selected && styles.selectionBadgeSelected,
					selected && {
						backgroundColor: themeColor,
						borderColor: themeColor,
					},
				]}
			>
				{selected ? (
					<Text
						style={[styles.selectionNumber, { color: themeForegroundColor }]}
					>
						{selectionNumber}
					</Text>
				) : null}
			</View>
			{item.kind === "camera" ? (
				<View style={styles.cameraLabel}>
					<Ionicons color="#fff" name="camera" size={12} />
				</View>
			) : null}
		</Pressable>
	);
}

export function PickerTabs({
	bottomInset,
	onAlbumPress,
	onCameraPress,
}: {
	bottomInset: number;
	onAlbumPress: () => void;
	onCameraPress: () => void;
}) {
	const themeColor = useThemeColor("accent");

	return (
		<View style={[styles.tabs, { paddingBottom: Math.max(bottomInset, 12) }]}>
			<Pressable onPress={onAlbumPress} style={styles.tab}>
				<Text style={[styles.tabText, styles.tabTextActive]}>相册</Text>
				<View style={[styles.tabIndicator, { backgroundColor: themeColor }]} />
			</Pressable>
			<Pressable onPress={onCameraPress} style={styles.tab}>
				<Text style={styles.tabText}>拍照</Text>
			</Pressable>
		</View>
	);
}
