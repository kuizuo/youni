import { AuthRequired } from "@/components/auth-required";
import DraftsScreen from "@/components/profile/drafts-screen";

export default function DraftsRoute() {
	return (
		<AuthRequired redirectTo="/drafts">
			<DraftsScreen />
		</AuthRequired>
	);
}
