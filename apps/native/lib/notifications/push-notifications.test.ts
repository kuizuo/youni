import { beforeEach, describe, expect, mock, test } from "bun:test";

process.env.EXPO_OS = "ios";

const getExpoPushTokenAsync = mock(async () => ({
	data: "ExponentPushToken[test]",
}));
const registerPushToken = mock(async () => ({ id: "push-token-id" }));

mock.module("expo", () => ({ isRunningInExpoGo: () => false }));
mock.module("expo-constants", () => ({
	default: { easConfig: { projectId: "test-project" } },
}));
mock.module("expo-secure-store", () => ({
	getItemAsync: async () => null,
	setItemAsync: async () => {},
}));
mock.module("expo-notifications", () => ({
	AndroidImportance: { HIGH: 4 },
	getExpoPushTokenAsync,
	getPermissionsAsync: async () => ({ granted: true }),
	requestPermissionsAsync: async () => ({ granted: true }),
	setNotificationChannelAsync: async () => {},
}));
mock.module("@/utils/orpc", () => ({
	client: {
		notifications: {
			registerPushToken,
			unregisterPushToken: async () => ({ ok: true }),
		},
	},
}));

const { RequestTimeoutError } = await import("@/utils/request-timeout");
const { registerCurrentDevicePushToken } = await import("./push-notifications");

beforeEach(() => {
	getExpoPushTokenAsync.mockClear();
	registerPushToken.mockReset();
	registerPushToken.mockResolvedValue({ id: "push-token-id" });
});

describe("registerCurrentDevicePushToken", () => {
	test("retries one timed out registration without reacquiring the token", async () => {
		registerPushToken.mockRejectedValueOnce(new RequestTimeoutError());

		await expect(registerCurrentDevicePushToken()).resolves.toBe(
			"ExponentPushToken[test]",
		);

		expect(getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
		expect(registerPushToken).toHaveBeenCalledTimes(2);
		expect(registerPushToken).toHaveBeenLastCalledWith({
			platform: "ios",
			token: "ExponentPushToken[test]",
		});
	});

	test("does not retry a non-timeout error", async () => {
		registerPushToken.mockRejectedValueOnce(new Error("unauthorized"));

		await expect(registerCurrentDevicePushToken()).rejects.toThrow(
			"unauthorized",
		);
		expect(registerPushToken).toHaveBeenCalledTimes(1);
	});

	test("stops after the second timeout", async () => {
		registerPushToken.mockRejectedValue(new RequestTimeoutError());

		await expect(registerCurrentDevicePushToken()).rejects.toBeInstanceOf(
			RequestTimeoutError,
		);
		expect(registerPushToken).toHaveBeenCalledTimes(2);
	});
});
