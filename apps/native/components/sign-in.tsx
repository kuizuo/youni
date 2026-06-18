import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import {
	Alert,
	Button,
	Card,
	Input,
	Label,
	Spinner,
	Surface,
	Text,
	TextField,
	useToast,
} from "heroui-native";
import { useRef, useState } from "react";
import type { TextInput } from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signInSchema = z.object({
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
	password: z.string().min(1, "请输入密码").min(8, "密码至少 8 位"),
});

function getErrorMessage(error: unknown): string | null {
	if (!error) return null;

	if (typeof error === "string") {
		return error;
	}

	if (Array.isArray(error)) {
		for (const issue of error) {
			const message = getErrorMessage(issue);
			if (message) return message;
		}
		return null;
	}

	if (typeof error === "object" && error !== null) {
		const maybeError = error as { message?: unknown };
		if (typeof maybeError.message === "string") {
			return maybeError.message;
		}
	}

	return null;
}

function SignIn() {
	const passwordInputRef = useRef<TextInput>(null);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [statusHint, setStatusHint] = useState(
		"可使用管理员账号进入后台，也可以注册普通账号。",
	);
	const { toast } = useToast();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signInSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			setStatusHint("正在登录，请稍等。");
			await authClient.signIn.email(
				{
					email: value.email.trim(),
					password: value.password,
				},
				{
					onError(error) {
						const message = error.error?.message || "登录失败";
						setStatusHint(message);
						toast.show({
							variant: "danger",
							label: message,
						});
					},
					onSuccess() {
						formApi.reset();
						setStatusHint("登录成功，正在同步你的内容。");
						toast.show({
							variant: "success",
							label: "登录成功",
						});
						queryClient.refetchQueries();
					},
				},
			);
		},
	});
	const fillAdminAccount = () => {
		form.setFieldValue("email", "admin@youni.local");
		form.setFieldValue("password", "Admin123456");
		setStatusHint("已填入管理员账号，可以直接登录。");
		toast.show({
			variant: "success",
			label: "已填入管理员账号",
			duration: 1200,
		});
	};

	return (
		<Card className="gap-4 rounded-3xl p-4">
			<Card.Header className="flex-row items-center justify-between p-0">
				<Card.Body className="gap-0.5 p-0">
					<Card.Title className="font-semibold text-foreground text-lg">
						登录
					</Card.Title>
					<Card.Description>回到你的收藏、关注和发布记录。</Card.Description>
				</Card.Body>
				<Button
					size="sm"
					variant="secondary"
					feedbackVariant="scale-ripple"
					onPress={fillAdminAccount}
				>
					<Ionicons name="shield-checkmark-outline" size={15} color="#8a8a8a" />
					<Button.Label>管理员</Button.Label>
				</Button>
			</Card.Header>

			<form.Subscribe
				selector={(state) => ({
					isSubmitting: state.isSubmitting,
					validationError: getErrorMessage(state.errorMap.onSubmit),
				})}
			>
				{({ isSubmitting, validationError }) => {
					const formError = validationError;

					return (
						<>
							{formError ? (
								<Alert status="danger" className="rounded-2xl">
									<Alert.Indicator />
									<Alert.Content>
										<Alert.Title>登录信息需要检查</Alert.Title>
										<Alert.Description>{formError}</Alert.Description>
									</Alert.Content>
								</Alert>
							) : null}
							<Surface
								variant="secondary"
								className="flex-row items-center gap-2 rounded-2xl bg-accent-soft px-3 py-2"
							>
								<Ionicons
									name="information-circle-outline"
									size={15}
									color="#f43f5e"
								/>
								<Text.Paragraph
									type="body-sm"
									weight="semibold"
									className="text-accent"
								>
									{statusHint}
								</Text.Paragraph>
							</Surface>

							<Surface variant="transparent" className="gap-4 p-0">
								<form.Field name="email">
									{(field) => (
										<TextField isRequired>
											<Label>邮箱</Label>
											<Input
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={field.handleChange}
												placeholder="email@example.com"
												keyboardType="email-address"
												autoCapitalize="none"
												autoComplete="email"
												textContentType="emailAddress"
												returnKeyType="next"
												blurOnSubmit={false}
												onSubmitEditing={() => {
													passwordInputRef.current?.focus();
												}}
												onFocus={() => setStatusHint("请输入登录邮箱。")}
											/>
										</TextField>
									)}
								</form.Field>

								<form.Field name="password">
									{(field) => (
										<TextField isRequired>
											<Label>密码</Label>
											<Input
												ref={passwordInputRef}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={field.handleChange}
												placeholder="至少 8 位"
												secureTextEntry={!isPasswordVisible}
												autoComplete="password"
												textContentType="password"
												returnKeyType="go"
												onSubmitEditing={form.handleSubmit}
												onFocus={() => setStatusHint("请输入密码，至少 8 位。")}
											/>
										</TextField>
									)}
								</form.Field>
								<Card.Footer className="flex-row flex-wrap gap-2 p-0">
									<Button
										size="sm"
										variant="secondary"
										feedbackVariant="scale-ripple"
										onPress={() => {
											setIsPasswordVisible((value) => !value);
											setStatusHint(
												isPasswordVisible
													? "密码已隐藏。"
													: "密码已显示，确认后可登录。",
											);
										}}
									>
										<Ionicons
											name={
												isPasswordVisible ? "eye-off-outline" : "eye-outline"
											}
											size={15}
											color="#8a8a8a"
										/>
										<Button.Label>
											{isPasswordVisible ? "隐藏密码" : "显示密码"}
										</Button.Label>
									</Button>
									<Button
										size="sm"
										variant="ghost"
										feedbackVariant="scale-ripple"
										onPress={() => {
											form.reset();
											setStatusHint("已清空输入。");
											toast.show({ label: "已清空输入", duration: 900 });
										}}
									>
										<Button.Label>清空</Button.Label>
									</Button>
								</Card.Footer>

								<Button
									variant="primary"
									feedbackVariant="scale-ripple"
									isDisabled={isSubmitting}
									onPress={form.handleSubmit}
								>
									{isSubmitting ? <Spinner size="sm" /> : null}
									<Button.Label>
										{isSubmitting ? "登录中" : "登录"}
									</Button.Label>
								</Button>
							</Surface>
						</>
					);
				}}
			</form.Subscribe>
		</Card>
	);
}

export { SignIn };
