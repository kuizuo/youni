import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { router } from "expo-router";
import {
	Button,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth-client";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

const SAMPLE_IMAGES = [
	"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80",
	"https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80",
];

const TOPIC_PRESETS = ["综艺推荐", "爆笑综艺", "看剧"];
const TOPIC_SUGGESTIONS = [
	"分享一部最近看的电视剧",
	"宝能环球汇(西丽)",
	"欢乐牧场主题自助",
	"南方科技大学教育",
];
const QUICK_ACTIONS = [
	{ label: "话题", icon: "pricetag-outline" },
	{ label: "用户", icon: "at-outline" },
	{ label: "投票", icon: "chatbubble-ellipses-outline" },
] as const;
const OPTION_ROWS = [
	{
		label: "标记地点",
		icon: "location-outline",
		suggestions: TOPIC_SUGGESTIONS,
	},
	{ label: "公开可见", icon: "lock-open-outline" },
	{ label: "添加组件", icon: "grid-outline", value: "可添加文件" },
	{ label: "高级选项", icon: "settings-outline" },
] as const;

type IoniconName = keyof typeof Ionicons.glyphMap;
type NoteVisibility = "followers" | "private" | "public";
type PublishSubmitMode = "draft" | "publish";
type NoteComponent = {
	title: string;
	type: "file" | "poll";
	value?: string;
};

const DEFAULT_ADVANCED_OPTIONS = {
	allowComment: true,
	allowShare: true,
	isOriginal: true,
};

export default function CreateScreen() {
	const session = authClient.useSession();
	const { toast } = useAppToast();
	const defaultForegroundColor = useThemeColor("default-foreground");
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const insets = useSafeAreaInsets();
	const [hasAuthenticated, setHasAuthenticated] = useState(false);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [imageUrls, setImageUrls] = useState<string[]>([]);
	const [topics, setTopics] = useState<string[]>([]);
	const [locationName, setLocationName] = useState("");
	const [visibility, setVisibility] = useState<NoteVisibility>("public");
	const [components, setComponents] = useState<NoteComponent[]>([]);
	const [advancedOptions, setAdvancedOptions] = useState(
		DEFAULT_ADVANCED_OPTIONS,
	);
	const [pendingSubmitMode, setPendingSubmitMode] =
		useState<PublishSubmitMode | null>(null);
	const isAuthenticated = Boolean(session.data?.user) || hasAuthenticated;

	useEffect(() => {
		if (session.data?.user) {
			setHasAuthenticated(true);
		}
	}, [session.data?.user]);

	const missingItems = useMemo(
		() =>
			[
				imageUrls.length === 0 ? "图片" : null,
				title.trim().length === 0 ? "标题" : null,
				content.trim().length === 0 ? "正文" : null,
				topics.length === 0 ? "话题" : null,
			].filter((item): item is string => Boolean(item)),
		[content, imageUrls.length, title, topics.length],
	);
	const canPublish = missingItems.length === 0;
	const visibilityLabel =
		visibility === "public"
			? "公开可见"
			: visibility === "followers"
				? "仅关注者可见"
				: "仅自己可见";
	const componentLabel =
		components.length > 0 ? `已添加 ${components.length} 个` : "可添加文件";
	const advancedLabel = advancedOptions.allowComment ? "评论开启" : "评论关闭";

	const createMutation = useMutation(
		orpc.social.create.mutationOptions({
			onSuccess: async (_result, variables) => {
				setTitle("");
				setContent("");
				setImageUrls([]);
				setTopics([]);
				setLocationName("");
				setVisibility("public");
				setComponents([]);
				setAdvancedOptions(DEFAULT_ADVANCED_OPTIONS);
				await queryClient.refetchQueries();
				const isDraft = variables.submitMode === "draft";
				toast.show({
					variant: "success",
					label: isDraft ? "已保存草稿" : "已提交审核",
					description: isDraft
						? "草稿已保存到你的主页。"
						: "审核通过后会出现在发现页。",
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
			onSettled: () => {
				setPendingSubmitMode(null);
			},
		}),
	);

	const buildPayload = (submitMode: PublishSubmitMode) => ({
		title: title.trim(),
		content: content.trim(),
		images: imageUrls,
		topics,
		locationName: locationName || undefined,
		visibility,
		components,
		advancedOptions,
		submitMode,
	});

	const goBack = () => {
		fireHaptic();
		if (router.canGoBack()) {
			router.back();
			return;
		}
		router.replace("/");
	};

	const addImage = () => {
		fireHaptic();
		const nextImage = SAMPLE_IMAGES[imageUrls.length % SAMPLE_IMAGES.length];
		setImageUrls((current) =>
			current.includes(nextImage)
				? current
				: [...current, nextImage].slice(0, 9),
		);
	};

	const removeImage = (url: string) => {
		fireHaptic();
		setImageUrls((current) => current.filter((item) => item !== url));
	};

	const toggleTopic = (topic: string) => {
		fireHaptic();
		setTopics((current) =>
			current.includes(topic)
				? current.filter((item) => item !== topic)
				: [...current, topic].slice(0, 8),
		);
	};

	const saveDraft = () => {
		fireHaptic();
		if (createMutation.isPending) return;
		if (!isAuthenticated) {
			toast.show({
				variant: "warning",
				label: "登录后再保存",
				description: "请先登录账号，再保存草稿。",
			});
			return;
		}
		setPendingSubmitMode("draft");
		createMutation.mutate(buildPayload("draft"));
	};

	const publish = () => {
		fireHaptic();
		if (createMutation.isPending) return;

		if (!isAuthenticated) {
			toast.show({
				variant: "warning",
				label: "登录后再发布",
				description: "请先登录账号，再提交笔记。",
			});
			return;
		}

		if (!canPublish) {
			toast.show({
				variant: "warning",
				label: "还不能发布",
				description: `还差：${missingItems.join("、")}`,
			});
			return;
		}

		setPendingSubmitMode("publish");
		createMutation.mutate(buildPayload("publish"));
	};

	const cycleVisibility = () => {
		fireHaptic();
		setVisibility((value) => {
			if (value === "public") return "followers";
			if (value === "followers") return "private";
			return "public";
		});
	};

	const toggleFileComponent = () => {
		fireHaptic();
		setComponents((current) =>
			current.length > 0
				? []
				: [
						{
							type: "file",
							title: "可添加文件",
							value: "发布页组件占位",
						},
					],
		);
	};

	const toggleAllowComment = () => {
		fireHaptic();
		setAdvancedOptions((current) => ({
			...current,
			allowComment: !current.allowComment,
		}));
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-background"
		>
			<View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
				<View className="h-16 justify-center px-4">
					<PressableFeedback
						accessibilityLabel="返回"
						accessibilityRole="button"
						hitSlop={10}
						onPress={goBack}
						className="size-11 items-center justify-center rounded-full"
					>
						<Ionicons name="chevron-back" size={34} color="#9b9b9b" />
					</PressableFeedback>
				</View>

				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerClassName="gap-6 px-4 pt-6"
					contentContainerStyle={{ paddingBottom: insets.bottom + 116 }}
				>
					<View className="flex-row gap-3">
						<MediaTile
							imageUrl={imageUrls[0]}
							label="分享画面会显示在首页这里"
							onPress={
								imageUrls[0] ? () => removeImage(imageUrls[0]) : addImage
							}
						/>
						<PressableFeedback
							accessibilityLabel="添加图片"
							accessibilityRole="button"
							onPress={addImage}
							className="h-28 w-28 items-center justify-center rounded-2xl border border-border bg-content2"
						>
							<Ionicons name="add" size={54} color="#cfcfcf" />
						</PressableFeedback>
					</View>

					<View className="gap-3">
						<TextInput
							value={title}
							onChangeText={setTitle}
							placeholder="添加标题"
							placeholderTextColor="#c7c7c7"
							maxLength={80}
							returnKeyType="next"
							style={{
								color: foregroundColor,
								fontSize: 32,
								fontWeight: "500",
								lineHeight: 40,
								minHeight: 48,
								padding: 0,
							}}
						/>
						<View className="flex-row items-start gap-2">
							<TextInput
								value={content}
								onChangeText={setContent}
								placeholder="添加正文或发语音"
								placeholderTextColor="#c7c7c7"
								multiline
								maxLength={2000}
								textAlignVertical="top"
								style={{
									color: foregroundColor,
									flex: 1,
									fontSize: 25,
									lineHeight: 34,
									minHeight: 272,
									padding: 0,
								}}
							/>
							<Ionicons name="mic-outline" size={34} color="#c7c7c7" />
						</View>
					</View>

					<View className="gap-3">
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerClassName="gap-2 pr-4"
						>
							{[...TOPIC_PRESETS, ...TOPIC_SUGGESTIONS.slice(0, 1)].map(
								(topic) => (
									<SuggestionChip
										key={topic}
										label={`#${topic}`}
										onPress={() => toggleTopic(topic)}
									/>
								),
							)}
						</ScrollView>
						<View className="flex-row flex-wrap gap-3">
							{QUICK_ACTIONS.map((action) => (
								<ActionChip
									key={action.label}
									icon={action.icon}
									label={action.label}
									onPress={() => toggleTopic(action.label)}
									isActive={topics.includes(action.label)}
								/>
							))}
						</View>
					</View>

					<View className="border-border-tertiary border-t">
						{OPTION_ROWS.map((row) => {
							const value =
								row.label === "公开可见"
									? visibilityLabel
									: row.label === "添加组件"
										? componentLabel
										: row.label === "高级选项"
											? advancedLabel
											: locationName || undefined;
							const onPress =
								row.label === "公开可见"
									? cycleVisibility
									: row.label === "添加组件"
										? toggleFileComponent
										: row.label === "高级选项"
											? toggleAllowComment
											: undefined;

							return (
								<OptionRow
									key={row.label}
									icon={row.icon}
									label={row.label}
									value={value}
									foregroundColor={defaultForegroundColor}
									mutedColor={mutedColor}
									onPress={onPress}
								>
									{"suggestions" in row ? (
										<ScrollView
											horizontal
											showsHorizontalScrollIndicator={false}
											contentContainerClassName="gap-2 pt-3 pr-4"
										>
											{row.suggestions.map((suggestion) => (
												<SuggestionChip
													key={suggestion}
													label={suggestion}
													onPress={() => setLocationName(suggestion)}
												/>
											))}
										</ScrollView>
									) : null}
								</OptionRow>
							);
						})}
					</View>

					<PressableFeedback
						accessibilityLabel="查看笔记内容声明"
						accessibilityRole="button"
						onPress={() => fireHaptic()}
						className="flex-row items-center gap-1 py-1"
					>
						<Text.Paragraph type="body-sm" color="muted">
							笔记内容声明
						</Text.Paragraph>
						<Ionicons name="chevron-forward" size={16} color={mutedColor} />
					</PressableFeedback>
				</ScrollView>

				<View
					className="flex-row items-center gap-3 border-border-tertiary border-t bg-background px-4 pt-3"
					style={{
						paddingBottom: insets.bottom + 12,
					}}
				>
					<Button
						onPress={saveDraft}
						size="lg"
						variant="outline"
						feedbackVariant="scale-ripple"
						isDisabled={createMutation.isPending}
						className="h-14 flex-1 rounded-full"
					>
						{pendingSubmitMode === "draft" ? <Spinner size="sm" /> : null}
						<Button.Label>存草稿</Button.Label>
					</Button>
					<Button
						onPress={publish}
						size="lg"
						variant="primary"
						feedbackVariant="scale-ripple"
						isDisabled={createMutation.isPending}
						className="h-14 flex-[2] rounded-full"
						style={{ backgroundColor: "#ff2442" }}
					>
						{pendingSubmitMode === "publish" ? <Spinner size="sm" /> : null}
						<Button.Label className="text-white">发布笔记</Button.Label>
					</Button>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

function MediaTile({
	imageUrl,
	label,
	onPress,
}: {
	imageUrl?: string;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={imageUrl ? "移除图片" : "添加图片"}
			accessibilityRole="button"
			onPress={onPress}
			className="h-28 w-28 overflow-hidden rounded-2xl border border-border bg-content2"
		>
			{imageUrl ? (
				<Image
					source={{ uri: imageUrl }}
					resizeMode="cover"
					className="h-full w-full"
				/>
			) : (
				<View className="flex-1 items-center justify-center gap-1 px-3">
					<Ionicons name="images-outline" size={24} color="#d6d6d6" />
					<Text.Paragraph
						type="body-xs"
						color="muted"
						numberOfLines={2}
						className="text-center"
					>
						{label}
					</Text.Paragraph>
				</View>
			)}
		</PressableFeedback>
	);
}

function SuggestionChip({
	label,
	onPress,
}: {
	label: string;
	onPress?: () => void;
}) {
	const content = (
		<View className="rounded-full bg-content2 px-4 py-2">
			<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
				{label}
			</Text.Paragraph>
		</View>
	);

	if (!onPress) {
		return content;
	}

	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
		>
			{content}
		</PressableFeedback>
	);
}

function ActionChip({
	icon,
	isActive,
	label,
	onPress,
}: {
	icon: IoniconName;
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			accessibilityState={isActive ? { selected: true } : undefined}
			onPress={onPress}
			className="h-12 flex-row items-center gap-1.5 rounded-full bg-content2 px-4"
		>
			<Ionicons
				name={icon}
				size={24}
				color={isActive ? "#ff2442" : "#333333"}
			/>
			<Text.Paragraph weight="semibold" className="text-foreground">
				{label}
			</Text.Paragraph>
		</PressableFeedback>
	);
}

function OptionRow({
	children,
	foregroundColor,
	icon,
	label,
	mutedColor,
	onPress,
	value,
}: {
	children?: ReactNode;
	foregroundColor: string;
	icon: IoniconName;
	label: string;
	mutedColor: string;
	onPress?: () => void;
	value?: string;
}) {
	return (
		<View className="border-border-tertiary border-b py-4">
			<PressableFeedback
				accessibilityLabel={label}
				accessibilityRole="button"
				onPress={onPress ?? (() => fireHaptic())}
				className="flex-row items-center gap-3"
			>
				<Ionicons name={icon} size={25} color={foregroundColor} />
				<Text.Paragraph
					weight="medium"
					className="min-w-0 flex-1 text-foreground"
				>
					{label}
				</Text.Paragraph>
				{value ? (
					<Text.Paragraph type="body-sm" color="muted">
						{value}
					</Text.Paragraph>
				) : null}
				<Ionicons name="chevron-forward" size={22} color={mutedColor} />
			</PressableFeedback>
			{children}
		</View>
	);
}
