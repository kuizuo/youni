import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";
import { Button, Text, useThemeColor } from "heroui-native";
import { View } from "react-native";
import { AppHeading } from "@/components/shared/app-heading";
import { Container } from "@/components/shared/container";

type IoniconName = keyof typeof Ionicons.glyphMap;

const quickActions = [
	{
		label: "发一篇图文",
		icon: "add-circle-outline",
		href: "/create",
		variant: "primary",
	},
	{
		label: "找灵感",
		icon: "search-outline",
		href: "/search",
		variant: "secondary",
	},
	{
		label: "回到发现",
		icon: "compass-outline",
		href: "/",
		variant: "secondary",
	},
] as const satisfies Array<{
	label: string;
	icon: IoniconName;
	href: Href;
	variant: "primary" | "secondary";
}>;

function Modal() {
	const accentForegroundColor = useThemeColor("accent-foreground");
	const defaultForegroundColor = useThemeColor("default-foreground");

	function handleClose() {
		if (router.canGoBack()) {
			router.back();
			return;
		}

		router.replace("/");
	}

	function handleNavigate(href: Href) {
		router.push(href);
	}

	return (
		<Container
			scrollViewProps={{
				contentContainerClassName: "flex-grow justify-center px-4 py-6",
			}}
		>
			<View className="mx-auto w-full max-w-sm gap-6">
				<View className="flex-row items-start justify-between gap-4">
					<View className="min-w-0 flex-1 gap-1">
						<AppHeading type="h2">下一步</AppHeading>
						<Text.Paragraph type="body-sm" color="muted">
							发布、搜索，或者继续回到发现页。
						</Text.Paragraph>
					</View>
					<Button
						onPress={handleClose}
						size="sm"
						variant="ghost"
						isIconOnly
						feedbackVariant="scale-ripple"
						accessibilityLabel="关闭"
					>
						<Ionicons name="close" size={18} color={defaultForegroundColor} />
					</Button>
				</View>

				<View className="gap-3">
					{quickActions.map((action) => (
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
				</View>

				<View className="flex-row gap-2">
					<Button
						onPress={() => router.replace("/")}
						className="flex-1"
						size="sm"
						variant="tertiary"
						feedbackVariant="scale-ripple"
					>
						<Button.Label>稍后再说</Button.Label>
					</Button>
					<Button
						onPress={() => handleNavigate("/me" as Href)}
						className="flex-1"
						size="sm"
						variant="outline"
						feedbackVariant="scale-ripple"
					>
						<Button.Label>我的主页</Button.Label>
					</Button>
				</View>
			</View>
		</Container>
	);
}

export default Modal;
