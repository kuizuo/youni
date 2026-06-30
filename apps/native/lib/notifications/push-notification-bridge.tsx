import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { type Href, router } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { authClient } from "@/lib/auth-client";
import { client } from "@/utils/orpc";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

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

function getString(value: unknown) {
	return typeof value === "string" && value.length > 0 ? value : null;
}

function hasNotificationPermission(value: unknown) {
	return (value as { granted?: boolean }).granted === true;
}

function openNotificationTarget(data: NotificationData) {
	const targetType = getString(data.targetType);
	const targetId = getString(data.targetId);
	const noteId = getString(data.noteId);

	if (targetType === "note" && (noteId || targetId)) {
		router.push({
			pathname: "/note/[id]",
			params: { id: noteId ?? targetId },
		} as unknown as Href);
		return;
	}

	if (targetType === "user" && targetId) {
		router.push({
			pathname: "/user/[id]",
			params: { id: targetId },
		} as unknown as Href);
		return;
	}

	if (targetType === "chat" && targetId) {
		router.push({
			pathname: "/chat/[id]",
			params: { id: targetId },
		} as unknown as Href);
		return;
	}

	router.push("/messages" as Href);
}

async function getExpoPushToken() {
	if (Platform.OS === "web") {
		return null;
	}

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "默认通知",
			importance: Notifications.AndroidImportance.DEFAULT,
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
	const token = await Notifications.getExpoPushTokenAsync(
		projectId ? { projectId } : undefined,
	);

	return token.data;
}

export function PushNotificationBridge() {
	const session = authClient.useSession();
	const registeredTokenRef = useRef<null | string>(null);
	const userId = session.data?.user?.id;

	useEffect(() => {
		const subscription = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				openNotificationTarget(
					response.notification.request.content.data as NotificationData,
				);
			},
		);

		return () => {
			subscription.remove();
		};
	}, []);

	useEffect(() => {
		if (!userId) return;

		let isCanceled = false;

		async function registerToken() {
			try {
				const token = await getExpoPushToken();
				if (!token || isCanceled || registeredTokenRef.current === token) {
					return;
				}

				await client.notifications.registerPushToken({
					token,
					platform: getPlatform(),
				});
				registeredTokenRef.current = token;
			} catch (error) {
				console.log("Push notification registration failed", error);
			}
		}

		registerToken();

		return () => {
			isCanceled = true;
		};
	}, [userId]);

	return null;
}
