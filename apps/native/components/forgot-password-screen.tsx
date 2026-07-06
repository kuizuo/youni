import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ForgotPasswordForm } from "@/components/forgot-password/form";
import {
	forgotPasswordSchema,
	getAuthErrorMessage,
	RESEND_COOLDOWN_SECONDS,
	resetPasswordSchema,
} from "@/components/forgot-password/utils";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isResetting, setIsResetting] = useState(false);
	const [hasSent, setHasSent] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);

	useEffect(() => {
		if (resendCooldown <= 0) return;

		const timer = setTimeout(() => {
			setResendCooldown((current) => Math.max(current - 1, 0));
		}, 1000);

		return () => clearTimeout(timer);
	}, [resendCooldown]);

	const sendOtp = async () => {
		if (isSendingOtp || isResetting || (hasSent && resendCooldown > 0)) return;

		const parsed = forgotPasswordSchema.safeParse({ email });
		if (!parsed.success) {
			setErrorMessage(parsed.error.issues[0]?.message ?? "请检查邮箱");
			return;
		}

		setErrorMessage(null);
		setIsSendingOtp(true);
		try {
			await authClient.emailOtp.requestPasswordReset(
				{
					email: parsed.data.email,
				},
				{
					onError(error) {
						const message = getAuthErrorMessage(
							error.error?.message,
							"重置邮件发送失败，请稍后重试",
						);
						setErrorMessage(message);
						toast.show({
							variant: "danger",
							label: "发送失败",
							description: message,
						});
					},
					onSuccess() {
						setHasSent(true);
						setResendCooldown(RESEND_COOLDOWN_SECONDS);
						toast.show({
							variant: "success",
							label: "验证码已发送",
							description: "如果邮箱存在，请查看邮件并输入验证码。",
						});
					},
				},
			);
		} catch (error) {
			const message = isRequestTimeoutError(error)
				? REQUEST_TIMEOUT_MESSAGE
				: "重置邮件发送失败，请稍后重试";
			setErrorMessage(message);
			if (!isRequestTimeoutError(error)) {
				toast.show({
					variant: "danger",
					label: "发送失败",
					description: error instanceof Error ? error.message : undefined,
				});
			}
		} finally {
			setIsSendingOtp(false);
		}
	};

	const resetPassword = async () => {
		if (isSendingOtp || isResetting) return;

		const parsed = resetPasswordSchema.safeParse({
			confirmPassword,
			email,
			otp,
			password,
		});
		if (!parsed.success) {
			setErrorMessage(
				parsed.error.issues[0]?.message ?? "请检查邮箱、验证码和新密码",
			);
			return;
		}

		setErrorMessage(null);
		setIsResetting(true);
		try {
			await authClient.emailOtp.resetPassword(
				{
					email: parsed.data.email,
					otp: parsed.data.otp,
					password: parsed.data.password,
				},
				{
					onError(error) {
						const message = getAuthErrorMessage(
							error.error?.message,
							"密码重置失败，请重新获取验证码",
						);
						setErrorMessage(message);
						toast.show({
							variant: "danger",
							label: "重置失败",
							description: message,
						});
					},
					onSuccess() {
						toast.show({
							variant: "success",
							label: "密码已重置",
							description: "请用新密码登录。",
						});
						router.replace("/login" as Href);
					},
				},
			);
		} catch (error) {
			const message = isRequestTimeoutError(error)
				? REQUEST_TIMEOUT_MESSAGE
				: "密码重置失败，请重新获取验证码";
			setErrorMessage(message);
			if (!isRequestTimeoutError(error)) {
				toast.show({
					variant: "danger",
					label: "重置失败",
					description: error instanceof Error ? error.message : undefined,
				});
			}
		} finally {
			setIsResetting(false);
		}
	};

	const goLogin = () => {
		router.replace("/login" as Href);
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: false,
				}}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-background"
			>
				<View
					className="flex-1 bg-background px-4"
					style={{
						paddingBottom: insets.bottom + 10,
						paddingTop: insets.top + 10,
					}}
				>
					<ForgotPasswordForm
						confirmPassword={confirmPassword}
						email={email}
						errorMessage={errorMessage}
						hasSent={hasSent}
						isResetting={isResetting}
						isSendingOtp={isSendingOtp}
						otp={otp}
						password={password}
						resendCooldown={resendCooldown}
						onChangeConfirmPassword={setConfirmPassword}
						onChangeEmail={setEmail}
						onChangeOtp={setOtp}
						onChangePassword={setPassword}
						onGoLogin={goLogin}
						onResetPassword={resetPassword}
						onSendOtp={sendOtp}
					/>
				</View>
			</KeyboardAvoidingView>
		</>
	);
}
