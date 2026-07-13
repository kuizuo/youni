import type { UserGender } from "@youni/api/contracts/shared";
import { Button, Typography } from "heroui-native";
import { View } from "react-native";

export function GenderSelector({
	value,
	onChange,
}: {
	value: UserGender;
	onChange: (value: UserGender) => void;
}) {
	return (
		<View className="gap-2">
			<Typography.Paragraph type="body-sm" weight="semibold">
				性别
			</Typography.Paragraph>
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
