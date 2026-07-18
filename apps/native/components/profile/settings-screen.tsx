import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useFocusEffect, useRouter } from "expo-router";
import { ListGroup, Typography, useThemeColor } from "heroui-native";
import { type ReactNode, useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { SettingsAccountCard } from "@/components/profile/settings/account-card";
import { SignOutButton } from "@/components/profile/settings/sign-out-button";
import { AppSeparator } from "@/components/shared/app-separator";
import { isRegisteredUser } from "@/lib/anonymous-session";
import {
	type AppearancePreference,
	getAppearancePreference,
} from "@/lib/appearance-preference";
import { authClient } from "@/lib/auth-client";
import {
	getPushNotificationStatus,
	type PushNotificationStatus,
} from "@/lib/notifications/push-notifications";
import { signOutCurrentUser } from "@/lib/sign-out";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc } from "@/utils/orpc";

const APPEARANCE_LABELS: Record<AppearancePreference, string> = {
	dark: "深色",
	light: "浅色",
	system: "跟随系统",
};

const NOTIFICATION_LABELS: Record<PushNotificationStatus, string> = {
	denied: "未授权",
	disabled: "未开启",
	enabled: "已开启",
	unavailable: "不可用",
};

export default function SettingsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const [appearance, setAppearance] = useState<AppearancePreference>("system");
	const [notificationStatus, setNotificationStatus] =
		useState<PushNotificationStatus | null>(null);
	const user = isRegisteredUser(session.data?.user)
		? session.data?.user
		: undefined;
	const me = useQuery({
		...orpc.profiles.me.queryOptions(),
		enabled: Boolean(user),
	});
	const profile = me.data?.profile;
	const displayName = profile?.name ?? user?.name ?? "我";
	const displayHandle = profile?.handle ? `@${profile.handle}` : user?.email;
	const image = profile?.image ?? user?.image;

	useFocusEffect(
		useCallback(() => {
			let isCanceled = false;
			Promise.allSettled([
				getAppearancePreference(),
				getPushNotificationStatus(),
			]).then(([appearanceResult, notificationResult]) => {
				if (isCanceled) return;
				if (appearanceResult.status === "fulfilled") {
					setAppearance(appearanceResult.value);
				}
				setNotificationStatus(
					notificationResult.status === "fulfilled"
						? notificationResult.value
						: null,
				);
			});
			return () => {
				isCanceled = true;
			};
		}, []),
	);

	const open = (href: Href) => {
		fireHaptic();
		router.push(href);
	};

	const signOut = async () => {
		fireHaptic();
		await signOutCurrentUser();
		router.replace("/" as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="设置" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-6 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<SettingsAccountCard
					displayHandle={displayHandle}
					displayName={displayName}
					image={image}
					isLoading={me.isLoading}
					onPress={() => open("/settings/profile" as Href)}
				/>

				<SettingsSection label="账号">
					<SettingsRow
						description="邮箱、登录方式与密码"
						icon="shield-checkmark-outline"
						label="账号与安全"
						onPress={() => open("/settings/account" as Href)}
					/>
				</SettingsSection>

				<SettingsSection label="通用">
					<SettingsRow
						icon="notifications-outline"
						label="通知设置"
						value={
							notificationStatus
								? NOTIFICATION_LABELS[notificationStatus]
								: "检查中"
						}
						onPress={() => open("/settings/notifications" as Href)}
					/>
					<AppSeparator className="opacity-60" />
					<SettingsRow
						icon="color-palette-outline"
						label="外观"
						value={APPEARANCE_LABELS[appearance]}
						onPress={() => open("/settings/appearance" as Href)}
					/>
				</SettingsSection>

				<SettingsSection label="隐私">
					<SettingsRow
						description="管理你已拉黑的用户"
						icon="ban-outline"
						label="黑名单"
						onPress={() => open("/settings/blocked" as Href)}
					/>
				</SettingsSection>

				<SettingsSection label="其他">
					<SettingsRow
						icon="information-circle-outline"
						label="关于 Youni"
						onPress={() => open("/settings/about" as Href)}
					/>
				</SettingsSection>

				<SignOutButton onPress={() => void signOut()} />
			</ScrollView>
		</View>
	);
}

function SettingsSection({
	children,
	label,
}: {
	children: ReactNode;
	label: string;
}) {
	return (
		<View className="gap-2">
			<Typography.Paragraph
				type="body-xs"
				color="muted"
				weight="semibold"
				className="px-2"
			>
				{label}
			</Typography.Paragraph>
			<ListGroup variant="secondary" className="overflow-hidden rounded-2xl">
				{children}
			</ListGroup>
		</View>
	);
}

function SettingsRow({
	description,
	icon,
	label,
	onPress,
	value,
}: {
	description?: string;
	icon: keyof typeof Ionicons.glyphMap;
	label: string;
	onPress: () => void;
	value?: string;
}) {
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");

	return (
		<ListGroup.Item
			accessibilityLabel={label}
			accessibilityRole="button"
			className="gap-3 px-3.5 py-3"
			onPress={onPress}
		>
			<ListGroup.ItemPrefix>
				<Ionicons name={icon} size={21} color={foregroundColor} />
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle className="text-sm">{label}</ListGroup.ItemTitle>
				{description ? (
					<ListGroup.ItemDescription>{description}</ListGroup.ItemDescription>
				) : null}
			</ListGroup.ItemContent>
			<ListGroup.ItemSuffix className="flex-row items-center gap-1.5">
				{value ? (
					<Typography.Paragraph type="body-xs" color="muted">
						{value}
					</Typography.Paragraph>
				) : null}
				<Ionicons name="chevron-forward" size={18} color={mutedColor} />
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	);
}
