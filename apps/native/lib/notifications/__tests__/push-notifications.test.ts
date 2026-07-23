import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from "@jest/globals";
import * as ExpoNotifications from "expo-notifications";
import { client } from "@/utils/orpc";
import { RequestTimeoutError } from "@/utils/request-timeout";
import { registerCurrentDevicePushToken } from "../push-notifications";

process.env.EXPO_OS = "ios";

jest.mock("expo", () => ({ isRunningInExpoGo: () => false }));
jest.mock("expo-constants", () => ({
	__esModule: true,
	default: { easConfig: { projectId: "test-project" } },
}));
jest.mock("expo-secure-store", () => ({
	getItemAsync: async () => null,
	setItemAsync: async () => {},
}));
jest.mock("expo-notifications", () => ({
	AndroidImportance: { HIGH: 4 },
	getExpoPushTokenAsync: jest.fn(),
	getPermissionsAsync: async () => ({ granted: true }),
	requestPermissionsAsync: async () => ({ granted: true }),
	setNotificationChannelAsync: async () => {},
}));
jest.mock("@/utils/orpc", () => ({
	client: {
		notifications: {
			registerPushToken: jest.fn(),
			unregisterPushToken: async () => ({ ok: true }),
		},
	},
}));

const mockGetExpoPushTokenAsync = jest.mocked(
	ExpoNotifications.getExpoPushTokenAsync,
);
const mockRegisterPushToken = jest.mocked(
	client.notifications.registerPushToken,
);

beforeEach(() => {
	jest.useFakeTimers();
	mockGetExpoPushTokenAsync.mockReset();
	mockGetExpoPushTokenAsync.mockResolvedValue({
		data: "ExponentPushToken[test]",
		type: "expo",
	});
	mockRegisterPushToken.mockReset();
	mockRegisterPushToken.mockResolvedValue({ id: "push-token-id" });
});

afterEach(() => {
	jest.useRealTimers();
});

describe("registerCurrentDevicePushToken", () => {
	test("retries one timed out registration without reacquiring the token", async () => {
		mockRegisterPushToken.mockRejectedValueOnce(new RequestTimeoutError());

		const registration = registerCurrentDevicePushToken();
		const expectation = expect(registration).resolves.toBe(
			"ExponentPushToken[test]",
		);
		await jest.runAllTimersAsync();
		await expectation;

		expect(mockGetExpoPushTokenAsync).toHaveBeenCalledTimes(1);
		expect(mockRegisterPushToken).toHaveBeenCalledTimes(2);
		expect(mockRegisterPushToken).toHaveBeenLastCalledWith({
			platform: "ios",
			token: "ExponentPushToken[test]",
		});
	});

	test("does not retry a non-timeout error", async () => {
		mockRegisterPushToken.mockRejectedValueOnce(new Error("unauthorized"));

		await expect(registerCurrentDevicePushToken()).rejects.toThrow(
			"unauthorized",
		);
		expect(mockRegisterPushToken).toHaveBeenCalledTimes(1);
	});

	test("stops after the second timeout", async () => {
		mockRegisterPushToken.mockRejectedValue(new RequestTimeoutError());

		const registration = registerCurrentDevicePushToken();
		const expectation =
			expect(registration).rejects.toBeInstanceOf(RequestTimeoutError);
		await jest.runAllTimersAsync();
		await expectation;
		expect(mockRegisterPushToken).toHaveBeenCalledTimes(2);
	});
});
