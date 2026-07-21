import {
	ImageFormat,
	type SkImage,
	useCanvasRef,
} from "@shopify/react-native-skia";
import { NOTE_IMAGE_MAX_SIZE_BYTES } from "@youni/api/lib/notes/image-identity";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Modal,
	Platform,
	useWindowDimensions,
	View,
} from "react-native";
import {
	type ComposedGesture,
	Gesture,
	type GestureType,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { MediaImage } from "@/lib/media/types";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { EditorCanvas } from "./editor-canvas";
import { EditorBottomControls, EditorTopBar } from "./editor-controls";
import { renderEditorExport } from "./export-renderer";
import {
	constrainImageTransform,
	constrainTextLayer,
	pointInRect,
} from "./image-effects";
import type {
	AdjustmentKey,
	CropDragMode,
	CropRatio,
	EditorSnapshot,
	EditorTool,
	FilterPreset,
	ImageLoadStatus,
	Point,
	RectModel,
	TextLayer,
	TransformModel,
} from "./types";
import {
	BRUSH_COLORS,
	clamp,
	deleteLocalFile,
	getCropDragMode,
	initialTransform,
	loadEditorImage,
	makeCenteredCropRect,
	makeExportSize,
	makeInitialSnapshot,
	pointInText,
	rectsEqual,
	resizeCropRect,
	TEXT_COLORS,
	writeJpegBase64,
} from "./utils";

type ImageEditorProps = {
	image: MediaImage;
	onCancel: () => void;
	onSave: (editedImage: MediaImage) => void;
};

type HistoryEntry = {
	snapshot: EditorSnapshot;
	sourceImage: SkImage;
	sourceRevision: number;
};

function snapshotsEqual(a: unknown, b: unknown) {
	return JSON.stringify(a) === JSON.stringify(b);
}

function imageOutputSnapshot(snapshot: EditorSnapshot) {
	return {
		...snapshot,
		cropRect: snapshot.cropDirty ? snapshot.cropRect : null,
		selectedTextId: null,
		texts: snapshot.texts.filter((text) => text.value.trim().length > 0),
	};
}

function outputSnapshotsEqual(a: EditorSnapshot, b: EditorSnapshot) {
	return snapshotsEqual(imageOutputSnapshot(a), imageOutputSnapshot(b));
}

function hasVisibleEdits(snapshot: EditorSnapshot) {
	return (
		snapshot.cropDirty ||
		snapshot.adjustments.brightness !== 0 ||
		snapshot.adjustments.contrast !== 0 ||
		snapshot.adjustments.saturation !== 0 ||
		snapshot.adjustments.warmth !== 0 ||
		snapshot.filter !== "original" ||
		snapshot.blurStrokes.length > 0 ||
		snapshot.strokes.length > 0 ||
		snapshot.texts.some((text) => text.value.trim().length > 0)
	);
}

export function ImageEditor({ image, onCancel, onSave }: ImageEditorProps) {
	const canvasRef = useCanvasRef();
	const insets = useSafeAreaInsets();
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const { toast } = useAppToast();
	const [sourceImage, setSourceImage] = useState<null | SkImage>(null);
	const [originalImage, setOriginalImage] = useState<null | SkImage>(null);
	const [imageLoadStatus, setImageLoadStatus] =
		useState<ImageLoadStatus>("loading");
	const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
	const [editorState, setEditorState] = useState<EditorSnapshot>(() =>
		makeInitialSnapshot(),
	);
	const [past, setPast] = useState<HistoryEntry[]>([]);
	const [future, setFuture] = useState<HistoryEntry[]>([]);
	const [tool, setTool] = useState<EditorTool | null>(null);
	const [editingTextId, setEditingTextId] = useState<null | string>(null);
	const [textFocusKey, setTextFocusKey] = useState(0);
	const [textColor, setTextColor] = useState<string>(TEXT_COLORS[0]);
	const [textSize, setTextSize] = useState(24);
	const [brushColor, setBrushColor] = useState<string>(BRUSH_COLORS[0]);
	const [brushWidth, setBrushWidth] = useState(6);
	const [blurWidth, setBlurWidth] = useState(30);
	const [isSaving, setIsSaving] = useState(false);
	const [isApplyingTool, setIsApplyingTool] = useState(false);
	const [showOriginal, setShowOriginal] = useState(false);
	const [sourceRevision, setSourceRevision] = useState(0);
	const [hasPendingToolChanges, setHasPendingToolChangesState] =
		useState(false);
	const editorStateRef = useRef(editorState);
	const sourceImageRef = useRef<null | SkImage>(null);
	const sourceRevisionRef = useRef(0);
	const hasPendingToolChangesRef = useRef(false);
	const originalEditorStateRef = useRef(editorState);
	const originalSourceRevisionRef = useRef(0);
	const toolDraftBaseRef = useRef(editorState);
	const toolRef = useRef<EditorTool | null>(tool);
	const textColorRef = useRef(textColor);
	const brushColorRef = useRef(brushColor);
	const brushWidthRef = useRef(brushWidth);
	const blurWidthRef = useRef(blurWidth);
	const gestureStartStateRef = useRef<EditorSnapshot | null>(null);
	const transformStartRef = useRef<TransformModel>(initialTransform);
	const dragOffsetRef = useRef<Point>({ x: 0, y: 0 });
	const dragStartRef = useRef<Point>({ x: 0, y: 0 });
	const cropStartRectRef = useRef<RectModel>({
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	});
	const cropDragModeRef = useRef<CropDragMode | null>(null);
	const activeLayerIdRef = useRef<null | string>(null);
	const textGestureStartRef = useRef<{
		id: string;
		rotation: number;
		size: number;
	} | null>(null);
	const sourceRatio = sourceImage
		? sourceImage.width() / sourceImage.height()
		: 1;

	const loadSourceImage = useCallback(async () => {
		setImageLoadStatus("loading");
		setSourceImage(null);
		originalSourceRevisionRef.current = 0;
		sourceRevisionRef.current = 0;
		setSourceRevision(0);
		try {
			const decodedImage = await loadEditorImage(image.uri);
			const decodedOriginal =
				image.originalUri && image.originalUri !== image.uri
					? await loadEditorImage(image.originalUri)
					: decodedImage;
			setOriginalImage(decodedOriginal);
			sourceImageRef.current = decodedImage;
			setSourceImage(decodedImage);
			setImageLoadStatus("ready");
		} catch {
			setImageLoadStatus("error");
		}
	}, [image.originalUri, image.uri]);

	useEffect(() => {
		void loadSourceImage();
	}, [loadSourceImage]);

	useEffect(() => {
		editorStateRef.current = editorState;
	}, [editorState]);

	useEffect(() => {
		sourceImageRef.current = sourceImage;
	}, [sourceImage]);

	useEffect(() => {
		sourceRevisionRef.current = sourceRevision;
	}, [sourceRevision]);

	useEffect(() => {
		toolRef.current = tool;
	}, [tool]);

	useEffect(() => {
		textColorRef.current = textColor;
	}, [textColor]);

	useEffect(() => {
		brushColorRef.current = brushColor;
	}, [brushColor]);

	useEffect(() => {
		brushWidthRef.current = brushWidth;
	}, [brushWidth]);

	useEffect(() => {
		blurWidthRef.current = blurWidth;
	}, [blurWidth]);

	const imageRect = useMemo<RectModel>(() => {
		if (!sourceImage || canvasSize.width <= 0 || canvasSize.height <= 0) {
			return { height: canvasSize.height, width: canvasSize.width, x: 0, y: 0 };
		}

		const imageRatio = sourceImage.width() / sourceImage.height();
		const canvasRatio = canvasSize.width / canvasSize.height;
		let width = canvasSize.width;
		let height = canvasSize.height;

		if (imageRatio > canvasRatio) {
			height = width / imageRatio;
		} else {
			width = height * imageRatio;
		}

		return {
			height,
			width,
			x: (canvasSize.width - width) / 2,
			y: (canvasSize.height - height) / 2,
		};
	}, [canvasSize.height, canvasSize.width, sourceImage]);

	const setEditorStateAndRef = useCallback(
		(
			updater: EditorSnapshot | ((current: EditorSnapshot) => EditorSnapshot),
		) => {
			setEditorState((current) => {
				const next = typeof updater === "function" ? updater(current) : updater;
				editorStateRef.current = next;
				return next;
			});
		},
		[],
	);

	const setHasPendingToolChanges = useCallback((value: boolean) => {
		hasPendingToolChangesRef.current = value;
		setHasPendingToolChangesState(value);
	}, []);

	const resetToolDraftBase = useCallback((snapshot: EditorSnapshot) => {
		toolDraftBaseRef.current = snapshot;
	}, []);

	const resetOriginalEditorState = useCallback((snapshot: EditorSnapshot) => {
		originalEditorStateRef.current = snapshot;
	}, []);

	const currentHistoryEntry = useCallback(
		(snapshot = editorStateRef.current): HistoryEntry | null => {
			const currentSourceImage = sourceImageRef.current;
			if (!currentSourceImage) return null;
			return {
				snapshot,
				sourceImage: currentSourceImage,
				sourceRevision: sourceRevisionRef.current,
			};
		},
		[],
	);

	const restoreHistoryEntry = useCallback(
		(entry: HistoryEntry) => {
			sourceImageRef.current = entry.sourceImage;
			setSourceImage(entry.sourceImage);
			sourceRevisionRef.current = entry.sourceRevision;
			setSourceRevision(entry.sourceRevision);
			setEditorStateAndRef(entry.snapshot);
			resetToolDraftBase(entry.snapshot);
		},
		[resetToolDraftBase, setEditorStateAndRef],
	);

	const clearToolInteractionState = useCallback(() => {
		gestureStartStateRef.current = null;
		activeLayerIdRef.current = null;
		cropDragModeRef.current = null;
		textGestureStartRef.current = null;
	}, []);

	const stageEditorState = useCallback(
		(next: EditorSnapshot) => {
			setEditorStateAndRef(next);
			setHasPendingToolChanges(
				!outputSnapshotsEqual(toolDraftBaseRef.current, next),
			);
		},
		[setEditorStateAndRef, setHasPendingToolChanges],
	);

	useEffect(() => {
		if (imageRect.width <= 0 || imageRect.height <= 0) return;
		setEditorStateAndRef((current) => {
			if (current.cropDirty || rectsEqual(current.cropRect, imageRect)) {
				return current;
			}
			const next = {
				...current,
				cropRect: imageRect,
			};
			if (!hasPendingToolChangesRef.current) {
				if (past.length === 0) {
					resetOriginalEditorState(next);
				}
				resetToolDraftBase(next);
			}
			return next;
		});
	}, [
		imageRect,
		past.length,
		resetOriginalEditorState,
		resetToolDraftBase,
		setEditorStateAndRef,
	]);

	const pushGestureHistory = useCallback(() => {
		const startState = gestureStartStateRef.current;
		gestureStartStateRef.current = null;
		activeLayerIdRef.current = null;
		cropDragModeRef.current = null;
		textGestureStartRef.current = null;
		if (!startState) return;

		if (snapshotsEqual(startState, editorStateRef.current)) {
			return;
		}

		setHasPendingToolChanges(
			!outputSnapshotsEqual(toolDraftBaseRef.current, editorStateRef.current),
		);
	}, [setHasPendingToolChanges]);

	const selectTextAtPoint = useCallback(
		(point: Point, options?: { edit?: boolean }) => {
			if (!pointInRect(point, imageRect)) return null;
			const current = editorStateRef.current;
			const hitText = [...current.texts]
				.reverse()
				.find((item) => pointInText(point, item));
			if (!hitText) return null;
			setEditorStateAndRef((state) => ({
				...state,
				selectedTextId: hitText.id,
			}));
			setTextColor(hitText.color);
			setTextSize(hitText.size);
			if (options?.edit) {
				setEditingTextId(hitText.id);
				setTextFocusKey((value) => value + 1);
			} else {
				setEditingTextId(null);
			}
			return hitText;
		},
		[imageRect, setEditorStateAndRef],
	);

	const createEditableTextAtPoint = useCallback(
		(point: Point) => {
			const id = `text-${Date.now()}`;
			const current = editorStateRef.current;
			const selectedText = current.texts.find(
				(text) => text.id === current.selectedTextId,
			);
			const nextText = constrainTextLayer(
				{
					color: textColorRef.current,
					id,
					rotation: 0,
					size: selectedText?.size ?? textSize,
					value: "",
					x: point.x,
					y: point.y,
				},
				imageRect,
			);
			stageEditorState({
				...current,
				selectedTextId: id,
				texts: [
					...current.texts.filter((text) => text.value.trim().length > 0),
					nextText,
				],
			});
			setEditingTextId(id);
			setTextFocusKey((value) => value + 1);
		},
		[imageRect, stageEditorState, textSize],
	);

	const clearTextSelection = useCallback(() => {
		setEditingTextId(null);
		const current = editorStateRef.current;
		stageEditorState({
			...current,
			selectedTextId: null,
			texts: current.texts.filter((text) => text.value.trim().length > 0),
		});
	}, [stageEditorState]);

	const handleSingleTap = useCallback(
		(x: number, y: number) => {
			if (toolRef.current !== "text") return;
			fireHaptic();
			const hitText = selectTextAtPoint({ x, y });
			if (!hitText) {
				clearTextSelection();
			}
		},
		[clearTextSelection, selectTextAtPoint],
	);

	const handleDoubleTap = useCallback(
		(x: number, y: number) => {
			if (toolRef.current !== "text") return;
			if (!pointInRect({ x, y }, imageRect)) return;
			fireHaptic();
			const hitText = selectTextAtPoint({ x, y }, { edit: true });
			if (!hitText) {
				createEditableTextAtPoint({ x, y });
			}
		},
		[createEditableTextAtPoint, imageRect, selectTextAtPoint],
	);

	const handlePanBegin = useCallback(
		(x: number, y: number) => {
			const current = editorStateRef.current;
			gestureStartStateRef.current = current;
			const currentTool = toolRef.current;
			const point = { x, y };

			if (currentTool === "draw") {
				if (!pointInRect(point, imageRect)) return;
				const id = `stroke-${Date.now()}`;
				activeLayerIdRef.current = id;
				setEditorStateAndRef((state) => ({
					...state,
					selectedTextId: null,
					strokes: [
						...state.strokes,
						{
							color: brushColorRef.current,
							id,
							points: [point],
							width: brushWidthRef.current,
						},
					],
				}));
				return;
			}

			if (currentTool === "blur") {
				if (!pointInRect(point, imageRect)) return;
				const id = `blur-${Date.now()}`;
				activeLayerIdRef.current = id;
				setEditorStateAndRef((state) => ({
					...state,
					selectedTextId: null,
					blurStrokes: [
						...state.blurStrokes,
						{ id, points: [point], width: blurWidthRef.current },
					],
				}));
				return;
			}

			if (currentTool === "text") {
				setEditingTextId(null);
				const hitText = selectTextAtPoint(point);
				if (hitText) {
					activeLayerIdRef.current = hitText.id;
					dragOffsetRef.current = {
						x: point.x - hitText.x,
						y: point.y - hitText.y,
					};
				}
				return;
			}

			if (currentTool === "crop") {
				const mode = getCropDragMode(point, current.cropRect);
				if (mode && mode !== "move") {
					dragStartRef.current = point;
					cropStartRectRef.current = current.cropRect;
					cropDragModeRef.current = mode;
				} else {
					cropDragModeRef.current = null;
					transformStartRef.current = current.transform;
				}
				return;
			}
		},
		[imageRect, selectTextAtPoint, setEditorStateAndRef],
	);

	const handlePanChange = useCallback(
		(x: number, y: number, translationX: number, translationY: number) => {
			const currentTool = toolRef.current;
			const activeId = activeLayerIdRef.current;

			if (currentTool === "draw" && activeId) {
				setEditorStateAndRef((state) => ({
					...state,
					strokes: state.strokes.map((stroke) =>
						stroke.id === activeId
							? { ...stroke, points: [...stroke.points, { x, y }] }
							: stroke,
					),
				}));
				return;
			}

			if (currentTool === "blur" && activeId) {
				setEditorStateAndRef((state) => ({
					...state,
					blurStrokes: state.blurStrokes.map((stroke) =>
						stroke.id === activeId
							? { ...stroke, points: [...stroke.points, { x, y }] }
							: stroke,
					),
				}));
				return;
			}

			if (currentTool === "text" && activeId) {
				const offset = dragOffsetRef.current;
				setEditorStateAndRef((state) => ({
					...state,
					texts: state.texts.map((text) =>
						text.id === activeId
							? constrainTextLayer(
									{
										...text,
										x: x - offset.x,
										y: y - offset.y,
									},
									imageRect,
								)
							: text,
					),
				}));
				return;
			}

			if (currentTool === "crop") {
				const mode = cropDragModeRef.current;
				setEditorStateAndRef((state) => {
					if (mode) {
						const cropRect = resizeCropRect({
							bounds: imageRect,
							mode,
							ratio: state.cropRatio,
							sourceRatio,
							startPoint: dragStartRef.current,
							startRect: cropStartRectRef.current,
							x,
							y,
						});
						return {
							...state,
							cropDirty: true,
							cropRect,
							transform: constrainImageTransform(
								state.transform,
								imageRect,
								cropRect,
							),
						};
					}
					return {
						...state,
						cropDirty: true,
						transform: constrainImageTransform(
							{
								...state.transform,
								translateX: transformStartRef.current.translateX + translationX,
								translateY: transformStartRef.current.translateY + translationY,
							},
							imageRect,
							state.cropRect,
						),
					};
				});
				return;
			}
		},
		[imageRect, setEditorStateAndRef, sourceRatio],
	);

	const handlePinchBegin = useCallback(() => {
		gestureStartStateRef.current = editorStateRef.current;
		transformStartRef.current = editorStateRef.current.transform;
		const selectedText = editorStateRef.current.texts.find(
			(text) => text.id === editorStateRef.current.selectedTextId,
		);
		textGestureStartRef.current = selectedText
			? {
					id: selectedText.id,
					rotation: selectedText.rotation,
					size: selectedText.size,
				}
			: null;
	}, []);

	const handlePinchChange = useCallback(
		(scale: number) => {
			if (toolRef.current === "text" && textGestureStartRef.current) {
				const startText = textGestureStartRef.current;
				setEditorStateAndRef((state) => ({
					...state,
					texts: state.texts.map((text) =>
						text.id === startText.id
							? constrainTextLayer(
									{ ...text, size: clamp(startText.size * scale, 12, 72) },
									imageRect,
								)
							: text,
					),
				}));
				return;
			}

			if (toolRef.current !== "crop") return;
			setEditorStateAndRef((state) => ({
				...state,
				cropDirty: true,
				transform: constrainImageTransform(
					{
						...state.transform,
						scale: clamp(transformStartRef.current.scale * scale, 0.5, 4),
					},
					imageRect,
					state.cropRect,
				),
			}));
		},
		[imageRect, setEditorStateAndRef],
	);

	const handleRotationBegin = useCallback(() => {
		gestureStartStateRef.current = editorStateRef.current;
		transformStartRef.current = editorStateRef.current.transform;
		const selectedText = editorStateRef.current.texts.find(
			(text) => text.id === editorStateRef.current.selectedTextId,
		);
		textGestureStartRef.current = selectedText
			? {
					id: selectedText.id,
					rotation: selectedText.rotation,
					size: selectedText.size,
				}
			: null;
	}, []);

	const handleRotationChange = useCallback(
		(rotation: number) => {
			if (toolRef.current === "text" && textGestureStartRef.current) {
				const startText = textGestureStartRef.current;
				setEditorStateAndRef((state) => ({
					...state,
					texts: state.texts.map((text) =>
						text.id === startText.id
							? constrainTextLayer(
									{ ...text, rotation: startText.rotation + rotation },
									imageRect,
								)
							: text,
					),
				}));
				return;
			}
			if (toolRef.current !== "crop") return;
			setEditorStateAndRef((state) => ({
				...state,
				cropDirty: true,
				transform: constrainImageTransform(
					{
						...state.transform,
						rotation: transformStartRef.current.rotation + rotation,
					},
					imageRect,
					state.cropRect,
				),
			}));
		},
		[imageRect, setEditorStateAndRef],
	);

	const panGesture = useMemo(
		() =>
			Gesture.Pan()
				.minDistance(1)
				.onBegin((event) => {
					runOnJS(handlePanBegin)(event.x, event.y);
				})
				.onUpdate((event) => {
					runOnJS(handlePanChange)(
						event.x,
						event.y,
						event.translationX,
						event.translationY,
					);
				})
				.onEnd(() => {
					runOnJS(pushGestureHistory)();
				})
				.onFinalize(() => {
					runOnJS(pushGestureHistory)();
				}),
		[handlePanBegin, handlePanChange, pushGestureHistory],
	);
	const tapGesture = useMemo(() => {
		const singleTapGesture = Gesture.Tap()
			.numberOfTaps(1)
			.onEnd((event) => {
				runOnJS(handleSingleTap)(event.x, event.y);
			});
		const doubleTapGesture = Gesture.Tap()
			.numberOfTaps(2)
			.onEnd((event) => {
				runOnJS(handleDoubleTap)(event.x, event.y);
			});
		return Gesture.Exclusive(doubleTapGesture, singleTapGesture);
	}, [handleDoubleTap, handleSingleTap]);
	const pinchGesture = useMemo(
		() =>
			Gesture.Pinch()
				.onBegin(() => {
					runOnJS(handlePinchBegin)();
				})
				.onUpdate((event) => {
					runOnJS(handlePinchChange)(event.scale);
				})
				.onEnd(() => {
					runOnJS(pushGestureHistory)();
				}),
		[handlePinchBegin, handlePinchChange, pushGestureHistory],
	);
	const rotationGesture = useMemo(
		() =>
			Gesture.Rotation()
				.onBegin(() => {
					runOnJS(handleRotationBegin)();
				})
				.onUpdate((event) => {
					runOnJS(handleRotationChange)(event.rotation);
				})
				.onEnd(() => {
					runOnJS(pushGestureHistory)();
				}),
		[handleRotationBegin, handleRotationChange, pushGestureHistory],
	);
	const canvasGesture = useMemo<ComposedGesture | GestureType>(
		() =>
			tool === "crop"
				? Gesture.Simultaneous(
						panGesture,
						tapGesture,
						pinchGesture,
						rotationGesture,
					)
				: tool === "text"
					? Gesture.Simultaneous(
							panGesture,
							tapGesture,
							pinchGesture,
							rotationGesture,
						)
					: Gesture.Simultaneous(panGesture, tapGesture),
		[panGesture, pinchGesture, rotationGesture, tapGesture, tool],
	);

	const undo = () => {
		if (toolRef.current || hasPendingToolChangesRef.current) return;
		fireHaptic();
		setPast((items) => {
			const previous = items[items.length - 1];
			if (!previous) return items;
			const current = currentHistoryEntry();
			if (current) {
				setFuture((futureItems) => [current, ...futureItems].slice(0, 30));
			}
			restoreHistoryEntry(previous);
			return items.slice(0, -1);
		});
	};

	const redo = () => {
		if (toolRef.current || hasPendingToolChangesRef.current) return;
		fireHaptic();
		setFuture((items) => {
			const next = items[0];
			if (!next) return items;
			const current = currentHistoryEntry();
			if (current) {
				setPast((pastItems) => [...pastItems.slice(-29), current]);
			}
			restoreHistoryEntry(next);
			return items.slice(1);
		});
	};

	const selectTool = (nextTool: EditorTool) => {
		if (nextTool === toolRef.current) return;
		if (hasPendingToolChangesRef.current) return;
		fireHaptic();
		resetToolDraftBase(editorStateRef.current);
		toolRef.current = nextTool;
		setTool(nextTool);
		if (nextTool === "text") {
			const current = editorStateRef.current;
			const hasText = current.texts.some(
				(text) => text.value.trim().length > 0,
			);
			const selectedText = current.texts.find(
				(text) => text.id === current.selectedTextId,
			);
			if (selectedText && selectedText.value.trim().length > 0) {
				setTextColor(selectedText.color);
				setEditingTextId(null);
			} else if (!hasText) {
				createEditableTextAtPoint({
					x: imageRect.x + imageRect.width / 2,
					y: imageRect.y + imageRect.height / 2,
				});
			} else {
				setEditingTextId(null);
			}
		}
	};

	const cancelToolChanges = () => {
		fireHaptic();
		clearToolInteractionState();
		setEditingTextId(null);
		setEditorStateAndRef(toolDraftBaseRef.current);
		setHasPendingToolChanges(false);
		toolRef.current = null;
		setTool(null);
	};

	const confirmToolChanges = async () => {
		if (isApplyingTool) return;
		fireHaptic();
		const activeTool = toolRef.current;
		const base = toolDraftBaseRef.current;
		let current = editorStateRef.current;
		if (activeTool === "text") {
			current = {
				...current,
				selectedTextId: null,
				texts: current.texts.filter((text) => text.value.trim().length > 0),
			};
			setEditingTextId(null);
			setEditorStateAndRef(current);
		}
		const hasOutputChanges = !outputSnapshotsEqual(base, current);
		clearToolInteractionState();

		if (activeTool === "crop" && hasOutputChanges && sourceImage) {
			setIsApplyingTool(true);
			try {
				const snapshotRect = current.cropDirty ? current.cropRect : imageRect;
				const croppedImage = await renderEditorExport({
					canvasSize,
					cropRect: snapshotRect,
					editorState: current,
					imageRect,
					sourceImage,
				}).catch(() => canvasRef.current?.makeImageSnapshotAsync(snapshotRect));
				if (!croppedImage) {
					throw new Error("图片裁切失败");
				}
				const next = makeInitialSnapshot();
				const historyEntry = currentHistoryEntry(base);
				if (historyEntry) {
					setPast((items) => [...items.slice(-29), historyEntry]);
				}
				setFuture([]);
				sourceImageRef.current = croppedImage;
				setSourceImage(croppedImage);
				setImageLoadStatus("ready");
				setEditorStateAndRef(next);
				resetToolDraftBase(next);
				setHasPendingToolChanges(false);
				const nextRevision = sourceRevisionRef.current + 1;
				sourceRevisionRef.current = nextRevision;
				setSourceRevision(nextRevision);
				toolRef.current = null;
				setTool(null);
			} catch (error) {
				toast.show({
					variant: "danger",
					label: error instanceof Error ? error.message : "裁切失败",
				});
			} finally {
				setIsApplyingTool(false);
			}
			return;
		}

		if (hasOutputChanges) {
			const historyEntry = currentHistoryEntry(base);
			if (historyEntry) {
				setPast((items) => [...items.slice(-29), historyEntry]);
			}
			setFuture([]);
		}
		resetToolDraftBase(current);
		setHasPendingToolChanges(false);
		toolRef.current = null;
		setTool(null);
	};

	const rotateImage = (direction: -1 | 1) => {
		fireHaptic();
		const current = editorStateRef.current;
		stageEditorState({
			...current,
			cropDirty: true,
			selectedTextId: null,
			transform: constrainImageTransform(
				{
					...current.transform,
					rotation: current.transform.rotation + direction * (Math.PI / 2),
				},
				imageRect,
				current.cropRect,
			),
		});
	};

	const flipImage = () => {
		fireHaptic();
		const current = editorStateRef.current;
		stageEditorState({
			...current,
			cropDirty: true,
			selectedTextId: null,
			transform: {
				...current.transform,
				flipX: !current.transform.flipX,
			},
		});
	};

	const setCropRatio = (ratio: CropRatio) => {
		fireHaptic();
		const current = editorStateRef.current;
		const cropRect = makeCenteredCropRect(imageRect, ratio, sourceRatio);
		stageEditorState({
			...current,
			cropDirty: true,
			cropRatio: ratio,
			cropRect,
			selectedTextId: null,
			transform: constrainImageTransform(
				current.transform,
				imageRect,
				cropRect,
			),
		});
	};

	const updateAdjustment = (key: AdjustmentKey, value: number) => {
		stageEditorState({
			...editorStateRef.current,
			adjustments: {
				...editorStateRef.current.adjustments,
				[key]: value,
			},
		});
	};

	const updateFilter = (filter: FilterPreset) => {
		fireHaptic();
		stageEditorState({ ...editorStateRef.current, filter });
	};

	const updateFilterIntensity = (filterIntensity: number) => {
		stageEditorState({ ...editorStateRef.current, filterIntensity });
	};

	const updateSelectedText = (
		updater: (text: TextLayer) => TextLayer,
		options?: { commit?: boolean },
	) => {
		const current = editorStateRef.current;
		if (!current.selectedTextId) return;
		const next = {
			...current,
			texts: current.texts.map((text) =>
				text.id === current.selectedTextId ? updater(text) : text,
			),
		};
		if (options?.commit) {
			stageEditorState(next);
		} else {
			setEditorStateAndRef(next);
		}
	};

	const updateTextColor = (color: string) => {
		fireHaptic();
		setTextColor(color);
		updateSelectedText((text) => ({ ...text, color }), { commit: true });
	};

	const updateTextSize = (size: number) => {
		const nextSize = clamp(size, 12, 72);
		setTextSize(nextSize);
		updateSelectedText(
			(text) => constrainTextLayer({ ...text, size: nextSize }, imageRect),
			{ commit: true },
		);
	};

	const addText = () => {
		fireHaptic();
		createEditableTextAtPoint({
			x: imageRect.x + imageRect.width / 2,
			y: imageRect.y + imageRect.height / 2,
		});
	};

	const updateSelectedTextValue = (value: string) => {
		updateSelectedText(
			(text) => constrainTextLayer({ ...text, value }, imageRect),
			{ commit: true },
		);
	};

	const deleteSelectedText = () => {
		fireHaptic();
		const current = editorStateRef.current;
		if (!current.selectedTextId) return;
		const selectedText = current.texts.find(
			(text) => text.id === current.selectedTextId,
		);
		if (selectedText) setTextSize(selectedText.size);
		stageEditorState({
			...current,
			selectedTextId: null,
			texts: current.texts.filter((text) => text.id !== current.selectedTextId),
		});
	};

	const saveImage = async () => {
		if (
			!canvasRef.current ||
			isSaving ||
			!sourceImage ||
			canvasSize.width <= 0 ||
			canvasSize.height <= 0 ||
			isApplyingTool ||
			toolRef.current ||
			hasPendingToolChangesRef.current
		) {
			return;
		}
		fireHaptic();
		const restoredOriginal =
			sourceRevisionRef.current === -1 &&
			originalImage &&
			!hasVisibleEdits(editorStateRef.current);
		if (restoredOriginal) {
			const uri = image.originalUri ?? image.uri;
			const isRemote = /^https?:\/\//i.test(uri);
			if (
				image.isEdited &&
				image.uri !== uri &&
				image.uri.includes("/youni-image-edits/")
			) {
				await deleteLocalFile(image.uri).catch(() => undefined);
			}
			onSave({
				...image,
				asset: isRemote ? undefined : { uri },
				fileName: undefined,
				fileSize: undefined,
				height: originalImage.height(),
				isEdited: false,
				mimeType: undefined,
				originalUri: uri,
				remoteUrl: isRemote ? uri : undefined,
				uri,
				width: originalImage.width(),
			});
			return;
		}
		if (!hasImageChanges) {
			onSave(image);
			return;
		}
		setIsSaving(true);
		try {
			const snapshotRect = editorStateRef.current.cropDirty
				? editorStateRef.current.cropRect
				: imageRect;
			const exportSize = makeExportSize(
				snapshotRect,
				sourceImage,
				imageRect,
				editorStateRef.current.transform.scale,
			);
			if (!exportSize) {
				throw new Error("图片导出失败");
			}
			const snapshot = await renderEditorExport({
				canvasSize,
				cropRect: snapshotRect,
				editorState: editorStateRef.current,
				imageRect,
				sourceImage,
			}).catch(() => canvasRef.current?.makeImageSnapshotAsync(snapshotRect));
			if (!snapshot) {
				throw new Error("图片导出失败");
			}
			let quality = 90;
			let encoded = snapshot.encodeToBase64(ImageFormat.JPEG, quality);
			let exported = await writeJpegBase64(encoded, quality);

			while (
				exported.fileSize &&
				exported.fileSize > NOTE_IMAGE_MAX_SIZE_BYTES &&
				quality > 60
			) {
				await deleteLocalFile(exported.uri);
				quality -= 10;
				encoded = snapshot.encodeToBase64(ImageFormat.JPEG, quality);
				exported = await writeJpegBase64(encoded, quality);
			}

			if (exported.fileSize && exported.fileSize > NOTE_IMAGE_MAX_SIZE_BYTES) {
				await deleteLocalFile(exported.uri);
				throw new Error("编辑后的图片仍超过 8MB");
			}

			const editedImage: MediaImage = {
				...image,
				asset: {
					fileName: exported.fileName,
					fileSize: exported.fileSize,
					mimeType: "image/jpeg",
					uri: exported.uri,
				},
				fileName: exported.fileName,
				fileSize: exported.fileSize,
				height: exportSize.height,
				isEdited: true,
				mimeType: "image/jpeg",
				originalUri: image.originalUri ?? image.uri,
				remoteUrl: undefined,
				uri: exported.uri,
				width: exportSize.width,
			};
			if (
				image.isEdited &&
				image.uri !== image.originalUri &&
				image.uri.includes("/youni-image-edits/")
			) {
				await deleteLocalFile(image.uri).catch(() => undefined);
			}
			onSave(editedImage);
		} catch (error) {
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "图片保存失败",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const canvasHeight = Math.min(
		640,
		Math.max(180, windowHeight - insets.top - insets.bottom - 236),
	);
	const canvasWidth = Math.max(280, windowWidth - 24);
	const hasImageChanges =
		sourceRevision !== originalSourceRevisionRef.current ||
		hasPendingToolChanges ||
		!outputSnapshotsEqual(originalEditorStateRef.current, editorState);
	const canUndo = !tool && !hasPendingToolChanges && past.length > 0;
	const canRedo = !tool && !hasPendingToolChanges && future.length > 0;
	const selectedText = editorState.texts.find(
		(text) => text.id === editorState.selectedTextId,
	);
	const canRestore =
		hasImageChanges ||
		Boolean(
			image.isEdited && image.originalUri && image.originalUri !== image.uri,
		);
	const restoreOriginal = () => {
		if (!(originalImage && canRestore)) return;
		Alert.alert("还原原图？", "当前图片的全部修改都会被移除。", [
			{ text: "取消", style: "cancel" },
			{
				text: "还原",
				style: "destructive",
				onPress: () => {
					const historyEntry = currentHistoryEntry();
					if (historyEntry) {
						setPast((items) => [...items.slice(-29), historyEntry]);
					}
					setFuture([]);
					const next = makeInitialSnapshot();
					sourceImageRef.current = originalImage;
					setSourceImage(originalImage);
					const nextRevision = image.originalUri !== image.uri ? -1 : 0;
					sourceRevisionRef.current = nextRevision;
					setSourceRevision(nextRevision);
					setEditorStateAndRef(next);
					resetToolDraftBase(next);
				},
			},
		]);
	};
	const requestEditorCancel = () => {
		if (!hasImageChanges) {
			onCancel();
			return;
		}
		Alert.alert(
			"放弃更改？",
			"当前图片有未保存的编辑，返回后这些更改会丢失。",
			[
				{ text: "继续编辑", style: "cancel" },
				{
					text: "放弃",
					style: "destructive",
					onPress: onCancel,
				},
			],
		);
	};

	return (
		<Modal animationType="slide" visible onRequestClose={requestEditorCancel}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				className="flex-1 bg-black"
			>
				<View
					className="flex-1 bg-black"
					style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}
				>
					{tool ? null : (
						<EditorTopBar
							canRedo={canRedo}
							canRestore={canRestore}
							canUndo={canUndo}
							isSaving={isSaving}
							onCancel={requestEditorCancel}
							onRedo={redo}
							onRestore={restoreOriginal}
							onSave={saveImage}
							onShowOriginalChange={setShowOriginal}
							onUndo={undo}
							saveDisabled={
								isSaving ||
								isApplyingTool ||
								!sourceImage ||
								canvasSize.width <= 0 ||
								canvasSize.height <= 0 ||
								Boolean(tool) ||
								hasPendingToolChanges
							}
						/>
					)}

					<View className="flex-1 justify-center px-3 py-3">
						<View
							className="relative self-center"
							style={{ height: canvasHeight, width: canvasWidth }}
						>
							<EditorCanvas
								canvasGesture={canvasGesture as ComposedGesture}
								canvasRef={canvasRef}
								canvasSize={canvasSize}
								editorState={editorState}
								imageLoadStatus={imageLoadStatus}
								imageRect={imageRect}
								onCanvasLayout={setCanvasSize}
								onRetryLoad={loadSourceImage}
								onTextChange={updateSelectedTextValue}
								editingTextId={editingTextId}
								originalImage={originalImage}
								showOriginal={showOriginal}
								sourceImage={sourceImage}
								textFocusKey={textFocusKey}
								tool={tool}
							/>
						</View>
					</View>

					<EditorBottomControls
						adjustments={editorState.adjustments}
						blurWidth={blurWidth}
						brushColor={brushColor}
						brushWidth={brushWidth}
						canDeleteText={Boolean(selectedText)}
						cropRatio={editorState.cropRatio}
						filter={editorState.filter}
						filterIntensity={editorState.filterIntensity}
						isApplyingTool={isApplyingTool}
						onAddText={addText}
						onAdjustmentChange={updateAdjustment}
						onBlurWidthChange={setBlurWidth}
						onBrushColorChange={setBrushColor}
						onBrushWidthChange={setBrushWidth}
						onCancelToolChanges={cancelToolChanges}
						onConfirmToolChanges={confirmToolChanges}
						onDeleteText={deleteSelectedText}
						onFilterChange={updateFilter}
						onFilterIntensityChange={updateFilterIntensity}
						onFlipImage={flipImage}
						onRotateImage={rotateImage}
						onSetCropRatio={setCropRatio}
						onSetTool={selectTool}
						onTextColorChange={updateTextColor}
						onTextSizeChange={updateTextSize}
						sourceImage={sourceImage}
						textColor={selectedText?.color ?? textColor}
						textSize={selectedText?.size ?? textSize}
						tool={tool}
					/>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
