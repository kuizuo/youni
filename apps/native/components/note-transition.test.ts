import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { startNoteViewTransition } from "../lib/note-view-transition";

const cardSource = readFileSync(
	new URL("./note-card.tsx", import.meta.url),
	"utf8",
);
const detailSource = readFileSync(
	new URL("./notes/note-detail-screen.tsx", import.meta.url),
	"utf8",
);
const layoutSource = readFileSync(
	new URL("../app/_layout.tsx", import.meta.url),
	"utf8",
);

describe("note zoom transition", () => {
	test("zooms the whole card and detail instead of a detached cover", () => {
		const triggerStart = cardSource.indexOf("<Link.Trigger withAppleZoom>");
		const triggerEnd = cardSource.indexOf("</Link.Trigger>", triggerStart);
		const cardFooter = cardSource.indexOf("<Card.Footer", triggerStart);

		expect(cardSource).toContain("<Link.Trigger withAppleZoom>");
		expect(cardFooter).toBeLessThan(triggerEnd);
		expect(cardSource).toContain("style={transitionStyle}");
		expect(cardSource).not.toContain("<Link.AppleZoom>");
		expect(detailSource).toContain(
			"style={[webFallbackStyle, transitionStyle]}",
		);
		expect(detailSource).not.toContain("<Link.AppleZoomTarget>");
	});

	test("does not block native interaction while the note closes", () => {
		expect(layoutSource).not.toContain("isNoteClosing");
		expect(layoutSource).not.toContain("onStartShouldSetResponder");
		expect(startNoteViewTransition(() => {})).toBe(false);
	});
});
