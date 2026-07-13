import { describe, expect, mock, test } from "bun:test";
import type { ReactElement, ReactNode } from "react";

mock.module("react-native", () => ({
	Platform: { OS: "ios" },
	Text: "Text",
	TextInput: "TextInput",
	View: "View",
}));
mock.module("heroui-native", () => ({
	useThemeColor: (name: string) => (name === "link" ? "#006fee" : "#111111"),
}));

const { ContentEditor } = await import("./content-editor");
const { LinkedComposerInput } = await import("./linked-composer-input");

function findElement(
	node: ReactNode,
	type: string,
): ReactElement<Record<string, unknown>> {
	const found = findElementOrNull(node, type);
	if (found) return found;
	throw new Error(`Could not find ${type}`);
}

function findElementOrNull(
	node: ReactNode,
	type: string,
): ReactElement<Record<string, unknown>> | null {
	if (Array.isArray(node)) {
		for (const child of node) {
			const found = findElementOrNull(child, type);
			if (found) return found;
		}
		return null;
	}
	if (!node || typeof node !== "object" || !("type" in node)) return null;
	const element = node as ReactElement<Record<string, unknown>>;
	if (element.type === type) return element;
	return findElementOrNull(element.props.children as ReactNode, type);
}

function flattenStyle(style: unknown) {
	return (Array.isArray(style) ? style : [style]).reduce<
		Record<string, unknown>
	>(
		(result, item) =>
			item && typeof item === "object" ? Object.assign(result, item) : result,
		{},
	);
}

describe("create editor inputs", () => {
	test("renders the body placeholder, text, and cursor in the same input", () => {
		const emptyEditor = LinkedComposerInput({
			onChangeText: () => {},
			placeholder: "添加正文",
			placeholderTextColor: "#888888",
			value: "",
		});
		const filledEditor = LinkedComposerInput({
			onChangeText: () => {},
			placeholder: "添加正文",
			placeholderTextColor: "#888888",
			value: "正文",
		});
		const emptyInput = findElement(emptyEditor, "TextInput");
		const filledInput = findElement(filledEditor, "TextInput");

		expect(findElementOrNull(emptyEditor, "Text")).toBeNull();
		expect(emptyInput.props.placeholderTextColor).toBe("#888888");
		expect(flattenStyle(filledInput.props.style).color).toBe("#111111");
	});

	test("leaves the native cursor under the input's control while typing", () => {
		const editor = LinkedComposerInput({
			maxLength: 2000,
			onChangeText: () => {},
			onSelectionChange: () => {},
			placeholder: "添加正文",
			placeholderTextColor: "#888888",
			value: "正文",
		});
		const input = findElement(editor, "TextInput");

		expect("selection" in input.props).toBe(false);
	});

	test("keeps title text in the same vertically-centered input after typing", () => {
		const editor = ContentEditor({
			content: "",
			contentInputRef: { current: null },
			foregroundColor: "#111111",
			isEmojiInputLocked: false,
			mutedColor: "#888888",
			onContentChange: () => {},
			onContentFocus: () => {},
			onContentSelectionChange: () => {},
			onTitleChange: () => {},
			onTitleFocus: () => {},
			onTitleSelectionChange: () => {},
			title: "标题",
			titleInputRef: { current: null },
		});
		const input = findElement(editor, "TextInput");
		const style = flattenStyle(input.props.style);

		expect(style.color).toBe("#111111");
		expect(style.textAlignVertical).toBe("center");
		expect("selection" in input.props).toBe(false);
	});
});
