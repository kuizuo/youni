import { describe, expect, test } from "bun:test";

import { parseAppearancePreference } from "./appearance-preference";
import { resolvePushNotificationStatus } from "./notifications/push-notification-status";

describe("settings preferences", () => {
	test("repairs invalid appearance values", () => {
		expect(parseAppearancePreference("dark")).toBe("dark");
		expect(parseAppearancePreference("light")).toBe("light");
		expect(parseAppearancePreference("system")).toBe("system");
		expect(parseAppearancePreference("unknown")).toBe("system");
		expect(parseAppearancePreference(null)).toBe("system");
	});

	test("resolves effective push notification status", () => {
		expect(
			resolvePushNotificationStatus({
				canAskAgain: true,
				granted: true,
				isEnabled: true,
				isSupported: true,
			}),
		).toBe("enabled");
		expect(
			resolvePushNotificationStatus({
				canAskAgain: false,
				granted: false,
				isEnabled: true,
				isSupported: true,
			}),
		).toBe("denied");
		expect(
			resolvePushNotificationStatus({
				canAskAgain: true,
				granted: true,
				isEnabled: false,
				isSupported: true,
			}),
		).toBe("disabled");
		expect(
			resolvePushNotificationStatus({
				canAskAgain: false,
				granted: false,
				isEnabled: false,
				isSupported: true,
			}),
		).toBe("denied");
		expect(
			resolvePushNotificationStatus({
				canAskAgain: true,
				granted: true,
				isEnabled: true,
				isSupported: false,
			}),
		).toBe("unavailable");
	});
});
