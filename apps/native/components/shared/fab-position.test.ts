import { describe, expect, test } from "bun:test";

import {
	getFABContentPosition,
	resolveFABAlign,
	resolveFABPlacement,
} from "./fab-position";

const screen = { height: 800, width: 400 };

describe("FAB positioning", () => {
	test("opens a bottom-right trigger upward and keeps content on screen", () => {
		const trigger = { height: 48, pageX: 336, pageY: 720, width: 48 };
		const placement = resolveFABPlacement("auto", trigger, screen);
		const align = resolveFABAlign("auto", placement, trigger, screen);

		expect(placement).toBe("top");
		expect(align).toBe("end");
		expect(
			getFABContentPosition({
				align,
				alignOffset: 0,
				content: { height: 160, width: 180 },
				insets: { bottom: 12, left: 12, right: 12, top: 12 },
				offset: 12,
				placement,
				screen,
				trigger,
			}),
		).toEqual({ left: 204, maxWidth: 376, top: 548 });
	});
});
