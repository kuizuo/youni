import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";

export function AuthPanel() {
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

	return (
		<View className="gap-4">
			{mode === "sign-in" ? <SignIn /> : <SignUp />}
			<Pressable
				onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
				className="h-11 items-center justify-center rounded-lg"
			>
				<Text className="font-medium text-primary">
					{mode === "sign-in" ? "还没有账号，去注册" : "已有账号，去登录"}
				</Text>
			</Pressable>
			<Text className="text-center text-muted-foreground text-xs">
				登录后可以发布、点赞、收藏、评论和关注。
			</Text>
		</View>
	);
}
