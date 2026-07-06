import { Text } from "heroui-native";
import { View } from "react-native";

export function ScanOverlay({
	bottomInset,
	mutedColor,
	topInset,
}: {
	bottomInset: number;
	mutedColor: string;
	topInset: number;
}) {
	return (
		<>
			<View
				pointerEvents="none"
				className="absolute right-0 left-0 h-40 bg-black/70"
				style={{ top: topInset + 72 }}
			/>
			<View
				pointerEvents="none"
				className="absolute right-0 left-0 h-40 bg-black/70"
				style={{ bottom: bottomInset + 220 }}
			/>
			<Text.Paragraph
				type="body-xs"
				align="center"
				color="muted"
				className="absolute right-0 bottom-2 left-0"
				style={{ color: mutedColor }}
			>
				Youni 扫一扫
			</Text.Paragraph>
		</>
	);
}
