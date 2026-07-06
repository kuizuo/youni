import { Text } from "heroui-native";
import { View } from "react-native";
import { GoogleSignIn } from "@/components/google-sign-in";
import { AppSeparator } from "@/components/shared/app-separator";
import { SignIn } from "@/components/sign-in";

type AuthPanelProps = {
	onAuthenticated?: () => Promise<void> | void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
	return (
		<View className="mx-auto w-full max-w-sm gap-3">
			<GoogleSignIn onAuthenticated={onAuthenticated} />

			<View className="flex-row items-center gap-3">
				<AppSeparator className="flex-1" />
				<Text.Paragraph type="body-sm" color="muted">
					或
				</Text.Paragraph>
				<AppSeparator className="flex-1" />
			</View>

			<SignIn onAuthenticated={onAuthenticated} />
		</View>
	);
}
