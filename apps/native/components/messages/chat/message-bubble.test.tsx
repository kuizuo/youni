import { expect, mock, test } from "bun:test";
import type { ReactElement, ReactNode } from "react";

const React = await import("react");

mock.module("react", () => ({
	...React,
	useRef: (value: unknown) => ({ current: value }),
	useState: (value: unknown) => [value, () => {}],
}));
mock.module("react-native", () => ({
	View: "View",
	useWindowDimensions: () => ({ width: 400 }),
}));
mock.module("@expo/vector-icons", () => ({ Ionicons: "Ionicons" }));
mock.module("@/lib/utils/fire-haptic", () => ({ fireHaptic: () => {} }));
mock.module("heroui-native", () => {
	const Menu = Object.assign(() => null, {
		Content: "MenuContent",
		Item: "MenuItem",
		ItemTitle: "MenuItemTitle",
		Overlay: "MenuOverlay",
		Portal: "MenuPortal",
		Trigger: "MenuTrigger",
	});
	return {
		cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
		Menu,
		PressableFeedback: "PressableFeedback",
		Typography: { Paragraph: "Paragraph" },
		useThemeColor: (name: string) => name,
	};
});

const { MessageBubble } = await import("./message-bubble");

function findBubble(node: ReactNode): ReactElement<Record<string, unknown>> {
	if (Array.isArray(node)) {
		for (const child of node) {
			try {
				return findBubble(child);
			} catch {}
		}
	}
	if (node && typeof node === "object" && "type" in node) {
		const element = node as ReactElement<Record<string, unknown>>;
		if (
			element.type === "View" &&
			typeof element.props.className === "string" &&
			element.props.className.includes("rounded-3xl")
		)
			return element;
		return findBubble(element.props.children as ReactNode);
	}
	throw new Error("Message bubble not found");
}

test.each([
	"hello",
	"😄",
	"这是一条会在达到最大宽度后正常换行的较长消息",
])("keeps %s readable within the message list", (content) => {
	const bubble = findBubble(
		MessageBubble({
			isMine: true,
			item: {
				content,
				createdAt: new Date("2026-07-22T01:18:00.000Z"),
				id: content,
				senderId: "me",
			},
			onCopy: () => {},
			onDelete: () => {},
		}),
	);

	expect(bubble.props.style).toEqual({ maxWidth: 287.04 });
	expect(bubble.props.className).not.toContain("max-w-[78%]");
});
