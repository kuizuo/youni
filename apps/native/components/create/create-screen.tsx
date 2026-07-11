import { Spinner, useThemeColor } from "heroui-native";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentEditor } from "@/components/create/content-editor";
import { CreateHeader } from "@/components/create/create-header";
import type {
	ComposerImage,
	InlineTrigger,
} from "@/components/create/create-types";
import { findInlineTrigger } from "@/components/create/inline-trigger";
import { MediaStrip } from "@/components/create/media-strip";
import { PublishingOptions } from "@/components/create/publishing-options";
import { SubmitBar } from "@/components/create/submit-bar";
import { ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { isGifImage } from "@/utils/media";
import { AdvancedOptionsSheet } from "./create-sheets";
import { ImageEditor } from "./image-editor";
import type { TextSelection } from "./linked-composer-input";
import { useCreateComposer } from "./use-create-composer";

type CreateScreenProps = {
	onRequestClose?: () => void;
};

export default function CreateScreen({ onRequestClose }: CreateScreenProps) {
	const defaultForegroundColor = useThemeColor("default-foreground");
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const composer = useCreateComposer({ onRequestClose });
	const contentRef = useRef(composer.content);
	contentRef.current = composer.content;
	const [isAdvancedSheetOpen, setIsAdvancedSheetOpen] = useState(false);
	const [editingImageId, setEditingImageId] = useState<null | string>(null);
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
	const editingImage =
		composer.images.find((image) => image.id === editingImageId) ?? null;

	const openImageEditor = (image: ComposerImage) => {
		fireHaptic();
		if (isGifImage(image)) {
			toast.show({
				variant: "warning",
				label: "暂不支持编辑动图",
			});
			return;
		}
		setEditingImageId(image.id);
	};

	if (composer.isLoadingExistingContent) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				{composer.loadExistingContentError ? (
					<ErrorState
						description="图文暂时没有加载出来，请稍后重试。"
						onRetry={composer.retryLoadExistingContent}
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
				<CreateHeader
					mutedColor={mutedColor}
					onBack={composer.goBack}
					onOpenDrafts={composer.openDrafts}
					showDrafts={!composer.isEditingDraft && !composer.isEditingNote}
				/>

				<ScrollView
					contentInsetAdjustmentBehavior="automatic"
					keyboardDismissMode="on-drag"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerClassName="gap-4 px-4 pt-3"
					contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
				>
					<MediaStrip
						images={composer.images}
						isAddingImages={composer.isAddingImages}
						mutedColor={mutedColor}
						onAddImage={composer.addImage}
						onEditImage={openImageEditor}
						onRemoveImage={composer.removeImage}
					/>

					<ContentEditor
						content={composer.content}
						foregroundColor={foregroundColor}
						inlineTrigger={inlineTrigger}
						mutedColor={mutedColor}
						selectedTopics={composer.topics}
						title={composer.title}
						onContentChange={handleContentChange}
						onMentionSelect={(value) => replaceInlineTrigger("mention", value)}
						onSelectionChange={handleContentSelectionChange}
						onTitleChange={composer.setTitle}
						onTopicSelect={(value) => replaceInlineTrigger("topic", value)}
					/>

					<PublishingOptions
						advancedLabel={composer.advancedLabel}
						defaultForegroundColor={defaultForegroundColor}
						mutedColor={mutedColor}
						visibilityLabel={composer.visibilityLabel}
						onAdvancedPress={() => {
							fireHaptic();
							setIsAdvancedSheetOpen(true);
						}}
						onVisibilityPress={composer.cycleVisibility}
					/>
				</ScrollView>

				<SubmitBar
					bottomInset={insets.bottom}
					isSubmitting={composer.isSubmitting}
					isUploadingImages={composer.isUploadingImages}
					pendingSubmitMode={composer.pendingSubmitMode}
					publishLabel={composer.isEditingNote ? "提交审核" : "发布笔记"}
					showSaveDraft={!composer.isEditingNote}
					onPublish={composer.publish}
					onSaveDraft={composer.saveDraft}
				/>
				<AdvancedOptionsSheet
					isOpen={isAdvancedSheetOpen}
					onOpenChange={setIsAdvancedSheetOpen}
					allowComment={composer.advancedOptions.allowComment}
					allowShare={composer.advancedOptions.allowShare}
					onAllowCommentChange={composer.setAllowComment}
					onAllowShareChange={composer.setAllowShare}
				/>
				{editingImage ? (
					<ImageEditor
						image={editingImage}
						onCancel={() => setEditingImageId(null)}
						onSave={(editedImage) => {
							composer.updateImage(editedImage);
							setEditingImageId(null);
						}}
					/>
				) : null}
			</View>
		</KeyboardAvoidingView>
	);
}
