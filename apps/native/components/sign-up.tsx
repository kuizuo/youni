import { useForm } from "@tanstack/react-form";
import { useToast } from "heroui-native";
import { useRef } from "react";
import {
	ActivityIndicator,
	Pressable,
	Text,
	TextInput,
	View,
} from "react-native";
import z from "zod";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/orpc";

const signUpSchema = z.object({
	name: z.string().trim().min(1, "请输入昵称").min(2, "昵称至少 2 个字符"),
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
			if (message) {
				return message;
			}
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
			await authClient.signUp.email(
				{
					name: value.name.trim(),
					email: value.email.trim(),
					password: value.password,
				},
				{
					onError(error) {
						toast.show({
							variant: "danger",
							label: error.error?.message || "注册失败",
						});
					},
					onSuccess() {
						formApi.reset();
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

	return (
		<View className="rounded-lg bg-content2 p-4">
			<Text className="mb-4 font-medium text-foreground">注册账号</Text>

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
								<Text className="mb-3 text-danger text-xs">{formError}</Text>
							) : null}

							<View className="gap-3">
								<form.Field name="name">
									{(field) => (
										<View className="gap-1">
											<Text className="text-muted-foreground text-xs">
												昵称
											</Text>
											<TextInput
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={field.handleChange}
												placeholder="你的昵称"
												placeholderTextColor="#8a8a8a"
												autoComplete="name"
												textContentType="name"
												returnKeyType="next"
												blurOnSubmit={false}
												className="h-11 rounded-lg bg-background px-3 text-foreground"
												onSubmitEditing={() => {
													emailInputRef.current?.focus();
												}}
											/>
										</View>
									)}
								</form.Field>

								<form.Field name="email">
									{(field) => (
										<View className="gap-1">
											<Text className="text-muted-foreground text-xs">
												邮箱
											</Text>
											<TextInput
												ref={emailInputRef}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={field.handleChange}
												placeholder="email@example.com"
												placeholderTextColor="#8a8a8a"
												keyboardType="email-address"
												autoCapitalize="none"
												autoComplete="email"
												textContentType="emailAddress"
												returnKeyType="next"
												blurOnSubmit={false}
												className="h-11 rounded-lg bg-background px-3 text-foreground"
												onSubmitEditing={() => {
													passwordInputRef.current?.focus();
												}}
											/>
										</View>
									)}
								</form.Field>

								<form.Field name="password">
									{(field) => (
										<View className="gap-1">
											<Text className="text-muted-foreground text-xs">
												密码
											</Text>
											<TextInput
												ref={passwordInputRef}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChangeText={field.handleChange}
												placeholder="••••••••"
												placeholderTextColor="#8a8a8a"
												secureTextEntry
												autoComplete="new-password"
												textContentType="newPassword"
												returnKeyType="go"
												className="h-11 rounded-lg bg-background px-3 text-foreground"
												onSubmitEditing={form.handleSubmit}
											/>
										</View>
									)}
								</form.Field>

								<Pressable
									onPress={form.handleSubmit}
									disabled={isSubmitting}
									className="mt-1 h-11 items-center justify-center rounded-lg bg-primary disabled:opacity-60"
								>
									{isSubmitting ? (
										<ActivityIndicator color="#ffffff" />
									) : (
										<Text className="font-medium text-primary-foreground">
											注册
										</Text>
									)}
								</Pressable>
							</View>
						</>
					);
				}}
			</form.Subscribe>
		</View>
	);
}
