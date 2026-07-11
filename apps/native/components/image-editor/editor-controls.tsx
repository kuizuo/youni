import { Button, PressableFeedback, Spinner, Typography } from "heroui-native";
import { ScrollView, View } from "react-native";

import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";
import { AppSeparator } from "@/components/shared/app-separator";
import { GravityIcon, type GravityIconName } from "./gravity-icon";
import type { CropRatio, EditorTool, ToolDefinition } from "./types";
import { BRUSH_COLORS, TEXT_COLORS } from "./utils";

export const TOOLBAR_TOOLS: ToolDefinition[] = [
	{ key: "transform", label: "调整", icon: "sliders" },
	{ key: "crop", label: "裁剪", icon: "crop" },
	{ key: "text", label: "文字", icon: "font" },
	{ key: "draw", label: "画笔", icon: "brush" },
	{ key: "blur", label: "模糊", icon: "eye-slash" },
];

const CROP_RATIOS: Array<{ key: CropRatio; label: string }> = [
	{ key: "free", label: "自由" },
	{ key: "original", label: "原图" },
	{ key: "1:1", label: "1:1" },
	{ key: "4:5", label: "4:5" },
	{ key: "16:9", label: "16:9" },
];

type EditorTopBarProps = {
	activeTool: null | EditorTool;
	canRedo: boolean;
	canUndo: boolean;
	isApplyingTool: boolean;
	isSaving: boolean;
	onCancel: () => void;
	onCancelToolChanges: () => void;
	onConfirmToolChanges: () => void;
	onRedo: () => void;
	onSave: () => void;
	onUndo: () => void;
	saveDisabled: boolean;
};

export function EditorTopBar({
	activeTool,
	canRedo,
	canUndo,
	isApplyingTool,
	isSaving,
	onCancel,
	onCancelToolChanges,
	onConfirmToolChanges,
	onRedo,
	onSave,
	onUndo,
	saveDisabled,
}: EditorTopBarProps) {
	if (activeTool) {
		return (
			<View className="h-14 flex-row items-center justify-between px-3">
				<PressableFeedback
					accessibilityLabel="取消本次修改"
					accessibilityRole="button"
					hitSlop={10}
					isDisabled={isApplyingTool}
					onPress={onCancelToolChanges}
					className={`h-11 w-11 items-center justify-center rounded-full ${
						isApplyingTool ? "bg-white/5 opacity-40" : "bg-white/10"
					}`}
				>
					<GravityIcon name="xmark" size={APP_HEADER_ICON_SIZE} color="white" />
				</PressableFeedback>
				<PressableFeedback
					accessibilityLabel="确认本次修改"
					accessibilityRole="button"
					hitSlop={10}
					isDisabled={isApplyingTool}
					onPress={onConfirmToolChanges}
					className={`h-11 w-11 items-center justify-center rounded-full ${
						isApplyingTool ? "bg-white/60 opacity-70" : "bg-white"
					}`}
				>
					{isApplyingTool ? (
						<Spinner size="sm" />
					) : (
						<GravityIcon
							name="check"
							size={APP_HEADER_ICON_SIZE}
							color="black"
						/>
					)}
				</PressableFeedback>
			</View>
		);
	}

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
	blurWidth: number;
	brushColor: string;
	brushWidth: number;
	canDeleteText: boolean;
	cropRatio: CropRatio;
	onBlurWidthChange: (value: number) => void;
	onBrushColorChange: (value: string) => void;
	onBrushWidthChange: (value: number) => void;
	onDeleteText: () => void;
	onResetTransform: () => void;
	onRotateImage: () => void;
	onSetCropRatio: (value: CropRatio) => void;
	onSetTool: (value: EditorTool) => void;
	onTextColorChange: (value: string) => void;
	onTextSizeChange: (delta: number) => void;
	onZoomImage: (delta: number) => void;
	textColor: string;
	tool: EditorTool | null;
};

export function EditorBottomControls({
	blurWidth,
	brushColor,
	brushWidth,
	canDeleteText,
	cropRatio,
	onBlurWidthChange,
	onBrushColorChange,
	onBrushWidthChange,
	onDeleteText,
	onResetTransform,
	onRotateImage,
	onSetCropRatio,
	onSetTool,
	onTextColorChange,
	onTextSizeChange,
	onZoomImage,
	textColor,
	tool,
}: EditorBottomControlsProps) {
	return (
		<View
			className="relative px-3 pt-3 pb-2"
			style={{ height: 67, overflow: "visible" }}
		>
			<AppSeparator className="absolute top-0 right-0 left-0 bg-white/10" />
			<View
				pointerEvents={tool ? "auto" : "none"}
				className="absolute right-3 left-3 h-24 justify-end gap-2"
				style={{ bottom: 67 }}
			>
				{tool === "transform" ? (
					<View className="flex-row items-center justify-center gap-2">
						<IconActionButton
							icon="minus"
							label="缩小"
							onPress={() => onZoomImage(-0.15)}
						/>
						<IconActionButton
							icon="plus"
							label="放大"
							onPress={() => onZoomImage(0.15)}
						/>
						<IconActionButton
							icon="arrow-rotate-right"
							label="旋转"
							onPress={onRotateImage}
						/>
						<IconActionButton
							icon="arrow-rotate-left"
							label="重置"
							onPress={onResetTransform}
						/>
					</View>
				) : null}

				{tool === "crop" ? (
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
								icon="minus"
								label="缩小文字"
								isDisabled={!canDeleteText}
								onPress={() => onTextSizeChange(-4)}
							/>
							<IconActionButton
								icon="plus"
								label="放大文字"
								isDisabled={!canDeleteText}
								onPress={() => onTextSizeChange(4)}
							/>
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
						<WidthStepper
							value={brushWidth}
							onChange={onBrushWidthChange}
							min={2}
							max={18}
							label="画笔粗细"
						/>
					</View>
				) : null}

				{tool === "blur" ? (
					<View>
						<WidthStepper
							value={blurWidth}
							onChange={onBlurWidthChange}
							min={14}
							max={56}
							label="模糊范围"
						/>
					</View>
				) : null}
			</View>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="h-11 shrink-0"
				contentContainerClassName="gap-2 pr-3"
			>
				{TOOLBAR_TOOLS.map((item) => (
					<EditorToolButton
						key={item.key}
						icon={item.icon}
						label={item.label}
						isActive={tool === item.key}
						isDisabled={Boolean(tool && tool !== item.key)}
						onPress={() => onSetTool(item.key)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

function EditorToolButton({
	icon,
	isActive,
	isDisabled,
	label,
	onPress,
}: {
	icon: GravityIconName;
	isActive: boolean;
	isDisabled?: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			isDisabled={isDisabled}
			onPress={onPress}
			className={`size-11 items-center justify-center rounded-full ${
				isActive ? "bg-white" : "bg-white/10"
			} ${isDisabled ? "opacity-35" : ""}`}
		>
			<GravityIcon name={icon} size={22} color={isActive ? "black" : "white"} />
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
			accessibilityLabel={`裁剪比例${label}`}
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

function WidthStepper({
	label,
	max,
	min,
	onChange,
	value,
}: {
	label: string;
	max: number;
	min: number;
	onChange: (value: number) => void;
	value: number;
}) {
	const fillPercent = Math.max(
		12,
		((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100,
	);

	return (
		<View className="flex-row items-center justify-center gap-3">
			<IconActionButton
				icon="minus"
				label={`${label}减小`}
				onPress={() => onChange(Math.max(min, value - 2))}
			/>
			<View className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
				<View
					className="h-full rounded-full bg-white"
					style={{
						width: `${fillPercent}%`,
					}}
				/>
			</View>
			<IconActionButton
				icon="plus"
				label={`${label}增大`}
				onPress={() => onChange(Math.min(max, value + 2))}
			/>
		</View>
	);
}
