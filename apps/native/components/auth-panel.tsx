import { Separator, Text } from "heroui-native";
import { View } from "react-native";
import { GoogleSignIn } from "@/components/google-sign-in";
import { SignIn } from "@/components/sign-in";

type AuthPanelProps = {
	onAuthenticated?: () => Promise<void> | void;
};

export function AuthPanel({ onAuthenticated }: AuthPanelProps) {
	return (
		<View className="mx-auto w-full max-w-sm gap-3">
			<GoogleSignIn onAuthenticated={onAuthenticated} />

			<View className="flex-row items-center gap-3">
				<Separator className="flex-1" />
				<Text.Paragraph type="body-sm" color="muted">
					或
				</Text.Paragraph>
				<Separator className="flex-1" />
			</View>

			<SignIn onAuthenticated={onAuthenticated} />
		</View>
	);
}
