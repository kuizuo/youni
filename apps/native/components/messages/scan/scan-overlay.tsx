import { Typography } from "heroui-native";

export function ScanOverlay({ mutedColor }: { mutedColor: string }) {
	return (
		<Typography.Paragraph
			type="body-xs"
			align="center"
			color="muted"
			className="absolute right-0 bottom-2 left-0"
			style={{ color: mutedColor }}
		>
			Youni 扫一扫
		</Typography.Paragraph>
	);
}
