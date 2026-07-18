import { useQuery } from "@tanstack/react-query";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { SettingsProfileForm } from "@/components/profile/settings/profile-form";
import { isRegisteredUser } from "@/lib/anonymous-session";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export default function ProfileSettingsScreen() {
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const user = isRegisteredUser(session.data?.user)
		? session.data?.user
		: undefined;
	const me = useQuery({
		...orpc.profiles.me.queryOptions(),
		enabled: Boolean(user),
	});
	const profile = me.data?.profile;
	const displayName = profile?.name ?? user?.name ?? "我";

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="个人资料" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				contentContainerClassName="px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<SettingsProfileForm
					displayName={displayName}
					isLoadingProfile={me.isLoading}
					profile={profile}
					user={user}
					onProfileSaved={me.refetch}
				/>
			</ScrollView>
		</View>
	);
}
