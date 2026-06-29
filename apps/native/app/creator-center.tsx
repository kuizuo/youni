import { AuthRequired } from "@/components/auth-required";
import CreatorCenterScreen from "@/components/profile/creator-center-screen";

export default function CreatorCenterRoute() {
	return (
		<AuthRequired redirectTo="/creator-center">
			<CreatorCenterScreen />
		</AuthRequired>
	);
}
