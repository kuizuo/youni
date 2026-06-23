import { AuthRequired } from "@/components/auth-required";
import MessagesScreen from "@/components/messages/messages-screen";

export default function MessagesTabRoute() {
	return (
		<AuthRequired redirectTo="/messages">
			<MessagesScreen />
		</AuthRequired>
	);
}
