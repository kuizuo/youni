import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
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

const signUpSchema = z.object({
	name: z.string().trim().min(2, "昵称至少 2 个字符"),
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
	password: z.string().min(8, "密码至少 8 位"),
});

type SignUpProps = {
	onAuthenticated?: () => Promise<void> | void;
};

type EmailAuthenticationError = {
	message?: string;
};

export function SignUp({ onAuthenticated }: SignUpProps) {
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signUpSchema,
		},
		onSubmit: async ({ value }) => {
			const parsed = signUpSchema.parse(value);
			setErrorMessage(null);
			try {
				const authenticationError =
					await runAccountAuthentication<EmailAuthenticationError>({
						authenticate: () =>
							authClient.signUp.email({
								name: parsed.name,
								email: parsed.email,
								password: parsed.password,
							}),
						onAuthenticated,
					});

				if (authenticationError) {
					const message = authenticationError.message || "注册失败，请稍后重试";
					setErrorMessage(message);
					toast.show({ variant: "danger", label: message });
				}
			} catch (error) {
				if (isRequestTimeoutError(error)) {
					setErrorMessage(REQUEST_TIMEOUT_MESSAGE);
					return;
				}

				setErrorMessage("注册失败，请稍后重试");
				toast.show({
					variant: "danger",
					label:
						error instanceof Error ? error.message : "注册失败，请稍后重试",
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

			<form.Field name="name">
				{(field) => {
					const fieldError = field.state.meta.errors[0]?.message;
					return (
						<TextField isInvalid={Boolean(fieldError)}>
							<Label>昵称</Label>
							<Input
								value={field.state.value}
								onBlur={field.handleBlur}
								onChangeText={(value) => {
									setErrorMessage(null);
									field.handleChange(value);
								}}
								placeholder="你的昵称"
								placeholderTextColor={mutedColor}
								autoComplete="name"
								textContentType="name"
								returnKeyType="next"
							/>
							<FieldError>{fieldError}</FieldError>
						</TextField>
					);
				}}
			</form.Field>

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
									autoComplete="new-password"
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
						<Button.Label>{isSubmitting ? "注册中" : "注册"}</Button.Label>
					</Button>
				)}
			</form.Subscribe>
		</View>
	);
}
