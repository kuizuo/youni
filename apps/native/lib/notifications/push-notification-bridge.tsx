import { router } from "expo-router";
import { useEffect } from "react";

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
		let tokenSubscription: undefined | { remove: () => void };

		async function registerToken() {
			try {
				await registerCurrentDevicePushToken();
			} catch (error) {
				console.warn("Push notification registration failed", error);
			}
		}

		async function startTokenRegistration() {
			try {
				const Notifications = await loadNotifications();
				if (isCanceled) return;

				await registerToken();
				tokenSubscription = Notifications.addPushTokenListener(() => {
					void registerToken();
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
