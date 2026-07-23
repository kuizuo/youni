import { Ionicons } from "@expo/vector-icons";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	FieldError,
	Input,
	Label,
	ListGroup,
	Spinner,
	Surface,
	TextField,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
	changePasswordSchema,
	getAuthErrorMessage,
} from "@/components/forgot-password/utils";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { AppSeparator } from "@/components/shared/app-separator";
import { ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const PROVIDER_LABELS: Record<string, string> = {
	credential: "邮箱密码",
	google: "Google",
};

export default function AccountSecurityScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const session = authClient.useSession();
	const user = session.data?.user;
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const accounts = useQuery({
		queryKey: ["auth", "accounts", user?.id],
		enabled: Boolean(user),
		queryFn: async () => {
			const result = await authClient.listAccounts();
			if (result.error) {
				throw new Error(result.error.message || "登录方式读取失败");
			}
			return result.data ?? [];
		},
	});
	const hasPassword = accounts.data?.some(
		(account) => account.providerId === "credential",
	);
	const changePassword = useMutation({
		mutationFn: async (input: {
			currentPassword: string;
			newPassword: string;
		}) => {
			const result = await authClient.changePassword({
				...input,
				revokeOtherSessions: true,
			});
			if (result.error) {
				throw new Error(
					getAuthErrorMessage(result.error.message, "密码修改失败"),
				);
			}
			return result.data;
		},
	});
	const form = useForm({
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
		validators: {
			onSubmit: changePasswordSchema,
		},
		onSubmit: async ({ value }) => {
			const parsed = changePasswordSchema.parse(value);
			setErrorMessage(null);
			try {
				await changePassword.mutateAsync({
					currentPassword: parsed.currentPassword,
					newPassword: parsed.newPassword,
				});
				form.reset();
				toast.show({
					variant: "success",
					label: "密码已修改，其他设备已退出",
				});
			} catch (error) {
				if (isRequestTimeoutError(error)) return;
				const message = error instanceof Error ? error.message : "密码修改失败";
				setErrorMessage(message);
				toast.show({ variant: "danger", label: message });
			}
		},
	});

	const submit = () => {
		fireHaptic();
		void form.handleSubmit();
	};

	const openPasswordSetup = () => {
		if (!user?.email) return;
		fireHaptic();
		router.push({
			pathname: "/forgot-password",
			params: { email: user.email, mode: "set-password" },
		} as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="账号与安全" />
			<KeyboardAvoidingView
				behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
				className="flex-1"
			>
				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					keyboardShouldPersistTaps="handled"
					contentContainerClassName="gap-5 px-4 pt-4"
					contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
				>
					<View className="gap-2">
						<Typography.Paragraph
							className="px-2"
							color="muted"
							type="body-xs"
							weight="semibold"
						>
							账号
						</Typography.Paragraph>
						<ListGroup
							variant="secondary"
							className="overflow-hidden rounded-2xl"
						>
							<ListGroup.Item disabled className="px-4 py-3.5">
								<ListGroup.ItemContent>
									<ListGroup.ItemTitle>邮箱</ListGroup.ItemTitle>
								</ListGroup.ItemContent>
								<ListGroup.ItemSuffix>
									<Typography.Paragraph
										selectable
										color="muted"
										type="body-sm"
										numberOfLines={1}
									>
										{user?.email ?? ""}
									</Typography.Paragraph>
								</ListGroup.ItemSuffix>
							</ListGroup.Item>
						</ListGroup>
					</View>

					<View className="gap-2">
						<Typography.Paragraph
							className="px-2"
							color="muted"
							type="body-xs"
							weight="semibold"
						>
							登录方式
						</Typography.Paragraph>
						{accounts.isLoading ? (
							<View className="items-center py-8">
								<Spinner />
							</View>
						) : accounts.isError ? (
							<ErrorState onRetry={() => void accounts.refetch()} />
						) : (
							<ListGroup
								variant="secondary"
								className="overflow-hidden rounded-2xl"
							>
								{accounts.data?.map((account, index) => (
									<View key={account.id}>
										{index > 0 ? <AppSeparator className="opacity-60" /> : null}
										<LoginMethodRow providerId={account.providerId} />
									</View>
								))}
							</ListGroup>
						)}
					</View>

					{!accounts.isLoading && !accounts.isError ? (
						hasPassword ? (
							<Surface className="gap-4 rounded-2xl p-4">
								<View className="gap-1">
									<Typography.Paragraph weight="bold">
										修改密码
									</Typography.Paragraph>
									<Typography.Paragraph color="muted" type="body-sm">
										修改后，其他设备需要重新登录。
									</Typography.Paragraph>
								</View>

								{errorMessage ? (
									<Typography.Paragraph
										selectable
										className="text-danger"
										type="body-sm"
									>
										{errorMessage}
									</Typography.Paragraph>
								) : null}

								<form.Field name="currentPassword">
									{(field) => (
										<PasswordField
											autoComplete="password"
											errorMessage={field.state.meta.errors[0]?.message}
											label="当前密码"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChangeText={(value) => {
												setErrorMessage(null);
												field.handleChange(value);
											}}
										/>
									)}
								</form.Field>
								<form.Field name="newPassword">
									{(field) => (
										<PasswordField
											errorMessage={field.state.meta.errors[0]?.message}
											label="新密码"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChangeText={(value) => {
												setErrorMessage(null);
												field.handleChange(value);
											}}
										/>
									)}
								</form.Field>
								<form.Field name="confirmPassword">
									{(field) => (
										<PasswordField
											errorMessage={field.state.meta.errors[0]?.message}
											label="确认新密码"
											returnKeyType="go"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChangeText={(value) => {
												setErrorMessage(null);
												field.handleChange(value);
											}}
											onSubmitEditing={submit}
										/>
									)}
								</form.Field>

								<form.Subscribe selector={(state) => state.isSubmitting}>
									{(isSubmitting) => (
										<Button
											variant="primary"
											className="rounded-full"
											feedbackVariant="scale-ripple"
											isDisabled={isSubmitting}
											onPress={submit}
										>
											{isSubmitting ? <Spinner size="sm" /> : null}
											<Button.Label>
												{isSubmitting ? "修改中" : "修改密码"}
											</Button.Label>
										</Button>
									)}
								</form.Subscribe>
							</Surface>
						) : (
							<Surface className="gap-3 rounded-2xl p-4">
								<View className="gap-1">
									<Typography.Paragraph weight="bold">
										设置登录密码
									</Typography.Paragraph>
									<Typography.Paragraph color="muted" type="body-sm">
										通过邮箱验证码确认身份后，你也可以使用邮箱密码登录。
									</Typography.Paragraph>
								</View>
								<Button
									variant="primary"
									className="rounded-full"
									feedbackVariant="scale-ripple"
									onPress={openPasswordSetup}
								>
									<Button.Label>发送邮箱验证码</Button.Label>
								</Button>
							</Surface>
						)
					) : null}
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
}

function LoginMethodRow({ providerId }: { providerId: string }) {
	const foregroundColor = useThemeColor("foreground");
	const label = PROVIDER_LABELS[providerId] ?? providerId;
	return (
		<ListGroup.Item disabled className="px-4 py-3.5">
			<ListGroup.ItemPrefix>
				<Ionicons
					name={providerId === "google" ? "logo-google" : "mail-outline"}
					size={20}
					color={foregroundColor}
				/>
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle>{label}</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
			<ListGroup.ItemSuffix>
				<Typography.Paragraph color="muted" type="body-xs">
					已关联
				</Typography.Paragraph>
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	);
}

function PasswordField({
	autoComplete = "new-password",
	errorMessage,
	label,
	onBlur,
	onChangeText,
	onSubmitEditing,
	returnKeyType,
	value,
}: {
	autoComplete?: "new-password" | "password";
	errorMessage?: string;
	label: string;
	onBlur: () => void;
	onChangeText: (value: string) => void;
	onSubmitEditing?: () => void;
	returnKeyType?: "go";
	value: string;
}) {
	const mutedColor = useThemeColor("muted");
	const [isVisible, setIsVisible] = useState(false);
	return (
		<TextField isInvalid={Boolean(errorMessage)}>
			<Label>{label}</Label>
			<View className="relative">
				<Input
					value={value}
					autoComplete={autoComplete}
					className="pr-12"
					onBlur={onBlur}
					onChangeText={onChangeText}
					onSubmitEditing={onSubmitEditing}
					placeholder="至少 8 位"
					returnKeyType={returnKeyType}
					secureTextEntry={!isVisible}
				/>
				<Button
					accessibilityLabel={isVisible ? "隐藏密码" : "显示密码"}
					className="absolute top-1 right-1 h-9 w-9 rounded-full"
					feedbackVariant="scale-ripple"
					isIconOnly
					size="sm"
					variant="ghost"
					onPress={() => setIsVisible((current) => !current)}
				>
					<Ionicons
						name={isVisible ? "eye-off-outline" : "eye-outline"}
						size={18}
						color={mutedColor}
					/>
				</Button>
			</View>
			<FieldError>{errorMessage}</FieldError>
		</TextField>
	);
}
