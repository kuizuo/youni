import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
import { Button, Text, useThemeColor } from "heroui-native";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { YouniMark } from "@/components/brand/youni-logo";
import { AppHeading } from "@/components/shared/app-heading";
import { SignUp } from "@/components/sign-up";
import { authClient } from "@/lib/auth-client";

export default function RegisterScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");

	const goLogin = () => {
		router.replace("/login" as Href);
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-background"
				style={{
					paddingBottom: insets.bottom + 18,
					paddingTop: insets.top + 14,
				}}
			>
				<View className="mx-auto w-full max-w-sm flex-1 justify-center gap-5 px-4">
					<View className="items-center gap-3">
						<YouniMark size={50} />
						<View className="items-center gap-1.5">
							<AppHeading type="h1" align="center" className="text-foreground">
								注册 Youni
							</AppHeading>
							<Text.Paragraph
								color="muted"
								align="center"
								className="leading-6"
							>
								创建账号后可以发布内容、收藏喜欢的笔记和查看消息。
							</Text.Paragraph>
						</View>
					</View>

					<SignUp
						onAuthenticated={async () => {
							await session.refetch();
							router.replace("/" as Href);
						}}
					/>

					<Button
						variant="tertiary"
						size="md"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						onPress={goLogin}
					>
						<Ionicons name="arrow-back-outline" size={18} color={mutedColor} />
						<Button.Label>已有账号？去登录</Button.Label>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</>
	);
}
