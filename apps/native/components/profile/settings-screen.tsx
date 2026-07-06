import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { SettingsAccountCard } from "@/components/profile/settings/account-card";
import { SettingsProfileForm } from "@/components/profile/settings/profile-form";
import { SignOutButton } from "@/components/profile/settings/sign-out-button";
import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc, queryClient } from "@/utils/orpc";

export default function SettingsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const me = useQuery({
		...orpc.me.queryOptions(),
		enabled: Boolean(session.data?.user),
	});
	const profile = me.data?.profile;
	const user = session.data?.user;
	const displayName = profile?.name ?? user?.name ?? "我";
	const displayHandle = profile?.handle ? `@${profile.handle}` : user?.email;
	const image = profile?.image ?? user?.image;

	const signOut = () => {
		fireHaptic();
		authClient.signOut();
		queryClient.clear();
		router.replace("/" as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="设置" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<SettingsAccountCard
					displayHandle={displayHandle}
					displayName={displayName}
					image={image}
					isLoading={me.isLoading}
				/>

				<SettingsProfileForm
					displayName={displayName}
					isLoadingProfile={me.isLoading}
					profile={profile}
					user={user}
					onProfileSaved={me.refetch}
				/>

				<SignOutButton onPress={signOut} />
			</ScrollView>
		</View>
	);
}
