import {
	Canvas,
	ColorMatrix,
	type SkImage,
	Image as SkiaImage,
} from "@shopify/react-native-skia";
import {
	Button,
	PressableFeedback,
	Slider,
	Spinner,
	Typography,
} from "heroui-native";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";
import { AppSeparator } from "@/components/shared/app-separator";
import { GravityIcon, type GravityIconName } from "./gravity-icon";
import {
	DEFAULT_ADJUSTMENTS,
	editorColorMatrix,
	FILTER_PRESETS,
} from "./image-effects";
import type {
	AdjustmentKey,
	Adjustments,
	CropRatio,
	EditorTool,
	FilterPreset,
	ToolDefinition,
} from "./types";
import { BRUSH_COLORS, TEXT_COLORS } from "./utils";

export const TOOLBAR_TOOLS: ToolDefinition[] = [
	{ key: "adjust", label: "调整", icon: "sliders" },
	{ key: "filter", label: "滤镜", icon: "layout-cells" },
	{ key: "crop", label: "裁剪", icon: "crop" },
	{ key: "text", label: "文字", icon: "font" },
	{ key: "draw", label: "画笔", icon: "brush" },
	{ key: "blur", label: "模糊", icon: "eye-slash" },
];

const CROP_RATIOS: Array<{ key: CropRatio; label: string }> = [
	{ key: "free", label: "自由" },
	{ key: "original", label: "原图" },
	{ key: "1:1", label: "1:1" },
	{ key: "3:4", label: "3:4" },
	{ key: "4:3", label: "4:3" },
	{ key: "4:5", label: "4:5" },
	{ key: "5:4", label: "5:4" },
	{ key: "9:16", label: "9:16" },
	{ key: "16:9", label: "16:9" },
];

const ADJUSTMENTS: Array<{ key: AdjustmentKey; label: string }> = [
	{ key: "brightness", label: "亮度" },
	{ key: "contrast", label: "对比度" },
	{ key: "saturation", label: "饱和度" },
	{ key: "warmth", label: "色温" },
];

type EditorTopBarProps = {
	canRedo: boolean;
	canRestore: boolean;
	canUndo: boolean;
	isSaving: boolean;
	onCancel: () => void;
	onRedo: () => void;
	onRestore: () => void;
	onSave: () => void;
	onShowOriginalChange: (value: boolean) => void;
	onUndo: () => void;
	saveDisabled: boolean;
};

export function EditorTopBar({
	canRedo,
	canRestore,
	canUndo,
	isSaving,
	onCancel,
	onRedo,
	onRestore,
	onSave,
	onShowOriginalChange,
	onUndo,
	saveDisabled,
}: EditorTopBarProps) {
	return (
		<View className="h-14 flex-row items-center justify-between px-3">
			<PressableFeedback
				accessibilityLabel="返回"
				accessibilityRole="button"
				hitSlop={10}
				onPress={onCancel}
				className="h-11 w-11 items-center justify-center rounded-full"
			>
				<GravityIcon
					name="chevron-left"
					size={APP_HEADER_ICON_SIZE}
					color="white"
				/>
			</PressableFeedback>
			<View className="flex-row items-center gap-2">
				<PressableFeedback
					accessibilityHint="按住可临时查看未编辑的图片"
					accessibilityLabel="查看原图"
					accessibilityRole="button"
					onPressIn={() => onShowOriginalChange(true)}
					onPressOut={() => onShowOriginalChange(false)}
					className="h-10 items-center justify-center rounded-full bg-white/10 px-3"
				>
					<Typography.Paragraph type="body-xs" className="text-white">
						原图
					</Typography.Paragraph>
				</PressableFeedback>
				<IconActionButton
					icon="arrow-rotate-left"
					label="还原全部修改"
					isDisabled={!canRestore}
					onPress={onRestore}
				/>
				<IconActionButton
					icon="arrow-uturn-ccw-left"
					label="撤销"
					isDisabled={!canUndo}
					onPress={onUndo}
				/>
				<IconActionButton
					icon="arrow-uturn-cw-right"
					label="重做"
					isDisabled={!canRedo}
					onPress={onRedo}
				/>
			</View>
			<Button
				size="sm"
				variant="primary"
				isDisabled={saveDisabled}
				onPress={onSave}
				className="h-9 rounded-full px-4"
			>
				{isSaving ? <Spinner size="sm" /> : null}
				<Button.Label>完成</Button.Label>
			</Button>
		</View>
	);
}

type EditorBottomControlsProps = {
	adjustments: Adjustments;
	blurWidth: number;
	brushColor: string;
	brushWidth: number;
	canDeleteText: boolean;
	cropRatio: CropRatio;
	filter: FilterPreset;
	filterIntensity: number;
	isApplyingTool: boolean;
	onAddText: () => void;
	onAdjustmentChange: (key: AdjustmentKey, value: number) => void;
	onBlurWidthChange: (value: number) => void;
	onBrushColorChange: (value: string) => void;
	onBrushWidthChange: (value: number) => void;
	onCancelToolChanges: () => void;
	onConfirmToolChanges: () => void;
	onDeleteText: () => void;
	onFilterChange: (value: FilterPreset) => void;
	onFilterIntensityChange: (value: number) => void;
	onFlipImage: () => void;
	onRotateImage: (direction: -1 | 1) => void;
	onSetCropRatio: (value: CropRatio) => void;
	onSetTool: (value: EditorTool) => void;
	onTextColorChange: (value: string) => void;
	onTextSizeChange: (value: number) => void;
	sourceImage: null | SkImage;
	textColor: string;
	textSize: number;
	tool: EditorTool | null;
};

export function EditorBottomControls({
	adjustments,
	blurWidth,
	brushColor,
	brushWidth,
	canDeleteText,
	cropRatio,
	filter,
	filterIntensity,
	isApplyingTool,
	onAddText,
	onAdjustmentChange,
	onBlurWidthChange,
	onBrushColorChange,
	onBrushWidthChange,
	onCancelToolChanges,
	onConfirmToolChanges,
	onDeleteText,
	onFilterChange,
	onFilterIntensityChange,
	onFlipImage,
	onRotateImage,
	onSetCropRatio,
	onSetTool,
	onTextColorChange,
	onTextSizeChange,
	sourceImage,
	textColor,
	textSize,
	tool,
}: EditorBottomControlsProps) {
	const [activeAdjustment, setActiveAdjustment] =
		useState<AdjustmentKey>("brightness");
	const controlHeight = tool ? 112 : 0;
	return (
		<View className="bg-black" style={{ height: 56 + controlHeight }}>
			<AppSeparator className="absolute top-0 right-0 left-0 bg-white/10" />
			{tool ? (
				<View
					className="justify-end gap-3 px-3 pt-2 pb-3"
					style={{ height: controlHeight }}
				>
					{tool === "adjust" ? (
						<View className="gap-3">
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerClassName="gap-2 pr-3"
							>
								{ADJUSTMENTS.map((item) => (
									<RatioButton
										key={item.key}
										isActive={activeAdjustment === item.key}
										label={item.label}
										onPress={() => setActiveAdjustment(item.key)}
									/>
								))}
							</ScrollView>
							<ValueSlider
								label={
									ADJUSTMENTS.find((item) => item.key === activeAdjustment)
										?.label ?? "调整"
								}
								value={adjustments[activeAdjustment]}
								min={-100}
								max={100}
								onChange={(value) =>
									onAdjustmentChange(activeAdjustment, value)
								}
							/>
						</View>
					) : null}

					{tool === "filter" ? (
						<View className="gap-2">
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerClassName="gap-2 pr-3"
							>
								{FILTER_PRESETS.map((item) => (
									<FilterButton
										key={item.key}
										filter={item.key}
										isActive={filter === item.key}
										label={item.label}
										onPress={() => onFilterChange(item.key)}
										sourceImage={sourceImage}
									/>
								))}
							</ScrollView>
							<ValueSlider
								label="强度"
								value={filter === "original" ? 0 : filterIntensity}
								min={0}
								max={100}
								isDisabled={filter === "original"}
								onChange={onFilterIntensityChange}
							/>
						</View>
					) : null}

					{tool === "crop" ? (
						<View className="gap-3">
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerClassName="gap-2 pr-3"
							>
								{CROP_RATIOS.map((item) => (
									<RatioButton
										key={item.key}
										isActive={cropRatio === item.key}
										label={item.label}
										onPress={() => onSetCropRatio(item.key)}
									/>
								))}
							</ScrollView>
							<View className="flex-row items-center justify-center gap-2">
								<IconActionButton
									icon="arrow-rotate-left"
									label="向左旋转 90 度"
									onPress={() => onRotateImage(-1)}
								/>
								<IconActionButton
									icon="arrow-rotate-right"
									label="向右旋转 90 度"
									onPress={() => onRotateImage(1)}
								/>
								<IconActionButton
									icon="arrows-expand"
									label="水平翻转"
									onPress={onFlipImage}
								/>
							</View>
						</View>
					) : null}

					{tool === "text" ? (
						<View className="gap-2">
							<ColorPalette
								colors={TEXT_COLORS}
								selectedColor={textColor}
								onSelect={onTextColorChange}
							/>
							<View className="flex-row items-center justify-center gap-2">
								<IconActionButton
									icon="plus"
									label="添加文字"
									onPress={onAddText}
								/>
								<View className="min-w-0 flex-1">
									<ValueSlider
										label="字号"
										value={textSize}
										min={12}
										max={72}
										isDisabled={!canDeleteText}
										onChange={onTextSizeChange}
									/>
								</View>
								<IconActionButton
									icon="trash-bin"
									label="删除文字"
									isDisabled={!canDeleteText}
									onPress={onDeleteText}
								/>
							</View>
						</View>
					) : null}

					{tool === "draw" ? (
						<View className="gap-2">
							<ColorPalette
								colors={BRUSH_COLORS}
								selectedColor={brushColor}
								onSelect={onBrushColorChange}
							/>
							<View className="pb-2">
								<ValueSlider
									value={brushWidth}
									onChange={onBrushWidthChange}
									min={2}
									max={18}
									label="粗细"
								/>
							</View>
						</View>
					) : null}

					{tool === "blur" ? (
						<View className="pb-2">
							<ValueSlider
								value={blurWidth}
								onChange={onBlurWidthChange}
								min={14}
								max={56}
								label="模糊"
							/>
						</View>
					) : null}
				</View>
			) : null}

			<View className="justify-center px-3 py-2" style={{ height: 56 }}>
				{tool ? (
					<ToolActionBar
						isApplyingTool={isApplyingTool}
						onCancel={onCancelToolChanges}
						onConfirm={onConfirmToolChanges}
						tool={tool}
					/>
				) : (
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						className="h-12 shrink-0"
						contentContainerClassName="gap-2 pr-3"
					>
						{TOOLBAR_TOOLS.map((item) => (
							<EditorToolButton
								key={item.key}
								icon={item.icon}
								label={item.label}
								isActive={false}
								onPress={() => onSetTool(item.key)}
							/>
						))}
					</ScrollView>
				)}
			</View>
		</View>
	);
}

function ToolActionBar({
	isApplyingTool,
	onCancel,
	onConfirm,
	tool,
}: {
	isApplyingTool: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	tool: EditorTool;
}) {
	return (
		<View className="flex-1 flex-row items-center justify-between">
			<PressableFeedback
				accessibilityLabel="取消本次修改"
				accessibilityRole="button"
				hitSlop={8}
				isDisabled={isApplyingTool}
				onPress={onCancel}
				className={`size-10 items-center justify-center rounded-full ${
					isApplyingTool ? "bg-white/5 opacity-40" : "bg-white/10"
				}`}
			>
				<GravityIcon
					name="xmark"
					size={APP_HEADER_ICON_SIZE - 2}
					color="white"
				/>
			</PressableFeedback>
			<Typography.Paragraph type="body-sm" className="text-white/70">
				{TOOLBAR_TOOLS.find((item) => item.key === tool)?.label}
			</Typography.Paragraph>
			<PressableFeedback
				accessibilityLabel="确认本次修改"
				accessibilityRole="button"
				hitSlop={8}
				isDisabled={isApplyingTool}
				onPress={onConfirm}
				className={`size-10 items-center justify-center rounded-full ${
					isApplyingTool ? "bg-white/60 opacity-70" : "bg-white"
				}`}
			>
				{isApplyingTool ? (
					<Spinner size="sm" />
				) : (
					<GravityIcon
						name="check"
						size={APP_HEADER_ICON_SIZE - 2}
						color="black"
					/>
				)}
			</PressableFeedback>
		</View>
	);
}

function EditorToolButton({
	icon,
	isActive,
	label,
	onPress,
}: {
	icon: GravityIconName;
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
			className={`h-12 w-14 items-center justify-center gap-0.5 rounded-xl ${
				isActive ? "bg-white" : "bg-white/10"
			}`}
		>
			<GravityIcon name={icon} size={20} color={isActive ? "black" : "white"} />
			<Typography.Paragraph
				type="body-xs"
				className={isActive ? "text-black" : "text-white"}
			>
				{label}
			</Typography.Paragraph>
		</PressableFeedback>
	);
}

export function IconActionButton({
	icon,
	isDisabled,
	label,
	onPress,
}: {
	icon: GravityIconName;
	isDisabled?: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			isDisabled={isDisabled}
			hitSlop={6}
			onPress={onPress}
			className={`size-10 items-center justify-center rounded-full ${
				isDisabled ? "bg-white/5 opacity-40" : "bg-white/10"
			}`}
		>
			<GravityIcon name={icon} size={21} color="white" />
		</PressableFeedback>
	);
}

function RatioButton({
	isActive,
	label,
	onPress,
}: {
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
			className={`h-9 items-center justify-center rounded-full px-3 ${
				isActive ? "bg-white" : "bg-white/10"
			}`}
		>
			<Typography.Paragraph
				type="body-xs"
				className={isActive ? "text-black" : "text-white"}
			>
				{label}
			</Typography.Paragraph>
		</PressableFeedback>
	);
}

function ColorPalette({
	colors,
	onSelect,
	selectedColor,
}: {
	colors: readonly string[];
	onSelect: (value: string) => void;
	selectedColor: string;
}) {
	return (
		<View className="flex-row items-center justify-center gap-2">
			{colors.map((color) => (
				<PressableFeedback
					key={color}
					accessibilityLabel="选择颜色"
					accessibilityRole="button"
					onPress={() => onSelect(color)}
					className={`size-8 items-center justify-center rounded-full ${
						selectedColor === color ? "border-2 border-white" : ""
					}`}
				>
					<View
						className="size-5 rounded-full border border-white/30"
						style={{ backgroundColor: color }}
					/>
				</PressableFeedback>
			))}
		</View>
	);
}

function FilterButton({
	filter,
	isActive,
	label,
	onPress,
	sourceImage,
}: {
	filter: FilterPreset;
	isActive: boolean;
	label: string;
	onPress: () => void;
	sourceImage: null | SkImage;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={`滤镜${label}`}
			accessibilityRole="button"
			onPress={onPress}
			className="items-center gap-1"
		>
			<View
				className={`size-12 overflow-hidden rounded-lg ${isActive ? "border-2 border-white" : "border border-white/20"}`}
			>
				<Canvas style={{ height: 48, width: 48 }}>
					<SkiaImage
						image={sourceImage}
						x={0}
						y={0}
						width={48}
						height={48}
						fit="cover"
					>
						<ColorMatrix
							matrix={editorColorMatrix(DEFAULT_ADJUSTMENTS, filter, 100)}
						/>
					</SkiaImage>
				</Canvas>
			</View>
			<Typography.Paragraph type="body-xs" className="text-white/80">
				{label}
			</Typography.Paragraph>
		</PressableFeedback>
	);
}

function ValueSlider({
	isDisabled,
	label,
	max,
	min,
	onChange,
	value,
}: {
	isDisabled?: boolean;
	label: string;
	max: number;
	min: number;
	onChange: (value: number) => void;
	value: number;
}) {
	return (
		<View className="flex-row items-center gap-3 px-1">
			<Typography.Paragraph type="body-xs" className="w-11 text-white/80">
				{label}
			</Typography.Paragraph>
			<Slider
				accessibilityLabel={label}
				className="flex-1"
				isDisabled={isDisabled}
				maxValue={max}
				minValue={min}
				onChange={(nextValue) =>
					onChange(
						Array.isArray(nextValue) ? (nextValue[0] ?? value) : nextValue,
					)
				}
				step={1}
				value={value}
			>
				<Slider.Track className="h-1.5 rounded-full bg-white/20">
					<Slider.Fill className="rounded-full bg-white" />
					<Slider.Thumb
						classNames={{
							thumbContainer: "size-5 rounded-full bg-white",
							thumbKnob: "bg-white",
						}}
					/>
				</Slider.Track>
			</Slider>
			<Typography.Paragraph
				type="body-xs"
				className="w-9 text-right text-white/80"
			>
				{Math.round(value)}
			</Typography.Paragraph>
		</View>
	);
}
