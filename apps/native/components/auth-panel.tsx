import { Tabs } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";

type AuthPanelProps = {
	onAuthenticated?: () => Promise<void> | void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

	return (
		<View className="mx-auto w-full max-w-sm gap-4">
			<Tabs
				value={mode}
				onValueChange={(value) => setMode(value as typeof mode)}
			>
				<Tabs.List>
					<Tabs.Indicator />
					<Tabs.Trigger value="sign-in">
						<Tabs.Label>登录</Tabs.Label>
					</Tabs.Trigger>
					<Tabs.Trigger value="sign-up">
						<Tabs.Label>注册</Tabs.Label>
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="sign-in">
					<SignIn onAuthenticated={onAuthenticated} />
				</Tabs.Content>
				<Tabs.Content value="sign-up">
					<SignUp onAuthenticated={onAuthenticated} />
				</Tabs.Content>
			</Tabs>
		</View>
	);
}
