import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	Input,
	InputOTP,
	Label,
	REGEXP_ONLY_DIGITS,
	Spinner,
	TextField,
	Typography,
} from "heroui-native";
import { useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { YouniMark } from "@/components/brand/youni-logo";
import { AppHeading } from "@/components/shared/app-heading";
import {
	NATIVE_FORM_CONTROL_VARIANT,
	SINGLE_LINE_INPUT_STYLE,
} from "@/components/shared/input-styles";

const StyledIonicons = withUniwind(Ionicons);

export function ForgotPasswordForm({
	confirmPassword,
	email,
	errorMessage,
	hasSent,
	isResetting,
	isSendingOtp,
	otp,
	password,
	resendCooldown,
	onChangeConfirmPassword,
	onChangeEmail,
	onChangeOtp,
	onChangePassword,
	onGoLogin,
	onResetPassword,
	onSendOtp,
}: {
	confirmPassword: string;
	email: string;
	errorMessage: null | string;
	hasSent: boolean;
	isResetting: boolean;
	isSendingOtp: boolean;
	otp: string;
	password: string;
	resendCooldown: number;
	onChangeConfirmPassword: (value: string) => void;
	onChangeEmail: (value: string) => void;
	onChangeOtp: (value: string) => void;
	onChangePassword: (value: string) => void;
	onGoLogin: () => void;
	onResetPassword: () => void;
	onSendOtp: () => void;
}) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
		useState(false);

	return (
		<View className="mx-auto w-full max-w-sm flex-1 justify-center gap-4">
			<View className="items-center gap-2">
				<YouniMark size={42} />
				<View className="items-center gap-1">
					<AppHeading type="h1" align="center" className="text-foreground">
						找回密码
					</AppHeading>
				</View>
			</View>

			<View className="gap-3">
				{errorMessage ? (
					<Typography.Paragraph type="body-sm" className="text-danger">
						{errorMessage}
					</Typography.Paragraph>
				) : null}

				{hasSent ? (
					<SentCodeNotice
						email={email}
						isResetting={isResetting}
						isSendingOtp={isSendingOtp}
						resendCooldown={resendCooldown}
						onSendOtp={onSendOtp}
					/>
				) : null}

				<TextField>
					<Label>邮箱</Label>
					<Input
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
						style={SINGLE_LINE_INPUT_STYLE}
						variant={NATIVE_FORM_CONTROL_VARIANT}
						value={email}
						onChangeText={onChangeEmail}
						placeholder="email@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						autoComplete="email"
						textContentType="emailAddress"
						returnKeyType="send"
						onSubmitEditing={hasSent ? undefined : onSendOtp}
						editable={!hasSent}
					/>
				</TextField>

				{hasSent ? (
					<>
						<CodeInput value={otp} onChange={onChangeOtp} />

						<PasswordField
							label="新密码"
							placeholder="至少 8 位"
							value={password}
							isVisible={isPasswordVisible}
							onChangeText={onChangePassword}
							onToggleVisible={() => setIsPasswordVisible((value) => !value)}
						/>

						<PasswordField
							label="确认新密码"
							placeholder="再次输入新密码"
							value={confirmPassword}
							isVisible={isConfirmPasswordVisible}
							returnKeyType="go"
							onChangeText={onChangeConfirmPassword}
							onSubmitEditing={onResetPassword}
							onToggleVisible={() =>
								setIsConfirmPasswordVisible((value) => !value)
							}
						/>

						<Button
							variant="primary"
							size="md"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							isDisabled={isSendingOtp || isResetting}
							onPress={onResetPassword}
						>
							{isResetting ? <Spinner size="sm" /> : null}
							<Button.Label>
								{isResetting ? "提交中" : "设置新密码"}
							</Button.Label>
						</Button>
					</>
				) : (
					<Button
						variant="primary"
						size="md"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						isDisabled={isSendingOtp || isResetting}
						onPress={onSendOtp}
					>
						{isSendingOtp ? <Spinner size="sm" /> : null}
						<Button.Label>
							{isSendingOtp ? "发送中" : "发送验证码"}
						</Button.Label>
					</Button>
				)}

				<Button
					variant="tertiary"
					size="md"
					className="rounded-full"
					feedbackVariant="scale-ripple"
					onPress={onGoLogin}
				>
					<StyledIonicons
						name="arrow-back-outline"
						size={18}
						className="text-muted"
					/>
					<Button.Label>返回登录</Button.Label>
				</Button>
			</View>
		</View>
	);
}

function SentCodeNotice({
	email,
	isResetting,
	isSendingOtp,
	onSendOtp,
	resendCooldown,
}: {
	email: string;
	isResetting: boolean;
	isSendingOtp: boolean;
	onSendOtp: () => void;
	resendCooldown: number;
}) {
	return (
		<View className="gap-2 rounded-2xl border border-border bg-surface p-2.5">
			<View className="flex-row items-center gap-2">
				<StyledIonicons
					name="mail-outline"
					size={18}
					className="text-success"
				/>
				<Typography.Paragraph type="body-sm" color="muted">
					如果 {email.trim()} 已注册，你会收到验证码邮件。
				</Typography.Paragraph>
			</View>
			<Button
				variant="secondary"
				size="sm"
				className="rounded-full"
				feedbackVariant="scale-ripple"
				isDisabled={isSendingOtp || isResetting || resendCooldown > 0}
				onPress={onSendOtp}
			>
				{isSendingOtp ? <Spinner size="sm" /> : null}
				<Button.Label>
					{isSendingOtp
						? "发送中"
						: resendCooldown > 0
							? `${resendCooldown}s 后重新发送`
							: "重新发送验证码"}
				</Button.Label>
			</Button>
		</View>
	);
}

function CodeInput({
	onChange,
	value,
}: {
	onChange: (value: string) => void;
	value: string;
}) {
	return (
		<View className="gap-2">
			<Label>验证码</Label>
			<InputOTP
				variant={NATIVE_FORM_CONTROL_VARIANT}
				value={value}
				onChange={onChange}
				maxLength={6}
				pattern={REGEXP_ONLY_DIGITS}
				inputMode="numeric"
				textInputProps={{
					autoComplete: "one-time-code",
					textContentType: "oneTimeCode",
				}}
			>
				<InputOTP.Group>
					<InputOTP.Slot
						index={0}
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
					/>
					<InputOTP.Slot
						index={1}
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
					/>
					<InputOTP.Slot
						index={2}
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
					/>
				</InputOTP.Group>
				<InputOTP.Separator />
				<InputOTP.Group>
					<InputOTP.Slot
						index={3}
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
					/>
					<InputOTP.Slot
						index={4}
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
					/>
					<InputOTP.Slot
						index={5}
						className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default"
					/>
				</InputOTP.Group>
			</InputOTP>
		</View>
	);
}

function PasswordField({
	isVisible,
	label,
	onChangeText,
	onSubmitEditing,
	onToggleVisible,
	placeholder,
	returnKeyType,
	value,
}: {
	isVisible: boolean;
	label: string;
	onChangeText: (value: string) => void;
	onSubmitEditing?: () => void;
	onToggleVisible: () => void;
	placeholder: string;
	returnKeyType?: "go";
	value: string;
}) {
	return (
		<TextField>
			<Label>{label}</Label>
			<View className="relative">
				<Input
					style={SINGLE_LINE_INPUT_STYLE}
					variant={NATIVE_FORM_CONTROL_VARIANT}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					secureTextEntry={!isVisible}
					autoComplete="new-password"
					textContentType="newPassword"
					returnKeyType={returnKeyType}
					onSubmitEditing={onSubmitEditing}
					className="ios:h-12 android:rounded-xl ios:rounded-xl android:bg-default ios:bg-default pr-12"
				/>
				<Button
					isIconOnly
					size="sm"
					variant="ghost"
					feedbackVariant="scale-ripple"
					accessibilityLabel={isVisible ? "隐藏密码" : "显示密码"}
					className="absolute top-1 right-1 h-9 w-9 rounded-full"
					onPress={onToggleVisible}
				>
					<StyledIonicons
						name={isVisible ? "eye-off-outline" : "eye-outline"}
						size={18}
						className="text-muted"
					/>
				</Button>
			</View>
		</TextField>
	);
}
