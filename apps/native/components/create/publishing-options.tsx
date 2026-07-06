import type { Ionicons } from "@expo/vector-icons";
import { ListGroup } from "heroui-native";
import { View } from "react-native";

import { ListDivider, SettingsListItem } from "./create-ui";

const OPTION_ROWS = [
	{ key: "visibility", label: "公开可见", icon: "lock-open-outline" },
	{ key: "advanced", label: "高级选项", icon: "settings-outline" },
] as const;

export function PublishingOptions({
	advancedLabel,
	defaultForegroundColor,
	mutedColor,
	visibilityLabel,
	onAdvancedPress,
	onVisibilityPress,
}: {
	advancedLabel: string;
	defaultForegroundColor: string;
	mutedColor: string;
	visibilityLabel: string;
	onAdvancedPress: () => void;
	onVisibilityPress: () => void;
}) {
	return (
		<ListGroup variant="secondary" className="overflow-hidden rounded-2xl">
			{OPTION_ROWS.map((row, index) => (
				<View key={row.key}>
					<SettingsListItem
						icon={row.icon as keyof typeof Ionicons.glyphMap}
						label={row.label}
						value={row.key === "visibility" ? visibilityLabel : advancedLabel}
						foregroundColor={defaultForegroundColor}
						mutedColor={mutedColor}
						onPress={
							row.key === "visibility" ? onVisibilityPress : onAdvancedPress
						}
					/>
					{index < OPTION_ROWS.length - 1 ? <ListDivider /> : null}
				</View>
			))}
		</ListGroup>
	);
}
