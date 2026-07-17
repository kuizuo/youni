import { Button, Spinner } from "heroui-native";
import { View } from "react-native";

import { ListDivider } from "./create-ui";

export function SubmitBar({
	bottomInset,
	isSubmitting,
	pendingSubmitMode,
	onPublish,
	onSaveDraft,
	publishLabel = "发布笔记",
	showSaveDraft = true,
}: {
	bottomInset: number;
	isSubmitting: boolean;
	pendingSubmitMode: "draft" | "publish" | null;
	onPublish: () => void;
	onSaveDraft: () => void;
	publishLabel?: string;
	showSaveDraft?: boolean;
}) {
	return (
		<View
			className="bg-background"
			style={{
				paddingBottom: bottomInset + 10,
			}}
		>
			<ListDivider />
			<View className="flex-row items-center gap-2 px-4 pt-2.5">
				{showSaveDraft ? (
					<Button
						onPress={onSaveDraft}
						size="md"
						variant="outline"
						feedbackVariant="scale-ripple"
						isDisabled={isSubmitting}
						className="h-12 flex-1 rounded-full"
					>
						{pendingSubmitMode === "draft" ? <Spinner size="sm" /> : null}
						<Button.Label>存草稿</Button.Label>
					</Button>
				) : null}
				<Button
					onPress={onPublish}
					size="md"
					variant="primary"
					feedbackVariant="scale-ripple"
					isDisabled={isSubmitting}
					className={
						showSaveDraft
							? "h-12 flex-[2] rounded-full"
							: "h-12 flex-1 rounded-full"
					}
				>
					<Button.Label>{publishLabel}</Button.Label>
				</Button>
			</View>
		</View>
	);
}
