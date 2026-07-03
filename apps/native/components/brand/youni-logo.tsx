import { Image } from "expo-image";

const younMark = require("../../assets/images/youni-mark.png");
const younLogo = require("../../assets/images/youni-logo.png");

type YouniMarkProps = {
	size?: number;
};

type YouniLogoProps = {
	height?: number;
};

export function YouniMark({ size = 48 }: YouniMarkProps) {
	return (
		<Image
			accessibilityLabel="Youni"
			contentFit="contain"
			source={younMark}
			style={{ height: size, width: size }}
		/>
	);
}

export function YouniLogo({ height = 48 }: YouniLogoProps) {
	return (
		<Image
			accessibilityLabel="Youni"
			contentFit="contain"
			source={younLogo}
			style={{ height, width: Math.round(height * 4.4) }}
		/>
	);
}
