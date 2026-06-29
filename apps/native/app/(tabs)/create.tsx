import { useNavigation } from "expo-router";

import { AuthRequired } from "@/components/auth-required";
import CreateScreen from "@/components/create/create-screen";

type TabNavigation = {
	navigate: (routeName: string) => void;
};

export default function CreateTabRoute() {
	const navigation = useNavigation<TabNavigation>();

	return (
		<AuthRequired redirectTo="/">
			<CreateScreen onRequestClose={() => navigation.navigate("index")} />
		</AuthRequired>
	);
}
