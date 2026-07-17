import { Ionicons } from "@expo/vector-icons";
import type * as ImagePicker from "expo-image-picker";
import {
	BottomSheet,
	Button,
	Spinner,
	Typography,
	useBottomSheetAwareHandlers,
	useThemeColor,
} from "heroui-native";
import { useEffect, useRef, useState } from "react";
import {
	Keyboard,
	Text,
	TextInput,
	useWindowDimensions,
	View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

import { AppBottomSheetContent } from "@/components/shared/app-bottom-sheet";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";

const TEXT_IMAGE_MAX_LENGTH = 60;
const TEXT_IMAGE_MAX_LINES = 6;

function normalizeText(value: string) {
	return value
		.split("\n")
		.slice(0, TEXT_IMAGE_MAX_LINES)
		.join("\n")
		.slice(0, TEXT_IMAGE_MAX_LENGTH);
}

function waitForPaint() {
	return new Promise<void>((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => resolve());
		});
	});
}

export function TextImageSheet({
	initialText,
	isOpen,
	onComplete,
	onOpenChange,
}: {
	initialText: string;
	isOpen: boolean;
	onComplete: (asset: ImagePicker.ImagePickerAsset) => Promise<boolean>;
	onOpenChange: (value: boolean) => void;
}) {
	return (
		<BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
			<BottomSheet.Portal disableFullWindowOverlay>
				<BottomSheet.Overlay />
				<AppBottomSheetContent enableOverDrag={false} keyboardBehavior="extend">
					<TextImageSheetContent
						initialText={initialText}
						isOpen={isOpen}
						onComplete={onComplete}
						onOpenChange={onOpenChange}
					/>
				</AppBottomSheetContent>
			</BottomSheet.Portal>
		</BottomSheet>
	);
}

function TextImageSheetContent({
	initialText,
	isOpen,
	onComplete,
	onOpenChange,
}: {
	initialText: string;
	isOpen: boolean;
	onComplete: (asset: ImagePicker.ImagePickerAsset) => Promise<boolean>;
	onOpenChange: (value: boolean) => void;
}) {
	const accentColor = useThemeColor("accent");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const mutedColor = useThemeColor("muted");
	const { toast } = useAppToast();
	const { width } = useWindowDimensions();
	const { onBlur, onFocus } = useBottomSheetAwareHandlers();
	const cardRef = useRef<View>(null);
	const inputRef = useRef<TextInput>(null);
	const [text, setText] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const previewWidth = Math.min(width - 64, 280);
	const cleanText = text.trim();
	const fontSize = !cleanText
		? 28
		: cleanText.length <= 4
			? 52
			: cleanText.length <= 20
				? 34
				: 25;
	const lineHeight = Math.round(fontSize * 1.35);

	useEffect(() => {
		if (!isOpen) return;
		setText(normalizeText(initialText.trim()));
	}, [initialText, isOpen]);

	const createImage = async () => {
		if (isGenerating) return;
		if (!cleanText) {
			toast.show({ label: "先输入图片上的文字", variant: "warning" });
			inputRef.current?.focus();
			return;
		}
		if (!cardRef.current) return;

		fireHaptic();
		inputRef.current?.blur();
		Keyboard.dismiss();
		setIsGenerating(true);
		try {
			await waitForPaint();
			const uri = await captureRef(cardRef, {
				format: "jpg",
				height: 1440,
				quality: 1,
				result: "tmpfile",
				width: 1080,
			});
			const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
			const added = await onComplete({
				assetId: `text-image:${stamp}`,
				fileName: `youni-text-${stamp}.jpg`,
				height: 1440,
				mimeType: "image/jpeg",
				type: "image",
				uri,
				width: 1080,
			});
			if (added) onOpenChange(false);
		} catch (error) {
			toast.show({
				label: error instanceof Error ? error.message : "文字图片生成失败",
				variant: "danger",
			});
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<View className="gap-4">
			<BottomSheet.Title>生成文字图</BottomSheet.Title>
			<View className="items-center">
				<View
					ref={cardRef}
					collapsable={false}
					className="relative overflow-hidden rounded-2xl bg-white"
					style={{
						aspectRatio: 3 / 4,
						width: previewWidth,
					}}
				>
					<View
						pointerEvents="none"
						className="absolute inset-0"
						style={{
							experimental_backgroundImage: `linear-gradient(145deg, #ffffff 0%, ${accentColor} 100%)`,
							opacity: 0.52,
						}}
					/>
					<Text
						pointerEvents="none"
						style={{
							color: accentForegroundColor,
							fontSize: 66,
							fontWeight: "700",
							left: 30,
							lineHeight: 72,
							opacity: 0.13,
							position: "absolute",
							top: 22,
						}}
					>
						“
					</Text>
					<View className="flex-1 items-center justify-center px-8 py-20">
						{isGenerating ? (
							<Text
								style={{
									color: "#26313d",
									fontSize,
									fontWeight: "700",
									lineHeight,
									textAlign: "center",
								}}
							>
								{cleanText}
							</Text>
						) : (
							<TextInput
								ref={inputRef}
								accessibilityLabel="图片文字"
								cursorColor={accentForegroundColor}
								maxLength={TEXT_IMAGE_MAX_LENGTH}
								multiline
								onBlur={onBlur}
								onChangeText={(value) => setText(normalizeText(value))}
								onFocus={onFocus}
								placeholder="请输入文字"
								placeholderTextColor={mutedColor}
								selectionColor={accentForegroundColor}
								scrollEnabled={false}
								style={{
									alignSelf: "stretch",
									color: "#26313d",
									fontSize,
									fontWeight: "700",
									height: previewWidth * 0.68,
									lineHeight,
									padding: 0,
									textAlign: "center",
									textAlignVertical: "center",
								}}
								value={text}
							/>
						)}
					</View>
					<View
						pointerEvents="none"
						className="absolute h-1 w-9 rounded-full"
						style={{
							backgroundColor: accentForegroundColor,
							bottom: 30,
							opacity: 0.13,
							right: 28,
						}}
					/>
				</View>
			</View>

			<View className="flex-row gap-2">
				<Button
					className="h-12 flex-1 rounded-full"
					isDisabled={isGenerating}
					onPress={() => {
						fireHaptic();
						onOpenChange(false);
					}}
					variant="outline"
				>
					<Button.Label>取消</Button.Label>
				</Button>
				<Button
					className="h-12 flex-[2] rounded-full"
					isDisabled={isGenerating || !cleanText}
					onPress={() => void createImage()}
					variant="primary"
				>
					{isGenerating ? (
						<Spinner size="sm" color={accentForegroundColor} />
					) : (
						<Ionicons
							name="image-outline"
							size={18}
							color={accentForegroundColor}
						/>
					)}
					<Button.Label>{isGenerating ? "生成中" : "生成并使用"}</Button.Label>
				</Button>
			</View>
			<Typography.Paragraph
				accessibilityLabel={`已输入 ${text.length} 个字，最多 ${TEXT_IMAGE_MAX_LENGTH} 个字`}
				className="text-center"
				color="muted"
				type="body-xs"
			>
				{text.length}/{TEXT_IMAGE_MAX_LENGTH}
			</Typography.Paragraph>
		</View>
	);
}
