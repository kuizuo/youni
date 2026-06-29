import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Spinner,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc, queryClient } from "@/utils/orpc";

export default function SettingsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const mutedColor = useThemeColor("muted");
	const dangerColor = useThemeColor("danger");
	const me = useQuery({
		...orpc.social.me.queryOptions(),
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
			<ProfilePageHeader title="设置" subtitle="账号和资料" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				<Surface className="gap-4 rounded-3xl p-4">
					<View className="flex-row items-center gap-3">
						<Avatar size="lg" alt={displayName}>
							{image ? <Avatar.Image source={{ uri: image }} /> : null}
							<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
						</Avatar>
						<View className="min-w-0 flex-1">
							<Text.Paragraph weight="bold" numberOfLines={1}>
								{displayName}
							</Text.Paragraph>
							<Text.Paragraph
								type="body-sm"
								color="muted"
								numberOfLines={1}
								selectable
							>
								{displayHandle ?? "登录账号"}
							</Text.Paragraph>
						</View>
						{me.isLoading ? <Spinner size="sm" /> : null}
					</View>
					<Button
						variant="outline"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						onPress={() => router.replace("/me" as Href)}
					>
						<Ionicons name="person-outline" size={18} color={mutedColor} />
						<Button.Label>查看个人主页</Button.Label>
					</Button>
				</Surface>

				<Surface className="gap-3 rounded-3xl p-4">
					<Text.Paragraph weight="bold">账号</Text.Paragraph>
					<Text.Paragraph type="body-sm" color="muted" selectable>
						{user?.email ?? "当前账号"}
					</Text.Paragraph>
					<Button
						variant="danger-soft"
						className="rounded-full"
						feedbackVariant="scale-ripple"
						onPress={signOut}
					>
						<Ionicons name="log-out-outline" size={18} color={dangerColor} />
						<Button.Label>退出登录</Button.Label>
					</Button>
				</Surface>
			</ScrollView>
		</View>
	);
}
