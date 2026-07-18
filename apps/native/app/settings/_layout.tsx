import { Stack } from "expo-router";

import { AuthRequired } from "@/components/auth-required";

export default function SettingsLayout() {
	return (
		<AuthRequired redirectTo="/settings">
			<Stack screenOptions={{ headerShown: false }} />
		</AuthRequired>
	);
}
