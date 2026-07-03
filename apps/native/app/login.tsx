import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { Stack, useRouter } from "expo-router";
import { Button, Text, useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPanel } from "@/components/auth-panel";
import { YouniMark } from "@/components/brand/youni-logo";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");

	useEffect(() => {
		if (session.data?.user) {
			router.replace("/" as Href);
		}
	}, [router, session.data?.user]);

	const goHome = () => {
		router.replace("/" as Href);
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				keyboardDismissMode="on-drag"
				keyboardShouldPersistTaps="handled"
				className="flex-1 bg-background"
				contentContainerClassName="flex-grow px-4"
				contentContainerStyle={{
					paddingTop: insets.top + 18,
					paddingBottom: insets.bottom + 28,
				}}
			>
				<View className="mx-auto w-full max-w-sm flex-1 justify-center gap-7">
					<View className="gap-4">
						<YouniMark size={56} />
						<View className="gap-2">
							<Text.Heading type="h1" className="text-foreground">
								登录 Youni
							</Text.Heading>
							<Text.Paragraph color="muted" className="leading-6">
								登录后可以发布、收藏、点赞、评论和查看消息。
							</Text.Paragraph>
						</View>
					</View>

					<AuthPanel
						onAuthenticated={async () => {
							await session.refetch();
							router.replace("/" as Href);
						}}
					/>

					<Button
						variant="tertiary"
						size="lg"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						onPress={goHome}
					>
						<Ionicons name="compass-outline" size={18} color={mutedColor} />
						<Button.Label>暂不登录，跳过</Button.Label>
					</Button>
				</View>
			</ScrollView>
		</>
	);
}
