import { useFocusEffect } from "expo-router";
import { Button, ListGroup, Spinner, Switch, Typography } from "heroui-native";
import { useCallback, useState } from "react";
import { Linking, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import {
	disablePushNotifications,
	enablePushNotifications,
	getPushNotificationStatus,
	type PushNotificationStatus,
} from "@/lib/notifications/push-notifications";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";

const STATUS_COPY: Record<
	PushNotificationStatus,
	{ description: string; label: string }
> = {
	denied: {
		label: "系统通知未开启",
		description: "请前往手机系统设置，允许 Youni 发送通知。",
	},
	disabled: {
		label: "推送已关闭",
		description: "应用内的点赞、评论和关注消息仍会保留。",
	},
	enabled: {
		label: "推送已开启",
		description: "这台设备会接收 Youni 的系统推送。",
	},
	unavailable: {
		label: "当前环境不支持推送",
		description: "请在安装到手机的开发版或正式版中管理通知。",
	},
};

export default function NotificationsSettingsScreen() {
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const [status, setStatus] = useState<PushNotificationStatus>("disabled");
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);

	const refresh = useCallback(async () => {
		try {
			setStatus(await getPushNotificationStatus());
		} catch {
			toast.show({ variant: "danger", label: "通知状态读取失败" });
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	useFocusEffect(
		useCallback(() => {
			void refresh();
		}, [refresh]),
	);

	const update = async (isEnabled: boolean) => {
		if (isUpdating || status === "unavailable") return;
		if (status === "denied" && isEnabled) {
			void Linking.openSettings();
			return;
		}

		fireHaptic();
		setIsUpdating(true);
		try {
			if (isEnabled) {
				setStatus(await enablePushNotifications());
			} else {
				await disablePushNotifications();
				setStatus("disabled");
			}
		} catch (error) {
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "通知设置更新失败",
			});
			await refresh();
		} finally {
			setIsUpdating(false);
		}
	};

	const copy = STATUS_COPY[status];
	const isEnabled = status === "enabled";

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="通知设置" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<ListGroup variant="secondary" className="overflow-hidden rounded-2xl">
					<ListGroup.Item
						accessibilityLabel="允许推送通知"
						accessibilityRole="switch"
						accessibilityState={{ checked: isEnabled }}
						className="px-4 py-3.5"
						disabled={isLoading || isUpdating || status === "unavailable"}
						onPress={() => void update(!isEnabled)}
					>
						<ListGroup.ItemContent>
							<ListGroup.ItemTitle>允许推送通知</ListGroup.ItemTitle>
							<ListGroup.ItemDescription>
								仅影响当前设备
							</ListGroup.ItemDescription>
						</ListGroup.ItemContent>
						<ListGroup.ItemSuffix>
							{isLoading || isUpdating ? (
								<Spinner size="sm" />
							) : (
								<Switch
									isDisabled={status === "unavailable"}
									isSelected={isEnabled}
									pointerEvents="none"
								/>
							)}
						</ListGroup.ItemSuffix>
					</ListGroup.Item>
				</ListGroup>

				<View className="gap-2 rounded-2xl bg-content2 p-4">
					<Typography.Paragraph weight="semibold">
						{copy.label}
					</Typography.Paragraph>
					<Typography.Paragraph selectable color="muted" type="body-sm">
						{copy.description}
					</Typography.Paragraph>
					{status === "denied" ? (
						<Button
							variant="secondary"
							className="mt-1 rounded-full"
							feedbackVariant="scale-ripple"
							onPress={() => void Linking.openSettings()}
						>
							<Button.Label>前往系统设置</Button.Label>
						</Button>
					) : null}
				</View>
			</ScrollView>
		</View>
	);
}
