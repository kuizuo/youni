import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
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

const quickActions = [
	{
		label: "发一篇图文",
		description: "用图片链接和话题创建新内容",
		icon: "add-circle-outline",
		href: "/create",
		variant: "primary",
	},
	{
		label: "找灵感",
		description: "搜索话题、作者和图文",
		icon: "search-outline",
		href: "/search",
		variant: "secondary",
	},
	{
		label: "回到发现",
		description: "继续浏览已发布内容",
		icon: "compass-outline",
		href: "/",
		variant: "outline",
	},
] as const satisfies Array<{
	label: string;
	description: string;
	icon: IoniconName;
	href: Href;
	variant: "primary" | "secondary" | "outline";
}>;

function Modal() {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const defaultForegroundColor = useThemeColor("default-foreground");
	const [hint, setHint] = useState(
		"先选一个动作，内容会继续留在同一个社区流程里。",
	);

	function handleClose() {
		if (router.canGoBack()) {
			router.back();
			return;
		}

		router.replace("/");
	}

	function handleNavigate(href: Href, label: string) {
		setHint(`${label}已准备好`);
		router.push(href);
	}

	return (
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
					<Card.Header className="items-center justify-between">
						<Surface
							variant="transparent"
							className="flex-row items-center gap-3 p-0"
						>
							<Surface className="h-12 w-12 items-center justify-center rounded-full bg-accent">
								<Ionicons
									name="sparkles-outline"
									size={24}
									color={accentForegroundColor}
								/>
							</Surface>
							<Surface variant="transparent" className="gap-1 p-0">
								<Card.Title>灵感操作</Card.Title>
								<Card.Description>发布、搜索和继续浏览</Card.Description>
							</Surface>
						</Surface>
						<Button
							onPress={handleClose}
							size="sm"
							variant="ghost"
							isIconOnly
							feedbackVariant="scale-ripple"
						>
							<Ionicons name="close" size={18} color={defaultForegroundColor} />
						</Button>
					</Card.Header>
					<Card.Body className="gap-3">
						<Alert status="accent" className="items-center">
							<Alert.Indicator />
							<Alert.Content>
								<Alert.Title>继续完成内容流</Alert.Title>
								<Alert.Description>{hint}</Alert.Description>
							</Alert.Content>
						</Alert>
						{quickActions.map((action) => (
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
					<Card.Footer className="gap-3">
						<Button
							onPress={() => {
								setHint("可以先浏览，再从底部发布按钮回来。");
								router.replace("/");
							}}
							className="flex-1"
							size="sm"
							variant="tertiary"
							feedbackVariant="scale-ripple"
						>
							<Button.Label>稍后再说</Button.Label>
						</Button>
						<Button
							onPress={() => handleNavigate("/me" as Href, "个人页")}
							className="flex-1"
							size="sm"
							variant="outline"
							feedbackVariant="scale-ripple"
						>
							<Button.Label>我的主页</Button.Label>
						</Button>
					</Card.Footer>
				</Card>
			</Surface>
		</Container>
	);
}

export default Modal;
