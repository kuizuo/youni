import type { GravityIconName } from "./gravity-icon";

export type EditorTool =
	| "adjust"
	| "blur"
	| "crop"
	| "draw"
	| "filter"
	| "text";
export type CropRatio =
	| "1:1"
	| "3:4"
	| "4:3"
	| "4:5"
	| "5:4"
	| "9:16"
	| "16:9"
	| "free"
	| "original";
export type AdjustmentKey = "brightness" | "contrast" | "saturation" | "warmth";
export type FilterPreset =
	| "original"
	| "vivid"
	| "clear"
	| "warm"
	| "cool"
	| "film"
	| "mono";

export type Adjustments = Record<AdjustmentKey, number>;

export type ToolDefinition = {
	icon: GravityIconName;
	key: EditorTool;
	label: string;
};

export type Point = {
	x: number;
	y: number;
};

export type RectModel = Point & {
	height: number;
	width: number;
};

export type TransformModel = {
	flipX: boolean;
	rotation: number;
	scale: number;
	translateX: number;
	translateY: number;
};

export type TextLayer = Point & {
	color: string;
	id: string;
	rotation: number;
	size: number;
	value: string;
};

export type StrokeLayer = {
	color: string;
	id: string;
	points: Point[];
	width: number;
};

export type BlurStroke = {
	id: string;
	points: Point[];
	width: number;
};

export type EditorSnapshot = {
	adjustments: Adjustments;
	blurStrokes: BlurStroke[];
	cropDirty: boolean;
	cropRatio: CropRatio;
	cropRect: RectModel;
	filter: FilterPreset;
	filterIntensity: number;
	selectedTextId: null | string;
	strokes: StrokeLayer[];
	texts: TextLayer[];
	transform: TransformModel;
};

export type ImageLoadStatus = "error" | "loading" | "ready";

export type CropDragMode =
	| "bottom"
	| "bottomLeft"
	| "bottomRight"
	| "left"
	| "move"
	| "right"
	| "top"
	| "topLeft"
	| "topRight";
