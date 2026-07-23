import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	FieldError,
	Input,
	Label,
	Spinner,
	TextField,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import z from "zod";
import { runAccountAuthentication } from "@/lib/account-authentication";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

const signInSchema = z.object({
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
	password: z.string().min(1, "请输入密码").min(8, "密码至少 8 位"),
});

type SignInProps = {
	onAuthenticated?: () => Promise<void> | void;
};

type EmailAuthenticationError = {
	message?: string;
};

export function SignIn({ onAuthenticated }: SignInProps) {
	const router = useRouter();
	const isLastUsedMethod = authClient.isLastUsedLoginMethod("email");
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signInSchema,
		},
		onSubmit: async ({ value }) => {
			const parsed = signInSchema.parse(value);
			setErrorMessage(null);
			try {
				const authenticationError =
					await runAccountAuthentication<EmailAuthenticationError>({
						authenticate: () =>
							authClient.signIn.email({
								email: parsed.email,
								password: parsed.password,
							}),
						onAuthenticated,
					});

				if (authenticationError) {
					const message = authenticationError.message || "登录失败，请稍后重试";
					setErrorMessage(message);
					toast.show({ variant: "danger", label: message });
				}
			} catch (error) {
				if (isRequestTimeoutError(error)) {
					setErrorMessage(REQUEST_TIMEOUT_MESSAGE);
					return;
				}

				setErrorMessage("登录失败，请稍后重试");
				toast.show({
					variant: "danger",
					label:
						error instanceof Error ? error.message : "登录失败，请稍后重试",
				});
			}
		},
	});

	return (
		<View className="gap-3 pt-3">
			{errorMessage ? (
				<Typography.Paragraph type="body-sm" style={{ color: dangerColor }}>
					{errorMessage}
				</Typography.Paragraph>
			) : null}

			<form.Field name="email">
				{(field) => {
					const fieldError = field.state.meta.errors[0]?.message;
					return (
						<TextField isInvalid={Boolean(fieldError)}>
							<Label>邮箱</Label>
							<Input
								value={field.state.value}
								onBlur={field.handleBlur}
								onChangeText={(value) => {
									setErrorMessage(null);
									field.handleChange(value);
								}}
								placeholder="email@example.com"
								placeholderTextColor={mutedColor}
								keyboardType="email-address"
								autoCapitalize="none"
								autoComplete="email"
								textContentType="emailAddress"
								returnKeyType="next"
							/>
							<FieldError>{fieldError}</FieldError>
						</TextField>
					);
				}}
			</form.Field>

			<form.Field name="password">
				{(field) => {
					const fieldError = field.state.meta.errors[0]?.message;
					return (
						<TextField isInvalid={Boolean(fieldError)}>
							<Label>密码</Label>
							<View className="relative">
								<Input
									value={field.state.value}
									onBlur={field.handleBlur}
									onChangeText={(value) => {
										setErrorMessage(null);
										field.handleChange(value);
									}}
									placeholder="至少 8 位"
									placeholderTextColor={mutedColor}
									secureTextEntry={!isPasswordVisible}
									autoComplete="password"
									returnKeyType="go"
									onSubmitEditing={() => void form.handleSubmit()}
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
										name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
										size={18}
										color={mutedColor}
									/>
								</Button>
							</View>
							<FieldError>{fieldError}</FieldError>
						</TextField>
					);
				}}
			</form.Field>

			<View className="-mt-2 -mb-1 flex-row justify-end">
				<Button
					size="sm"
					variant="ghost"
					className="h-7 rounded-full px-2"
					feedbackVariant="scale-ripple"
					onPress={() => router.push("/forgot-password" as Href)}
				>
					<Button.Label>忘记密码？</Button.Label>
				</Button>
			</View>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<Button
						variant="primary"
						size="md"
						feedbackVariant="scale-ripple"
						isDisabled={isSubmitting}
						onPress={() => void form.handleSubmit()}
					>
						{isSubmitting ? <Spinner size="sm" /> : null}
						<Button.Label>
							{isSubmitting ? "登录中" : isLastUsedMethod ? "登录" : "登录"}
						</Button.Label>
					</Button>
				)}
			</form.Subscribe>
		</View>
	);
}
