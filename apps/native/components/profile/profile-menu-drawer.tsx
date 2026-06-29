import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { Modal, Pressable, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/lib/contexts/app-theme-context";
import { fireHaptic } from "@/lib/utils/fire-haptic";

type DrawerItem = {
	href: Href;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
};

const MAIN_ITEMS: DrawerItem[] = [
	{
		label: "创作者中心",
		icon: "stats-chart-outline",
		href: "/creator-center" as Href,
	},
	{
		label: "我的草稿",
		icon: "document-text-outline",
		href: "/drafts" as Href,
	},
	{
		label: "浏览记录",
		icon: "time-outline",
		href: "/history" as Href,
	},
];

export function ProfileMenuDrawer({
	displayHandle,
	displayName,
	image,
	isVisible,
	onClose,
	onSignOut,
}: {
	displayHandle: string;
	displayName: string;
	image?: null | string;
	isVisible: boolean;
	onClose: () => void;
	onSignOut: () => void;
}) {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();
	const dangerColor = useThemeColor("danger");
	const { isDark, toggleTheme } = useAppTheme();
	const drawerWidth = Math.min(width * 0.82, 336);

	const openRoute = (href: Href) => {
		fireHaptic();
		onClose();
		router.push(href);
	};

	const signOut = () => {
		fireHaptic();
		onClose();
		onSignOut();
	};

	const toggleAppearance = () => {
		fireHaptic();
		toggleTheme();
	};

	return (
		<Modal
			animationType="fade"
			onRequestClose={onClose}
			transparent
			visible={isVisible}
		>
			<View className="flex-1">
				<Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
				<Animated.View
					entering={SlideInLeft.duration(220)}
					style={{
						paddingBottom: insets.bottom + 14,
						paddingTop: insets.top + 18,
						width: drawerWidth,
					}}
					className="h-full bg-background"
				>
					<Animated.View
						entering={FadeIn.delay(90).duration(180)}
						className="h-full justify-between px-4"
					>
						<View className="gap-6">
							<View className="flex-row items-center gap-3 pt-1">
								<Avatar size="md" alt={displayName}>
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
									>
										{displayHandle}
									</Text.Paragraph>
								</View>
							</View>

							<Surface variant="transparent" className="gap-1 p-0">
								{MAIN_ITEMS.map((item) => (
									<DrawerButton
										key={item.label}
										icon={item.icon}
										label={item.label}
										onPress={() => openRoute(item.href)}
									/>
								))}
							</Surface>
						</View>

						<View className="gap-1 border-border border-t pt-3">
							<AppearanceButton isDark={isDark} onPress={toggleAppearance} />
							<DrawerButton
								icon="settings-outline"
								label="设置"
								onPress={() => openRoute("/settings" as Href)}
							/>
							<Button
								variant="ghost"
								className="h-12 justify-start rounded-2xl px-3"
								feedbackVariant="scale-ripple"
								onPress={signOut}
							>
								<Ionicons
									name="log-out-outline"
									size={22}
									color={dangerColor}
								/>
								<Button.Label className="text-danger">退出登录</Button.Label>
							</Button>
							<Text.Paragraph type="body-xs" color="muted" className="px-3">
								Youni
							</Text.Paragraph>
						</View>
					</Animated.View>
				</Animated.View>
				<PressableFeedback
					accessibilityLabel="关闭菜单"
					accessibilityRole="button"
					className="absolute size-10 items-center justify-center rounded-full bg-white/20"
					style={{ left: drawerWidth + 10, top: insets.top + 16 }}
					onPress={onClose}
				>
					<Ionicons name="close" size={20} color="#ffffff" />
				</PressableFeedback>
			</View>
		</Modal>
	);
}

function AppearanceButton({
	isDark,
	onPress,
}: {
	isDark: boolean;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<Button
			variant="ghost"
			className="h-12 justify-start rounded-2xl px-3"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons
				name={isDark ? "moon-outline" : "sunny-outline"}
				size={22}
				color={mutedColor}
			/>
			<Button.Label>外观</Button.Label>
			<View className="ml-auto rounded-full bg-content2 px-2 py-1">
				<Text.Paragraph type="body-xs" color="muted">
					{isDark ? "深色" : "浅色"}
				</Text.Paragraph>
			</View>
		</Button>
	);
}

function DrawerButton({
	icon,
	label,
	onPress,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<Button
			variant="ghost"
			className="h-12 justify-start rounded-2xl px-3"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons name={icon} size={22} color={mutedColor} />
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
