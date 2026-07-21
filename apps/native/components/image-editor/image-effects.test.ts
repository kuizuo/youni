import { describe, expect, test } from "bun:test";

import {
	constrainImageTransform,
	constrainTextLayer,
	DEFAULT_ADJUSTMENTS,
	editorColorMatrix,
	exportSizeForCrop,
	pointInRect,
} from "./image-effects";

describe("image editor math", () => {
	test("keeps the original filter neutral", () => {
		expect(editorColorMatrix(DEFAULT_ADJUSTMENTS, "original", 100)).toEqual([
			1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
		]);
	});

	test("keeps color offsets in Skia's normalized color range", () => {
		for (const filter of [
			"vivid",
			"clear",
			"warm",
			"cool",
			"film",
			"mono",
		] as const) {
			const matrix = editorColorMatrix(DEFAULT_ADJUSTMENTS, filter, 100);
			for (const index of [4, 9, 14, 19]) {
				expect(Math.abs(matrix[index] ?? 0)).toBeLessThanOrEqual(1);
			}
		}
	});

	test("keeps annotation layers inside the visible image", () => {
		const bounds = { height: 80, width: 100, x: 10, y: 20 };
		const text = constrainTextLayer(
			{
				color: "#fff",
				id: "text",
				rotation: 0,
				size: 24,
				value: "Hi",
				x: -100,
				y: 500,
			},
			bounds,
		);

		expect(text.x).toBe(34);
		expect(text.y).toBeCloseTo(83.8, 5);
		expect(pointInRect({ x: text.x, y: text.y }, bounds)).toBe(true);
	});

	test("scales a rotated image enough to cover the crop", () => {
		const constrained = constrainImageTransform(
			{
				flipX: false,
				rotation: Math.PI / 4,
				scale: 1,
				translateX: 500,
				translateY: -500,
			},
			{ height: 300, width: 300, x: 0, y: 0 },
			{ height: 300, width: 300, x: 0, y: 0 },
		);

		expect(constrained.scale).toBeCloseTo(Math.SQRT2, 5);
		expect(constrained.translateX).toBeCloseTo(0, 5);
		expect(constrained.translateY).toBeCloseTo(0, 5);
	});

	test("exports only the pixels represented by the crop and never upscales", () => {
		expect(
			exportSizeForCrop({
				cropRect: { height: 75, width: 100, x: 0, y: 0 },
				imageRect: { height: 150, width: 200, x: 0, y: 0 },
				imageScale: 1,
				maxLongEdge: 2048,
				sourceHeight: 300,
				sourceWidth: 400,
			}),
		).toEqual({ height: 150, scale: 2, width: 200 });
	});
});
