import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
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
import { AppHeading } from "@/components/shared/app-heading";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

const forgotPasswordSchema = z.object({
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
});

function createResetRedirectUrl() {
	if (Platform.OS === "web" && typeof window !== "undefined") {
		return `${window.location.origin}/reset-password`;
	}

	return Linking.createURL("/reset-password");
}

export default function ForgotPasswordScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const [email, setEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [hasSent, setHasSent] = useState(false);

	const submit = async () => {
		if (isSubmitting) return;

		const parsed = forgotPasswordSchema.safeParse({ email });
		if (!parsed.success) {
			setErrorMessage(parsed.error.issues[0]?.message ?? "请检查邮箱");
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		try {
			await authClient.requestPasswordReset(
				{
					email: parsed.data.email,
					redirectTo: createResetRedirectUrl(),
				},
				{
					onError(error) {
						const message =
							error.error?.message || "重置邮件发送失败，请稍后重试";
						setErrorMessage(message);
						toast.show({
							variant: "danger",
							label: "发送失败",
							description: message,
						});
					},
					onSuccess() {
						setHasSent(true);
						toast.show({
							variant: "success",
							label: "邮件已发送",
							description: "如果邮箱存在，请按邮件里的链接设置新密码。",
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
			setIsSubmitting(false);
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
								<AppHeading type="h1" className="text-foreground">
									找回密码
								</AppHeading>
								<Text.Paragraph color="muted" className="leading-6">
									输入注册邮箱，我们会发送一封邮件帮你设置新密码。
								</Text.Paragraph>
							</View>
						</View>

						<View className="gap-4">
							{errorMessage ? (
								<Text.Paragraph type="body-sm" style={{ color: dangerColor }}>
									{errorMessage}
								</Text.Paragraph>
							) : null}

							{hasSent ? (
								<View className="gap-4 rounded-3xl border border-border bg-surface p-4">
									<View className="flex-row items-start gap-3">
										<View className="size-10 items-center justify-center rounded-full bg-success-soft">
											<Ionicons
												name="mail-outline"
												size={22}
												color={accentForegroundColor}
											/>
										</View>
										<View className="min-w-0 flex-1 gap-1">
											<Text.Paragraph weight="bold">
												检查你的邮箱
											</Text.Paragraph>
											<Text.Paragraph type="body-sm" color="muted">
												如果 {email.trim()} 已注册，你会收到一封重置密码邮件。
											</Text.Paragraph>
										</View>
									</View>
									<Button
										variant="secondary"
										className="rounded-full"
										feedbackVariant="scale-ripple"
										isDisabled={isSubmitting}
										onPress={submit}
									>
										{isSubmitting ? <Spinner size="sm" /> : null}
										<Button.Label>
											{isSubmitting ? "发送中" : "重新发送"}
										</Button.Label>
									</Button>
								</View>
							) : (
								<>
									<TextField>
										<Label>邮箱</Label>
										<Input
											value={email}
											onChangeText={setEmail}
											placeholder="email@example.com"
											placeholderTextColor={mutedColor}
											keyboardType="email-address"
											autoCapitalize="none"
											autoComplete="email"
											textContentType="emailAddress"
											returnKeyType="send"
											onSubmitEditing={submit}
										/>
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
											{isSubmitting ? "发送中" : "发送重置邮件"}
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
