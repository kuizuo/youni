import { AuthRequired } from "@/components/auth-required";
import SettingsScreen from "@/components/profile/settings-screen";

export default function SettingsRoute() {
	return (
		<AuthRequired redirectTo="/settings">
			<SettingsScreen />
		</AuthRequired>
	);
}
