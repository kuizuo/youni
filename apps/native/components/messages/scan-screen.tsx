import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, Text, useThemeColor } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScanBottomAction } from "@/components/messages/scan/bottom-action";
import { CameraPermissionState } from "@/components/messages/scan/permission-state";
import { ScanFrame } from "@/components/messages/scan/scan-frame";
import { ScanOverlay } from "@/components/messages/scan/scan-overlay";
import { getUserIdFromCode } from "@/components/messages/scan/utils";
import { AppHeading } from "@/components/shared/app-heading";
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
		toast.show({ label: "已识别二维码", description: data.slice(0, 80) });
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
				style={{ flex: 1 }}
				facing="back"
				enableTorch={torchEnabled}
				barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
				onBarcodeScanned={handleScan}
			>
				<View
					className="flex-1"
					style={{
						paddingBottom: insets.bottom + 28,
						paddingTop: insets.top + 10,
					}}
				>
					<View className="h-12 flex-row items-center justify-between px-4">
						<Button
							isIconOnly
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel="返回"
							onPress={() => router.back()}
						>
							<Ionicons name="chevron-back" size={28} color="#ffffff" />
						</Button>
						<AppHeading type="h2" style={{ color: "#ffffff" }}>
							扫描二维码
						</AppHeading>
						<View className="size-10" />
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
								<Text.Paragraph style={{ color: "#ffffff" }}>
									轻触照亮
								</Text.Paragraph>
							</View>
						</ScanFrame>
						<Text.Paragraph
							align="center"
							weight="semibold"
							className="pt-12"
							style={{ color: "#ffffff" }}
						>
							请将二维码对准扫码框中心
						</Text.Paragraph>
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
							onPress={() =>
								toast.show({
									label: "相册入口已打开",
									description: "当前先支持相机扫码。",
								})
							}
						/>
					</View>
				</View>
			</CameraView>
			<ScanOverlay
				bottomInset={insets.bottom}
				mutedColor={mutedColor}
				topInset={insets.top}
			/>
		</View>
	);
}
