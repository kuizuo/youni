import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import type { ReactNode } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useCreateComposer } from "./use-create-composer";

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

type CreateScreenProps = {
	onRequestClose?: () => void;
};

export default function CreateScreen({ onRequestClose }: CreateScreenProps) {
	const defaultForegroundColor = useThemeColor("default-foreground");
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const insets = useSafeAreaInsets();
	const composer = useCreateComposer({ onRequestClose });
	const primaryImageUrl = composer.imageUrls[0];

	if (
		composer.isEditingDraft &&
		(composer.draftQuery.isLoading || !composer.draftQuery.data)
	) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				{composer.draftQuery.isError ? (
					<ErrorState
						description="草稿暂时没有加载出来，请稍后重试。"
						onRetry={() => composer.draftQuery.refetch()}
					/>
				) : (
					<Spinner />
				)}
			</View>
		);
	}

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
						onPress={composer.goBack}
						className="size-11 items-center justify-center rounded-full"
					>
						<Ionicons name="chevron-back" size={34} color={mutedColor} />
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
							imageUrl={primaryImageUrl}
							label="分享画面会显示在首页这里"
							onPress={
								primaryImageUrl
									? () => composer.removeImage(primaryImageUrl)
									: composer.addImage
							}
						/>
						<PressableFeedback
							accessibilityLabel="添加图片"
							accessibilityRole="button"
							onPress={composer.addImage}
							className="h-28 w-28 items-center justify-center rounded-2xl border border-border bg-content2"
						>
							<Ionicons name="add" size={54} color={mutedColor} />
						</PressableFeedback>
					</View>

					<View className="gap-3">
						<TextInput
							value={composer.title}
							onChangeText={composer.setTitle}
							placeholder="添加标题"
							placeholderTextColor={mutedColor}
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
								value={composer.content}
								onChangeText={composer.setContent}
								placeholder="添加正文或发语音"
								placeholderTextColor={mutedColor}
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
							<Ionicons name="mic-outline" size={34} color={mutedColor} />
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
										onPress={() => composer.toggleTopic(topic)}
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
									onPress={() => composer.toggleTopic(action.label)}
									isActive={composer.topics.includes(action.label)}
								/>
							))}
						</View>
					</View>

					<View className="border-border-tertiary border-t">
						{OPTION_ROWS.map((row) => {
							const value =
								row.label === "公开可见"
									? composer.visibilityLabel
									: row.label === "添加组件"
										? composer.componentLabel
										: row.label === "高级选项"
											? composer.advancedLabel
											: composer.locationName || undefined;
							const onPress =
								row.label === "公开可见"
									? composer.cycleVisibility
									: row.label === "添加组件"
										? composer.toggleFileComponent
										: row.label === "高级选项"
											? composer.toggleAllowComment
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
													onPress={() => composer.setLocationName(suggestion)}
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
						onPress={composer.saveDraft}
						size="lg"
						variant="outline"
						feedbackVariant="scale-ripple"
						isDisabled={composer.isSubmitting}
						className="h-14 flex-1 rounded-full"
					>
						{composer.pendingSubmitMode === "draft" ? (
							<Spinner size="sm" />
						) : null}
						<Button.Label>存草稿</Button.Label>
					</Button>
					<Button
						onPress={composer.publish}
						size="lg"
						variant="primary"
						feedbackVariant="scale-ripple"
						isDisabled={composer.isSubmitting}
						className="h-14 flex-[2] rounded-full"
					>
						{composer.pendingSubmitMode === "publish" ? (
							<Spinner size="sm" />
						) : null}
						<Button.Label>发布笔记</Button.Label>
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
	const mutedColor = useThemeColor("muted");

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
					<Ionicons name="images-outline" size={24} color={mutedColor} />
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
	const dangerColor = useThemeColor("danger");
	const mutedColor = useThemeColor("muted");

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
				color={isActive ? dangerColor : mutedColor}
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
