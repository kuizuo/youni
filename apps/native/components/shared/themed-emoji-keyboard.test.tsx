import { expect, mock, test } from "bun:test";

mock.module("heroui-native", () => ({
	useThemeColor: (names: string[]) => names.map((name) => `theme:${name}`),
}));
mock.module("rn-emoji-keyboard", () => ({ EmojiKeyboard: "EmojiKeyboard" }));

const { ThemedEmojiKeyboard } = await import("./themed-emoji-keyboard");

test("uses the active app theme instead of the emoji keyboard defaults", () => {
	const keyboard = ThemedEmojiKeyboard({ onEmojiSelected: () => {} });

	expect(keyboard.props.theme).toEqual({
		container: "theme:surface-secondary",
		header: "theme:muted",
		skinTonesContainer: "theme:surface-tertiary",
		category: {
			container: "theme:surface-secondary",
			containerActive: "theme:surface-tertiary",
			icon: "theme:foreground",
			iconActive: "theme:accent",
		},
		emoji: { selected: "theme:surface-tertiary" },
	});
});
