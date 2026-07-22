import { Ionicons } from "@expo/vector-icons";
import {
	Button,
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
import { prepareForAccountAuthentication } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import { queryClient } from "@/utils/orpc";
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
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = async () => {
		if (isSubmitting) return;

		const parsed = signUpSchema.safeParse({ name, email, password });
		if (!parsed.success) {
			setErrorMessage(parsed.error.issues[0]?.message ?? "请检查注册信息");
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		try {
			await prepareForAccountAuthentication();
			const authenticationError =
				await runAccountAuthentication<EmailAuthenticationError>({
					authenticate: () =>
						authClient.signUp.email({
							name: parsed.data.name.trim(),
							email: parsed.data.email.trim(),
							password: parsed.data.password,
						}),
					onAuthenticated: async () => {
						authClient.$store.notify("$sessionSignal");
						await onAuthenticated?.();
						queryClient.refetchQueries();
					},
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
				label: error instanceof Error ? error.message : "注册失败，请稍后重试",
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

			<TextField>
				<Label>昵称</Label>
				<Input
					value={name}
					onChangeText={setName}
					placeholder="你的昵称"
					placeholderTextColor={mutedColor}
					autoComplete="name"
					textContentType="name"
					returnKeyType="next"
				/>
			</TextField>

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
					returnKeyType="next"
				/>
			</TextField>

			<TextField>
				<Label>密码</Label>
				<View className="relative">
					<Input
						value={password}
						onChangeText={setPassword}
						placeholder="至少 8 位"
						placeholderTextColor={mutedColor}
						secureTextEntry={!isPasswordVisible}
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
			</TextField>

			<Button
				variant="primary"
				size="md"
				feedbackVariant="scale-ripple"
				isDisabled={isSubmitting}
				onPress={submit}
			>
				{isSubmitting ? <Spinner size="sm" /> : null}
				<Button.Label>{isSubmitting ? "注册中" : "注册"}</Button.Label>
			</Button>
		</View>
	);
}
