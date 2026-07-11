import type { SkImage } from "@shopify/react-native-skia";
import { Skia, StrokeCap, StrokeJoin } from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

import type {
	BlurStroke,
	CropDragMode,
	CropRatio,
	EditorSnapshot,
	Point,
	RectModel,
	StrokeLayer,
	TextLayer,
	TransformModel,
} from "./types";

export const MAX_EXPORTED_BYTES = 8 * 1024 * 1024;
export const MAX_EXPORT_LONG_EDGE = 2048;
export const EDIT_EXPORT_DIR = "youni-image-edits";
export const TEXT_COLORS = [
	"#ffffff",
	"#111827",
	"#f87171",
	"#fb923c",
	"#facc15",
	"#34d399",
	"#60a5fa",
	"#c084fc",
] as const;
export const BRUSH_COLORS = [
	"#ffffff",
	"#111827",
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#3b82f6",
	"#a855f7",
] as const;

export const initialTransform: TransformModel = {
	rotation: 0,
	scale: 1,
	translateX: 0,
	translateY: 0,
};

export function makeInitialSnapshot(): EditorSnapshot {
	return {
		blurStrokes: [],
		cropDirty: false,
		cropRatio: "free",
		cropRect: { height: 0, width: 0, x: 0, y: 0 },
		selectedTextId: null,
		strokes: [],
		texts: [],
		transform: initialTransform,
	};
}

export function clamp(value: number, min: number, max: number) {
	"worklet";
	return Math.min(Math.max(value, min), max);
}

export function rectsEqual(a: RectModel, b: RectModel) {
	return (
		Math.abs(a.x - b.x) < 0.5 &&
		Math.abs(a.y - b.y) < 0.5 &&
		Math.abs(a.width - b.width) < 0.5 &&
		Math.abs(a.height - b.height) < 0.5
	);
}

export function textLayerWidth(text: TextLayer) {
	return Math.max(48, text.value.length * text.size * 0.62);
}

export function pointInText(point: Point, text: TextLayer) {
	const width = textLayerWidth(text);
	const height = text.size * 1.35;
	const cos = Math.cos(-text.rotation);
	const sin = Math.sin(-text.rotation);
	const dx = point.x - text.x;
	const dy = point.y - text.y;
	const localX = dx * cos - dy * sin;
	const localY = dx * sin + dy * cos;

	return (
		localX >= -width / 2 &&
		localX <= width / 2 &&
		localY >= -height / 2 &&
		localY <= height / 2
	);
}

export function buildStrokePath(stroke: StrokeLayer | BlurStroke) {
	const path = Skia.Path.Make();
	const [firstPoint, ...points] = stroke.points;
	if (!firstPoint) return path;
	path.moveTo(firstPoint.x, firstPoint.y);
	for (const point of points) {
		path.lineTo(point.x, point.y);
	}
	return path;
}

export function buildStrokeClipPath(stroke: StrokeLayer | BlurStroke) {
	const path = buildStrokePath(stroke);
	return (
		path.stroke({
			cap: StrokeCap.Round,
			join: StrokeJoin.Round,
			width: stroke.width,
		}) ?? path
	);
}

export function strokeBounds(stroke: StrokeLayer | BlurStroke): RectModel {
	if (stroke.points.length === 0) {
		return { height: 1, width: 1, x: 0, y: 0 };
	}

	const padding = stroke.width * 1.4;
	const xs = stroke.points.map((point) => point.x);
	const ys = stroke.points.map((point) => point.y);
	const left = Math.min(...xs) - padding;
	const right = Math.max(...xs) + padding;
	const top = Math.min(...ys) - padding;
	const bottom = Math.max(...ys) + padding;

	return {
		height: Math.max(1, bottom - top),
		width: Math.max(1, right - left),
		x: left,
		y: top,
	};
}

export function makeExportSize(rect: RectModel, sourceImage?: null | SkImage) {
	const rectLongEdge = Math.max(rect.width, rect.height);
	if (rectLongEdge <= 0) {
		return null;
	}

	const sourceLongEdge = sourceImage
		? Math.max(sourceImage.width(), sourceImage.height())
		: MAX_EXPORT_LONG_EDGE;
	const targetLongEdge = Math.max(
		1,
		Math.round(Math.min(MAX_EXPORT_LONG_EDGE, sourceLongEdge)),
	);
	const scale = targetLongEdge / rectLongEdge;

	return {
		height: Math.max(1, Math.round(rect.height * scale)),
		scale,
		width: Math.max(1, Math.round(rect.width * scale)),
	};
}

export function ratioValue(
	ratio: CropRatio,
	sourceRatio: number,
): null | number {
	if (ratio === "free") return null;
	if (ratio === "original") return sourceRatio;
	if (ratio === "1:1") return 1;
	if (ratio === "4:5") return 4 / 5;
	return 16 / 9;
}

export function makeCenteredCropRect(
	bounds: RectModel,
	ratio: CropRatio,
	sourceRatio: number,
): RectModel {
	const value = ratioValue(ratio, sourceRatio);
	if (!value) return bounds;

	let width = bounds.width;
	let height = width / value;
	if (height > bounds.height) {
		height = bounds.height;
		width = height * value;
	}

	return {
		height,
		width,
		x: bounds.x + (bounds.width - width) / 2,
		y: bounds.y + (bounds.height - height) / 2,
	};
}

export function getCropDragMode(
	point: Point,
	rect: RectModel,
): CropDragMode | null {
	const edgeSize = 28;
	const nearLeft = Math.abs(point.x - rect.x) <= edgeSize;
	const nearRight = Math.abs(point.x - (rect.x + rect.width)) <= edgeSize;
	const nearTop = Math.abs(point.y - rect.y) <= edgeSize;
	const nearBottom = Math.abs(point.y - (rect.y + rect.height)) <= edgeSize;
	const inside =
		point.x >= rect.x &&
		point.x <= rect.x + rect.width &&
		point.y >= rect.y &&
		point.y <= rect.y + rect.height;

	if (!inside) return null;
	if (nearLeft && nearTop) return "topLeft";
	if (nearRight && nearTop) return "topRight";
	if (nearLeft && nearBottom) return "bottomLeft";
	if (nearRight && nearBottom) return "bottomRight";
	if (nearLeft) return "left";
	if (nearRight) return "right";
	if (nearTop) return "top";
	if (nearBottom) return "bottom";
	return "move";
}

export function resizeCropRect({
	bounds,
	mode,
	ratio,
	sourceRatio,
	startPoint,
	startRect,
	x,
	y,
}: {
	bounds: RectModel;
	mode: CropDragMode;
	ratio: CropRatio;
	sourceRatio: number;
	startPoint: Point;
	startRect: RectModel;
	x: number;
	y: number;
}) {
	const minSize = 72;
	const dx = x - startPoint.x;
	const dy = y - startPoint.y;
	const maxRight = bounds.x + bounds.width;
	const maxBottom = bounds.y + bounds.height;

	if (mode === "move") {
		return {
			...startRect,
			x: clamp(startRect.x + dx, bounds.x, maxRight - startRect.width),
			y: clamp(startRect.y + dy, bounds.y, maxBottom - startRect.height),
		};
	}

	let left = startRect.x;
	let right = startRect.x + startRect.width;
	let top = startRect.y;
	let bottom = startRect.y + startRect.height;

	if (mode.includes("Left") || mode === "left") {
		left = clamp(startRect.x + dx, bounds.x, right - minSize);
	}
	if (mode.includes("Right") || mode === "right") {
		right = clamp(startRect.x + startRect.width + dx, left + minSize, maxRight);
	}
	if (mode.includes("top") || mode === "top") {
		top = clamp(startRect.y + dy, bounds.y, bottom - minSize);
	}
	if (mode.includes("bottom") || mode === "bottom") {
		bottom = clamp(
			startRect.y + startRect.height + dy,
			top + minSize,
			maxBottom,
		);
	}

	const fixedRatio = ratioValue(ratio, sourceRatio);
	if (!fixedRatio) {
		return {
			height: bottom - top,
			width: right - left,
			x: left,
			y: top,
		};
	}

	let width = right - left;
	let height = width / fixedRatio;
	if (height > bottom - top) {
		height = bottom - top;
		width = height * fixedRatio;
	}

	const anchorRight = mode.includes("Left") || mode === "left";
	const anchorBottom = mode.includes("top") || mode === "top";
	const nextX = anchorRight ? right - width : left;
	const nextY = anchorBottom ? bottom - height : top;

	return {
		height,
		width,
		x: clamp(nextX, bounds.x, maxRight - width),
		y: clamp(nextY, bounds.y, maxBottom - height),
	};
}

function bytesFromDataUri(value: string) {
	const cleanValue = value
		.replace(/^data:[^;]+;base64,/, "")
		.replace(/\s/g, "");
	const lookup = new Uint8Array(256);
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	for (let index = 0; index < chars.length; index += 1) {
		lookup[chars.charCodeAt(index)] = index;
	}

	const placeholderCount = cleanValue.endsWith("==")
		? 2
		: cleanValue.endsWith("=")
			? 1
			: 0;
	const bytes = new Uint8Array((cleanValue.length * 3) / 4 - placeholderCount);
	let byteIndex = 0;

	for (let index = 0; index < cleanValue.length; index += 4) {
		const encoded1 = lookup[cleanValue.charCodeAt(index)];
		const encoded2 = lookup[cleanValue.charCodeAt(index + 1)];
		const encoded3 = lookup[cleanValue.charCodeAt(index + 2)];
		const encoded4 = lookup[cleanValue.charCodeAt(index + 3)];

		if (byteIndex < bytes.length) {
			bytes[byteIndex] = (encoded1 << 2) | (encoded2 >> 4);
			byteIndex += 1;
		}
		if (byteIndex < bytes.length) {
			bytes[byteIndex] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
			byteIndex += 1;
		}
		if (byteIndex < bytes.length) {
			bytes[byteIndex] = ((encoded3 & 3) << 6) | encoded4;
		}
	}

	return bytes;
}

async function loadSkiaImage(uri: string) {
	if (uri.startsWith("data:")) {
		const decodedImage = Skia.Image.MakeImageFromEncoded(
			Skia.Data.fromBytes(bytesFromDataUri(uri)),
		);
		if (!decodedImage) {
			throw new Error("图片无法解码");
		}
		return decodedImage;
	}

	const data = await Skia.Data.fromURI(uri);
	const decodedImage = Skia.Image.MakeImageFromEncoded(data);
	if (!decodedImage) {
		throw new Error("图片无法解码");
	}
	return decodedImage;
}

export async function loadEditorImage(uri: string): Promise<SkImage> {
	try {
		const converted = await manipulateAsync(uri, [], {
			compress: 0.92,
			format: SaveFormat.JPEG,
		});
		return await loadSkiaImage(converted.uri);
	} catch {
		try {
			return await loadSkiaImage(uri);
		} catch {
			throw new Error("当前图片格式暂不支持，请换一张图片");
		}
	}
}

async function ensureEditDirectory() {
	const baseDirectory =
		FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
	if (!baseDirectory) {
		throw new Error("无法访问本地缓存目录");
	}

	const directory = `${baseDirectory}${EDIT_EXPORT_DIR}/`;
	const directoryInfo = await FileSystem.getInfoAsync(directory);
	if (!directoryInfo.exists) {
		await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
	}
	return directory;
}

export async function writeJpegBase64(base64: string, quality: number) {
	const directory = await ensureEditDirectory();
	const fileName = `image-edit-${Date.now()}-${quality}.jpg`;
	const uri = `${directory}${fileName}`;

	await FileSystem.writeAsStringAsync(uri, base64, {
		encoding: FileSystem.EncodingType.Base64,
	});

	const info = await FileSystem.getInfoAsync(uri);
	const fileSize = info.exists && !info.isDirectory ? info.size : undefined;
	return { fileName, fileSize, uri };
}

export async function deleteLocalFile(uri: string) {
	await FileSystem.deleteAsync(uri, { idempotent: true });
}
