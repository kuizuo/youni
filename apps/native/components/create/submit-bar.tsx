import { Button, Spinner } from "heroui-native";
import { View } from "react-native";

import { ListDivider } from "./create-ui";

export function SubmitBar({
	bottomInset,
	isSubmitting,
	isUploadingImages,
	pendingSubmitMode,
	onPublish,
	onSaveDraft,
}: {
	bottomInset: number;
	isSubmitting: boolean;
	isUploadingImages: boolean;
	pendingSubmitMode: "draft" | "publish" | null;
	onPublish: () => void;
	onSaveDraft: () => void;
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
				<Button
					onPress={onSaveDraft}
					size="md"
					variant="outline"
					feedbackVariant="scale-ripple"
					isDisabled={isSubmitting}
					className="h-12 flex-1 rounded-full"
				>
					{pendingSubmitMode === "draft" || isUploadingImages ? (
						<Spinner size="sm" />
					) : null}
					<Button.Label>存草稿</Button.Label>
				</Button>
				<Button
					onPress={onPublish}
					size="md"
					variant="primary"
					feedbackVariant="scale-ripple"
					isDisabled={isSubmitting}
					className="h-12 flex-[2] rounded-full"
				>
					{pendingSubmitMode === "publish" || isUploadingImages ? (
						<Spinner size="sm" />
					) : null}
					<Button.Label>发布笔记</Button.Label>
				</Button>
			</View>
		</View>
	);
}
