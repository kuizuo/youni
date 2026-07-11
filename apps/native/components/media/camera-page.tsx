import { Ionicons } from "@expo/vector-icons";
import {
	type CameraCapturedPicture,
	CameraView,
	type useCameraPermissions,
} from "expo-camera";
import { Image } from "expo-image";
import { useThemeColor } from "heroui-native";
import type { RefObject } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { mediaPickerStyles as styles } from "./media-picker-styles";

export function CameraPage({
	cameraFacing,
	cameraPermission,
	cameraRef,
	capturedPicture,
	flash,
	insets,
	isCameraReady,
	isTakingPicture,
	onBackToAlbum,
	onCameraReady,
	onFacingChange,
	onFlashChange,
	onRequestPermission,
	onRetake,
	onTakePicture,
	onUsePicture,
}: {
	cameraFacing: "back" | "front";
	cameraPermission: ReturnType<typeof useCameraPermissions>[0];
	cameraRef: RefObject<CameraView | null>;
	capturedPicture: CameraCapturedPicture | null;
	flash: "auto" | "off" | "on";
	insets: { bottom: number; top: number };
	isCameraReady: boolean;
	isTakingPicture: boolean;
	onBackToAlbum: () => void;
	onCameraReady: () => void;
	onFacingChange: () => void;
	onFlashChange: () => void;
	onRequestPermission: () => Promise<unknown>;
	onRetake: () => void;
	onTakePicture: () => void;
	onUsePicture: () => void;
}) {
	const themeColor = useThemeColor("accent");
	const themeForegroundColor = useThemeColor("accent-foreground");

	if (!cameraPermission?.granted) {
		return (
			<View style={[styles.cameraPermission, { paddingTop: insets.top }]}>
				<Pressable
					accessibilityLabel="返回相册"
					onPress={onBackToAlbum}
					style={[styles.cameraBack, { top: insets.top + 8 }]}
				>
					<Ionicons color="#fff" name="chevron-back" size={30} />
				</Pressable>
				<Ionicons color="#888" name="camera-outline" size={48} />
				<Text style={styles.cameraPermissionTitle}>需要相机权限</Text>
				<Text style={styles.cameraPermissionText}>
					允许后才能拍摄照片，不会申请麦克风权限。
				</Text>
				{!cameraPermission || cameraPermission.canAskAgain ? (
					<Pressable
						onPress={() => void onRequestPermission()}
						style={[styles.permissionButton, { backgroundColor: themeColor }]}
					>
						<Text
							style={[
								styles.permissionButtonText,
								{ color: themeForegroundColor },
							]}
						>
							允许使用相机
						</Text>
					</Pressable>
				) : null}
			</View>
		);
	}

	if (capturedPicture) {
		return (
			<View style={styles.cameraRoot}>
				<Image
					contentFit="contain"
					source={capturedPicture.uri}
					style={StyleSheet.absoluteFill}
				/>
				<View
					style={[styles.previewActions, { paddingBottom: insets.bottom + 28 }]}
				>
					<Pressable onPress={onRetake} style={styles.previewButton}>
						<Text style={styles.previewButtonText}>重拍</Text>
					</Pressable>
					<Pressable
						onPress={onUsePicture}
						style={[
							styles.previewButton,
							styles.previewButtonPrimary,
							{ backgroundColor: themeColor },
						]}
					>
						<Text
							style={[
								styles.previewButtonText,
								styles.previewButtonPrimaryText,
								{ color: themeForegroundColor },
							]}
						>
							使用照片
						</Text>
					</Pressable>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.cameraRoot}>
			<CameraView
				active
				facing={cameraFacing}
				flash={flash}
				mirror={cameraFacing === "front"}
				mode="picture"
				onCameraReady={onCameraReady}
				ref={cameraRef}
				style={StyleSheet.absoluteFill}
			/>
			<View style={[styles.cameraTop, { paddingTop: insets.top + 8 }]}>
				<Pressable
					accessibilityLabel="返回相册"
					onPress={onBackToAlbum}
					style={styles.roundIconButton}
				>
					<Ionicons color="#fff" name="close" size={30} />
				</Pressable>
				<Pressable
					accessibilityLabel="切换闪光灯"
					onPress={onFlashChange}
					style={styles.roundIconButton}
				>
					<Ionicons
						color="#fff"
						name={flash === "off" ? "flash-off" : "flash"}
						size={22}
					/>
					<Text style={styles.flashLabel}>
						{flash === "auto" ? "A" : flash === "on" ? "开" : ""}
					</Text>
				</Pressable>
			</View>
			<View
				style={[styles.cameraControls, { paddingBottom: insets.bottom + 24 }]}
			>
				<View style={styles.cameraControlSpacer} />
				<Pressable
					accessibilityLabel="拍照"
					disabled={!isCameraReady || isTakingPicture}
					onPress={onTakePicture}
					style={styles.shutterOuter}
				>
					<View style={styles.shutterInner} />
				</Pressable>
				<Pressable
					accessibilityLabel="切换前后镜头"
					onPress={onFacingChange}
					style={styles.flipButton}
				>
					<Ionicons color="#fff" name="camera-reverse-outline" size={30} />
				</Pressable>
			</View>
		</View>
	);
}
