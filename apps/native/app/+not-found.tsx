import { Ionicons } from "@expo/vector-icons";
import { type Href, router, Stack } from "expo-router";
import { Button, Typography, useThemeColor } from "heroui-native";
import { View } from "react-native";
import { AppHeading } from "@/components/shared/app-heading";
import { Container } from "@/components/shared/container";

type RecoveryIconName = keyof typeof Ionicons.glyphMap;

const recoveryActions = [
	{
		label: "回到发现",
		icon: "compass-outline",
		href: "/",
		variant: "primary",
	},
	{
		label: "去搜索",
		icon: "search-outline",
		href: "/search",
		variant: "secondary",
	},
	{
		label: "发布图文",
		icon: "add-circle-outline",
		href: "/create",
		variant: "secondary",
	},
] as const satisfies Array<{
	label: string;
	icon: RecoveryIconName;
	href: Href;
	variant: "primary" | "secondary";
}>;

export default function NotFoundScreen() {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const defaultForegroundColor = useThemeColor("default-foreground");

	function handleNavigate(href: Href) {
		router.replace(href);
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<Container
				scrollViewProps={{
					contentContainerClassName: "flex-grow justify-center px-4 py-6",
				}}
			>
				<View className="mx-auto w-full max-w-sm gap-6">
					<View className="items-center gap-3">
						<View className="size-14 items-center justify-center rounded-full bg-danger-soft">
							<Ionicons
								name="map-outline"
								size={26}
								color={defaultForegroundColor}
							/>
						</View>
						<View className="items-center gap-1">
							<AppHeading type="h2" align="center">
								这篇内容走丢了
							</AppHeading>
							<Typography.Paragraph type="body-sm" color="muted" align="center">
								可能已被删除、隐藏，或者链接不太对。
							</Typography.Paragraph>
						</View>
					</View>

					<View className="gap-3">
						{recoveryActions.map((action) => (
							<Button
								key={action.href}
								onPress={() => handleNavigate(action.href)}
								size="lg"
								variant={action.variant}
								feedbackVariant="scale-ripple"
								className="justify-start"
							>
								<Ionicons
									name={action.icon}
									size={20}
									color={
										action.variant === "primary"
											? accentForegroundColor
											: defaultForegroundColor
									}
								/>
								<Button.Label>{action.label}</Button.Label>
							</Button>
						))}
						<Button
							onPress={() => handleNavigate("/me" as Href)}
							size="md"
							variant="tertiary"
							feedbackVariant="scale-ripple"
						>
							<Button.Label>我的主页</Button.Label>
						</Button>
					</View>
				</View>
			</Container>
		</>
	);
}
