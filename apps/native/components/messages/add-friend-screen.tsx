import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	Spinner,
	Surface,
	Typography,
	useThemeColor,
} from "heroui-native";
import { ScrollView, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";
import { ErrorState } from "@/components/social-states";
import { authClient } from "@/lib/auth-client";
import { getLoginHref } from "@/lib/auth-navigation";
import { orpc } from "@/utils/orpc";

export default function AddFriendScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const session = authClient.useSession();
	const mutedColor = useThemeColor("muted");
	const foregroundColor = useThemeColor("foreground");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const me = useQuery({
		...orpc.me.queryOptions(),
		enabled: Boolean(session.data?.user),
	});
	const profile = me.data?.profile;
	const displayName = profile?.name ?? session.data?.user?.name ?? "我";
	const displayHandle = profile?.handle
		? `@${profile.handle}`
		: (session.data?.user?.email ?? "登录后生成二维码");
	const image = profile?.image ?? session.data?.user?.image;
	const qrValue = `youni:user:${profile?.id ?? session.data?.user?.id ?? ""}`;

	if (!session.data?.user) {
		return (
			<View className="flex-1 items-center justify-center bg-background px-6">
				<Typography.Paragraph align="center" color="muted">
					登录后可以生成你的个人二维码。
				</Typography.Paragraph>
				<Button
					className="mt-4 rounded-full"
					onPress={() => router.push(getLoginHref("/add-friend"))}
				>
					<Button.Label>去登录</Button.Label>
				</Button>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<AppHeader
				variant="leading"
				title="添加好友"
				topInset={insets.top}
				showSeparator
				left={
					<AppHeaderIconButton
						accessibilityLabel="返回"
						color={mutedColor}
						icon="chevron-back"
						onPress={() => router.back()}
					/>
				}
				right={
					<AppHeaderIconButton
						accessibilityLabel="扫一扫"
						color={foregroundColor}
						icon="scan-outline"
						onPress={() => router.push("/scan" as Href)}
					/>
				}
			/>

			<ScrollView
				className="flex-1"
				contentContainerClassName="items-center gap-5 px-5 pt-8"
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
			>
				<Surface className="w-full max-w-sm items-center gap-5 rounded-3xl p-5">
					<View className="items-center gap-2">
						<Avatar size="lg" alt={displayName}>
							{image ? <Avatar.Image source={{ uri: image }} /> : null}
							<Avatar.Fallback>{displayName.slice(0, 1)}</Avatar.Fallback>
						</Avatar>
						<View className="items-center">
							<Typography.Paragraph weight="bold" className="text-foreground">
								{displayName}
							</Typography.Paragraph>
							<Typography.Paragraph type="body-sm" color="muted">
								{displayHandle}
							</Typography.Paragraph>
						</View>
					</View>

					{me.isLoading ? (
						<View className="h-72 items-center justify-center">
							<Spinner />
						</View>
					) : me.isError ? (
						<ErrorState onRetry={() => me.refetch()} />
					) : (
						<View className="overflow-hidden rounded-3xl bg-white p-4">
							<PersonalQr image={image} value={qrValue} />
						</View>
					)}
				</Surface>

				<Button
					variant="primary"
					className="w-full max-w-sm rounded-full"
					feedbackVariant="scale-ripple"
					onPress={() => router.push("/scan" as Href)}
				>
					<Ionicons
						name="scan-outline"
						size={18}
						color={accentForegroundColor}
					/>
					<Button.Label>扫一扫</Button.Label>
				</Button>
			</ScrollView>
		</View>
	);
}

function PersonalQr({
	image,
	value,
}: {
	image?: null | string;
	value: string;
}) {
	return (
		<View className="h-64 w-64 items-center justify-center bg-white">
			<QRCode
				backgroundColor="#ffffff"
				color="#000000"
				ecl="H"
				logo={image ? { uri: image } : undefined}
				logoBackgroundColor="#ffffff"
				logoBorderRadius={12}
				logoMargin={4}
				logoSize={48}
				size={240}
				value={value}
			/>
		</View>
	);
}
