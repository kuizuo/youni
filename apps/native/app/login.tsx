import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
import { Button, Typography, useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPanel } from "@/components/auth-panel";
import { YouniMark } from "@/components/brand/youni-logo";
import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");

	useEffect(() => {
		if (isRegisteredUser(session.data?.user)) {
			router.replace("/" as Href);
		}
	}, [router, session.data?.user]);

	const goHome = () => {
		router.replace("/" as Href);
	};

	const goRegister = () => {
		router.push("/register" as Href);
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
						<View className="items-center">
							<Typography.Heading
								type="h1"
								align="center"
								className="text-foreground"
							>
								登录 Youni
							</Typography.Heading>
						</View>
					</View>

					<AuthPanel onAuthenticated={() => router.replace("/" as Href)} />

					<View className="gap-2">
						<Button
							variant="tertiary"
							size="md"
							feedbackVariant="scale-ripple"
							onPress={goRegister}
						>
							<Ionicons
								name="person-add-outline"
								size={18}
								color={mutedColor}
							/>
							<Button.Label>还没有账号？去注册</Button.Label>
						</Button>

						<Button
							variant="tertiary"
							size="md"
							feedbackVariant="scale-ripple"
							onPress={goHome}
						>
							<Ionicons name="compass-outline" size={18} color={mutedColor} />
							<Button.Label>暂不登录，跳过</Button.Label>
						</Button>
					</View>
				</View>
			</KeyboardAvoidingView>
		</>
	);
}
