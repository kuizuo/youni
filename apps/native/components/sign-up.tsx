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
import { useMemo, useRef, useState } from "react";
import type { TextInput } from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signUpSchema = z.object({
	name: z.string().trim().min(1, "请输入昵称").min(2, "昵称至少 2 个字符"),
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
	password: z.string().min(1, "请输入密码").min(8, "密码至少 8 位"),
});
const profileStarters = [
	{
		label: "城市生活",
		description: "记录路线、咖啡和周末",
		name: "林一一",
		emailPrefix: "city",
		icon: "footsteps-outline",
	},
	{
		label: "穿搭好物",
		description: "分享通勤穿搭和清单",
		name: "小周的衣橱",
		emailPrefix: "style",
		icon: "shirt-outline",
	},
	{
		label: "美食探店",
		description: "写早餐、咖啡和餐厅",
		name: "阿禾今天吃什么",
		emailPrefix: "food",
		icon: "cafe-outline",
	},
] as const;

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

export function SignUp() {
	const emailInputRef = useRef<TextInput>(null);
	const passwordInputRef = useRef<TextInput>(null);
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [passwordValue, setPasswordValue] = useState("");
	const [statusHint, setStatusHint] = useState(
		"创建账号后即可发布、收藏和关注。",
	);
	const { toast } = useToast();

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signUpSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			setStatusHint("正在创建账号，请稍等。");
			await authClient.signUp.email(
				{
					name: value.name.trim(),
					email: value.email.trim(),
					password: value.password,
				},
				{
					onError(error) {
						const message = error.error?.message || "注册失败";
						setStatusHint(message);
						toast.show({
							variant: "danger",
							label: message,
						});
					},
					onSuccess() {
						formApi.reset();
						setPasswordValue("");
						setStatusHint("注册成功，正在同步你的内容。");
						toast.show({
							variant: "success",
							label: "注册成功",
						});
						queryClient.refetchQueries();
					},
				},
			);
		},
	});
	const passwordChecks = useMemo(
		() => [
			{ label: "至少 8 位", done: passwordValue.length >= 8 },
			{ label: "包含字母", done: /[a-zA-Z]/.test(passwordValue) },
			{ label: "包含数字", done: /\d/.test(passwordValue) },
		],
		[passwordValue],
	);
	const applyProfileStarter = (starter: (typeof profileStarters)[number]) => {
		const password = "Youni2026";
		const email = `${starter.emailPrefix}-${Date.now()}@youni.local`;
		form.setFieldValue("name", starter.name);
		form.setFieldValue("email", email);
		form.setFieldValue("password", password);
		setPasswordValue(password);
		setStatusHint(`已套用「${starter.label}」人设，可以直接注册。`);
		toast.show({
			variant: "success",
			label: `已套用「${starter.label}」`,
			description: "昵称、邮箱和密码都已填好。",
			duration: 1300,
		});
	};

	return (
		<Card className="gap-4 rounded-3xl p-4">
			<Card.Header className="flex-row items-center justify-between p-0">
				<Card.Body className="gap-0.5 p-0">
					<Card.Title className="font-semibold text-foreground text-lg">
						注册账号
					</Card.Title>
					<Card.Description>创建后即可加入社区互动。</Card.Description>
				</Card.Body>
				<Surface className="rounded-full bg-danger-soft p-2">
					<Ionicons name="person-add-outline" size={18} color="#f43f5e" />
				</Surface>
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
										<Alert.Title>注册信息需要检查</Alert.Title>
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
							<Surface variant="secondary" className="gap-3 rounded-2xl p-3">
								<Surface
									variant="transparent"
									className="flex-row items-center justify-between p-0"
								>
									<Surface variant="transparent" className="gap-0.5 p-0">
										<Text.Paragraph weight="semibold" type="body-sm">
											先选一个社区人设
										</Text.Paragraph>
										<Text.Paragraph color="muted" type="body-xs">
											点一下自动准备昵称、邮箱和密码
										</Text.Paragraph>
									</Surface>
									<Ionicons name="sparkles-outline" size={17} color="#f43f5e" />
								</Surface>
								<Surface
									variant="transparent"
									className="flex-row flex-wrap gap-2 p-0"
								>
									{profileStarters.map((starter) => (
										<Button
											key={starter.label}
											size="lg"
											variant="secondary"
											feedbackVariant="scale-ripple"
											className="min-h-20 min-w-[47%] flex-1 justify-start rounded-2xl px-3 py-3"
											onPress={() => applyProfileStarter(starter)}
										>
											<Surface
												variant="transparent"
												className="size-9 items-center justify-center rounded-full bg-danger-soft p-0"
											>
												<Ionicons
													name={starter.icon}
													size={18}
													color="#f43f5e"
												/>
											</Surface>
											<Surface
												variant="transparent"
												className="flex-1 items-start gap-0.5 p-0"
											>
												<Button.Label>{starter.label}</Button.Label>
												<Text.Paragraph
													color="muted"
													type="body-xs"
													numberOfLines={2}
												>
													{starter.description}
												</Text.Paragraph>
											</Surface>
										</Button>
									))}
								</Surface>
							</Surface>

							<Surface variant="transparent" className="gap-4 p-0">
								<form.Field name="name">
									{(field) => (
										<TextField isRequired>
											<Label>昵称</Label>
											<Input
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={field.handleChange}
												placeholder="你的昵称"
												autoComplete="name"
												textContentType="name"
												returnKeyType="next"
												blurOnSubmit={false}
												onSubmitEditing={() => {
													emailInputRef.current?.focus();
												}}
												onFocus={() => setStatusHint("给自己起一个昵称。")}
											/>
										</TextField>
									)}
								</form.Field>

								<form.Field name="email">
									{(field) => (
										<TextField isRequired>
											<Label>邮箱</Label>
											<Input
												ref={emailInputRef}
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
												onFocus={() => setStatusHint("请输入常用邮箱。")}
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
												onChangeText={(value) => {
													field.handleChange(value);
													setPasswordValue(value);
												}}
												placeholder="至少 8 位"
												secureTextEntry={!isPasswordVisible}
												autoComplete="new-password"
												textContentType="newPassword"
												returnKeyType="go"
												onSubmitEditing={form.handleSubmit}
												onFocus={() =>
													setStatusHint("设置一个至少 8 位的密码。")
												}
											/>
										</TextField>
									)}
								</form.Field>
								<Card.Footer className="flex-row flex-wrap gap-2 p-0">
									{passwordChecks.map((item) => (
										<Button
											key={item.label}
											size="sm"
											variant={item.done ? "primary" : "secondary"}
											feedbackVariant="scale-ripple"
											onPress={() => {
												setStatusHint(
													item.done
														? `${item.label}已满足。`
														: `还需要${item.label}。`,
												);
											}}
										>
											<Ionicons
												name={
													item.done ? "checkmark-circle" : "ellipse-outline"
												}
												size={14}
												color={item.done ? "#ffffff" : "#8a8a8a"}
											/>
											<Button.Label>{item.label}</Button.Label>
										</Button>
									))}
									<Button
										size="sm"
										variant="ghost"
										feedbackVariant="scale-ripple"
										onPress={() => {
											setIsPasswordVisible((value) => !value);
											setStatusHint(
												isPasswordVisible
													? "密码已隐藏。"
													: "密码已显示，确认后可注册。",
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
								</Card.Footer>

								<Button
									variant="primary"
									feedbackVariant="scale-ripple"
									isDisabled={isSubmitting}
									onPress={form.handleSubmit}
								>
									{isSubmitting ? <Spinner size="sm" /> : null}
									<Button.Label>
										{isSubmitting ? "注册中" : "注册"}
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
