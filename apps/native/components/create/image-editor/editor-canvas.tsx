import {
	BackdropBlur,
	Canvas,
	type CanvasRef,
	Group,
	matchFont,
	Path,
	Rect,
	type SkImage,
	Image as SkiaImage,
	Text as SkiaText,
} from "@shopify/react-native-skia";
import { Button, Spinner, Text } from "heroui-native";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import {
	type ComposedGesture,
	GestureDetector,
} from "react-native-gesture-handler";

import type {
	BlurStroke,
	EditorSnapshot,
	EditorTool,
	ImageLoadStatus,
	RectModel,
	TextLayer,
} from "./types";
import {
	buildStrokeClipPath,
	buildStrokePath,
	clamp,
	textLayerWidth,
} from "./utils";

type EditorCanvasProps = {
	canvasGesture: ComposedGesture;
	canvasRef: RefObject<CanvasRef | null>;
	canvasSize: { height: number; width: number };
	editingTextId: null | string;
	editorState: EditorSnapshot;
	imageLoadStatus: ImageLoadStatus;
	imageRect: RectModel;
	onCanvasLayout: (size: { height: number; width: number }) => void;
	onRetryLoad: () => void;
	onTextChange: (value: string) => void;
	sourceImage: null | SkImage;
	textFocusKey: number;
	tool: EditorTool | null;
};

type EditorSkiaSceneProps = {
	canvasSize: { height: number; width: number };
	editorState: EditorSnapshot;
	imageRect: RectModel;
	sourceImage: null | SkImage;
};

export function EditorCanvas({
	canvasGesture,
	canvasRef,
	canvasSize,
	editingTextId,
	editorState,
	imageLoadStatus,
	imageRect,
	onCanvasLayout,
	onRetryLoad,
	onTextChange,
	sourceImage,
	textFocusKey,
	tool,
}: EditorCanvasProps) {
	const selectedText = useMemo(
		() =>
			editorState.texts.find(
				(item) => item.id === editorState.selectedTextId,
			) ?? null,
		[editorState.selectedTextId, editorState.texts],
	);
	const isEditingSelectedText = selectedText?.id === editingTextId;

	return (
		<GestureDetector gesture={canvasGesture}>
			<View
				className="overflow-hidden rounded-xl bg-black"
				onLayout={(event) => {
					const { height, width } = event.nativeEvent.layout;
					onCanvasLayout({ height, width });
				}}
				style={StyleSheet.absoluteFill}
			>
				<Canvas ref={canvasRef} style={StyleSheet.absoluteFill}>
					<EditorSkiaScene
						canvasSize={canvasSize}
						editorState={editorState}
						imageRect={imageRect}
						sourceImage={sourceImage}
					/>
				</Canvas>

				{tool === "crop" && editorState.cropRect.width > 0 ? (
					<CropOverlay
						canvasSize={canvasSize}
						cropRect={editorState.cropRect}
					/>
				) : null}
				{tool === "text" && selectedText ? (
					<TextOverlayFrame
						canvasSize={canvasSize}
						isEditing={isEditingSelectedText}
						onChangeText={onTextChange}
						text={selectedText}
						textFocusKey={textFocusKey}
					/>
				) : null}
				{imageLoadStatus === "loading" ? (
					<View className="absolute inset-0 items-center justify-center bg-black">
						<Spinner />
					</View>
				) : null}
				{imageLoadStatus === "error" ? (
					<View className="absolute inset-0 items-center justify-center gap-3 bg-black px-6">
						<Text.Paragraph
							type="body-sm"
							className="text-center text-white/80"
						>
							当前图片格式暂不支持，请换一张图片
						</Text.Paragraph>
						<Button
							size="sm"
							variant="secondary"
							onPress={onRetryLoad}
							className="h-9 rounded-full px-4"
						>
							<Button.Label>重试</Button.Label>
						</Button>
					</View>
				) : null}
			</View>
		</GestureDetector>
	);
}

export function EditorSkiaScene({
	canvasSize,
	editorState,
	imageRect,
	sourceImage,
}: EditorSkiaSceneProps) {
	return (
		<>
			<Rect
				x={0}
				y={0}
				width={canvasSize.width}
				height={canvasSize.height}
				color="#050505"
			/>
			<Group
				origin={{
					x: canvasSize.width / 2,
					y: canvasSize.height / 2,
				}}
				transform={[
					{ translateX: editorState.transform.translateX },
					{ translateY: editorState.transform.translateY },
					{ rotate: editorState.transform.rotation },
					{ scale: editorState.transform.scale },
				]}
			>
				<SkiaImage
					image={sourceImage}
					x={imageRect.x}
					y={imageRect.y}
					width={imageRect.width}
					height={imageRect.height}
					fit="contain"
				/>
			</Group>
			{editorState.blurStrokes.map((stroke) => (
				<BlurStrokeOverlay key={stroke.id} stroke={stroke} />
			))}
			{editorState.strokes.map((stroke) => (
				<Path
					key={stroke.id}
					path={buildStrokePath(stroke)}
					color={stroke.color}
					style="stroke"
					strokeCap="round"
					strokeJoin="round"
					strokeWidth={stroke.width}
				/>
			))}
			{editorState.texts.map((text) => {
				const width = textLayerWidth(text);
				const font = matchFont({
					fontSize: text.size,
					fontWeight: "700",
				});
				return (
					<Group
						key={text.id}
						origin={{ x: text.x, y: text.y }}
						transform={[{ rotate: text.rotation }]}
					>
						<SkiaText
							text={text.value}
							font={font}
							x={text.x - width / 2}
							y={text.y + text.size / 2}
							color={text.color}
						/>
					</Group>
				);
			})}
		</>
	);
}

function BlurStrokeOverlay({ stroke }: { stroke: BlurStroke }) {
	const clipPath = useMemo(() => buildStrokeClipPath(stroke), [stroke]);
	const blurAmount = Math.min(34, Math.max(18, stroke.width * 0.75));

	return (
		<BackdropBlur blur={blurAmount} clip={clipPath}>
			<Path path={clipPath} color="rgba(255,255,255,0.035)" />
		</BackdropBlur>
	);
}

function TextOverlayFrame({
	canvasSize,
	isEditing,
	onChangeText,
	text,
	textFocusKey,
}: {
	canvasSize: { height: number; width: number };
	isEditing: boolean;
	onChangeText: (value: string) => void;
	text: TextLayer;
	textFocusKey: number;
}) {
	const inputRef = useRef<TextInput>(null);
	const displayValue = text.value.length > 0 ? text.value : "";
	const frame = makeTextFrame({ canvasSize, text, value: displayValue });
	const focusRequest = `${text.id}:${textFocusKey}`;

	useEffect(() => {
		if (!(isEditing && focusRequest)) return;
		const focusTimer = setTimeout(() => {
			inputRef.current?.focus();
		}, 80);
		return () => clearTimeout(focusTimer);
	}, [focusRequest, isEditing]);

	return (
		<View
			className="absolute rounded-md border border-white/70"
			pointerEvents={isEditing ? "auto" : "none"}
			style={{
				height: frame.height,
				left: frame.left,
				top: frame.top,
				transform: frame.transform,
				width: frame.width,
			}}
		>
			{isEditing ? (
				<TextInput
					ref={inputRef}
					autoFocus
					caretHidden={false}
					multiline
					value={text.value}
					onChangeText={onChangeText}
					returnKeyType="done"
					selectionColor="#4f8cff"
					textAlign="center"
					className="font-bold"
					style={{
						color: "transparent",
						fontSize: text.size,
						height: frame.height,
						lineHeight: Math.round(text.size * 1.2),
						paddingHorizontal: 0,
						paddingVertical: 0,
						textAlignVertical: "center",
						width: frame.width,
					}}
				/>
			) : null}
		</View>
	);
}

function CropOverlay({
	canvasSize,
	cropRect,
}: {
	canvasSize: { height: number; width: number };
	cropRect: RectModel;
}) {
	const right = cropRect.x + cropRect.width;
	const bottom = cropRect.y + cropRect.height;
	const shade = "rgba(0,0,0,0.52)";

	return (
		<View pointerEvents="none" className="absolute inset-0">
			<View
				className="absolute"
				style={{
					backgroundColor: shade,
					height: cropRect.y,
					left: 0,
					top: 0,
					width: canvasSize.width,
				}}
			/>
			<View
				className="absolute"
				style={{
					backgroundColor: shade,
					height: canvasSize.height - bottom,
					left: 0,
					top: bottom,
					width: canvasSize.width,
				}}
			/>
			<View
				className="absolute"
				style={{
					backgroundColor: shade,
					height: cropRect.height,
					left: 0,
					top: cropRect.y,
					width: cropRect.x,
				}}
			/>
			<View
				className="absolute"
				style={{
					backgroundColor: shade,
					height: cropRect.height,
					left: right,
					top: cropRect.y,
					width: canvasSize.width - right,
				}}
			/>
			<View
				className="absolute border-2 border-white"
				style={{
					height: cropRect.height,
					left: cropRect.x,
					top: cropRect.y,
					width: cropRect.width,
				}}
			>
				<View className="absolute top-1/3 right-0 left-0 h-px bg-white/50" />
				<View className="absolute top-2/3 right-0 left-0 h-px bg-white/50" />
				<View className="absolute top-0 bottom-0 left-1/3 w-px bg-white/50" />
				<View className="absolute top-0 right-1/3 bottom-0 w-px bg-white/50" />
				{[
					"top-[-5px] left-[-5px]",
					"top-[-5px] right-[-5px]",
					"bottom-[-5px] left-[-5px]",
					"right-[-5px] bottom-[-5px]",
				].map((className) => (
					<View
						key={className}
						className={`absolute size-3 rounded-full bg-white ${className}`}
					/>
				))}
			</View>
		</View>
	);
}

function makeTextFrame({
	canvasSize,
	text,
	value,
}: {
	canvasSize: { height: number; width: number };
	text: { rotation: number; size: number; value: string; x: number; y: number };
	value: string;
}) {
	const width = Math.max(48, value.length * text.size * 0.62);
	const height = Math.max(34, text.size * 1.42);
	const clampedWidth = clamp(width, 48, Math.max(48, canvasSize.width - 32));

	return {
		height,
		left: clamp(
			text.x - clampedWidth / 2,
			12,
			Math.max(12, canvasSize.width - clampedWidth - 12),
		),
		top: clamp(
			text.y - height / 2,
			12,
			Math.max(12, canvasSize.height - height - 12),
		),
		transform: [{ rotate: `${text.rotation}rad` }],
		width: clampedWidth,
	};
}
