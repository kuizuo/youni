import type * as GoogleSignInNative from "@react-native-google-signin/google-signin";
import { env } from "@youni/env/native";
import Constants from "expo-constants";
import { Text, useThemeColor } from "heroui-native";
import { SocialAuthButton } from "heroui-native-pro/social-auth-button";
import { useState } from "react";
import { Platform, View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import { queryClient } from "@/utils/orpc";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

type GoogleSignInProps = {
	onAuthenticated?: () => Promise<void> | void;
};

type GoogleSignInModule = typeof GoogleSignInNative;

let isGoogleSignInConfigured = false;
let googleSignInModule: GoogleSignInModule | null = null;

function getGoogleSignInModule() {
	if (Constants.appOwnership === "expo") {
		return null;
	}

	if (googleSignInModule) {
		return googleSignInModule;
	}

	try {
		googleSignInModule =
			require("@react-native-google-signin/google-signin") as GoogleSignInModule;
		return googleSignInModule;
	} catch {
		return null;
	}
}

function configureGoogleSignIn() {
	const googleSignIn = getGoogleSignInModule();
	if (!googleSignIn) {
		return null;
	}

	const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
	if (!webClientId) {
		return null;
	}

	if (Platform.OS === "ios" && !env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
		return null;
	}

	if (isGoogleSignInConfigured) {
		return googleSignIn;
	}

	googleSignIn.GoogleSignin.configure({
		webClientId,
		...(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
			? { iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID }
			: {}),
		scopes: ["email", "profile"],
	});
	isGoogleSignInConfigured = true;

	return googleSignIn;
}

function getGoogleErrorMessage(
	error: unknown,
	googleSignIn: GoogleSignInModule,
) {
	if (!googleSignIn.isErrorWithCode(error)) {
		return error instanceof Error
			? error.message
			: "Google 登录失败，请稍后重试";
	}

	switch (error.code) {
		case googleSignIn.statusCodes.SIGN_IN_CANCELLED:
			return null;
		case googleSignIn.statusCodes.IN_PROGRESS:
			return "Google 登录正在进行中";
		case googleSignIn.statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
			return "当前设备无法使用 Google 登录";
		default:
			return "Google 登录失败，请稍后重试";
	}
}

export function GoogleSignIn({ onAuthenticated }: GoogleSignInProps) {
	const { toast } = useAppToast();
	const dangerColor = useThemeColor("danger");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = async () => {
		if (isSubmitting) return;

		const googleSignIn = configureGoogleSignIn();
		if (!googleSignIn) {
			const message =
				Constants.appOwnership === "expo"
					? "当前预览环境不支持 Google 登录，请使用邮箱登录"
					: "Google 登录还没有配置";
			setErrorMessage(message);
			toast.show({
				variant: "danger",
				label: message,
			});
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		try {
			if (Platform.OS === "android") {
				await googleSignIn.GoogleSignin.hasPlayServices({
					showPlayServicesUpdateDialog: true,
				});
			}

			const response = await googleSignIn.GoogleSignin.signIn();
			if (response.type !== "success") {
				return;
			}

			const tokens = await googleSignIn.GoogleSignin.getTokens();
			const idToken = response.data.idToken ?? tokens.idToken;
			if (!idToken) {
				throw new Error("没有拿到 Google 登录凭证");
			}

			const { error } = await authClient.signIn.social({
				provider: "google",
				idToken: {
					token: idToken,
					accessToken: tokens.accessToken,
				},
			});

			if (error) {
				const message = error.message || "Google 登录失败，请稍后重试";
				setErrorMessage(message);
				toast.show({
					variant: "danger",
					label: message,
				});
				return;
			}

			authClient.$store.notify("$sessionSignal");
			await onAuthenticated?.();
			queryClient.refetchQueries();
		} catch (error) {
			if (isRequestTimeoutError(error)) {
				setErrorMessage(REQUEST_TIMEOUT_MESSAGE);
				return;
			}

			const message = getGoogleErrorMessage(error, googleSignIn);
			if (!message) {
				return;
			}

			setErrorMessage(message);
			toast.show({
				variant: "danger",
				label: message,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className="gap-2">
			<SocialAuthButton
				provider="google"
				label={isSubmitting ? "正在使用 Google 登录" : "使用 Google 登录"}
				size="md"
				className="rounded-full"
				feedbackVariant="scale-ripple"
				isDisabled={isSubmitting}
				accessibilityLabel="使用 Google 登录"
				onPress={submit}
			/>
			{errorMessage ? (
				<Text.Paragraph type="body-sm" style={{ color: dangerColor }}>
					{errorMessage}
				</Text.Paragraph>
			) : null}
		</View>
	);
}
