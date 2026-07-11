import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Typography, useThemeColor } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppHeader, AppHeaderIconButton } from "@/components/shared/app-header";
import { AppHeading } from "@/components/shared/app-heading";
import { getRouteParam } from "@/utils/route-params";

type MissingKind = "topic" | "user";

function getKind(value?: string): MissingKind {
	return value === "topic" ? "topic" : "user";
}

export default function MissingTargetScreen() {
	const params = useLocalSearchParams<{
		kind?: string | string[];
		returnTo?: string | string[];
		value?: string | string[];
	}>();
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const kind = getKind(getRouteParam(params.kind));
	const value = getRouteParam(params.value) ?? "";
	const returnTo = getRouteParam(params.returnTo);
	const isTopic = kind === "topic";
	const title = isTopic ? "话题不存在" : "用户不存在";
	const description = isTopic
		? `#${value} 可能已被删除，或者链接不太对。`
		: `@${value} 可能已改名、注销，或者链接不太对。`;

	const goBack = () => {
		if (returnTo) {
			router.replace(returnTo as Href);
			return;
		}
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/" as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<AppHeader
				topInset={insets.top}
				left={
					<AppHeaderIconButton
						accessibilityLabel="返回"
						color={mutedColor}
						icon="chevron-back"
						onPress={goBack}
					/>
				}
			/>
			<View className="mx-auto w-full max-w-xl px-4">
				<View className="min-h-[70vh] items-center justify-center gap-6 px-4">
					<View className="items-center gap-3">
						<View className="size-14 items-center justify-center rounded-full bg-content2">
							<Ionicons
								name={isTopic ? "pricetag-outline" : "person-outline"}
								size={28}
								color={mutedColor}
							/>
						</View>
						<View className="items-center gap-2">
							<AppHeading type="h3" align="center">
								{title}
							</AppHeading>
							<Typography.Paragraph type="body-sm" color="muted" align="center">
								{description}
							</Typography.Paragraph>
						</View>
					</View>

					<View className="w-full gap-3">
						<Button
							size="lg"
							variant="primary"
							feedbackVariant="scale-ripple"
							onPress={() => router.replace("/search" as Href)}
						>
							<Ionicons
								name="search-outline"
								size={20}
								color={accentForegroundColor}
							/>
							<Button.Label>去搜索</Button.Label>
						</Button>
						<Button
							size="lg"
							variant="secondary"
							feedbackVariant="scale-ripple"
							onPress={goBack}
						>
							<Button.Label>回到图文</Button.Label>
						</Button>
					</View>
				</View>
			</View>
		</View>
	);
}
