import { Button, Text } from "heroui-native";
import { View } from "react-native";

export type GenderValue = "female" | "male" | "unknown";

export function GenderSelector({
	value,
	onChange,
}: {
	value: GenderValue;
	onChange: (value: GenderValue) => void;
}) {
	return (
		<View className="gap-2">
			<Text.Paragraph type="body-sm" weight="semibold">
				性别
			</Text.Paragraph>
			<View className="flex-row rounded-full bg-content2 p-1">
				<GenderButton
					isActive={value === "unknown"}
					label="不展示"
					onPress={() => onChange("unknown")}
				/>
				<GenderButton
					isActive={value === "female"}
					label="女"
					onPress={() => onChange("female")}
				/>
				<GenderButton
					isActive={value === "male"}
					label="男"
					onPress={() => onChange("male")}
				/>
			</View>
		</View>
	);
}

function GenderButton({
	isActive,
	label,
	onPress,
}: {
	isActive: boolean;
	label: string;
	onPress: () => void;
}) {
	return (
		<Button
			size="sm"
			variant={isActive ? "primary" : "ghost"}
			className="h-9 flex-1 rounded-full"
			feedbackVariant="scale-ripple"
			onPress={onPress}
		>
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}
