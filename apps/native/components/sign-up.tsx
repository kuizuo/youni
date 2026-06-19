import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	Input,
	Label,
	Spinner,
	Text,
	TextField,
	useThemeColor,
	useToast,
} from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signUpSchema = z.object({
	name: z.string().trim().min(2, "昵称至少 2 个字符"),
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
	password: z.string().min(8, "密码至少 8 位"),
});

type SignUpProps = {
	onAuthenticated?: () => Promise<void> | void;
};

export function SignUp({ onAuthenticated }: SignUpProps) {
	const { toast } = useToast();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const submit = async () => {
		const parsed = signUpSchema.safeParse({ name, email, password });
		if (!parsed.success) {
			setErrorMessage(parsed.error.issues[0]?.message ?? "请检查注册信息");
			return;
		}

		setErrorMessage(null);
		setIsSubmitting(true);
		await authClient.signUp.email(
			{
				name: parsed.data.name.trim(),
				email: parsed.data.email.trim(),
				password: parsed.data.password,
			},
			{
				onError(error) {
					setErrorMessage(error.error?.message || "注册失败，请稍后重试");
					toast.show({
						variant: "danger",
						label: "注册失败",
						description: error.error?.message,
					});
				},
				onSuccess() {
					setName("");
					setEmail("");
					setPassword("");
					authClient.$store.notify("$sessionSignal");
					onAuthenticated?.();
					queryClient.refetchQueries();
					toast.show({ variant: "success", label: "注册成功" });
				},
			},
		);
		setIsSubmitting(false);
	};

	return (
		<View className="gap-3 pt-3">
			{errorMessage ? (
				<Text.Paragraph type="body-sm" style={{ color: dangerColor }}>
					{errorMessage}
				</Text.Paragraph>
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
				size="lg"
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
