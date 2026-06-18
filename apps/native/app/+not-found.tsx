import { Ionicons } from "@expo/vector-icons";
import { type Href, router, Stack } from "expo-router";
import {
	Alert,
	Button,
	Card,
	Surface,
	Text,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";

import { Container } from "@/components/container";

type IoniconName = keyof typeof Ionicons.glyphMap;

const recoveryActions = [
	{
		label: "回到发现",
		description: "继续看最新图文",
		icon: "compass-outline",
		href: "/",
		variant: "primary",
	},
	{
		label: "去搜索",
		description: "按话题或作者重新找",
		icon: "search-outline",
		href: "/search",
		variant: "secondary",
	},
	{
		label: "发布图文",
		description: "把灵感补成一篇内容",
		icon: "add-circle-outline",
		href: "/create",
		variant: "outline",
	},
] as const satisfies Array<{
	label: string;
	description: string;
	icon: IoniconName;
	href: Href;
	variant: "primary" | "secondary" | "outline";
}>;

export default function NotFoundScreen() {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const defaultForegroundColor = useThemeColor("default-foreground");
	const [hint, setHint] = useState("这条链接没有可展示的图文。");

	function handleNavigate(href: Href, label: string) {
		setHint(`正在前往${label}`);
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
				<Surface
					variant="transparent"
					className="mx-auto w-full max-w-sm gap-4 p-0"
				>
					<Card variant="secondary" className="gap-5 rounded-3xl p-5">
						<Card.Header className="items-center gap-3">
							<Surface className="size-14 items-center justify-center rounded-full bg-danger-soft">
								<Ionicons
									name="map-outline"
									size={26}
									color={defaultForegroundColor}
								/>
							</Surface>
							<Surface variant="transparent" className="items-center gap-1 p-0">
								<Card.Title>这篇内容走丢了</Card.Title>
								<Card.Description>
									可能已被删除、隐藏，或者链接不太对。
								</Card.Description>
							</Surface>
						</Card.Header>
						<Card.Body className="gap-3">
							<Alert status="warning" className="items-center">
								<Alert.Indicator />
								<Alert.Content>
									<Alert.Title>换个入口继续逛</Alert.Title>
									<Alert.Description>{hint}</Alert.Description>
								</Alert.Content>
							</Alert>
							{recoveryActions.map((action) => (
								<Button
									key={action.href}
									onPress={() => handleNavigate(action.href, action.label)}
									size="lg"
									variant={action.variant}
									feedbackVariant="scale-ripple"
									className="min-h-16 justify-start"
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
									<Surface
										variant="transparent"
										className="flex-1 items-start gap-0.5 p-0"
									>
										<Button.Label>{action.label}</Button.Label>
										<Text.Paragraph
											color="muted"
											type="body-xs"
											className="leading-4"
										>
											{action.description}
										</Text.Paragraph>
									</Surface>
									<Ionicons
										name="chevron-forward"
										size={16}
										color={defaultForegroundColor}
									/>
								</Button>
							))}
						</Card.Body>
						<Card.Footer>
							<Button
								onPress={() => handleNavigate("/me" as Href, "我的主页")}
								size="md"
								variant="tertiary"
								className="w-full"
								feedbackVariant="scale-ripple"
							>
								<Button.Label>回到我的主页</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			</Container>
		</>
	);
}
