import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback } from "heroui-native";
import { ScrollView } from "react-native";
import type { ComposerImage } from "./create-types";
import { MediaTile } from "./create-ui";

export function MediaStrip({
	images,
	isAddingImages,
	mutedColor,
	onAddImage,
	onEditImage,
	onRemoveImage,
}: {
	images: ComposerImage[];
	isAddingImages: boolean;
	mutedColor: string;
	onAddImage: () => void;
	onEditImage: (image: ComposerImage) => void;
	onRemoveImage: (id: string) => void;
}) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerClassName="gap-2.5 pr-4"
		>
			{images.map((image, index) => (
				<MediaTile
					key={image.id}
					image={image}
					label={`第 ${index + 1} 张图片`}
					onEdit={() => onEditImage(image)}
					onRemove={() => onRemoveImage(image.id)}
				/>
			))}
			{images.length < 9 ? (
				<PressableFeedback
					accessibilityLabel="添加图片"
					accessibilityRole="button"
					isDisabled={isAddingImages}
					onPress={onAddImage}
					className="h-22 w-22 items-center justify-center rounded-xl border border-border bg-content2"
				>
					<Ionicons name="add" size={42} color={mutedColor} />
				</PressableFeedback>
			) : null}
		</ScrollView>
	);
}
