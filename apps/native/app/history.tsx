import { AuthRequired } from "@/components/auth-required";
import HistoryScreen from "@/components/profile/history-screen";

export default function HistoryRoute() {
	return (
		<AuthRequired redirectTo="/history">
			<HistoryScreen />
		</AuthRequired>
	);
}
