import type { GravityIconName } from "./gravity-icon";

export type EditorTool = "blur" | "crop" | "draw" | "text" | "transform";
export type CropRatio = "1:1" | "16:9" | "4:5" | "free" | "original";

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
	blurStrokes: BlurStroke[];
	cropDirty: boolean;
	cropRatio: CropRatio;
	cropRect: RectModel;
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
