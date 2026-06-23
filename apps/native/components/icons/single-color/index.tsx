import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";
import { withUniwind } from "uniwind";

import { DEFAULT_ICON_SIZE, type IconProps } from "@/lib/types/icons";

const StyledIonicons = withUniwind(Ionicons);

const SINGLE_COLOR_ICONS = {
	home: "home-outline",
	"home-fill": "home",
	search: "search-outline",
	"search-fill": "search",
	message: "chatbubble-ellipses-outline",
	"message-fill": "chatbubble-ellipses",
	create: "add-circle-outline",
	"create-fill": "add-circle",
	user: "person-outline",
	"user-fill": "person",
	sparkles: "sparkles-outline",
	"sparkles-fill": "sparkles",
	sun: "sunny-outline",
	moon: "moon-outline",
	display: "phone-portrait-outline",
	gear: "settings-outline",
} as const satisfies Record<string, keyof typeof Ionicons.glyphMap>;

export type SingleColorIconName = keyof typeof SINGLE_COLOR_ICONS;

type SingleColorIconProps = IconProps & {
	colorClassName?: string;
	name: SingleColorIconName;
};

export function SingleColorIcon({
	color,
	colorClassName,
	name,
	size = DEFAULT_ICON_SIZE,
}: SingleColorIconProps) {
	const foregroundColor = useThemeColor("foreground");
	const iconName = SINGLE_COLOR_ICONS[name];

	if (color) {
		return <Ionicons name={iconName} size={size} color={color} />;
	}

	return (
		<StyledIonicons
			name={iconName}
			size={size}
			color={foregroundColor}
			className={colorClassName ?? "text-foreground"}
		/>
	);
}
