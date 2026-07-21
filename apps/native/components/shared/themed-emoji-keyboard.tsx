import { useThemeColor } from "heroui-native";
import { EmojiKeyboard, type EmojiType } from "rn-emoji-keyboard";

export function ThemedEmojiKeyboard({
	disableSafeArea,
	onEmojiSelected,
}: {
	disableSafeArea?: boolean;
	onEmojiSelected: (emoji: EmojiType) => void;
}) {
	const [container, selected, foreground, muted, accent] = useThemeColor([
		"surface-secondary",
		"surface-tertiary",
		"foreground",
		"muted",
		"accent",
	]);

	return (
		<EmojiKeyboard
			onEmojiSelected={onEmojiSelected}
			categoryPosition="bottom"
			disableSafeArea={disableSafeArea}
			enableSearchBar={false}
			allowMultipleSelections
			theme={{
				container,
				header: muted,
				skinTonesContainer: selected,
				category: {
					container,
					containerActive: selected,
					icon: foreground,
					iconActive: accent,
				},
				emoji: { selected },
			}}
		/>
	);
}
