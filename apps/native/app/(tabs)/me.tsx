import { AuthRequired } from "@/components/auth-required";
import MeScreen from "@/components/profile/me-screen";

export default function MeTabRoute() {
	return (
		<AuthRequired redirectTo="/me">
			<MeScreen />
		</AuthRequired>
	);
}
