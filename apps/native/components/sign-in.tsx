import { Ionicons } from "@expo/vector-icons";
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
import { type FieldErrors, getFieldErrors } from "@/utils/form-errors";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

const signInSchema = z.object({
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
	password: z.string().min(1, "请输入密码").min(8, "密码至少 8 位"),
});

type SignInValues = z.infer<typeof signInSchema>;

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
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInValues>>({});

	const changeEmail = (value: string) => {
		setEmail(value);
		setErrorMessage(null);
		setFieldErrors((current) => ({ ...current, email: undefined }));
	};

	const changePassword = (value: string) => {
		setPassword(value);
		setErrorMessage(null);
		setFieldErrors((current) => ({ ...current, password: undefined }));
	};

	const submit = async () => {
		if (isSubmitting) return;

		const parsed = signInSchema.safeParse({ email, password });
		if (!parsed.success) {
			setErrorMessage(null);
			setFieldErrors(getFieldErrors(parsed.error));
			return;
		}

		setErrorMessage(null);
		setFieldErrors({});
		setIsSubmitting(true);
		try {
			const authenticationError =
				await runAccountAuthentication<EmailAuthenticationError>({
					authenticate: () =>
						authClient.signIn.email({
							email: parsed.data.email.trim(),
							password: parsed.data.password,
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
				label: error instanceof Error ? error.message : "登录失败，请稍后重试",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<View className="gap-3 pt-3">
			{errorMessage ? (
				<Typography.Paragraph type="body-sm" style={{ color: dangerColor }}>
					{errorMessage}
				</Typography.Paragraph>
			) : null}

			<TextField isInvalid={Boolean(fieldErrors.email)}>
				<Label>邮箱</Label>
				<Input
					value={email}
					onChangeText={changeEmail}
					placeholder="email@example.com"
					placeholderTextColor={mutedColor}
					keyboardType="email-address"
					autoCapitalize="none"
					autoComplete="email"
					textContentType="emailAddress"
					returnKeyType="next"
				/>
				<FieldError>{fieldErrors.email}</FieldError>
			</TextField>

			<TextField isInvalid={Boolean(fieldErrors.password)}>
				<Label>密码</Label>
				<View className="relative">
					<Input
						value={password}
						onChangeText={changePassword}
						placeholder="至少 8 位"
						placeholderTextColor={mutedColor}
						secureTextEntry={!isPasswordVisible}
						autoComplete="password"
						returnKeyType="go"
						onSubmitEditing={submit}
						className="pr-12"
					/>
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						feedbackVariant="scale-ripple"
						accessibilityLabel={isPasswordVisible ? "隐藏密码" : "显示密码"}
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
				<FieldError>{fieldErrors.password}</FieldError>
			</TextField>

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

			<Button
				variant="primary"
				size="md"
				feedbackVariant="scale-ripple"
				isDisabled={isSubmitting}
				onPress={submit}
			>
				{isSubmitting ? <Spinner size="sm" /> : null}
				<Button.Label>
					{isSubmitting ? "登录中" : isLastUsedMethod ? "登录" : "登录"}
				</Button.Label>
			</Button>
		</View>
	);
}
