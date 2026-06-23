import {
	GoogleSignin,
	isErrorWithCode,
	statusCodes,
} from "@react-native-google-signin/google-signin";
import { env } from "@youni/env/native";
import { Text, useThemeColor } from "heroui-native";
import { SocialAuthButton } from "heroui-native-pro";
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

let isGoogleSignInConfigured = false;

function configureGoogleSignIn() {
	const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
	if (!webClientId) {
		return false;
	}

	if (Platform.OS === "ios" && !env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
		return false;
	}

	if (isGoogleSignInConfigured) {
		return true;
	}

	GoogleSignin.configure({
		webClientId,
		...(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
			? { iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID }
			: {}),
		scopes: ["email", "profile"],
	});
	isGoogleSignInConfigured = true;

	return true;
}

function getGoogleErrorMessage(error: unknown) {
	if (!isErrorWithCode(error)) {
		return error instanceof Error
			? error.message
			: "Google 登录失败，请稍后重试";
	}

	switch (error.code) {
		case statusCodes.SIGN_IN_CANCELLED:
			return null;
		case statusCodes.IN_PROGRESS:
			return "Google 登录正在进行中";
		case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
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

		if (!configureGoogleSignIn()) {
			const message = "Google 登录还没有配置";
			setErrorMessage(message);
			toast.show({
				variant: "danger",
				label: "Google 登录失败",
				description: message,
			});
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		try {
			if (Platform.OS === "android") {
				await GoogleSignin.hasPlayServices({
					showPlayServicesUpdateDialog: true,
				});
			}

			const response = await GoogleSignin.signIn();
			if (response.type !== "success") {
				return;
			}

			const tokens = await GoogleSignin.getTokens();
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
					label: "Google 登录失败",
					description: message,
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

			const message = getGoogleErrorMessage(error);
			if (!message) {
				return;
			}

			setErrorMessage(message);
			toast.show({
				variant: "danger",
				label: "Google 登录失败",
				description: message,
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
				size="lg"
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
