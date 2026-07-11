import { drawAsImage, Group, type SkImage } from "@shopify/react-native-skia";

import { EditorSkiaScene } from "./editor-canvas";
import type { EditorSnapshot, RectModel } from "./types";
import { makeExportSize } from "./utils";

type RenderEditorExportOptions = {
	canvasSize: { height: number; width: number };
	cropRect: RectModel;
	editorState: EditorSnapshot;
	imageRect: RectModel;
	sourceImage: SkImage;
};

export async function renderEditorExport({
	canvasSize,
	cropRect,
	editorState,
	imageRect,
	sourceImage,
}: RenderEditorExportOptions) {
	const exportSize = makeExportSize(cropRect, sourceImage);
	if (!exportSize) {
		throw new Error("图片导出失败");
	}

	return drawAsImage(
		<Group transform={[{ scale: exportSize.scale }]}>
			<Group
				transform={[{ translateX: -cropRect.x }, { translateY: -cropRect.y }]}
			>
				<EditorSkiaScene
					canvasSize={canvasSize}
					editorState={editorState}
					imageRect={imageRect}
					sourceImage={sourceImage}
				/>
			</Group>
		</Group>,
		{ height: exportSize.height, width: exportSize.width },
	);
}
