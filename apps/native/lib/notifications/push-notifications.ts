import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import {
	type PushNotificationStatus,
	resolvePushNotificationStatus,
} from "@/lib/notifications/push-notification-status";
import { client } from "@/utils/orpc";

export type { PushNotificationStatus } from "@/lib/notifications/push-notification-status";

type NotificationsModule = typeof import("expo-notifications");

const STORAGE_KEY = "youni.push-notifications-enabled";

let notificationsModulePromise: null | Promise<NotificationsModule> = null;

export function canUseRemoteNotifications() {
	return process.env.EXPO_OS !== "web" && !isRunningInExpoGo();
}

export function loadNotifications() {
	notificationsModulePromise ??= import("expo-notifications");
	return notificationsModulePromise;
}

export async function getPushNotificationsEnabled() {
	if (process.env.EXPO_OS === "web") {
		return globalThis.localStorage?.getItem(STORAGE_KEY) !== "false";
	}

	return (await SecureStore.getItemAsync(STORAGE_KEY)) !== "false";
}

async function setPushNotificationsEnabled(isEnabled: boolean) {
	const value = String(isEnabled);
	if (process.env.EXPO_OS === "web") {
		globalThis.localStorage?.setItem(STORAGE_KEY, value);
		return;
	}

	await SecureStore.setItemAsync(STORAGE_KEY, value);
}

function hasNotificationPermission(value: { granted?: boolean }) {
	return value.granted === true;
}

function getPlatform() {
	if (process.env.EXPO_OS === "android" || process.env.EXPO_OS === "ios") {
		return process.env.EXPO_OS;
	}
	return process.env.EXPO_OS === "web" ? "web" : "unknown";
}

async function getExpoPushToken({
	requestPermission,
}: {
	requestPermission: boolean;
}) {
	if (!canUseRemoteNotifications()) return null;

	const Notifications = await loadNotifications();
	if (process.env.EXPO_OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "Youni 通知",
			importance: Notifications.AndroidImportance.HIGH,
			lightColor: "#FF4D6D",
			vibrationPattern: [0, 250, 250, 250],
		});
	}

	const currentPermission = await Notifications.getPermissionsAsync();
	const permission =
		requestPermission && !hasNotificationPermission(currentPermission)
			? await Notifications.requestPermissionsAsync()
			: currentPermission;
	if (!hasNotificationPermission(permission)) return null;

	const projectId =
		Constants.easConfig?.projectId ??
		Constants.expoConfig?.extra?.eas?.projectId;
	if (!projectId) {
		throw new Error("Expo project ID is missing");
	}

	return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}

export async function getPushNotificationStatus(): Promise<PushNotificationStatus> {
	const isSupported = canUseRemoteNotifications();
	if (!isSupported) {
		return resolvePushNotificationStatus({
			canAskAgain: false,
			granted: false,
			isEnabled: false,
			isSupported,
		});
	}

	const [isEnabled, permission] = await Promise.all([
		getPushNotificationsEnabled(),
		loadNotifications().then((Notifications) =>
			Notifications.getPermissionsAsync(),
		),
	]);
	return resolvePushNotificationStatus({
		canAskAgain: permission.canAskAgain,
		granted: hasNotificationPermission(permission),
		isEnabled,
		isSupported,
	});
}

export async function registerCurrentDevicePushToken() {
	if (!(await getPushNotificationsEnabled())) return null;

	const token = await getExpoPushToken({ requestPermission: true });
	if (!token) return null;

	await client.notifications.registerPushToken({
		platform: getPlatform(),
		token,
	});
	return token;
}

export async function enablePushNotifications(): Promise<PushNotificationStatus> {
	await setPushNotificationsEnabled(true);
	try {
		const token = await registerCurrentDevicePushToken();
		if (token) return "enabled";

		const status = await getPushNotificationStatus();
		await setPushNotificationsEnabled(false);
		return status;
	} catch (error) {
		await setPushNotificationsEnabled(false).catch((): void => {});
		throw error;
	}
}

export async function unregisterCurrentDevicePushToken() {
	const token = await getExpoPushToken({ requestPermission: false });
	if (!token) return;
	await client.notifications.unregisterPushToken({ token });
}

export async function disablePushNotifications() {
	await unregisterCurrentDevicePushToken();
	await setPushNotificationsEnabled(false);
}
