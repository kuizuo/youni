import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback, useThemeColor } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import {
	GestureHandlerRootView,
	ScrollView,
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
	DropProvider,
	SortableDirection,
	SortableItem,
	useHorizontalSortableList,
} from "react-native-reanimated-dnd";
import { runOnUIAsync } from "react-native-worklets";
import type { MediaImage } from "@/lib/media/types";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { synchronizeSortableItems } from "./media-strip-state";
import { MediaTile } from "./media-tile";

const MEDIA_TILE_SIZE = 88;
const MEDIA_TILE_GAP = 10;
const PAGE_HORIZONTAL_PADDING = 32;
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function SortableMediaItems({
	images,
	isDisabled,
	maxItems,
	onAddImage,
	onEditImage,
	onMoveImage,
	onRemoveImage,
	loadedImageUris,
	onImageLoaded,
}: {
	images: MediaImage[];
	isDisabled: boolean;
	maxItems: number;
	onAddImage: () => void;
	onEditImage: (image: MediaImage) => void;
	onMoveImage: (imageId: string, toIndex: number) => void;
	onRemoveImage: (id: string) => void;
	loadedImageUris: Set<string>;
	onImageLoaded: (uri: string) => void;
}) {
	const { width: windowWidth } = useWindowDimensions();
	const mutedColor = useThemeColor("muted");
	const [containerWidth, setContainerWidth] = useState(
		Math.max(1, windowWidth - PAGE_HORIZONTAL_PADDING),
	);
	const [renderedImages, setRenderedImages] = useState(images);
	const synchronizationVersionRef = useRef(0);
	const {
		autoScroll,
		contentWidth,
		dropProviderRef,
		getItemProps,
		handleScroll,
		handleScrollEnd,
		positions,
		scrollViewRef,
	} = useHorizontalSortableList({
		data: renderedImages,
		gap: MEDIA_TILE_GAP,
		itemWidth: MEDIA_TILE_SIZE,
	});

	useEffect(() => {
		const version = synchronizationVersionRef.current + 1;
		synchronizationVersionRef.current = version;
		void synchronizeSortableItems(
			images,
			(nextPositions) => {
				if (Platform.OS === "web") {
					positions.value = nextPositions;
					return;
				}
				return runOnUIAsync(
					(sharedPositions, values) => {
						"worklet";
						sharedPositions.value = values;
					},
					positions,
					nextPositions,
				);
			},
			(nextImages) => {
				if (synchronizationVersionRef.current === version) {
					setRenderedImages(nextImages);
				}
			},
		);
		return () => {
			if (synchronizationVersionRef.current === version) {
				synchronizationVersionRef.current += 1;
			}
		};
	}, [images, positions]);

	const showAddButton = renderedImages.length < maxItems;
	const addButtonLeft =
		contentWidth + (renderedImages.length > 0 ? MEDIA_TILE_GAP : 0);
	const totalContentWidth =
		contentWidth +
		(showAddButton
			? (renderedImages.length > 0 ? MEDIA_TILE_GAP : 0) + MEDIA_TILE_SIZE
			: 0);

	return (
		<GestureHandlerRootView
			onLayout={(event) => {
				const nextWidth = Math.round(event.nativeEvent.layout.width);
				if (nextWidth > 0 && nextWidth !== containerWidth) {
					setContainerWidth(nextWidth);
				}
			}}
			style={{ height: MEDIA_TILE_SIZE }}
		>
			<DropProvider ref={dropProviderRef}>
				<AnimatedScrollView
					ref={scrollViewRef}
					horizontal
					contentContainerStyle={{
						height: MEDIA_TILE_SIZE,
						width: Math.max(totalContentWidth, containerWidth),
					}}
					keyboardShouldPersistTaps="handled"
					onMomentumScrollEnd={handleScrollEnd}
					onScroll={handleScroll}
					onScrollEndDrag={handleScrollEnd}
					scrollEventThrottle={16}
					showsHorizontalScrollIndicator={false}
					simultaneousHandlers={dropProviderRef}
					style={{ height: MEDIA_TILE_SIZE }}
				>
					{showAddButton ? (
						<View
							style={{
								height: MEDIA_TILE_SIZE,
								left: addButtonLeft,
								position: "absolute",
								top: 0,
								width: MEDIA_TILE_SIZE,
							}}
						>
							<PressableFeedback
								accessibilityLabel="添加图片"
								accessibilityRole="button"
								isDisabled={isDisabled}
								onPress={onAddImage}
								className="h-full w-full items-center justify-center rounded-xl border border-border bg-content2"
							>
								<Ionicons name="add" size={42} color={mutedColor} />
							</PressableFeedback>
						</View>
					) : null}

					{renderedImages.map((image, index) => {
						const itemProps = getItemProps(image, index);
						return (
							<SortableItem
								key={`${image.id}:${containerWidth}`}
								{...itemProps}
								autoScrollHorizontalDirection={autoScroll}
								containerWidth={containerWidth}
								data={image}
								direction={SortableDirection.Horizontal}
								onDragStart={() => fireHaptic()}
								onDrop={(imageId, toIndex) => onMoveImage(imageId, toIndex)}
								style={{ height: MEDIA_TILE_SIZE, width: MEDIA_TILE_SIZE }}
							>
								<MediaTile
									image={image}
									initiallyLoaded={loadedImageUris.has(image.uri)}
									label={`第 ${index + 1} 张图片`}
									onEdit={() => onEditImage(image)}
									onLoad={() => onImageLoaded(image.uri)}
									onRemove={() => onRemoveImage(image.id)}
								/>
							</SortableItem>
						);
					})}
				</AnimatedScrollView>
			</DropProvider>
		</GestureHandlerRootView>
	);
}

export function SortableMediaStrip({
	images,
	isDisabled,
	maxItems,
	onAddImage,
	onEditImage,
	onMoveImage,
	onRemoveImage,
}: {
	images: MediaImage[];
	isDisabled: boolean;
	maxItems: number;
	onAddImage: () => void;
	onEditImage: (image: MediaImage) => void;
	onMoveImage: (imageId: string, toIndex: number) => void;
	onRemoveImage: (id: string) => void;
}) {
	const loadedImageUrisRef = useRef(new Set<string>());

	return (
		<SortableMediaItems
			images={images}
			isDisabled={isDisabled}
			loadedImageUris={loadedImageUrisRef.current}
			maxItems={maxItems}
			onAddImage={onAddImage}
			onEditImage={onEditImage}
			onMoveImage={onMoveImage}
			onRemoveImage={onRemoveImage}
			onImageLoaded={(uri) => loadedImageUrisRef.current.add(uri)}
		/>
	);
}
