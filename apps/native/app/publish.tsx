import { AuthRequired } from "@/components/auth-required";
import CreateScreen from "@/components/create/create-screen";

export default function PublishRoute() {
	return (
		<AuthRequired redirectTo="/publish">
			<CreateScreen />
		</AuthRequired>
	);
}
