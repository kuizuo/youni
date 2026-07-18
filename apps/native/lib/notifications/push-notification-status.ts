export type PushNotificationStatus =
	| "denied"
	| "disabled"
	| "enabled"
	| "unavailable";

export function resolvePushNotificationStatus({
	canAskAgain,
	granted,
	isEnabled,
	isSupported,
}: {
	canAskAgain: boolean;
	granted: boolean;
	isEnabled: boolean;
	isSupported: boolean;
}): PushNotificationStatus {
	if (!isSupported) return "unavailable";
	if (!granted && !canAskAgain) return "denied";
	if (!isEnabled) return "disabled";
	if (granted) return "enabled";
	return "disabled";
}
