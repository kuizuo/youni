import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, Text, useThemeColor } from "heroui-native";
import { type ReactNode, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { useAppToast } from "@/utils/app-toast";

function getUserIdFromCode(value: string) {
	const match = value.match(/(?:user\/|user:)([a-zA-Z0-9_-]+)/);
	return match?.[1] ?? null;
}

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
			<View className="flex-1 items-center justify-center gap-4 bg-black px-8">
				<Ionicons name="camera-outline" size={44} color="#ffffff" />
				<Text.Paragraph align="center" style={{ color: "#ffffff" }}>
					需要相机权限才能扫一扫。
				</Text.Paragraph>
				<Button className="rounded-full" onPress={requestPermission}>
					<Button.Label>允许相机权限</Button.Label>
				</Button>
				<Button
					variant="ghost"
					className="rounded-full"
					onPress={() => router.back()}
				>
					<Button.Label className="text-white">返回</Button.Label>
				</Button>
			</View>
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
						<Text.Heading type="h2" style={{ color: "#ffffff" }}>
							扫描二维码
						</Text.Heading>
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
						<BottomAction
							icon="qr-code-outline"
							label="我的二维码"
							onPress={() => router.push("/add-friend" as Href)}
						/>
						<BottomAction
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
			<View
				pointerEvents="none"
				className="absolute right-0 left-0 h-40 bg-black/70"
				style={{ top: insets.top + 72 }}
			/>
			<View
				pointerEvents="none"
				className="absolute right-0 left-0 h-40 bg-black/70"
				style={{ bottom: insets.bottom + 220 }}
			/>
			<Text.Paragraph
				type="body-xs"
				align="center"
				color="muted"
				className="absolute right-0 bottom-2 left-0"
				style={{ color: mutedColor }}
			>
				Youni 扫一扫
			</Text.Paragraph>
		</View>
	);
}

function ScanFrame({ children }: { children: ReactNode }) {
	return (
		<View style={styles.scanFrame}>
			<View pointerEvents="none" style={styles.scanGuide} />
			<View pointerEvents="none" style={[styles.scanCorner, styles.topLeft]} />
			<View pointerEvents="none" style={[styles.scanCorner, styles.topRight]} />
			<View
				pointerEvents="none"
				style={[styles.scanCorner, styles.bottomLeft]}
			/>
			<View
				pointerEvents="none"
				style={[styles.scanCorner, styles.bottomRight]}
			/>
			<View className="items-center gap-3">{children}</View>
		</View>
	);
}

function BottomAction({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	return (
		<Pressable
			accessibilityRole="button"
			className="items-center gap-3"
			onPress={onPress}
		>
			<View className="size-16 items-center justify-center rounded-full bg-white/20">
				<Ionicons name={icon} size={30} color="#ffffff" />
			</View>
			<Text.Paragraph weight="semibold" style={{ color: "#ffffff" }}>
				{label}
			</Text.Paragraph>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	bottomLeft: {
		bottom: 0,
		borderBottomLeftRadius: 18,
		borderBottomWidth: 5,
		borderLeftWidth: 5,
		left: 0,
	},
	bottomRight: {
		bottom: 0,
		borderBottomRightRadius: 18,
		borderBottomWidth: 5,
		borderRightWidth: 5,
		right: 0,
	},
	scanCorner: {
		borderColor: "#ffffff",
		height: 48,
		position: "absolute",
		width: 48,
	},
	scanFrame: {
		alignItems: "center",
		alignSelf: "center",
		height: 256,
		justifyContent: "center",
		width: 256,
	},
	scanGuide: {
		...StyleSheet.absoluteFillObject,
		borderColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 28,
		borderWidth: StyleSheet.hairlineWidth,
	},
	topLeft: {
		borderLeftWidth: 5,
		borderTopLeftRadius: 18,
		borderTopWidth: 5,
		left: 0,
		top: 0,
	},
	topRight: {
		borderRightWidth: 5,
		borderTopRightRadius: 18,
		borderTopWidth: 5,
		right: 0,
		top: 0,
	},
});
