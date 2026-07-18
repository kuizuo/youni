export type FABAlign = "center" | "end" | "start";
export type FABPlacement = "bottom" | "left" | "right" | "top";
export type FABAutoAlign = FABAlign | "auto";
export type FABAutoPlacement = FABPlacement | "auto";

export type FABInsets = {
	bottom?: number;
	left?: number;
	right?: number;
	top?: number;
};

export type FABRectangle = {
	height: number;
	width: number;
};

export type FABTriggerPosition = FABRectangle & {
	pageX: number;
	pageY: number;
};

export type FABScreenSize = {
	height: number;
	width: number;
};

export function resolveFABPlacement(
	placement: FABAutoPlacement,
	trigger: FABTriggerPosition | null,
	screen: FABScreenSize,
): FABPlacement {
	if (placement !== "auto") return placement;
	if (!trigger) return "top";
	return trigger.pageY + trigger.height / 2 > screen.height / 2
		? "top"
		: "bottom";
}

export function resolveFABAlign(
	align: FABAutoAlign,
	placement: FABPlacement,
	trigger: FABTriggerPosition | null,
	screen: FABScreenSize,
): FABAlign {
	if (align !== "auto") return align;
	if (!trigger) return "end";

	const isVertical = placement === "top" || placement === "bottom";
	const center = isVertical
		? trigger.pageX + trigger.width / 2
		: trigger.pageY + trigger.height / 2;
	const size = isVertical ? screen.width : screen.height;

	if (center < size / 3) return "start";
	if (center > (size * 2) / 3) return "end";
	return "center";
}

export function getFABContentPosition({
	align,
	alignOffset,
	avoidCollisions = true,
	content,
	insets,
	offset,
	placement,
	screen,
	trigger,
}: {
	align: FABAlign;
	alignOffset: number;
	avoidCollisions?: boolean;
	content: FABRectangle;
	insets: FABInsets;
	offset: number;
	placement: FABPlacement;
	screen: FABScreenSize;
	trigger: FABTriggerPosition;
}) {
	const topInset = insets.top ?? 0;
	const bottomInset = insets.bottom ?? 0;
	const leftInset = insets.left ?? 0;
	const rightInset = insets.right ?? 0;
	const maxLeft = screen.width - rightInset - content.width;
	const maxTop = screen.height - bottomInset - content.height;
	const clampLeft = (value: number) =>
		avoidCollisions ? Math.max(leftInset, Math.min(maxLeft, value)) : value;
	const clampTop = (value: number) =>
		avoidCollisions ? Math.max(topInset, Math.min(maxTop, value)) : value;

	if (placement === "top" || placement === "bottom") {
		const top =
			placement === "top"
				? trigger.pageY - offset - content.height
				: trigger.pageY + trigger.height + offset;
		const left =
			align === "start"
				? trigger.pageX
				: align === "center"
					? trigger.pageX + trigger.width / 2 - content.width / 2
					: trigger.pageX + trigger.width - content.width;

		return {
			left: clampLeft(left + alignOffset),
			maxWidth: screen.width - leftInset - rightInset,
			top: clampTop(top),
		};
	}

	const left =
		placement === "left"
			? trigger.pageX - offset - content.width
			: trigger.pageX + trigger.width + offset;
	const top =
		align === "start"
			? trigger.pageY
			: align === "center"
				? trigger.pageY + trigger.height / 2 - content.height / 2
				: trigger.pageY + trigger.height - content.height;

	return {
		left: clampLeft(left),
		maxHeight: screen.height - topInset - bottomInset,
		maxWidth: screen.width - leftInset - rightInset,
		top: clampTop(top + alignOffset),
	};
}
