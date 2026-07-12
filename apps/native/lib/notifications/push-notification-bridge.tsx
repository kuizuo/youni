import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import {
	getNotificationIntent,
	toSocialHref,
} from "@/lib/social/navigation-intents";
import { client } from "@/utils/orpc";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModulePromise: null | Promise<NotificationsModule> = null;

function canUseRemoteNotifications() {
	return Platform.OS !== "web" && !isRunningInExpoGo();
}

function loadNotifications() {
	notificationsModulePromise ??= import("expo-notifications");
	return notificationsModulePromise;
}

type NotificationData = {
	noteId?: unknown;
	targetId?: unknown;
	targetType?: unknown;
};

function getPlatform() {
	if (Platform.OS === "android" || Platform.OS === "ios") {
		return Platform.OS;
	}
	if (Platform.OS === "web") {
		return "web";
	}
	return "unknown";
}

function hasNotificationPermission(value: unknown) {
	return (value as { granted?: boolean }).granted === true;
}

function openNotificationTarget(data: NotificationData) {
	router.push(toSocialHref(getNotificationIntent(data)));
}

async function getExpoPushToken(Notifications: NotificationsModule) {
	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "Youni 通知",
			importance: Notifications.AndroidImportance.HIGH,
			lightColor: "#FF4D6D",
			sound: "default",
			vibrationPattern: [0, 250, 250, 250],
		});
	}

	const currentPermission = await Notifications.getPermissionsAsync();
	const permission = hasNotificationPermission(currentPermission)
		? currentPermission
		: await Notifications.requestPermissionsAsync();

	if (!hasNotificationPermission(permission)) {
		return null;
	}

	const projectId =
		Constants.easConfig?.projectId ??
		Constants.expoConfig?.extra?.eas?.projectId;
	if (!projectId) {
		throw new Error("Expo project ID is missing");
	}

	const token = await Notifications.getExpoPushTokenAsync({ projectId });
	return token.data;
}

export function PushNotificationBridge() {
	const session = authClient.useSession();
	const registeredTokenRef = useRef<null | string>(null);
	const userId = isRegisteredUser(session.data?.user)
		? session.data?.user.id
		: undefined;

	useEffect(() => {
		if (!canUseRemoteNotifications()) return;

		let isCanceled = false;
		let subscription: undefined | { remove: () => void };

		async function observeNotifications() {
			try {
				const Notifications = await loadNotifications();
				if (isCanceled) return;

				Notifications.setNotificationHandler({
					handleNotification: async () => ({
						shouldPlaySound: true,
						shouldSetBadge: true,
						shouldShowBanner: true,
						shouldShowList: true,
					}),
				});

				const lastResponse = Notifications.getLastNotificationResponse();
				if (lastResponse?.notification) {
					openNotificationTarget(
						lastResponse.notification.request.content.data as NotificationData,
					);
					Notifications.clearLastNotificationResponse();
				}

				subscription = Notifications.addNotificationResponseReceivedListener(
					(response) => {
						openNotificationTarget(
							response.notification.request.content.data as NotificationData,
						);
					},
				);
			} catch (error) {
				console.warn("Notification listener setup failed", error);
			}
		}

		void observeNotifications();

		return () => {
			isCanceled = true;
			subscription?.remove();
		};
	}, []);

	useEffect(() => {
		if (!userId || !canUseRemoteNotifications()) return;

		let isCanceled = false;
		let tokenSubscription: undefined | { remove: () => void };

		async function registerToken(Notifications: NotificationsModule) {
			try {
				const token = await getExpoPushToken(Notifications);
				if (!token || isCanceled || registeredTokenRef.current === token) {
					return;
				}

				await client.notifications.registerPushToken({
					token,
					platform: getPlatform(),
				});
				registeredTokenRef.current = token;
			} catch (error) {
				console.warn("Push notification registration failed", error);
			}
		}

		async function startTokenRegistration() {
			try {
				const Notifications = await loadNotifications();
				if (isCanceled) return;

				await registerToken(Notifications);
				tokenSubscription = Notifications.addPushTokenListener(() => {
					void registerToken(Notifications);
				});
			} catch (error) {
				console.warn("Push notification setup failed", error);
			}
		}

		void startTokenRegistration();

		return () => {
			isCanceled = true;
			tokenSubscription?.remove();
		};
	}, [userId]);

	return null;
}
