import { NOTE_IMAGE_MAX_COUNT } from "@youni/api/lib/notes/image-identity";
import { Spinner, useThemeColor } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import {
	Keyboard,
	KeyboardAvoidingView,
	type KeyboardEvent,
	Platform,
	ScrollView,
	type TextInput,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EmojiType } from "rn-emoji-keyboard";

import { ContentEditor } from "@/components/create/content-editor";
import { CreateHeader } from "@/components/create/create-header";
import {
	type CreateInputField,
	CreateKeyboardPanel,
} from "@/components/create/create-keyboard-panel";
import {
	InlineMentionPicker,
	InlineTopicPicker,
} from "@/components/create/create-pickers";
import type { InlineTrigger } from "@/components/create/create-types";
import { findInlineTrigger } from "@/components/create/inline-trigger";
import { PublishingOptions } from "@/components/create/publishing-options";
import { SubmitBar } from "@/components/create/submit-bar";
import { ImageEditor } from "@/components/image-editor/image-editor";
import { MediaPicker } from "@/components/media/media-picker";
import { SortableMediaStrip } from "@/components/media/sortable-media-strip";
import { ErrorState } from "@/components/social-states";
import type { MediaImage } from "@/lib/media/types";
import type { TextSelection } from "@/lib/types/text-input";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { isGifImage } from "@/utils/media";
import { AdvancedOptionsSheet } from "./create-sheets";
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
	const titleInputRef = useRef<TextInput>(null);
	const contentInputRef = useRef<TextInput>(null);
	const activeInputFieldRef = useRef<CreateInputField | null>(null);
	const isEmojiPickerOpenRef = useRef(false);
	const isEmojiInputLockedRef = useRef(false);
	const isSwitchingToSystemKeyboardRef = useRef(false);
	const isSystemKeyboardVisibleRef = useRef(false);
	const keyboardHeightRef = useRef(300);
	const titleRef = useRef(composer.title);
	const contentRef = useRef(composer.content);
	titleRef.current = composer.title;
	contentRef.current = composer.content;
	const [isAdvancedSheetOpen, setIsAdvancedSheetOpen] = useState(false);
	const [activeInputField, setActiveInputField] =
		useState<CreateInputField | null>(null);
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
	const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
	const [isEmojiInputLocked, setIsEmojiInputLocked] = useState(false);
	const [emojiPanelHeight, setEmojiPanelHeight] = useState(300);
	const [editingImageId, setEditingImageId] = useState<null | string>(null);
	const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
	const [titleSelection, setTitleSelection] = useState<TextSelection>({
		end: 0,
		start: 0,
	});
	const [contentSelection, setContentSelection] = useState<TextSelection>({
		end: 0,
		start: 0,
	});
	const [inlineTrigger, setInlineTrigger] = useState<InlineTrigger | null>(
		null,
	);
	activeInputFieldRef.current = activeInputField;

	useEffect(() => {
		const updateKeyboardHeight = (event: KeyboardEvent) => {
			const height = Math.round(event.endCoordinates.height);
			if (height > 0) {
				const nextHeight = Math.max(260, height);
				keyboardHeightRef.current = nextHeight;
				setEmojiPanelHeight(nextHeight);
			}
		};
		const showSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
			(event: KeyboardEvent) => {
				if (Platform.OS === "ios") Keyboard.scheduleLayoutAnimation(event);
				isSystemKeyboardVisibleRef.current = true;
				setIsKeyboardVisible(true);
				updateKeyboardHeight(event);
				if (isSwitchingToSystemKeyboardRef.current) {
					isSwitchingToSystemKeyboardRef.current = false;
					isEmojiPickerOpenRef.current = false;
					setIsEmojiPickerOpen(false);
				}
			},
		);
		const hideSubscription = Keyboard.addListener(
			Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
			(event: KeyboardEvent) => {
				if (Platform.OS === "ios") Keyboard.scheduleLayoutAnimation(event);
				isSystemKeyboardVisibleRef.current = false;
				setIsKeyboardVisible(false);
				isSwitchingToSystemKeyboardRef.current = false;
				if (isEmojiPickerOpenRef.current) return;
				if (!activeInputFieldRef.current) return;
				setActiveInputField(null);
				setInlineTrigger(null);
			},
		);

		return () => {
			showSubscription.remove();
			hideSubscription.remove();
		};
	}, []);

	const updateInlineTrigger = (value: string, cursor: number) => {
		const trigger = findInlineTrigger(value, cursor);
		setInlineTrigger(trigger);
	};

	const handleTitleChange = (value: string) => {
		const previousTitle = titleRef.current;
		const cursor = Math.max(
			0,
			Math.min(
				value.length,
				titleSelection.start + value.length - previousTitle.length,
			),
		);
		titleRef.current = value;
		composer.setTitle(value);
		setTitleSelection({ start: cursor, end: cursor });
		updateInlineTrigger(value, cursor);
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
		const selection =
			activeInputField === "title" ? titleSelection : contentSelection;
		const start = trigger?.start ?? selection.start;
		const end = trigger?.end ?? selection.end;
		const token = `${type === "topic" ? "#" : "@"}${cleanValue} `;
		const currentValue =
			activeInputField === "title" ? titleRef.current : contentRef.current;
		const nextValue = `${currentValue.slice(0, start)}${token}${currentValue
			.slice(end)
			.replace(/^\s+/, "")}`;
		const cursor = start + token.length;
		let appliedCursor = cursor;

		if (activeInputField === "title") {
			const limitedValue = nextValue.slice(0, 80);
			const limitedCursor = Math.min(cursor, limitedValue.length);
			appliedCursor = limitedCursor;
			titleRef.current = limitedValue;
			composer.setTitle(limitedValue);
			setTitleSelection({ start: limitedCursor, end: limitedCursor });
		} else {
			contentRef.current = nextValue;
			composer.setContent(nextValue);
			setContentSelection({ start: cursor, end: cursor });
		}
		setInlineTrigger(null);
		requestAnimationFrame(() => {
			const input =
				activeInputField === "title"
					? titleInputRef.current
					: contentInputRef.current;
			input?.focus();
			input?.setSelection(appliedCursor, appliedCursor);
		});
	};

	const handleInputFocus = (field: CreateInputField) => {
		if (isEmojiInputLockedRef.current) return;
		isSystemKeyboardVisibleRef.current = true;
		setIsKeyboardVisible(true);
		setActiveInputField(field);
		if (isSwitchingToSystemKeyboardRef.current) return;
		isEmojiPickerOpenRef.current = false;
		setIsEmojiPickerOpen(false);
		const selection = field === "title" ? titleSelection : contentSelection;
		const value = field === "title" ? titleRef.current : contentRef.current;
		if (selection.start === selection.end) {
			updateInlineTrigger(value, selection.start);
		}
	};

	const insertActiveText = (text: string) => {
		if (!activeInputField) return;
		const isTitle = activeInputField === "title";
		const currentValue = isTitle ? titleRef.current : contentRef.current;
		const selection = isTitle ? titleSelection : contentSelection;
		const nextValue =
			`${currentValue.slice(0, selection.start)}${text}${currentValue.slice(selection.end)}`.slice(
				0,
				isTitle ? 80 : 2000,
			);
		const cursor = Math.min(selection.start + text.length, nextValue.length);
		if (isTitle) {
			titleRef.current = nextValue;
			composer.setTitle(nextValue);
			setTitleSelection({ start: cursor, end: cursor });
		} else {
			contentRef.current = nextValue;
			composer.setContent(nextValue);
			setContentSelection({ start: cursor, end: cursor });
		}
		updateInlineTrigger(nextValue, cursor);
		requestAnimationFrame(() => {
			const input = isTitle ? titleInputRef.current : contentInputRef.current;
			input?.setSelection(cursor, cursor);
		});
	};

	const insertInlineMarker = (type: InlineTrigger["type"]) => {
		const isTitle = activeInputField === "title";
		const currentValue = isTitle ? titleRef.current : contentRef.current;
		const selection = isTitle ? titleSelection : contentSelection;
		const previousChar =
			selection.start > 0 ? currentValue[selection.start - 1] : "";
		const spacer = previousChar && !/\s/.test(previousChar) ? " " : "";
		insertActiveText(`${spacer}${type === "topic" ? "#" : "@"}`);
	};

	const toggleEmojiPicker = () => {
		const nextValue = !isEmojiPickerOpenRef.current;
		if (!nextValue) {
			isSwitchingToSystemKeyboardRef.current = true;
			isEmojiInputLockedRef.current = false;
			setIsEmojiInputLocked(false);
			requestAnimationFrame(() => {
				const selection =
					activeInputField === "title" ? titleSelection : contentSelection;
				const input =
					activeInputField === "title"
						? titleInputRef.current
						: contentInputRef.current;
				input?.focus();
				input?.setSelection(selection.start, selection.end);
			});
			return;
		}
		isSwitchingToSystemKeyboardRef.current = false;
		isEmojiInputLockedRef.current = true;
		isEmojiPickerOpenRef.current = true;
		setEmojiPanelHeight(keyboardHeightRef.current);
		setIsEmojiInputLocked(true);
		setIsEmojiPickerOpen(true);
		setInlineTrigger(null);
		titleInputRef.current?.blur();
		contentInputRef.current?.blur();
		Keyboard.dismiss();
	};

	const finishInput = () => {
		isEmojiPickerOpenRef.current = false;
		isEmojiInputLockedRef.current = false;
		isSwitchingToSystemKeyboardRef.current = false;
		isSystemKeyboardVisibleRef.current = false;
		setIsEmojiPickerOpen(false);
		setIsEmojiInputLocked(false);
		setIsKeyboardVisible(false);
		setActiveInputField(null);
		setInlineTrigger(null);
		titleInputRef.current?.blur();
		contentInputRef.current?.blur();
		Keyboard.dismiss();
	};
	const openMediaPicker = () => {
		finishInput();
		if (composer.images.length >= NOTE_IMAGE_MAX_COUNT) {
			toast.show({
				variant: "warning",
				label: `最多只能选择 ${NOTE_IMAGE_MAX_COUNT} 张图片`,
			});
			return;
		}
		if (Platform.OS === "web") {
			void composer.pickImagesFromSystem();
			return;
		}
		fireHaptic();
		setIsMediaPickerOpen(true);
	};
	const editingImage =
		composer.images.find((image) => image.id === editingImageId) ?? null;

	const openImageEditor = (image: MediaImage) => {
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
					<ErrorState onRetry={composer.retryLoadExistingContent} />
				) : (
					<Spinner />
				)}
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={
				Platform.OS === "ios" && !isEmojiPickerOpen ? "padding" : undefined
			}
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
					<SortableMediaStrip
						images={composer.images}
						isDisabled={composer.isAddingImages}
						maxItems={9}
						onAddImage={openMediaPicker}
						onEditImage={openImageEditor}
						onMoveImage={composer.moveImage}
						onRemoveImage={composer.removeImage}
					/>

					<ContentEditor
						content={composer.content}
						contentInputRef={contentInputRef}
						foregroundColor={foregroundColor}
						isEmojiInputLocked={isEmojiInputLocked}
						mutedColor={mutedColor}
						title={composer.title}
						titleInputRef={titleInputRef}
						onContentChange={handleContentChange}
						onContentFocus={() => handleInputFocus("content")}
						onContentSelectionChange={handleContentSelectionChange}
						onTitleChange={handleTitleChange}
						onTitleFocus={() => handleInputFocus("title")}
						onTitleSelectionChange={(selection) => {
							setTitleSelection(selection);
							if (selection.start !== selection.end) {
								setInlineTrigger(null);
								return;
							}
							updateInlineTrigger(titleRef.current, selection.start);
						}}
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

				{activeInputField && (isKeyboardVisible || isEmojiPickerOpen) ? (
					<CreateKeyboardPanel
						emojiPanelHeight={emojiPanelHeight}
						isEmojiPickerOpen={isEmojiPickerOpen}
						mutedColor={mutedColor}
						onDone={finishInput}
						onEmojiPress={toggleEmojiPicker}
						onEmojiSelect={(emoji: EmojiType) => insertActiveText(emoji.emoji)}
						onMentionPress={() => insertInlineMarker("mention")}
						onTopicPress={() => insertInlineMarker("topic")}
					>
						{!isEmojiPickerOpen && inlineTrigger?.type === "topic" ? (
							<InlineTopicPicker
								query={inlineTrigger.query}
								selectedTopics={composer.topics}
								onSelect={(value) => replaceInlineTrigger("topic", value)}
							/>
						) : !isEmojiPickerOpen && inlineTrigger?.type === "mention" ? (
							<InlineMentionPicker
								query={inlineTrigger.query}
								onSelect={(value) => replaceInlineTrigger("mention", value)}
							/>
						) : null}
					</CreateKeyboardPanel>
				) : isKeyboardVisible || activeInputField ? null : (
					<SubmitBar
						bottomInset={insets.bottom}
						isSubmitting={composer.isSubmitting}
						pendingSubmitMode={composer.pendingSubmitMode}
						publishLabel={composer.isEditingNote ? "提交审核" : "发布笔记"}
						showSaveDraft={!composer.isEditingNote}
						onPublish={composer.publish}
						onSaveDraft={composer.saveDraft}
					/>
				)}
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
				<MediaPicker
					maxSelection={Math.max(0, 9 - composer.images.length)}
					visible={isMediaPickerOpen}
					onClose={() => setIsMediaPickerOpen(false)}
					onComplete={async (assets) => {
						const added = await composer.addImageAssets(assets);
						if (added) setIsMediaPickerOpen(false);
						return added;
					}}
				/>
			</View>
		</KeyboardAvoidingView>
	);
}
