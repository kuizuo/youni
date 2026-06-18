import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
	Button,
	Card,
	Description,
	Input,
	Label,
	Spinner,
	Surface,
	Text,
	TextArea,
	TextField,
	useToast,
} from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, ScrollView } from "react-native";

import { AuthPanel } from "@/components/auth-panel";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";

const sampleImages = [
	"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1514986888952-8cd320577b68?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
];

const topicPresets = ["穿搭", "美食", "周末", "旅行", "灵感", "好物"];

const inspirationTemplates = [
	{
		label: "周末散步",
		title: "城市散步路线：傍晚去河边看日落",
		content:
			"从老街一路走到河边，傍晚的光线很好。适合拍照，也适合一个人慢慢走。",
		topics: "旅行 周末 灵感",
		image: sampleImages[1],
	},
	{
		label: "初夏穿搭",
		title: "初夏通勤穿搭：蓝白衬衫和低饱和配色",
		content:
			"最近很喜欢蓝白组合，干净、轻盈，也适合通勤。包和鞋都选了低饱和色，整体会更柔和。",
		topics: "穿搭 好物 灵感",
		image: sampleImages[0],
	},
	{
		label: "早午餐",
		title: "周末早午餐清单：牛油果吐司和冰拿铁",
		content:
			"不想排队的时候就在家做早午餐。吐司烤脆，鸡蛋半熟，冰拿铁多放一点奶，十分钟就能开吃。",
		topics: "美食 周末 咖啡",
		image: sampleImages[3],
	},
];

const creatorBoosts = [
	{
		action: "cover",
		label: "先补封面",
		description: "选一张更适合首页的图",
		icon: "image-outline",
	},
	{
		action: "headline",
		label: "优化标题",
		description: "更像一篇可收藏的笔记",
		icon: "text-outline",
	},
	{
		action: "story",
		label: "补充体验",
		description: "加一点真实感和细节",
		icon: "create-outline",
	},
	{
		action: "tags",
		label: "加话题",
		description: "让内容更容易被搜到",
		icon: "pricetag-outline",
	},
] as const;

export default function CreateScreen() {
	const router = useRouter();
	const params = useLocalSearchParams<{
		source?: string;
		action?: string;
		actionAt?: string;
	}>();
	const session = authClient.useSession();
	const { toast } = useToast();
	const handledTabbarAction = useRef<string | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [imageText, setImageText] = useState("");
	const [topicText, setTopicText] = useState("");
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isResetOpen, setIsResetOpen] = useState(false);
	const [isSubmitOpen, setIsSubmitOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
	const [composeHint, setComposeHint] = useState(
		"先选图片或套用模板，系统会同步检查发布条件。",
	);
	const createMutation = useMutation(
		orpc.social.create.mutationOptions({
			onSuccess: async () => {
				toast.show({ variant: "success", label: "已提交审核" });
				setTitle("");
				setContent("");
				setImageText("");
				setTopicText("");
				setIsPreviewOpen(false);
				setIsResetOpen(false);
				setIsSubmitOpen(false);
				setSelectedImageUrl(null);
				setComposeHint("发布已提交，审核通过后会出现在首页。");
				queryClient.refetchQueries();
				router.replace("/me" as Href);
			},
			onError: (error) => {
				setComposeHint("提交失败，请检查内容后再试一次。");
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);

	const imageUrls = useMemo(
		() =>
			imageText
				.split(/\s+/)
				.map((item) => item.trim())
				.filter(Boolean)
				.slice(0, 9),
		[imageText],
	);
	const topics = useMemo(
		() =>
			topicText
				.split(/[,\s，#]+/)
				.map((item) => item.trim())
				.filter(Boolean),
		[topicText],
	);
	const canPublish =
		title.trim() &&
		content.trim() &&
		imageUrls.length > 0 &&
		topics.length > 0 &&
		!createMutation.isPending;
	const canPreview = title.trim() || content.trim() || imageUrls.length > 0;
	const hasDraft =
		!!title.trim() ||
		!!content.trim() ||
		imageUrls.length > 0 ||
		topics.length > 0;
	const completedSteps = [
		imageUrls.length > 0,
		!!title.trim(),
		!!content.trim(),
		topics.length > 0,
	].filter(Boolean).length;
	const progressPercent = (completedSteps / 4) * 100;
	const draftStatus = canPublish
		? "可以发布，提交后进入后台审核"
		: `还差 ${4 - completedSteps} 项，补齐后就能发布`;
	const reviewItems = [
		{
			label: "至少 1 张图片",
			done: imageUrls.length > 0,
			icon: "image-outline" as const,
			hint:
				imageUrls.length > 0
					? "图片已准备好。"
					: "先添加一张示例图或粘贴图片链接。",
		},
		{
			label: "标题已填写",
			done: !!title.trim(),
			icon: "text-outline" as const,
			hint: title.trim()
				? "标题已填写。"
				: "标题会决定首页卡片第一眼是否吸引人。",
		},
		{
			label: "正文已填写",
			done: !!content.trim(),
			icon: "document-text-outline" as const,
			hint: content.trim()
				? "正文已填写。"
				: "正文可以写体验、路线、清单或购买感受。",
		},
		{
			label: "添加话题",
			done: topics.length > 0,
			icon: "pricetag-outline" as const,
			hint: topics.length > 0 ? "话题已添加。" : "话题能让图文更容易被搜索到。",
		},
	];

	useEffect(() => {
		if (!session.data?.user) return;
		if (params.source !== "tabbar" && params.source !== "note") return;
		if (!params.action) return;
		const actionKey = `${params.source}:${params.action}:${params.actionAt ?? ""}`;
		if (handledTabbarAction.current === actionKey) return;
		handledTabbarAction.current = actionKey;

		if (params.action === "add-image") {
			const nextImage =
				sampleImages.find((url) => !imageUrls.includes(url)) ?? sampleImages[0];
			const nextImages = imageUrls.includes(nextImage)
				? imageUrls
				: [...imageUrls, nextImage].slice(0, 9);
			setImageText(nextImages.join("\n"));
			setComposeHint("已从底部快捷动作补上一张图片，可以继续设封面或发布。");
			toast.show({
				variant: "success",
				label: "已补上一张图片",
				description: "继续调整封面和正文。",
				duration: 1300,
			});
			return;
		}

		if (params.action === "starter") {
			const template = inspirationTemplates[0];
			setTitle((value) => value || template.title);
			setContent((value) => value || template.content);
			setTopicText((value) => value || template.topics);
			setImageText((value) => value || template.image);
			setComposeHint("已从发现页带入一篇图文结构，可以直接改成自己的内容。");
			toast.show({
				variant: "success",
				label: "已准备发布结构",
				description: "标题、正文、图片和话题都已补上。",
				duration: 1300,
			});
			return;
		}

		if (params.action === "search-starter") {
			setTitle((value) => value || "从搜索里找到的生活灵感，想认真记录一下");
			setContent(
				(value) =>
					value ||
					"刚才搜索到一个很适合尝试的方向，先把图片、路线、清单和真实感受整理成一篇笔记。",
			);
			setTopicText((value) => value || "灵感 周末 好物");
			setImageText((value) => value || sampleImages[2]);
			setComposeHint("已把搜索灵感带到发布页，可以继续补细节和预览。");
			toast.show({
				variant: "success",
				label: "已带入搜索灵感",
				description: "可以继续写成自己的图文。",
				duration: 1300,
			});
			return;
		}

		if (params.action === "same-style") {
			setTitle((value) => value || "我也想记录一次同款生活灵感");
			setContent(
				(value) =>
					value ||
					"刚刚看完一篇很有启发的图文，我也想按自己的体验写一个版本。先记录图片、路线、清单和真实感受，之后可以继续补充细节。",
			);
			setTopicText((value) => value || "灵感 周末 生活");
			setImageText((value) => value || sampleImages[1]);
			setComposeHint("已从详情页带入同款发布结构，可以直接改成你的版本。");
			toast.show({
				variant: "success",
				label: "已带入同款结构",
				description: "标题、正文、图片和话题都已准备好。",
				duration: 1300,
			});
		}
	}, [
		imageUrls,
		params.action,
		params.actionAt,
		params.source,
		session.data?.user,
		toast.show,
	]);

	if (!session.data?.user) {
		return (
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-4 bg-background p-4"
			>
				<AuthPanel />
			</ScrollView>
		);
	}

	const showActionFeedback = (label: string) => {
		toast.show({ label, duration: 1400 });
	};
	const setTitleValue = (value: string) => {
		setTitle(value);
		setComposeHint(
			value.trim()
				? "标题已更新，继续补正文和图片。"
				: "标题已清空，需要重新填写。",
		);
	};
	const setContentValue = (value: string) => {
		setContent(value);
		setComposeHint(
			value.trim()
				? "正文已更新，可以继续补图片和话题。"
				: "正文已清空，需要重新填写。",
		);
	};
	const setImageTextValue = (value: string) => {
		setImageText(value);
		setComposeHint(
			value.trim()
				? "图片链接已更新，点击图片可以设置封面。"
				: "图片链接已清空，需要至少 1 张图片。",
		);
	};
	const setTopicTextValue = (value: string) => {
		setTopicText(value);
		setComposeHint(
			value.trim()
				? "话题已更新，发布后更容易被发现。"
				: "话题已清空，可以从推荐话题里重新选择。",
		);
	};
	const resetDraft = () => {
		setTitle("");
		setContent("");
		setImageText("");
		setTopicText("");
		setIsPreviewOpen(false);
		setIsResetOpen(false);
		setIsSubmitOpen(false);
		setSelectedImageUrl(null);
		setComposeHint("草稿已清空，可以重新开始写一篇图文。");
		toast.show({ label: "草稿已清空", duration: 1200 });
	};

	const appendImage = (url: string) => {
		if (imageUrls.includes(url)) {
			removeImage(url);
			return;
		}
		if (imageUrls.length >= 9) {
			toast.show({ variant: "warning", label: "最多添加 9 张图片" });
			return;
		}
		setImageText([...imageUrls, url].join("\n"));
		setComposeHint(
			imageUrls.length === 0
				? "已添加首图，点击图片可设为封面。"
				: "已添加图片，可以继续调整封面顺序。",
		);
		showActionFeedback("已添加图片");
	};

	const removeImage = (url: string) => {
		setImageText(imageUrls.filter((item) => item !== url).join("\n"));
		setSelectedImageUrl(null);
		setComposeHint("图片已移除，发布前仍需要至少 1 张图片。");
		showActionFeedback("已移除图片");
	};

	const setCoverImage = (url: string) => {
		if (imageUrls[0] === url) {
			toast.show({ label: "这张已经是封面", duration: 1000 });
			return;
		}
		setImageText([url, ...imageUrls.filter((item) => item !== url)].join("\n"));
		setSelectedImageUrl(null);
		setComposeHint("封面已更新，首页卡片会优先展示这张图。");
		toast.show({
			variant: "success",
			label: "已设为封面",
			description: "首页卡片会优先展示这张图。",
		});
	};

	const toggleTopic = (topic: string) => {
		if (topics.includes(topic)) {
			setTopicText(topics.filter((item) => item !== topic).join(" "));
			setComposeHint(`已取消 #${topic}，可以继续添加更贴近内容的话题。`);
			showActionFeedback(`已取消 #${topic}`);
			return;
		}
		setTopicText([...topics, topic].join(" "));
		setComposeHint(`已添加 #${topic}，这篇图文更容易被发现。`);
		showActionFeedback(`已添加 #${topic}`);
	};
	const applyTemplate = (template: (typeof inspirationTemplates)[number]) => {
		const nextImages = imageUrls.includes(template.image)
			? imageUrls
			: [...imageUrls, template.image].slice(0, 9);
		setTitle(template.title);
		setContent(template.content);
		setTopicText(template.topics);
		setImageText(nextImages.join("\n"));
		setComposeHint(`已套用「${template.label}」，可以继续替换成自己的内容。`);
		toast.show({
			variant: "success",
			label: `已套用「${template.label}」`,
			description: "可以继续替换图片和修改文案。",
		});
	};
	const applyCreatorBoost = (
		action: (typeof creatorBoosts)[number]["action"],
	) => {
		if (action === "cover") {
			const nextImage =
				sampleImages.find((url) => !imageUrls.includes(url)) ?? sampleImages[0];
			appendImage(nextImage);
			setComposeHint("封面已补上，可以继续调整标题和正文。");
			return;
		}
		if (action === "headline") {
			const nextTitle = title.trim()
				? `${title.trim()}｜值得收藏的生活灵感`
				: "把日常过成喜欢的样子：今天的生活灵感";
			setTitleValue(nextTitle.slice(0, 48));
			toast.show({ variant: "success", label: "标题已优化", duration: 1200 });
			return;
		}
		if (action === "story") {
			const extra =
				"我把具体感受和实用细节也记下来：适合收藏，之后照着做会更省心。";
			setContentValue(content.trim() ? `${content.trim()}\n\n${extra}` : extra);
			toast.show({ variant: "success", label: "正文已补充", duration: 1200 });
			return;
		}
		const nextTopics = Array.from(new Set([...topics, "灵感", "好物"]));
		setTopicText(nextTopics.join(" "));
		setComposeHint("已补上更容易被发现的话题。");
		toast.show({ variant: "success", label: "话题已补充", duration: 1200 });
	};
	const requestPublish = () => {
		if (!canPublish) {
			const nextItem = reviewItems.find((item) => !item.done);
			setComposeHint(nextItem?.hint ?? "还不能提交，请先补齐发布条件。");
			toast.show({
				variant: "warning",
				label: "还不能发布",
				description: nextItem?.hint ?? "图片、标题、正文和话题都需要补齐。",
			});
			return;
		}
		setIsPreviewOpen(false);
		setIsSubmitOpen(true);
		setComposeHint("发布前确认一遍，提交后会进入后台审核。");
		toast.show({ label: "发布前再确认一下", duration: 900 });
	};
	const requestPreview = () => {
		if (!canPreview) {
			setComposeHint("先加一张图片、标题或正文，就能打开预览。");
			toast.show({
				variant: "warning",
				label: "还没有可预览内容",
				description: "先从示例图、模板或标题开始。",
			});
			return;
		}
		setIsPreviewOpen(true);
		setComposeHint("已打开发布预览，可以检查首页观感。");
		toast.show({ label: "已打开预览", duration: 900 });
	};
	const submitNote = () => {
		if (!canPublish) return;
		setComposeHint("正在提交审核，请稍等。");
		createMutation.mutate({
			title,
			content,
			images: imageUrls,
			topics,
		});
	};
	const handleReviewPress = (hint: string) => {
		setComposeHint(hint);
		toast.show({ label: hint, duration: 1200 });
	};

	return (
		<Surface variant="transparent" className="flex-1 bg-background p-0">
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="gap-5 bg-background p-4 pb-36"
			>
				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="flex-row items-start justify-between gap-3">
						<Card.Body className="flex-1 gap-1">
							<Card.Title className="font-semibold text-2xl text-foreground">
								发布图文
							</Card.Title>
							<Card.Description>
								像写笔记一样添加图片、标题、正文和话题。
							</Card.Description>
						</Card.Body>
						<Card.Footer className="flex-row gap-2">
							<Button
								size="sm"
								variant="ghost"
								feedbackVariant="scale-ripple"
								isDisabled={!hasDraft}
								onPress={() => setIsResetOpen(true)}
							>
								<Ionicons name="trash-outline" size={15} color="#8a8a8a" />
							</Button>
							<Button
								size="sm"
								variant="secondary"
								feedbackVariant="scale-ripple"
								onPress={requestPreview}
							>
								<Ionicons name="eye-outline" size={15} color="#8a8a8a" />
								<Button.Label>预览</Button.Label>
							</Button>
							<Button
								size="sm"
								variant={canPublish ? "primary" : "danger-soft"}
								feedbackVariant="scale-ripple"
								isDisabled={createMutation.isPending}
								onPress={requestPublish}
							>
								{createMutation.isPending ? <Spinner size="sm" /> : null}
								<Button.Label>
									{createMutation.isPending
										? "提交中"
										: canPublish
											? "发布"
											: "补齐"}
								</Button.Label>
							</Button>
						</Card.Footer>
					</Card.Header>
					<Card.Footer className="flex-row flex-wrap gap-2">
						<ChecklistButton
							done={imageUrls.length > 0}
							label="图片"
							onPress={() => handleReviewPress(reviewItems[0].hint)}
						/>
						<ChecklistButton
							done={!!title.trim()}
							label="标题"
							onPress={() => handleReviewPress(reviewItems[1].hint)}
						/>
						<ChecklistButton
							done={!!content.trim()}
							label="正文"
							onPress={() => handleReviewPress(reviewItems[2].hint)}
						/>
						<ChecklistButton
							done={topics.length > 0}
							label="话题"
							onPress={() => handleReviewPress(reviewItems[3].hint)}
						/>
					</Card.Footer>
					<Surface variant="secondary" className="gap-2 rounded-2xl p-3">
						<Surface
							variant="transparent"
							className="flex-row items-center justify-between p-0"
						>
							<Text.Paragraph type="body-sm" weight="semibold">
								草稿完成度
							</Text.Paragraph>
							<Text.Paragraph color="muted" type="body-xs">
								{completedSteps}/4
							</Text.Paragraph>
						</Surface>
						<Surface
							variant="tertiary"
							className="h-2 overflow-hidden rounded-full p-0"
						>
							<Surface
								className="h-2 rounded-full bg-accent p-0"
								style={{ width: `${progressPercent}%` }}
							/>
						</Surface>
						<Text.Paragraph color="muted" type="body-xs">
							{draftStatus}
						</Text.Paragraph>
					</Surface>
					<Surface
						variant="tertiary"
						className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
					>
						<Ionicons name="sparkles-outline" size={15} color="#f43f5e" />
						<Text.Paragraph type="body-sm" className="flex-1">
							{composeHint}
						</Text.Paragraph>
					</Surface>
					<Card.Footer className="flex-row flex-wrap gap-2">
						{reviewItems.map((item) => (
							<Button
								key={item.label}
								size="sm"
								variant={item.done ? "secondary" : "outline"}
								feedbackVariant="scale-ripple"
								onPress={() => handleReviewPress(item.hint)}
							>
								<Ionicons
									name={item.done ? "checkmark-circle" : item.icon}
									size={13}
									color={item.done ? "#16a34a" : "#8a8a8a"}
								/>
								<Button.Label>{item.label}</Button.Label>
							</Button>
						))}
					</Card.Footer>
					<Card.Footer className="flex-row flex-wrap gap-2">
						{imageUrls.length === 0 ? (
							<Button
								size="sm"
								variant="primary"
								feedbackVariant="scale-ripple"
								onPress={() => appendImage(sampleImages[0])}
							>
								<Ionicons name="image-outline" size={14} color="#ffffff" />
								<Button.Label>加一张示例图</Button.Label>
							</Button>
						) : null}
						{!title.trim() ? (
							<Button
								size="sm"
								variant="secondary"
								feedbackVariant="scale-ripple"
								onPress={() =>
									setTitleValue("今天发现的生活灵感，想认真记录一下")
								}
							>
								<Ionicons name="text-outline" size={14} color="#8a8a8a" />
								<Button.Label>填入标题</Button.Label>
							</Button>
						) : null}
						{!content.trim() ? (
							<Button
								size="sm"
								variant="secondary"
								feedbackVariant="scale-ripple"
								onPress={() =>
									setContentValue(
										"今天试了一个很喜欢的小灵感，图片里的细节值得单独记录。适合收藏，也适合分享给同样喜欢生活感的人。",
									)
								}
							>
								<Ionicons
									name="document-text-outline"
									size={14}
									color="#8a8a8a"
								/>
								<Button.Label>补一段正文</Button.Label>
							</Button>
						) : null}
						{topics.length === 0 ? (
							<Button
								size="sm"
								variant="secondary"
								feedbackVariant="scale-ripple"
								onPress={() => toggleTopic("灵感")}
							>
								<Ionicons name="pricetag-outline" size={14} color="#8a8a8a" />
								<Button.Label>加 #灵感</Button.Label>
							</Button>
						) : null}
					</Card.Footer>
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="flex-row items-center justify-between p-0">
						<Card.Body className="gap-0.5 p-0">
							<Text.Paragraph weight="semibold">创作小助手</Text.Paragraph>
							<Text.Paragraph color="muted" type="body-sm">
								根据当前草稿，快速补齐更像笔记的内容
							</Text.Paragraph>
						</Card.Body>
						<Button
							size="sm"
							variant={canPublish ? "primary" : "secondary"}
							feedbackVariant="scale-ripple"
							onPress={() => {
								const nextItem = reviewItems.find((item) => !item.done);
								handleReviewPress(
									nextItem?.hint ?? "这篇图文已经可以提交审核。",
								);
							}}
						>
							<Ionicons
								name={canPublish ? "checkmark-circle" : "bulb-outline"}
								size={14}
								color={canPublish ? "#ffffff" : "#f43f5e"}
							/>
							<Button.Label>{canPublish ? "可发布" : "下一步"}</Button.Label>
						</Button>
					</Card.Header>
					<Surface
						variant="secondary"
						className="flex-row items-center gap-2 rounded-2xl px-3 py-2"
					>
						<Ionicons name="bulb-outline" size={15} color="#f43f5e" />
						<Text.Paragraph className="flex-1" type="body-sm">
							{canPublish
								? "现在可以预览并提交审核。"
								: (reviewItems.find((item) => !item.done)?.hint ??
									"继续完善草稿。")}
						</Text.Paragraph>
					</Surface>
					<Surface
						variant="transparent"
						className="flex-row flex-wrap gap-2 p-0"
					>
						{creatorBoosts.map((boost) => (
							<Button
								key={boost.action}
								size="lg"
								variant={
									(boost.action === "cover" && imageUrls.length === 0) ||
									(boost.action === "headline" && !title.trim()) ||
									(boost.action === "story" && !content.trim()) ||
									(boost.action === "tags" && topics.length === 0)
										? "primary"
										: "secondary"
								}
								feedbackVariant="scale-ripple"
								className="min-h-20 min-w-[47%] flex-1 justify-start rounded-2xl px-3 py-3"
								onPress={() => applyCreatorBoost(boost.action)}
							>
								<Surface
									variant="transparent"
									className="size-9 items-center justify-center rounded-full bg-danger-soft p-0"
								>
									<Ionicons name={boost.icon} size={18} color="#f43f5e" />
								</Surface>
								<Surface
									variant="transparent"
									className="flex-1 items-start gap-0.5 p-0"
								>
									<Button.Label>{boost.label}</Button.Label>
									<Text.Paragraph
										color="muted"
										type="body-xs"
										numberOfLines={2}
									>
										{boost.description}
									</Text.Paragraph>
								</Surface>
							</Button>
						))}
					</Surface>
				</Card>

				<Card className="gap-3 rounded-3xl p-4">
					<Card.Header className="items-center justify-between">
						<Card.Body className="gap-1">
							<Text.Paragraph weight="semibold">灵感模板</Text.Paragraph>
							<Text.Paragraph color="muted" type="body-sm">
								先套一个结构，再改成自己的内容。
							</Text.Paragraph>
						</Card.Body>
					</Card.Header>
					<Card.Footer className="flex-row flex-wrap gap-2">
						{inspirationTemplates.map((template) => (
							<Button
								key={template.label}
								size="sm"
								variant="secondary"
								feedbackVariant="scale-ripple"
								onPress={() => applyTemplate(template)}
							>
								<Ionicons name="sparkles-outline" size={13} color="#f43f5e" />
								<Button.Label>{template.label}</Button.Label>
							</Button>
						))}
					</Card.Footer>
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<Card.Header className="flex-row items-center justify-between">
						<Text.Paragraph weight="semibold">图片</Text.Paragraph>
						<Button
							size="sm"
							variant="secondary"
							feedbackVariant="scale-ripple"
							onPress={() =>
								handleReviewPress(`当前已添加 ${imageUrls.length}/9 张图片`)
							}
						>
							<Ionicons name="images-outline" size={13} color="#8a8a8a" />
							<Button.Label>{imageUrls.length}/9</Button.Label>
						</Button>
					</Card.Header>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<Surface variant="transparent" className="flex-row gap-3 p-0 pr-4">
							{imageUrls.map((url) => (
								<Surface
									key={url}
									variant="transparent"
									className="relative overflow-hidden rounded-2xl p-0"
								>
									<Button
										isIconOnly
										variant="secondary"
										feedbackVariant="scale-ripple"
										accessibilityLabel={
											imageUrls[0] === url ? "查看封面图片操作" : "查看图片操作"
										}
										className="size-32 overflow-hidden rounded-2xl p-0"
										onPress={() => {
											setSelectedImageUrl(url);
											toast.show({ label: "打开图片操作", duration: 900 });
										}}
									>
										<Image
											source={{ uri: url }}
											className="size-32 rounded-2xl bg-content3"
											resizeMode="cover"
										/>
									</Button>
									{imageUrls[0] === url ? (
										<Surface className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2 py-1">
											<Text.Paragraph
												type="body-xs"
												weight="semibold"
												className="text-white"
											>
												封面
											</Text.Paragraph>
										</Surface>
									) : null}
									<Button
										isIconOnly
										size="sm"
										variant="danger-soft"
										className="absolute top-2 right-2"
										onPress={() => removeImage(url)}
									>
										<Ionicons name="close" size={14} color="#f43f5e" />
									</Button>
								</Surface>
							))}
							<Button
								variant="secondary"
								feedbackVariant="scale-ripple"
								className="size-32 flex-col overflow-hidden rounded-2xl border border-content3 border-dashed"
								onPress={() => {
									const nextImage =
										sampleImages.find((url) => !imageUrls.includes(url)) ??
										sampleImages[0];
									appendImage(nextImage);
								}}
							>
								<Ionicons name="image-outline" size={30} color="#8a8a8a" />
								<Button.Label className="text-muted-foreground text-xs">
									点按添加
								</Button.Label>
							</Button>
						</Surface>
					</ScrollView>
					<Card.Footer className="flex-row flex-wrap gap-2">
						{sampleImages.map((url, index) => {
							const active = imageUrls.includes(url);
							return (
								<Button
									key={url}
									size="sm"
									variant={active ? "primary" : "secondary"}
									feedbackVariant="scale-ripple"
									onPress={() => appendImage(url)}
								>
									<Button.Label>
										{active ? "已选" : "示例图"} {index + 1}
									</Button.Label>
								</Button>
							);
						})}
					</Card.Footer>
					<TextField>
						<Label>图片链接</Label>
						<TextArea
							value={imageText}
							onChangeText={setImageTextValue}
							autoCapitalize="none"
							placeholder="也可以粘贴图片链接，每行或空格分隔"
							className="min-h-20"
						/>
						<Description>第一阶段先使用图片链接，最多 9 张。</Description>
					</TextField>
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<TextField isRequired isInvalid={title.length > 40}>
						<Label>标题</Label>
						<Input
							value={title}
							onChangeText={setTitleValue}
							placeholder="写一个吸引人的标题"
							maxLength={48}
						/>
						<Description>
							{title.length > 40
								? "标题略长，建议压到 40 字以内"
								: `${title.length}/48`}
						</Description>
					</TextField>
					<TextField isRequired isInvalid={content.length > 1000}>
						<Label>正文</Label>
						<TextArea
							value={content}
							onChangeText={setContentValue}
							placeholder="分享你的体验、清单或灵感"
							className="min-h-36"
							maxLength={1200}
						/>
						<Description>
							{content.length > 1000
								? "正文略长，建议保留重点体验"
								: `${content.length}/1200`}
						</Description>
					</TextField>
				</Card>

				<Card className="gap-4 rounded-3xl p-4">
					<Card.Body className="gap-1">
						<Text.Paragraph weight="semibold">话题</Text.Paragraph>
						<Text.Paragraph color="muted" type="body-sm">
							选择话题会让内容更容易被发现。
						</Text.Paragraph>
					</Card.Body>
					<Card.Footer className="flex-row flex-wrap gap-2">
						{topicPresets.map((topic) => {
							const active = topics.includes(topic);
							return (
								<Button
									key={topic}
									size="sm"
									variant={active ? "primary" : "secondary"}
									feedbackVariant="scale-ripple"
									onPress={() => toggleTopic(topic)}
								>
									<Button.Label>#{topic}</Button.Label>
								</Button>
							);
						})}
					</Card.Footer>
					<TextField>
						<Label>自定义话题</Label>
						<Input
							value={topicText}
							onChangeText={setTopicTextValue}
							placeholder="例如：穿搭 美食 周末"
						/>
					</TextField>
				</Card>
			</ScrollView>

			<Surface className="absolute right-0 bottom-0 left-0 gap-3 border-content3 border-t bg-background/95 p-3">
				<Card.Header className="flex-row items-center justify-between">
					<Surface variant="transparent" className="gap-0.5 p-0">
						<Text.Paragraph type="body-sm" weight="semibold">
							{canPublish ? "草稿已就绪" : "继续完善草稿"}
						</Text.Paragraph>
						<Text.Paragraph color="muted" type="body-xs">
							{draftStatus}
						</Text.Paragraph>
					</Surface>
					<Button
						size="sm"
						variant={canPublish ? "primary" : "secondary"}
						feedbackVariant="scale-ripple"
						onPress={() => handleReviewPress(draftStatus)}
					>
						<Ionicons
							name={canPublish ? "checkmark-circle" : "ellipse-outline"}
							size={13}
							color={canPublish ? "#ffffff" : "#8a8a8a"}
						/>
						<Button.Label>{completedSteps}/4</Button.Label>
					</Button>
				</Card.Header>
				<Card.Footer className="flex-row gap-2">
					<Button
						variant="ghost"
						feedbackVariant="scale-ripple"
						isDisabled={!hasDraft}
						onPress={() => setIsResetOpen(true)}
					>
						<Ionicons name="trash-outline" size={15} color="#8a8a8a" />
						<Button.Label>清空</Button.Label>
					</Button>
					<Button
						variant="secondary"
						className="flex-1"
						feedbackVariant="scale-ripple"
						onPress={requestPreview}
					>
						<Ionicons name="eye-outline" size={15} color="#8a8a8a" />
						<Button.Label>预览</Button.Label>
					</Button>
					<Button
						variant={canPublish ? "primary" : "danger-soft"}
						className="flex-1"
						feedbackVariant="scale-ripple"
						isDisabled={createMutation.isPending}
						onPress={requestPublish}
					>
						{createMutation.isPending ? <Spinner size="sm" /> : null}
						<Button.Label>
							{createMutation.isPending
								? "提交中"
								: canPublish
									? "提交审核"
									: "补齐后提交"}
						</Button.Label>
					</Button>
				</Card.Footer>
			</Surface>

			{isResetOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-end bg-black/45 p-4"
				>
					<Card className="gap-5 rounded-3xl p-5">
						<Card.Body className="gap-1 p-0">
							<Text.Heading type="h4">清空当前草稿？</Text.Heading>
							<Text.Paragraph color="muted" type="body-sm">
								已填写的图片、标题、正文和话题都会被清掉。
							</Text.Paragraph>
						</Card.Body>
						<Card.Footer className="flex-row gap-2 p-0">
							<Button
								variant="secondary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								onPress={() => {
									setIsResetOpen(false);
									toast.show({ label: "继续编辑", duration: 1000 });
								}}
							>
								<Button.Label>继续编辑</Button.Label>
							</Button>
							<Button
								variant="danger"
								className="flex-1"
								feedbackVariant="scale-ripple"
								onPress={resetDraft}
							>
								<Button.Label>清空</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}

			{selectedImageUrl ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-end bg-black/45 p-4"
				>
					<Card className="gap-5 rounded-3xl p-5">
						<Card.Header className="flex-row items-center justify-between p-0">
							<Card.Body className="gap-0.5 p-0">
								<Text.Heading type="h4">图片操作</Text.Heading>
								<Text.Paragraph color="muted" type="body-sm">
									调整封面、查看图片，或从草稿里移除。
								</Text.Paragraph>
							</Card.Body>
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								feedbackVariant="scale-ripple"
								onPress={() => setSelectedImageUrl(null)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>
						<Card className="overflow-hidden rounded-3xl p-0">
							<Image
								source={{ uri: selectedImageUrl }}
								className="h-72 w-full bg-content3"
								resizeMode="cover"
							/>
							<Card.Footer className="absolute right-3 bottom-3 left-3 flex-row items-center justify-between rounded-2xl bg-black/45 px-3 py-2">
								<Text.Paragraph className="text-white" type="body-xs">
									{imageUrls[0] === selectedImageUrl ? "当前封面" : "草稿图片"}
								</Text.Paragraph>
								<Text.Paragraph className="text-white" type="body-xs">
									{imageUrls.indexOf(selectedImageUrl) + 1}/{imageUrls.length}
								</Text.Paragraph>
							</Card.Footer>
						</Card>
						<Card.Footer className="flex-row flex-wrap gap-2 p-0">
							<Button
								variant="primary"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={imageUrls[0] === selectedImageUrl}
								onPress={() => setCoverImage(selectedImageUrl)}
							>
								<Ionicons name="star-outline" size={16} color="#ffffff" />
								<Button.Label>设为封面</Button.Label>
							</Button>
							<Button
								variant="secondary"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								onPress={() => {
									setIsPreviewOpen(true);
									setSelectedImageUrl(null);
									toast.show({ label: "已打开发布预览", duration: 900 });
								}}
							>
								<Ionicons name="eye-outline" size={16} color="#8a8a8a" />
								<Button.Label>预览图文</Button.Label>
							</Button>
							<Button
								variant="danger-soft"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								onPress={() => removeImage(selectedImageUrl)}
							>
								<Ionicons name="trash-outline" size={16} color="#f43f5e" />
								<Button.Label>移除图片</Button.Label>
							</Button>
							<Button
								variant="ghost"
								className="min-w-[47%] flex-1"
								feedbackVariant="scale-ripple"
								onPress={() => setSelectedImageUrl(null)}
							>
								<Button.Label>继续编辑</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}

			{isSubmitOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-end bg-black/45 p-4"
				>
					<Card className="gap-5 rounded-3xl p-5">
						<Card.Header className="flex-row items-center justify-between p-0">
							<Card.Body className="gap-0.5 p-0">
								<Text.Heading type="h4">提交审核？</Text.Heading>
								<Text.Paragraph color="muted" type="body-sm">
									发布后会先进入后台审核，通过后展示在首页。
								</Text.Paragraph>
							</Card.Body>
							<Button
								size="sm"
								variant="primary"
								feedbackVariant="scale-ripple"
								onPress={() => handleReviewPress("内容已满足提交条件")}
							>
								<Ionicons name="checkmark-circle" size={13} color="#ffffff" />
								<Button.Label>{completedSteps}/4</Button.Label>
							</Button>
						</Card.Header>
						<Card variant="secondary" className="gap-3 rounded-3xl p-3">
							<Card.Header className="flex-row items-center gap-3 p-0">
								<Image
									source={{ uri: imageUrls[0] }}
									className="size-20 rounded-2xl bg-content3"
									resizeMode="cover"
								/>
								<Card.Body className="min-w-0 gap-1 p-0">
									<Card.Title numberOfLines={2}>{title.trim()}</Card.Title>
									<Card.Description numberOfLines={2}>
										{content.trim()}
									</Card.Description>
								</Card.Body>
							</Card.Header>
							<Card.Footer className="flex-row flex-wrap gap-2 p-0">
								<ChecklistButton
									done={imageUrls.length > 0}
									label="图片"
									onPress={() => handleReviewPress(reviewItems[0].hint)}
								/>
								<ChecklistButton
									done={!!title.trim()}
									label="标题"
									onPress={() => handleReviewPress(reviewItems[1].hint)}
								/>
								<ChecklistButton
									done={!!content.trim()}
									label="正文"
									onPress={() => handleReviewPress(reviewItems[2].hint)}
								/>
								<ChecklistButton
									done={topics.length > 0}
									label="话题"
									onPress={() => handleReviewPress(reviewItems[3].hint)}
								/>
							</Card.Footer>
						</Card>
						<Card.Footer className="flex-row gap-2 p-0">
							<Button
								variant="secondary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={createMutation.isPending}
								onPress={() => {
									setIsSubmitOpen(false);
									toast.show({ label: "继续编辑", duration: 900 });
								}}
							>
								<Button.Label>再改改</Button.Label>
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={!canPublish || createMutation.isPending}
								onPress={submitNote}
							>
								{createMutation.isPending ? <Spinner size="sm" /> : null}
								<Button.Label>
									{createMutation.isPending ? "提交中" : "确认提交"}
								</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}

			{isPreviewOpen ? (
				<Surface
					variant="transparent"
					className="absolute inset-0 z-50 justify-end bg-black/45 p-4"
				>
					<Card className="max-h-[88%] gap-4 rounded-3xl p-4">
						<Card.Header className="flex-row items-center justify-between">
							<Card.Body className="gap-0.5">
								<Text.Heading type="h4">发布预览</Text.Heading>
								<Text.Paragraph color="muted" type="body-sm">
									确认图文效果后提交审核。
								</Text.Paragraph>
							</Card.Body>
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								feedbackVariant="scale-ripple"
								onPress={() => setIsPreviewOpen(false)}
							>
								<Ionicons name="close" size={18} color="#8a8a8a" />
							</Button>
						</Card.Header>

						<ScrollView showsVerticalScrollIndicator={false}>
							<Card className="overflow-hidden rounded-3xl p-0">
								{imageUrls[0] ? (
									<Image
										source={{ uri: imageUrls[0] }}
										className="h-80 w-full bg-content3"
										resizeMode="cover"
									/>
								) : (
									<Surface
										variant="secondary"
										className="h-60 items-center justify-center"
									>
										<Ionicons name="image-outline" size={34} color="#8a8a8a" />
										<Text.Paragraph
											color="muted"
											type="body-sm"
											className="mt-2"
										>
											还没有图片
										</Text.Paragraph>
									</Surface>
								)}
								<Card.Body className="gap-3 p-4">
									<Card.Title
										className="font-semibold text-foreground text-xl leading-7"
										numberOfLines={3}
									>
										{title.trim() || "还没有标题"}
									</Card.Title>
									<Text.Paragraph
										color={content.trim() ? "default" : "muted"}
										type="body"
										className="leading-7"
									>
										{content.trim() || "正文会显示在这里。"}
									</Text.Paragraph>
									{topics.length ? (
										<Card.Footer className="flex-row flex-wrap gap-2">
											{topics.map((topic) => (
												<Button
													key={topic}
													size="md"
													variant="secondary"
													feedbackVariant="scale-ripple"
													onPress={() =>
														handleReviewPress(`#${topic} 会出现在图文话题里`)
													}
												>
													<Ionicons
														name="pricetag-outline"
														size={14}
														color="#8a8a8a"
													/>
													<Button.Label>#{topic}</Button.Label>
												</Button>
											))}
										</Card.Footer>
									) : null}
									<Surface
										variant="secondary"
										className="flex-row items-center justify-between rounded-2xl px-3 py-2"
									>
										<Text.Paragraph color="muted" type="body-xs">
											提交后进入后台审核
										</Text.Paragraph>
										<Text.Paragraph color="muted" type="body-xs">
											{imageUrls.length}/9 图
										</Text.Paragraph>
									</Surface>
								</Card.Body>
							</Card>
						</ScrollView>

						<Card.Footer className="flex-row gap-2">
							<Button
								variant="secondary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								onPress={() => setIsPreviewOpen(false)}
							>
								<Button.Label>继续编辑</Button.Label>
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								feedbackVariant="scale-ripple"
								isDisabled={!canPublish || createMutation.isPending}
								onPress={requestPublish}
							>
								{createMutation.isPending ? <Spinner size="sm" /> : null}
								<Button.Label>
									{createMutation.isPending ? "提交中" : "提交审核"}
								</Button.Label>
							</Button>
						</Card.Footer>
					</Card>
				</Surface>
			) : null}
		</Surface>
	);
}

function ChecklistButton({
	done,
	label,
	onPress,
}: {
	done: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant={done ? "primary" : "secondary"}
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Ionicons
				name={done ? "checkmark-circle" : "ellipse-outline"}
				size={13}
				color={done ? "#ffffff" : "#8a8a8a"}
			/>
			<Button.Label>{done ? `${label}已填` : `待填${label}`}</Button.Label>
		</Button>
	);
}
