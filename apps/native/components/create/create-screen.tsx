import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Description,
	Input,
	Label,
	PressableFeedback,
	Spinner,
	Text,
	TextArea,
	TextField,
	useThemeColor,
	useToast,
} from "heroui-native";
import { useEffect, useMemo, useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthPanel } from "@/components/auth-panel";
import { authClient } from "@/lib/auth-client";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const CREATE_ACTION_BAR_BOTTOM_OFFSET_PX = 80;

const SAMPLE_IMAGES = [
	"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
];

const TOPIC_PRESETS = [
	"穿搭",
	"美食",
	"旅行",
	"好物",
	"周末",
	"灵感",
	"咖啡",
	"家居",
];

export default function CreateScreen() {
	const router = useRouter();
	const session = authClient.useSession();
	const { toast } = useToast();
	const mutedColor = useThemeColor("muted");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const insets = useSafeAreaInsets();
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [imageText, setImageText] = useState("");
	const [topicText, setTopicText] = useState("");
	const [showImageLinks, setShowImageLinks] = useState(false);

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
				.filter(Boolean)
				.slice(0, 8),
		[topicText],
	);
	const missingItems = useMemo(
		() =>
			[
				imageUrls.length === 0 ? "封面" : null,
				title.trim().length === 0 ? "标题" : null,
				content.trim().length === 0 ? "正文" : null,
				topics.length === 0 ? "话题" : null,
			].filter((item): item is string => Boolean(item)),
		[content, imageUrls.length, title, topics.length],
	);
	const canPublish =
		title.trim().length > 0 &&
		content.trim().length > 0 &&
		imageUrls.length > 0 &&
		topics.length > 0;
	const isAuthenticated = Boolean(session.data?.user) || hasAuthenticated;

	useEffect(() => {
		if (session.data?.user) {
			setHasAuthenticated(true);
		}
	}, [session.data?.user]);

	const createMutation = useMutation(
		orpc.social.create.mutationOptions({
			onSuccess: async () => {
				setTitle("");
				setContent("");
				setImageText("");
				setTopicText("");
				setShowImageLinks(false);
				await queryClient.refetchQueries();
				toast.show({
					variant: "success",
					label: "已提交审核",
					description: "审核通过后会出现在发现页。",
				});
				router.replace("/me" as Href);
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({
					variant: "danger",
					label: "发布失败",
					description: error.message,
				});
			},
		}),
	);
	const publishLabel = createMutation.isPending
		? "提交中"
		: canPublish
			? "发布"
			: `还差 ${missingItems.length} 项`;
	const coverDescription =
		imageUrls.length > 0 ? `${imageUrls.length}/9` : "选一张";

	if (!isAuthenticated) {
		return (
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				contentContainerClassName="bg-background p-4 pb-32"
			>
				<AuthPanel
					onAuthenticated={() => {
						setHasAuthenticated(true);
						session.refetch();
					}}
				/>
			</ScrollView>
		);
	}

	const addImage = (url: string) => {
		const nextImages = imageUrls.includes(url)
			? imageUrls.filter((item) => item !== url)
			: [...imageUrls, url].slice(0, 9);
		setImageText(nextImages.join("\n"));
	};

	const toggleTopic = (topic: string) => {
		const nextTopics = topics.includes(topic)
			? topics.filter((item) => item !== topic)
			: [...topics, topic].slice(0, 8);
		setTopicText(nextTopics.join(" "));
	};

	const publish = () => {
		if (createMutation.isPending) return;

		if (!canPublish) {
			toast.show({
				variant: "warning",
				label: "还不能发布",
				description: `还差：${missingItems.join("、")}`,
			});
			return;
		}

		createMutation.mutate({
			title: title.trim(),
			content: content.trim(),
			images: imageUrls,
			topics,
		});
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-background"
		>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				contentContainerClassName="mx-auto w-full max-w-xl gap-6 bg-background px-4 pt-4 pb-64"
				keyboardDismissMode="on-drag"
			>
				<View className="gap-1">
					<Text.Heading type="h2">发布图文</Text.Heading>
				</View>

				<View className="gap-3">
					<SectionHeader title="封面" description={coverDescription} />
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerClassName="gap-2 pr-4"
					>
						{SAMPLE_IMAGES.map((url, index) => {
							const active = imageUrls.includes(url);
							return (
								<PressableFeedback
									key={url}
									accessibilityLabel={
										active ? `已选择封面 ${index + 1}` : `选择封面 ${index + 1}`
									}
									accessibilityRole="button"
									accessibilityState={active ? { selected: true } : undefined}
									onPress={() => addImage(url)}
									className={
										active
											? "h-28 w-24 overflow-hidden rounded-2xl border-2 border-accent bg-content2"
											: "h-28 w-24 overflow-hidden rounded-2xl bg-content2"
									}
								>
									<Image
										source={{ uri: url }}
										resizeMode="cover"
										className="h-full w-full"
									/>
									{active ? (
										<View className="absolute top-1.5 right-1.5 size-6 items-center justify-center rounded-full bg-accent">
											<Ionicons
												name="checkmark"
												size={14}
												color={accentForegroundColor}
											/>
										</View>
									) : null}
								</PressableFeedback>
							);
						})}
					</ScrollView>
					{imageUrls[0] ? (
						<View className="overflow-hidden rounded-2xl bg-content2">
							<Image
								source={{ uri: imageUrls[0] }}
								resizeMode="cover"
								className="h-60 w-full"
							/>
						</View>
					) : null}
					<Button
						size="sm"
						variant="ghost"
						className="self-start px-0"
						feedbackVariant="scale-ripple"
						onPress={() => setShowImageLinks((value) => !value)}
					>
						<Button.Label>
							{showImageLinks ? "收起图片链接" : "添加图片链接"}
						</Button.Label>
						<Ionicons
							name={showImageLinks ? "chevron-up" : "chevron-down"}
							size={15}
							color={mutedColor}
						/>
					</Button>
					{showImageLinks ? (
						<TextField>
							<Label>图片链接</Label>
							<TextArea
								value={imageText}
								onChangeText={setImageText}
								autoCapitalize="none"
								placeholder="每行一个图片链接"
								placeholderTextColor={mutedColor}
								className="min-h-24"
							/>
							<Description>第一行会作为首页封面。</Description>
						</TextField>
					) : null}
				</View>

				<View className="gap-4">
					<TextField isRequired>
						<Label>标题</Label>
						<Input
							value={title}
							onChangeText={setTitle}
							placeholder="今天最想分享的是..."
							placeholderTextColor={mutedColor}
							maxLength={80}
						/>
						{title.length > 0 ? (
							<Description>{title.length}/80</Description>
						) : null}
					</TextField>

					<TextField isRequired>
						<Label>正文</Label>
						<TextArea
							value={content}
							onChangeText={setContent}
							placeholder="写下细节、感受或清单"
							placeholderTextColor={mutedColor}
							className="min-h-40"
							maxLength={2000}
						/>
						{content.length > 0 ? (
							<Description>{content.length}/2000</Description>
						) : null}
					</TextField>
				</View>

				<View className="gap-3 border-border-tertiary border-t pt-5">
					<SectionHeader title="话题" description="选择 1 到 8 个" />
					<View className="flex-row flex-wrap gap-2">
						{TOPIC_PRESETS.map((topic) => {
							const active = topics.includes(topic);
							return (
								<Button
									key={topic}
									size="sm"
									variant={active ? "primary" : "secondary"}
									feedbackVariant="scale-ripple"
									onPress={() => toggleTopic(topic)}
								>
									<Button.Label>{topic}</Button.Label>
								</Button>
							);
						})}
					</View>
					{topics.length === 0 ? (
						<Text.Paragraph type="body-sm" color="muted">
							选一个话题，方便别人找到这篇图文。
						</Text.Paragraph>
					) : null}
				</View>
			</ScrollView>

			<View
				className="px-4"
				pointerEvents="box-none"
				style={{
					position: "absolute",
					right: 0,
					bottom: insets.bottom + CREATE_ACTION_BAR_BOTTOM_OFFSET_PX,
					left: 0,
				}}
			>
				<Button
					variant={canPublish ? "primary" : "secondary"}
					className="mx-auto h-12 w-full max-w-xl rounded-full shadow-overlay"
					feedbackVariant="scale-ripple"
					isDisabled={createMutation.isPending}
					onPress={publish}
				>
					{createMutation.isPending ? <Spinner size="sm" /> : null}
					<Button.Label>{publishLabel}</Button.Label>
				</Button>
			</View>
		</KeyboardAvoidingView>
	);
}

function SectionHeader({
	description,
	title,
}: {
	description: string;
	title: string;
}) {
	return (
		<View className="flex-row items-center justify-between gap-3">
			<Text.Paragraph weight="semibold" className="text-foreground">
				{title}
			</Text.Paragraph>
			<Text.Paragraph type="body-xs" color="muted">
				{description}
			</Text.Paragraph>
		</View>
	);
}
