import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	Input,
	Label,
	Spinner,
	Text,
	TextField,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import z from "zod";

import { YouniMark } from "@/components/brand/youni-logo";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

const resetPasswordSchema = z
	.object({
		confirmPassword: z.string().min(1, "请再次输入新密码"),
		password: z.string().min(8, "密码至少 8 位"),
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: "两次输入的密码不一致",
		path: ["confirmPassword"],
	});

function getRouteParam(value: string | string[] | undefined) {
	return Array.isArray(value) ? value[0] : value;
}

export default function ResetPasswordScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		error?: string | string[];
		token?: string | string[];
	}>();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const token = getRouteParam(params.token);
	const tokenError = getRouteParam(params.error);
	const invalidLinkMessage = tokenError
		? "重置链接无效或已过期，请重新发送邮件。"
		: !token
			? "重置链接缺少必要信息，请重新发送邮件。"
			: null;

	const submit = async () => {
		if (isSubmitting || invalidLinkMessage || !token) return;

		const parsed = resetPasswordSchema.safeParse({
			confirmPassword,
			password,
		});
		if (!parsed.success) {
			setErrorMessage(
				parsed.error.issues[0]?.message ?? "请检查新密码和确认密码",
			);
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		try {
			await authClient.resetPassword(
				{
					newPassword: parsed.data.password,
					token,
				},
				{
					onError(error) {
						const message =
							error.error?.message || "密码重置失败，请重新发送邮件";
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
				: "密码重置失败，请重新发送邮件";
			setErrorMessage(message);
			if (!isRequestTimeoutError(error)) {
				toast.show({
					variant: "danger",
					label: "重置失败",
					description: error instanceof Error ? error.message : undefined,
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const goForgotPassword = () => {
		router.replace("/forgot-password" as Href);
	};

	const goLogin = () => {
		router.replace("/login" as Href);
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					headerShadowVisible: false,
					title: "设置新密码",
				}}
			/>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-background"
			>
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					className="flex-1 bg-background"
					contentContainerClassName="flex-grow px-4"
					contentContainerStyle={{
						paddingBottom: insets.bottom + 28,
						paddingTop: 28,
					}}
				>
					<View className="mx-auto w-full max-w-sm flex-1 justify-center gap-7">
						<View className="gap-4">
							<YouniMark size={54} />
							<View className="gap-2">
								<Text.Heading type="h1" className="text-foreground">
									设置新密码
								</Text.Heading>
								<Text.Paragraph color="muted" className="leading-6">
									新密码至少 8 位。设置成功后，其他设备需要重新登录。
								</Text.Paragraph>
							</View>
						</View>

						<View className="gap-4">
							{invalidLinkMessage || errorMessage ? (
								<Text.Paragraph type="body-sm" style={{ color: dangerColor }}>
									{invalidLinkMessage ?? errorMessage}
								</Text.Paragraph>
							) : null}

							{invalidLinkMessage ? (
								<Button
									variant="primary"
									size="lg"
									className="rounded-full"
									feedbackVariant="scale-ripple"
									onPress={goForgotPassword}
								>
									<Ionicons name="mail-outline" size={18} color={mutedColor} />
									<Button.Label>重新发送邮件</Button.Label>
								</Button>
							) : (
								<>
									<TextField>
										<Label>新密码</Label>
										<View className="relative">
											<Input
												value={password}
												onChangeText={setPassword}
												placeholder="至少 8 位"
												placeholderTextColor={mutedColor}
												secureTextEntry={!isPasswordVisible}
												autoComplete="new-password"
												textContentType="newPassword"
												returnKeyType="next"
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
												<Ionicons
													name={
														isPasswordVisible
															? "eye-off-outline"
															: "eye-outline"
													}
													size={18}
													color={mutedColor}
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
												placeholderTextColor={mutedColor}
												secureTextEntry={!isConfirmPasswordVisible}
												autoComplete="new-password"
												textContentType="newPassword"
												returnKeyType="go"
												onSubmitEditing={submit}
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
												<Ionicons
													name={
														isConfirmPasswordVisible
															? "eye-off-outline"
															: "eye-outline"
													}
													size={18}
													color={mutedColor}
												/>
											</Button>
										</View>
									</TextField>

									<Button
										variant="primary"
										size="lg"
										className="rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={isSubmitting}
										onPress={submit}
									>
										{isSubmitting ? <Spinner size="sm" /> : null}
										<Button.Label>
											{isSubmitting ? "提交中" : "设置新密码"}
										</Button.Label>
									</Button>
								</>
							)}

							<Button
								variant="tertiary"
								size="lg"
								className="rounded-full"
								feedbackVariant="scale-ripple"
								onPress={goLogin}
							>
								<Ionicons
									name="arrow-back-outline"
									size={18}
									color={mutedColor}
								/>
								<Button.Label>返回登录</Button.Label>
							</Button>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</>
	);
}
