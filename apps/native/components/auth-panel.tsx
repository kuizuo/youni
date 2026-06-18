import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { Button, Card, Surface, Tabs, Text, useToast } from "heroui-native";
import { useState } from "react";

import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";

const guestActions = [
	{
		label: "先去发现",
		description: "不登录也能继续刷图文",
		icon: "compass-outline",
		href: "/",
	},
	{
		label: "搜点灵感",
		description: "看看话题、作者和内容",
		icon: "search-outline",
		href: "/search",
	},
	{
		label: "创建账号",
		description: "注册后就能发布和互动",
		icon: "person-add-outline",
		href: null,
	},
] as const;
const authBenefits = [
	{
		label: "发布图文",
		description: "把图片、正文和话题发成自己的生活笔记。",
		icon: "add-circle-outline",
		cta: "去创建账号",
		action: "sign-up",
	},
	{
		label: "收藏灵感",
		description: "先去搜索喜欢的内容，登录后就能保存到我的收藏。",
		icon: "bookmark-outline",
		cta: "先找灵感",
		action: "search",
	},
	{
		label: "关注作者",
		description: "先逛发现流，找到喜欢的作者后可以持续关注。",
		icon: "people-outline",
		cta: "去发现",
		action: "home",
	},
] as const;

export function AuthPanel() {
	const router = useRouter();
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
	const [hint, setHint] = useState("登录后可以继续互动。");
	const [activeBenefit, setActiveBenefit] = useState<
		(typeof authBenefits)[number]
	>(authBenefits[0]);
	const { toast } = useToast();
	const handleModeChange = (value: string) => {
		if (value === "sign-in" || value === "sign-up") {
			setMode(value);
			setHint(
				value === "sign-in" ? "登录后可以继续互动。" : "注册后自动进入社区。",
			);
			toast.show({
				label: value === "sign-in" ? "准备登录" : "准备注册",
				duration: 900,
			});
		}
	};
	const showBenefit = (item: (typeof authBenefits)[number]) => {
		setActiveBenefit(item);
		setHint(item.description);
		toast.show({
			label: item.label,
			description: item.description,
			duration: 1200,
		});
	};
	const runBenefitAction = () => {
		if (activeBenefit.action === "sign-up") {
			setMode("sign-up");
			setHint("已切到注册，创建账号后即可发布和互动。");
			toast.show({ label: "准备注册", duration: 900 });
			return;
		}
		if (activeBenefit.action === "search") {
			toast.show({ label: "去找灵感", duration: 900 });
			router.push("/search" as Href);
			return;
		}
		toast.show({ label: "去发现", duration: 900 });
		router.push("/" as Href);
	};
	const handleGuestAction = (action: (typeof guestActions)[number]) => {
		if (action.href) {
			setHint(`${action.label}，未登录也可以先浏览。`);
			toast.show({
				label: action.label,
				description: action.description,
				duration: 1100,
			});
			router.push(action.href as Href);
			return;
		}
		setMode("sign-up");
		setHint("已切到注册，创建账号后即可发布和互动。");
		toast.show({ label: "准备注册", duration: 900 });
	};

	return (
		<Surface variant="transparent" className="gap-4 p-0">
			<Card className="gap-4 rounded-3xl p-4">
				<Card.Header className="flex-row items-start justify-between gap-3 p-0">
					<Card.Body className="gap-1 p-0">
						<Card.Title className="font-semibold text-2xl text-foreground">
							{mode === "sign-in" ? "欢迎回来" : "创建账号"}
						</Card.Title>
						<Card.Description>
							登录后可以发布、点赞、收藏、评论和关注。
						</Card.Description>
					</Card.Body>
					<Surface className="rounded-full bg-danger-soft p-2">
						<Ionicons name="heart-outline" size={20} color="#f43f5e" />
					</Surface>
				</Card.Header>
				<Card.Footer className="flex-row flex-wrap gap-2 p-0">
					{authBenefits.map((item) => {
						const active = activeBenefit.label === item.label;
						return (
							<Button
								key={item.label}
								size="sm"
								variant={active ? "primary" : "secondary"}
								feedbackVariant="scale-ripple"
								onPress={() => showBenefit(item)}
							>
								<Ionicons
									name={item.icon}
									size={14}
									color={active ? "#ffffff" : "#f43f5e"}
								/>
								<Button.Label>{item.label}</Button.Label>
							</Button>
						);
					})}
				</Card.Footer>
				<Card variant="secondary" className="gap-3 rounded-3xl p-3">
					<Card.Header className="flex-row items-center gap-3 p-0">
						<Surface className="size-11 items-center justify-center rounded-full bg-danger-soft p-0">
							<Ionicons
								name={activeBenefit.icon}
								size={21}
								color="#f43f5e"
							/>
						</Surface>
						<Card.Body className="min-w-0 flex-1 gap-0.5 p-0">
							<Card.Title>{activeBenefit.label}</Card.Title>
							<Card.Description numberOfLines={2}>
								{activeBenefit.description}
							</Card.Description>
						</Card.Body>
						<Button
							size="sm"
							variant="primary"
							feedbackVariant="scale-ripple"
							onPress={runBenefitAction}
						>
							<Button.Label>{activeBenefit.cta}</Button.Label>
						</Button>
					</Card.Header>
				</Card>
				<Surface variant="transparent" className="flex-row flex-wrap gap-2 p-0">
					{guestActions.map((action) => (
						<Button
							key={action.label}
							size="lg"
							variant={action.href === null ? "primary" : "secondary"}
							feedbackVariant="scale-ripple"
							className="min-h-20 min-w-[47%] flex-1 justify-start rounded-2xl px-3 py-3"
							onPress={() => handleGuestAction(action)}
						>
							<Surface
								variant="transparent"
								className="size-9 items-center justify-center rounded-full bg-danger-soft p-0"
							>
								<Ionicons name={action.icon} size={18} color="#f43f5e" />
							</Surface>
							<Surface
								variant="transparent"
								className="flex-1 items-start gap-0.5 p-0"
							>
								<Button.Label>{action.label}</Button.Label>
								<Text.Paragraph
									color={action.href === null ? "default" : "muted"}
									type="body-xs"
									numberOfLines={2}
								>
									{action.description}
								</Text.Paragraph>
							</Surface>
						</Button>
					))}
				</Surface>
				<Surface
					variant="secondary"
					className="flex-row items-center gap-2 rounded-2xl bg-accent-soft px-3 py-2"
				>
					<Ionicons name="checkmark-circle" size={15} color="#f43f5e" />
					<Text.Paragraph
						type="body-sm"
						weight="semibold"
						className="text-accent"
					>
						{hint}
					</Text.Paragraph>
				</Surface>
			</Card>
			<Tabs value={mode} onValueChange={handleModeChange} variant="primary">
				<Tabs.List>
					<Tabs.Indicator />
					<Tabs.Trigger value="sign-in">
						<Tabs.Label>登录</Tabs.Label>
					</Tabs.Trigger>
					<Tabs.Trigger value="sign-up">
						<Tabs.Label>注册</Tabs.Label>
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="sign-in">
					<SignIn />
				</Tabs.Content>
				<Tabs.Content value="sign-up">
					<SignUp />
				</Tabs.Content>
			</Tabs>
			<Text.Paragraph align="center" color="muted" type="body-xs">
				未登录也可以浏览内容，互动时会提醒登录。
			</Text.Paragraph>
		</Surface>
	);
}
