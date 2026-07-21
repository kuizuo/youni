import { Ionicons } from "@expo/vector-icons";
import {
	CameraView,
	scanFromURLAsync,
	useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, Typography, useThemeColor } from "heroui-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScanBottomAction } from "@/components/messages/scan/bottom-action";
import { CameraPermissionState } from "@/components/messages/scan/permission-state";
import { ScanFrame } from "@/components/messages/scan/scan-frame";
import { ScanOverlay } from "@/components/messages/scan/scan-overlay";
import { getUserIdFromCode } from "@/components/messages/scan/utils";
import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { useAppToast } from "@/utils/app-toast";

export default function ScanScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const socialNavigation = useSocialNavigation();
	const { toast } = useAppToast();
	const [permission, requestPermission] = useCameraPermissions();
	const [torchEnabled, setTorchEnabled] = useState(false);
	const [lastScannedValue, setLastScannedValue] = useState<string | null>(null);
	const mutedColor = useThemeColor("muted");

	const handleScan = ({ data }: { data: string }) => {
		if (data === lastScannedValue) return;
		setLastScannedValue(data);
		const userId = getUserIdFromCode(data);
		if (userId) {
			socialNavigation.replaceWith({ type: "user", id: userId });
			return;
		}
		toast.show({
			label: "不是有效的 Youni 好友二维码",
			variant: "warning",
		});
	};

	const handleGalleryScan = async () => {
		try {
			const mediaPermission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!mediaPermission.granted) {
				toast.show({
					label: "需要相册权限才能选择二维码",
					variant: "warning",
				});
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				allowsEditing: false,
				mediaTypes: "images",
				preferredAssetRepresentationMode:
					ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
				quality: 1,
				shouldDownloadFromNetwork: true,
			});
			if (result.canceled) return;

			const asset = result.assets[0];
			if (!asset) return;

			const codes = await scanFromURLAsync(asset.uri, ["qr"]);
			if (codes.length === 0) {
				toast.show({
					label: "图片中没有识别到二维码",
					variant: "warning",
				});
				return;
			}

			const userId = codes
				.map(({ data }) => getUserIdFromCode(data))
				.find((value) => value !== null);
			if (!userId) {
				toast.show({
					label: "不是有效的 Youni 好友二维码",
					variant: "warning",
				});
				return;
			}

			socialNavigation.replaceWith({ type: "user", id: userId });
		} catch {
			toast.show({
				label: "二维码识别失败，请换一张图片重试",
				variant: "danger",
			});
		}
	};

	if (!permission) {
		return <View className="flex-1 bg-black" />;
	}

	if (!permission.granted) {
		return (
			<CameraPermissionState
				onBack={() => router.back()}
				onRequestPermission={requestPermission}
			/>
		);
	}

	return (
		<View className="flex-1 bg-black">
			<CameraView
				style={StyleSheet.absoluteFill}
				facing="back"
				enableTorch={torchEnabled}
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={handleScan}
			/>
			<ScanOverlay mutedColor={mutedColor} />
			<View
				className="flex-1"
				style={{
					paddingBottom: insets.bottom + 28,
					paddingTop: insets.top + 10,
				}}
			>
				<View className="h-12 flex-row items-center px-4">
					<Button
						isIconOnly
						variant="ghost"
						className="h-11 w-11 rounded-full"
						feedbackVariant="scale-ripple"
						accessibilityLabel="返回"
						onPress={() => router.back()}
					>
						<Ionicons
							name="chevron-back"
							size={APP_HEADER_ICON_SIZE}
							color="#ffffff"
						/>
					</Button>
				</View>

				<View className="flex-1 justify-center px-8">
					<ScanFrame>
						<View className="items-center gap-3">
							<Button
								isIconOnly
								variant="ghost"
								className="h-12 w-12 rounded-full bg-black/30"
								feedbackVariant="scale-ripple"
								accessibilityLabel="切换手电筒"
								onPress={() => setTorchEnabled((value) => !value)}
							>
								<Ionicons
									name={torchEnabled ? "flash" : "flashlight-outline"}
									size={22}
									color="#ffffff"
								/>
							</Button>
							<Typography.Paragraph style={{ color: "#ffffff" }}>
								轻触照亮
							</Typography.Paragraph>
						</View>
					</ScanFrame>
					<Typography.Paragraph
						align="center"
						weight="semibold"
						className="pt-12"
						style={{ color: "#ffffff" }}
					>
						请将二维码对准扫码框中心
					</Typography.Paragraph>
				</View>

				<View className="flex-row items-center justify-around px-12">
					<ScanBottomAction
						icon="qr-code-outline"
						label="我的二维码"
						onPress={() => router.push("/add-friend" as Href)}
					/>
					<ScanBottomAction
						icon="image-outline"
						label="相册"
						onPress={handleGalleryScan}
					/>
				</View>
			</View>
		</View>
	);
}
