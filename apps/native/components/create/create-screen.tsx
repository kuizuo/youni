import { Ionicons } from "@expo/vector-icons";
import {
	Button,
	ListGroup,
	PressableFeedback,
	Spinner,
	useThemeColor,
} from "heroui-native";
import { useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { InlineMentionPicker, InlineTopicPicker } from "./create-pickers";
import { AdvancedOptionsSheet } from "./create-sheets";
import { ListDivider, MediaTile, SettingsListItem } from "./create-ui";
import {
	LinkedComposerInput,
	type TextSelection,
} from "./linked-composer-input";
import { useCreateComposer } from "./use-create-composer";

const OPTION_ROWS = [
	{ key: "visibility", label: "公开可见", icon: "lock-open-outline" },
	{ key: "advanced", label: "高级选项", icon: "settings-outline" },
] as const;

type CreateScreenProps = {
	onRequestClose?: () => void;
};

type InlineTrigger = {
	end: number;
	query: string;
	start: number;
	type: "mention" | "topic";
};

function findInlineTrigger(
	value: string,
	cursor: number,
): InlineTrigger | null {
	const beforeCursor = value.slice(0, cursor);
	const match = beforeCursor.match(/(^|\s)([#@])([^\s#@]*)$/);
	if (!match) return null;

	const symbol = match[2];
	const query = match[3] ?? "";
	const tokenLength = symbol.length + query.length;
	return {
		end: cursor,
		query,
		start: cursor - tokenLength,
		type: symbol === "#" ? "topic" : "mention",
	};
}

export default function CreateScreen({ onRequestClose }: CreateScreenProps) {
	const defaultForegroundColor = useThemeColor("default-foreground");
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const insets = useSafeAreaInsets();
	const composer = useCreateComposer({ onRequestClose });
	const contentRef = useRef(composer.content);
	contentRef.current = composer.content;
	const [isAdvancedSheetOpen, setIsAdvancedSheetOpen] = useState(false);
	const [contentSelection, setContentSelection] = useState<TextSelection>({
		end: 0,
		start: 0,
	});
	const [inlineTrigger, setInlineTrigger] = useState<InlineTrigger | null>(
		null,
	);

	const updateInlineTrigger = (value: string, cursor: number) => {
		const trigger = findInlineTrigger(value, cursor);
		setInlineTrigger(trigger);
	};

	const handleContentChange = (value: string) => {
		const previousContent = contentRef.current;
		const cursor = Math.max(
			0,
			Math.min(
				value.length,
				contentSelection.start + value.length - previousContent.length,
			),
		);
		contentRef.current = value;
		composer.setContent(value);
		setContentSelection({ start: cursor, end: cursor });
		updateInlineTrigger(value, cursor);
	};

	const handleContentSelectionChange = (selection: TextSelection) => {
		setContentSelection(selection);
		if (selection.start !== selection.end) {
			setInlineTrigger(null);
			return;
		}
		updateInlineTrigger(contentRef.current, selection.start);
	};

	const replaceInlineTrigger = (type: InlineTrigger["type"], value: string) => {
		const cleanValue = value.replace(type === "topic" ? /^#/ : /^@/, "").trim();
		if (!cleanValue) return;

		const trigger = inlineTrigger?.type === type ? inlineTrigger : null;
		const start = trigger?.start ?? contentSelection.start;
		const end = trigger?.end ?? contentSelection.end;
		const token = `${type === "topic" ? "#" : "@"}${cleanValue} `;
		const currentContent = contentRef.current;
		const nextContent = `${currentContent.slice(0, start)}${token}${currentContent
			.slice(end)
			.replace(/^\s+/, "")}`;
		const cursor = start + token.length;

		contentRef.current = nextContent;
		composer.setContent(nextContent);
		setContentSelection({ start: cursor, end: cursor });
		setInlineTrigger(null);
	};

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
				<View className="h-14 justify-center px-4">
					<PressableFeedback
						accessibilityLabel="返回"
						accessibilityRole="button"
						hitSlop={10}
						onPress={composer.goBack}
						className="size-10 items-center justify-center rounded-full"
					>
						<Ionicons name="chevron-back" size={30} color={mutedColor} />
					</PressableFeedback>
				</View>

				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerClassName="gap-4 px-4 pt-3"
					contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
				>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerClassName="gap-2.5 pr-4"
					>
						{composer.images.map((image, index) => (
							<MediaTile
								key={image.id}
								image={image}
								label={`第 ${index + 1} 张图片`}
								onPress={() => composer.removeImage(image.id)}
							/>
						))}
						{composer.images.length < 9 ? (
							<PressableFeedback
								accessibilityLabel="添加图片"
								accessibilityRole="button"
								onPress={composer.addImage}
								className="h-22 w-22 items-center justify-center rounded-xl border border-border bg-content2"
							>
								<Ionicons name="add" size={42} color={mutedColor} />
							</PressableFeedback>
						) : null}
					</ScrollView>

					<View className="gap-2">
						<TextInput
							value={composer.title}
							onChangeText={composer.setTitle}
							placeholder="添加标题"
							placeholderTextColor={mutedColor}
							maxLength={80}
							returnKeyType="next"
							style={{
								color: foregroundColor,
								fontSize: 24,
								fontWeight: "500",
								lineHeight: 32,
								minHeight: 38,
								padding: 0,
							}}
						/>
						<LinkedComposerInput
							value={composer.content}
							onChangeText={handleContentChange}
							onSelectionChange={handleContentSelectionChange}
							placeholder="添加正文"
							placeholderTextColor={mutedColor}
							maxLength={2000}
						/>
						{inlineTrigger?.type === "topic" ? (
							<InlineTopicPicker
								query={inlineTrigger.query}
								selectedTopics={composer.topics}
								onSelect={(value) => replaceInlineTrigger("topic", value)}
							/>
						) : inlineTrigger?.type === "mention" ? (
							<InlineMentionPicker
								query={inlineTrigger.query}
								onSelect={(value) => replaceInlineTrigger("mention", value)}
							/>
						) : null}
					</View>

					<ListGroup
						variant="secondary"
						className="overflow-hidden rounded-2xl"
					>
						{OPTION_ROWS.map((row, index) => {
							const value =
								row.key === "visibility"
									? composer.visibilityLabel
									: composer.advancedLabel;
							const onPress =
								row.key === "visibility"
									? composer.cycleVisibility
									: () => {
											fireHaptic();
											setIsAdvancedSheetOpen(true);
										};

							return (
								<View key={row.key}>
									<SettingsListItem
										icon={row.icon}
										label={row.label}
										value={value}
										foregroundColor={defaultForegroundColor}
										mutedColor={mutedColor}
										onPress={onPress}
									/>
									{index < OPTION_ROWS.length - 1 ? <ListDivider /> : null}
								</View>
							);
						})}
					</ListGroup>
				</ScrollView>

				<View
					className="bg-background"
					style={{
						paddingBottom: insets.bottom + 10,
					}}
				>
					<ListDivider />
					<View className="flex-row items-center gap-2 px-4 pt-2.5">
						<Button
							onPress={composer.saveDraft}
							size="md"
							variant="outline"
							feedbackVariant="scale-ripple"
							isDisabled={composer.isSubmitting}
							className="h-12 flex-1 rounded-full"
						>
							{composer.pendingSubmitMode === "draft" ||
							composer.isUploadingImages ? (
								<Spinner size="sm" />
							) : null}
							<Button.Label>存草稿</Button.Label>
						</Button>
						<Button
							onPress={composer.publish}
							size="md"
							variant="primary"
							feedbackVariant="scale-ripple"
							isDisabled={composer.isSubmitting}
							className="h-12 flex-[2] rounded-full"
						>
							{composer.pendingSubmitMode === "publish" ||
							composer.isUploadingImages ? (
								<Spinner size="sm" />
							) : null}
							<Button.Label>发布笔记</Button.Label>
						</Button>
					</View>
				</View>
				<AdvancedOptionsSheet
					isOpen={isAdvancedSheetOpen}
					onOpenChange={setIsAdvancedSheetOpen}
					allowComment={composer.advancedOptions.allowComment}
					allowShare={composer.advancedOptions.allowShare}
					onAllowCommentChange={composer.setAllowComment}
					onAllowShareChange={composer.setAllowShare}
				/>
			</View>
		</KeyboardAvoidingView>
	);
}
