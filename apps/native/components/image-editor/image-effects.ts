import type {
	Adjustments,
	FilterPreset,
	Point,
	RectModel,
	TextLayer,
	TransformModel,
} from "./types";

export const DEFAULT_ADJUSTMENTS: Adjustments = {
	brightness: 0,
	contrast: 0,
	saturation: 0,
	warmth: 0,
};

export const FILTER_PRESETS: ReadonlyArray<{
	key: FilterPreset;
	label: string;
}> = [
	{ key: "original", label: "原图" },
	{ key: "vivid", label: "鲜明" },
	{ key: "clear", label: "清透" },
	{ key: "warm", label: "暖阳" },
	{ key: "cool", label: "冷调" },
	{ key: "film", label: "胶片" },
	{ key: "mono", label: "黑白" },
];

export function pointInRect(point: Point, rect: RectModel) {
	return (
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height
	);
}

export function textLayerWidth(text: TextLayer) {
	return Math.max(48, text.value.length * text.size * 0.62);
}

export function constrainTextLayer(
	text: TextLayer,
	bounds: RectModel,
): TextLayer {
	const width = textLayerWidth(text);
	const height = text.size * 1.35;
	const cosine = Math.abs(Math.cos(text.rotation));
	const sine = Math.abs(Math.sin(text.rotation));
	const halfWidth = Math.min(
		bounds.width / 2,
		(width * cosine + height * sine) / 2,
	);
	const halfHeight = Math.min(
		bounds.height / 2,
		(width * sine + height * cosine) / 2,
	);
	return {
		...text,
		x: Math.min(
			bounds.x + bounds.width - halfWidth,
			Math.max(bounds.x + halfWidth, text.x),
		),
		y: Math.min(
			bounds.y + bounds.height - halfHeight,
			Math.max(bounds.y + halfHeight, text.y),
		),
	};
}

const IDENTITY_MATRIX = [
	1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

function multiplyMatrices(left: number[], right: number[]) {
	const output = new Array<number>(20).fill(0);
	for (let row = 0; row < 4; row += 1) {
		for (let column = 0; column < 4; column += 1) {
			for (let index = 0; index < 4; index += 1) {
				output[row * 5 + column] +=
					(left[row * 5 + index] ?? 0) * (right[index * 5 + column] ?? 0);
			}
		}
		output[row * 5 + 4] =
			(left[row * 5 + 4] ?? 0) +
			[0, 1, 2, 3].reduce(
				(total, index) =>
					total + (left[row * 5 + index] ?? 0) * (right[index * 5 + 4] ?? 0),
				0,
			);
	}
	return output;
}

function saturationMatrix(amount: number) {
	const inverse = 1 - amount;
	const red = 0.2126 * inverse;
	const green = 0.7152 * inverse;
	const blue = 0.0722 * inverse;
	return [
		red + amount,
		green,
		blue,
		0,
		0,
		red,
		green + amount,
		blue,
		0,
		0,
		red,
		green,
		blue + amount,
		0,
		0,
		0,
		0,
		0,
		1,
		0,
	];
}

function contrastMatrix(amount: number) {
	const offset = 0.5 * (1 - amount);
	return [
		amount,
		0,
		0,
		0,
		offset,
		0,
		amount,
		0,
		0,
		offset,
		0,
		0,
		amount,
		0,
		offset,
		0,
		0,
		0,
		1,
		0,
	];
}

function brightnessMatrix(amount: number) {
	const offset = amount * 0.35;
	return [
		1,
		0,
		0,
		0,
		offset,
		0,
		1,
		0,
		0,
		offset,
		0,
		0,
		1,
		0,
		offset,
		0,
		0,
		0,
		1,
		0,
	];
}

function warmthMatrix(amount: number) {
	const offset = amount * 0.13;
	return [
		1,
		0,
		0,
		0,
		offset,
		0,
		1,
		0,
		0,
		offset * 0.16,
		0,
		0,
		1,
		0,
		-offset,
		0,
		0,
		0,
		1,
		0,
	];
}

function presetMatrix(preset: FilterPreset) {
	switch (preset) {
		case "vivid":
			return multiplyMatrices(contrastMatrix(1.08), saturationMatrix(1.3));
		case "clear":
			return multiplyMatrices(brightnessMatrix(0.06), contrastMatrix(1.08));
		case "warm":
			return multiplyMatrices(warmthMatrix(0.65), saturationMatrix(1.12));
		case "cool":
			return multiplyMatrices(warmthMatrix(-0.58), saturationMatrix(1.06));
		case "film":
			return multiplyMatrices(
				warmthMatrix(0.28),
				multiplyMatrices(contrastMatrix(0.92), saturationMatrix(0.82)),
			);
		case "mono":
			return multiplyMatrices(contrastMatrix(1.08), saturationMatrix(0));
		default:
			return [...IDENTITY_MATRIX];
	}
}

function mixMatrix(matrix: number[], intensity: number) {
	const amount = Math.min(1, Math.max(0, intensity / 100));
	return matrix.map(
		(value, index) =>
			(IDENTITY_MATRIX[index] ?? 0) * (1 - amount) + value * amount,
	);
}

export function editorColorMatrix(
	adjustments: Adjustments,
	filter: FilterPreset,
	filterIntensity: number,
) {
	let matrix = mixMatrix(presetMatrix(filter), filterIntensity);
	matrix = multiplyMatrices(
		brightnessMatrix(adjustments.brightness / 100),
		matrix,
	);
	matrix = multiplyMatrices(
		contrastMatrix(1 + adjustments.contrast / 100),
		matrix,
	);
	matrix = multiplyMatrices(
		saturationMatrix(1 + adjustments.saturation / 100),
		matrix,
	);
	return multiplyMatrices(warmthMatrix(adjustments.warmth / 100), matrix);
}

function rotatePoint(point: Point, angle: number): Point {
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	return {
		x: point.x * cosine - point.y * sine,
		y: point.x * sine + point.y * cosine,
	};
}

export function constrainImageTransform(
	transform: TransformModel,
	imageRect: RectModel,
	cropRect: RectModel,
): TransformModel {
	if (
		imageRect.width <= 0 ||
		imageRect.height <= 0 ||
		cropRect.width <= 0 ||
		cropRect.height <= 0
	) {
		return transform;
	}

	const imageCenter = {
		x: imageRect.x + imageRect.width / 2,
		y: imageRect.y + imageRect.height / 2,
	};
	const cropPoints = [
		{ x: cropRect.x, y: cropRect.y },
		{ x: cropRect.x + cropRect.width, y: cropRect.y },
		{ x: cropRect.x, y: cropRect.y + cropRect.height },
		{ x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height },
	].map((point) =>
		rotatePoint(
			{ x: point.x - imageCenter.x, y: point.y - imageCenter.y },
			-transform.rotation,
		),
	);
	const xs = cropPoints.map((point) => point.x);
	const ys = cropPoints.map((point) => point.y);
	const minScale = Math.max(
		(Math.max(...xs) - Math.min(...xs)) / imageRect.width,
		(Math.max(...ys) - Math.min(...ys)) / imageRect.height,
	);
	const scale = Math.min(4, Math.max(minScale, transform.scale));
	const halfWidth = (imageRect.width * scale) / 2;
	const halfHeight = (imageRect.height * scale) / 2;
	const localTranslation = rotatePoint(
		{ x: transform.translateX, y: transform.translateY },
		-transform.rotation,
	);
	const clampedLocal = {
		x: Math.min(
			Math.min(...xs) + halfWidth,
			Math.max(Math.max(...xs) - halfWidth, localTranslation.x),
		),
		y: Math.min(
			Math.min(...ys) + halfHeight,
			Math.max(Math.max(...ys) - halfHeight, localTranslation.y),
		),
	};
	const translation = rotatePoint(clampedLocal, transform.rotation);

	return {
		...transform,
		scale,
		translateX: translation.x,
		translateY: translation.y,
	};
}

export function exportSizeForCrop({
	cropRect,
	imageRect,
	imageScale,
	maxLongEdge,
	sourceHeight,
	sourceWidth,
}: {
	cropRect: RectModel;
	imageRect: RectModel;
	imageScale: number;
	maxLongEdge: number;
	sourceHeight: number;
	sourceWidth: number;
}) {
	if (
		cropRect.width <= 0 ||
		cropRect.height <= 0 ||
		imageRect.width <= 0 ||
		imageScale <= 0
	) {
		return null;
	}
	const pixelsPerPoint = Math.min(
		sourceWidth / (imageRect.width * imageScale),
		sourceHeight / (imageRect.height * imageScale),
	);
	let width = cropRect.width * pixelsPerPoint;
	let height = cropRect.height * pixelsPerPoint;
	const downscale = Math.min(1, maxLongEdge / Math.max(width, height));
	width *= downscale;
	height *= downscale;
	return {
		height: Math.max(1, Math.round(height)),
		scale: Math.max(1, Math.round(width)) / cropRect.width,
		width: Math.max(1, Math.round(width)),
	};
}
