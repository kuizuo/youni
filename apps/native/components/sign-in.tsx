import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
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
import { View } from "react-native";
import z from "zod";
import { SINGLE_LINE_INPUT_STYLE } from "@/components/shared/input-styles";

import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import { queryClient } from "@/utils/orpc";
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

export function SignIn({ onAuthenticated }: SignInProps) {
	const router = useRouter();
	const { toast } = useAppToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = async () => {
		if (isSubmitting) return;

		const parsed = signInSchema.safeParse({ email, password });
		if (!parsed.success) {
			setErrorMessage(parsed.error.issues[0]?.message ?? "请检查登录信息");
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		try {
			await authClient.signIn.email(
				{
					email: parsed.data.email.trim(),
					password: parsed.data.password,
				},
				{
					onError(error) {
						const message = error.error?.message || "登录失败，请稍后重试";
						setErrorMessage(message);
						toast.show({
							variant: "danger",
							label: message,
						});
					},
					onSuccess() {
						setEmail("");
						setPassword("");
						authClient.$store.notify("$sessionSignal");
						onAuthenticated?.();
						queryClient.refetchQueries();
					},
				},
			);
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
				<Text.Paragraph type="body-sm" style={{ color: dangerColor }}>
					{errorMessage}
				</Text.Paragraph>
			) : null}

			<TextField>
				<Label>邮箱</Label>
				<Input
					style={SINGLE_LINE_INPUT_STYLE}
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
						style={SINGLE_LINE_INPUT_STYLE}
						value={password}
						onChangeText={setPassword}
						placeholder="至少 8 位"
						placeholderTextColor={mutedColor}
						secureTextEntry={!isPasswordVisible}
						autoComplete="password"
						textContentType="password"
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
				className="rounded-full"
				feedbackVariant="scale-ripple"
				isDisabled={isSubmitting}
				onPress={submit}
			>
				{isSubmitting ? <Spinner size="sm" /> : null}
				<Button.Label>{isSubmitting ? "登录中" : "登录"}</Button.Label>
			</Button>
		</View>
	);
}
