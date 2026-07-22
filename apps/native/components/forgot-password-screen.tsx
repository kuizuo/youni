import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	FieldError,
	Input,
	InputOTP,
	Label,
	REGEXP_ONLY_DIGITS,
	Spinner,
	TextField,
	Typography,
} from "heroui-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import type z from "zod";

import { YouniMark } from "@/components/brand/youni-logo";
import {
	forgotPasswordSchema,
	getAuthErrorMessage,
	RESEND_COOLDOWN_SECONDS,
	resetPasswordSchema,
} from "@/components/forgot-password/utils";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import { type FieldErrors, getFieldErrors } from "@/utils/form-errors";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";
import { getRouteParam } from "@/utils/route-params";

const StyledIonicons = withUniwind(Ionicons);

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		email?: string | string[];
		mode?: string | string[];
	}>();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const initialEmail = getRouteParam(params.email) ?? "";
	const isPasswordSetup = getRouteParam(params.mode) === "set-password";
	const [email, setEmail] = useState(initialEmail);
	const [otp, setOtp] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isResetting, setIsResetting] = useState(false);
	const [hasSent, setHasSent] = useState(false);
	const [resendCooldown, setResendCooldown] = useState(0);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);
	const [fieldErrors, setFieldErrors] = useState<
		FieldErrors<ResetPasswordValues>
	>({});

	const changeField = (field: keyof ResetPasswordValues, value: string) => {
		if (field === "email") setEmail(value);
		if (field === "otp") setOtp(value);
		if (field === "password") setPassword(value);
		if (field === "confirmPassword") setConfirmPassword(value);
		setErrorMessage(null);
		setFieldErrors((current) => ({ ...current, [field]: undefined }));
	};

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
			setErrorMessage(null);
			setFieldErrors((current) => ({
				...current,
				email: getFieldErrors(parsed.error).email,
			}));
			return;
		}

		setErrorMessage(null);
		setFieldErrors((current) => ({ ...current, email: undefined }));
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
							label: message,
						});
					},
					onSuccess() {
						setHasSent(true);
						setResendCooldown(RESEND_COOLDOWN_SECONDS);
						toast.show({
							label: "验证码已发送",
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
					label: error instanceof Error ? error.message : "发送失败",
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
			setErrorMessage(null);
			setFieldErrors(getFieldErrors(parsed.error));
			return;
		}

		setErrorMessage(null);
		setFieldErrors({});
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
							label: message,
						});
					},
					onSuccess() {
						toast.show({
							label: isPasswordSetup ? "密码已设置" : "密码已重置",
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
					label: error instanceof Error ? error.message : "重置失败",
				});
			}
		} finally {
			setIsResetting(false);
		}
	};

	const goLogin = () => {
		if (isPasswordSetup) {
			router.back();
			return;
		}
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
							<Typography.Heading
								type="h1"
								align="center"
								className="text-foreground"
							>
								{isPasswordSetup ? "设置登录密码" : "找回密码"}
							</Typography.Heading>
						</View>

						<View className="gap-3">
							{errorMessage ? (
								<Typography.Paragraph type="body-sm" className="text-danger">
									{errorMessage}
								</Typography.Paragraph>
							) : null}

							{hasSent ? (
								<SentCodeNotice
									email={email}
									isPasswordSetup={isPasswordSetup}
									isResetting={isResetting}
									isSendingOtp={isSendingOtp}
									resendCooldown={resendCooldown}
									onSendOtp={sendOtp}
								/>
							) : null}

							<TextField isInvalid={Boolean(fieldErrors.email)}>
								<Label>邮箱</Label>
								<Input
									value={email}
									onChangeText={(value) => changeField("email", value)}
									placeholder="email@example.com"
									keyboardType="email-address"
									autoCapitalize="none"
									autoComplete="email"
									textContentType="emailAddress"
									returnKeyType="send"
									onSubmitEditing={hasSent ? undefined : sendOtp}
									editable={!hasSent && !isPasswordSetup}
								/>
								<FieldError>{fieldErrors.email}</FieldError>
							</TextField>

							{hasSent ? (
								<>
									<CodeInput
										errorMessage={fieldErrors.otp}
										value={otp}
										onChange={(value) => changeField("otp", value)}
									/>

									<PasswordField
										errorMessage={fieldErrors.password}
										label="新密码"
										placeholder="至少 8 位"
										value={password}
										isVisible={isPasswordVisible}
										onChangeText={(value) => changeField("password", value)}
										onToggleVisible={() =>
											setIsPasswordVisible((current) => !current)
										}
									/>

									<PasswordField
										errorMessage={fieldErrors.confirmPassword}
										label="确认新密码"
										placeholder="再次输入新密码"
										value={confirmPassword}
										isVisible={isConfirmPasswordVisible}
										returnKeyType="go"
										onChangeText={(value) =>
											changeField("confirmPassword", value)
										}
										onSubmitEditing={resetPassword}
										onToggleVisible={() =>
											setIsConfirmPasswordVisible((current) => !current)
										}
									/>

									<Button
										variant="primary"
										size="md"
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
								feedbackVariant="scale-ripple"
								onPress={goLogin}
							>
								<StyledIonicons
									name="arrow-back-outline"
									size={18}
									className="text-muted"
								/>
								<Button.Label>
									{isPasswordSetup ? "返回账号与安全" : "返回登录"}
								</Button.Label>
							</Button>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</>
	);
}

function SentCodeNotice({
	email,
	isPasswordSetup,
	isResetting,
	isSendingOtp,
	onSendOtp,
	resendCooldown,
}: {
	email: string;
	isPasswordSetup: boolean;
	isResetting: boolean;
	isSendingOtp: boolean;
	onSendOtp: () => void;
	resendCooldown: number;
}) {
	return (
		<View className="gap-2 rounded-2xl border border-border bg-surface p-2.5">
			<View className="flex-row items-center gap-2">
				<StyledIonicons
					name="mail-outline"
					size={18}
					className="text-success"
				/>
				<Typography.Paragraph type="body-sm" color="muted">
					{isPasswordSetup
						? `验证码已发送至 ${email.trim()}。`
						: `如果 ${email.trim()} 已注册，你会收到验证码邮件。`}
				</Typography.Paragraph>
			</View>
			<Button
				variant="secondary"
				size="sm"
				feedbackVariant="scale-ripple"
				isDisabled={isSendingOtp || isResetting || resendCooldown > 0}
				onPress={onSendOtp}
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
	);
}

function CodeInput({
	errorMessage,
	onChange,
	value,
}: {
	errorMessage?: string;
	onChange: (value: string) => void;
	value: string;
}) {
	return (
		<View className="gap-2">
			<Label isInvalid={Boolean(errorMessage)}>验证码</Label>
			<InputOTP
				value={value}
				onChange={onChange}
				isInvalid={Boolean(errorMessage)}
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
			<FieldError isInvalid={Boolean(errorMessage)}>{errorMessage}</FieldError>
		</View>
	);
}

function PasswordField({
	errorMessage,
	isVisible,
	label,
	onChangeText,
	onSubmitEditing,
	onToggleVisible,
	placeholder,
	returnKeyType,
	value,
}: {
	errorMessage?: string;
	isVisible: boolean;
	label: string;
	onChangeText: (value: string) => void;
	onSubmitEditing?: () => void;
	onToggleVisible: () => void;
	placeholder: string;
	returnKeyType?: "go";
	value: string;
}) {
	return (
		<TextField isInvalid={Boolean(errorMessage)}>
			<Label>{label}</Label>
			<View className="relative">
				<Input
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					secureTextEntry={!isVisible}
					autoComplete="new-password"
					returnKeyType={returnKeyType}
					onSubmitEditing={onSubmitEditing}
					className="pr-12"
				/>
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					feedbackVariant="scale-ripple"
					accessibilityLabel={isVisible ? "隐藏密码" : "显示密码"}
					className="absolute top-1 right-1 h-9 w-9 rounded-full"
					onPress={onToggleVisible}
				>
					<StyledIonicons
						name={isVisible ? "eye-off-outline" : "eye-outline"}
						size={18}
						className="text-muted"
					/>
				</Button>
			</View>
			<FieldError>{errorMessage}</FieldError>
		</TextField>
	);
}
