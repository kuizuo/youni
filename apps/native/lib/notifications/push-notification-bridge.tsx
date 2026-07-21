import { onlineManager } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect } from "react";
import { AppState } from "react-native";

import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import {
	canUseRemoteNotifications,
	loadNotifications,
	registerCurrentDevicePushToken,
} from "@/lib/notifications/push-notifications";
import {
	getNotificationIntent,
	type NotificationData,
	toSocialHref,
} from "@/lib/social/navigation-intents";

function openNotificationTarget(data: NotificationData) {
	router.push(toSocialHref(getNotificationIntent(data)));
}

export function PushNotificationBridge() {
	const session = authClient.useSession();
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
		let appStateSubscription: undefined | { remove: () => void };
		let registrationPromise: null | Promise<unknown> = null;
		let tokenSubscription: undefined | { remove: () => void };
		let unsubscribeOnline: undefined | (() => void);

		function registerToken() {
			if (isCanceled || registrationPromise) return;

			registrationPromise = registerCurrentDevicePushToken()
				.catch((error) => {
					console.warn("Push notification registration failed", error);
				})
				.finally(() => {
					registrationPromise = null;
				});
		}

		async function startTokenRegistration() {
			try {
				const Notifications = await loadNotifications();
				if (isCanceled) return;

				tokenSubscription = Notifications.addPushTokenListener(() => {
					registerToken();
				});
				appStateSubscription = AppState.addEventListener("change", (state) => {
					if (state === "active") registerToken();
				});
				unsubscribeOnline = onlineManager.subscribe((isOnline) => {
					if (isOnline) registerToken();
				});
				registerToken();
			} catch (error) {
				console.warn("Push notification setup failed", error);
			}
		}

		void startTokenRegistration();

		return () => {
			isCanceled = true;
			appStateSubscription?.remove();
			tokenSubscription?.remove();
			unsubscribeOnline?.();
		};
	}, [userId]);

	return null;
}
