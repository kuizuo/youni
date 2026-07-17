import { Ionicons } from "@expo/vector-icons";
import { Button, PressableFeedback } from "heroui-native";
import { View } from "react-native";

import { APP_HEADER_ICON_SIZE } from "@/components/shared/app-header";

export function CreateHeader({
	mutedColor,
	onBack,
	onCreateTextImage,
	onOpenDrafts,
	showDrafts,
	showTextImage,
}: {
	mutedColor: string;
	onBack: () => void;
	onCreateTextImage: () => void;
	onOpenDrafts: () => void;
	showDrafts: boolean;
	showTextImage: boolean;
}) {
	return (
		<View className="h-14 flex-row items-center justify-between px-4">
			<PressableFeedback
				accessibilityLabel="返回"
				accessibilityRole="button"
				hitSlop={10}
				onPress={onBack}
				className="h-11 w-11 items-center justify-center rounded-full"
			>
				<Ionicons
					name="chevron-back"
					size={APP_HEADER_ICON_SIZE}
					color={mutedColor}
				/>
			</PressableFeedback>
			<View className="flex-row items-center gap-1">
				{showTextImage ? (
					<Button
						accessibilityLabel="生成文字图片"
						className="h-10 rounded-full px-2.5"
						feedbackVariant="scale-ripple"
						onPress={onCreateTextImage}
						size="sm"
						variant="ghost"
					>
						<Ionicons name="text-outline" size={17} color={mutedColor} />
						<Button.Label>文字图</Button.Label>
					</Button>
				) : null}
				{showDrafts ? (
					<Button
						accessibilityLabel="打开我的草稿"
						className="h-10 rounded-full px-3"
						feedbackVariant="scale-ripple"
						onPress={onOpenDrafts}
						size="sm"
						variant="ghost"
					>
						<Button.Label>草稿</Button.Label>
					</Button>
				) : null}
			</View>
		</View>
	);
}
