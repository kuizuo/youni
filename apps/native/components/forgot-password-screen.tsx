import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
import {
	Button,
	Input,
	InputOTP,
	Label,
	REGEXP_ONLY_DIGITS,
	Spinner,
	Text,
	TextField,
} from "heroui-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import z from "zod";

import { YouniMark } from "@/components/brand/youni-logo";
import { AppHeading } from "@/components/shared/app-heading";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

const StyledIonicons = withUniwind(Ionicons);
const RESEND_COOLDOWN_SECONDS = 60;
const RATE_LIMIT_MESSAGES = new Set([
	"Too many attempts",
	"Too many requests. Please try again later.",
]);

const forgotPasswordSchema = z.object({
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
});

const resetPasswordSchema = forgotPasswordSchema
	.extend({
		confirmPassword: z.string().min(1, "请再次输入新密码"),
		otp: z.string().trim().min(1, "请输入验证码"),
		password: z.string().min(8, "密码至少 8 位"),
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: "两次输入的密码不一致",
		path: ["confirmPassword"],
	});

function getAuthErrorMessage(message: string | undefined, fallback: string) {
	if (!message) {
		return fallback;
	}

	if (RATE_LIMIT_MESSAGES.has(message)) {
		return "操作太频繁，请 60 秒后再试";
	}

	return message;
}

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);
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
					<View className="mx-auto w-full max-w-sm flex-1 justify-center gap-4">
						<View className="items-center gap-2">
							<YouniMark size={42} />
							<View className="items-center gap-1">
								<AppHeading
									type="h1"
									align="center"
									className="text-foreground"
								>
									找回密码
								</AppHeading>
								<Text.Paragraph
									color="muted"
									align="center"
									type="body-sm"
									className="leading-5"
								>
									输入注册邮箱，我们会发送一次性验证码帮你设置新密码。
								</Text.Paragraph>
							</View>
						</View>

						<View className="gap-3">
							{errorMessage ? (
								<Text.Paragraph type="body-sm" className="text-danger">
									{errorMessage}
								</Text.Paragraph>
							) : null}

							{hasSent ? (
								<View className="gap-2 rounded-2xl border border-border bg-surface p-2.5">
									<View className="flex-row items-center gap-2">
										<StyledIonicons
											name="mail-outline"
											size={18}
											className="text-success"
										/>
										<Text.Paragraph type="body-sm" color="muted">
											如果 {email.trim()} 已注册，你会收到验证码邮件。
										</Text.Paragraph>
									</View>
									<Button
										variant="secondary"
										size="sm"
										className="rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={
											isSendingOtp || isResetting || resendCooldown > 0
										}
										onPress={sendOtp}
									>
										{isSendingOtp ? <Spinner size="sm" /> : null}
										<Button.Label>
											{isSendingOtp
												? "发送中"
												: resendCooldown > 0
													? `${resendCooldown}s 后重新发送`
													: "重新发送验证码"}
										</Button.Label>
									</Button>
								</View>
							) : null}

							<TextField>
								<Label>邮箱</Label>
								<Input
									value={email}
									onChangeText={setEmail}
									placeholder="email@example.com"
									keyboardType="email-address"
									autoCapitalize="none"
									autoComplete="email"
									textContentType="emailAddress"
									returnKeyType="send"
									onSubmitEditing={hasSent ? undefined : sendOtp}
									editable={!hasSent}
								/>
							</TextField>

							{hasSent ? (
								<>
									<View className="gap-2">
										<Label>验证码</Label>
										<InputOTP
											value={otp}
											onChange={setOtp}
											maxLength={6}
											pattern={REGEXP_ONLY_DIGITS}
											inputMode="numeric"
											textInputProps={{
												autoComplete: "one-time-code",
												textContentType: "oneTimeCode",
											}}
										>
											<InputOTP.Group>
												<InputOTP.Slot index={0} />
												<InputOTP.Slot index={1} />
												<InputOTP.Slot index={2} />
											</InputOTP.Group>
											<InputOTP.Separator />
											<InputOTP.Group>
												<InputOTP.Slot index={3} />
												<InputOTP.Slot index={4} />
												<InputOTP.Slot index={5} />
											</InputOTP.Group>
										</InputOTP>
									</View>

									<TextField>
										<Label>新密码</Label>
										<View className="relative">
											<Input
												value={password}
												onChangeText={setPassword}
												placeholder="至少 8 位"
												secureTextEntry={!isPasswordVisible}
												autoComplete="new-password"
												textContentType="newPassword"
												className="pr-12"
											/>
											<Button
												isIconOnly
												size="sm"
												variant="ghost"
												feedbackVariant="scale-ripple"
												accessibilityLabel={
													isPasswordVisible ? "隐藏密码" : "显示密码"
												}
												className="absolute top-1 right-1 h-9 w-9 rounded-full"
												onPress={() => setIsPasswordVisible((value) => !value)}
											>
												<StyledIonicons
													name={
														isPasswordVisible
															? "eye-off-outline"
															: "eye-outline"
													}
													size={18}
													className="text-muted"
												/>
											</Button>
										</View>
									</TextField>

									<TextField>
										<Label>确认新密码</Label>
										<View className="relative">
											<Input
												value={confirmPassword}
												onChangeText={setConfirmPassword}
												placeholder="再次输入新密码"
												secureTextEntry={!isConfirmPasswordVisible}
												autoComplete="new-password"
												textContentType="newPassword"
												returnKeyType="go"
												onSubmitEditing={resetPassword}
												className="pr-12"
											/>
											<Button
												isIconOnly
												size="sm"
												variant="ghost"
												feedbackVariant="scale-ripple"
												accessibilityLabel={
													isConfirmPasswordVisible ? "隐藏密码" : "显示密码"
												}
												className="absolute top-1 right-1 h-9 w-9 rounded-full"
												onPress={() =>
													setIsConfirmPasswordVisible((value) => !value)
												}
											>
												<StyledIonicons
													name={
														isConfirmPasswordVisible
															? "eye-off-outline"
															: "eye-outline"
													}
													size={18}
													className="text-muted"
												/>
											</Button>
										</View>
									</TextField>

									<Button
										variant="primary"
										size="md"
										className="rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={isSendingOtp || isResetting}
										onPress={resetPassword}
									>
										{isResetting ? <Spinner size="sm" /> : null}
										<Button.Label>
											{isResetting ? "提交中" : "设置新密码"}
										</Button.Label>
									</Button>
								</>
							) : (
								<Button
									variant="primary"
									size="md"
									className="rounded-full"
									feedbackVariant="scale-ripple"
									isDisabled={isSendingOtp || isResetting}
									onPress={sendOtp}
								>
									{isSendingOtp ? <Spinner size="sm" /> : null}
									<Button.Label>
										{isSendingOtp ? "发送中" : "发送验证码"}
									</Button.Label>
								</Button>
							)}

							<Button
								variant="tertiary"
								size="md"
								className="rounded-full"
								feedbackVariant="scale-ripple"
								onPress={goLogin}
							>
								<StyledIonicons
									name="arrow-back-outline"
									size={18}
									className="text-muted"
								/>
								<Button.Label>返回登录</Button.Label>
							</Button>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</>
	);
}
