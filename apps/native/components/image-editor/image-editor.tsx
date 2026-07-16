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
import type {
	CropDragMode,
	CropRatio,
	EditorSnapshot,
	EditorTool,
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

function snapshotsEqual(a: EditorSnapshot, b: EditorSnapshot) {
	return JSON.stringify(a) === JSON.stringify(b);
}

function imageOutputSnapshot(snapshot: EditorSnapshot) {
	return {
		...snapshot,
		selectedTextId: null,
		texts: snapshot.texts.filter((text) => text.value.trim().length > 0),
	};
}

function outputSnapshotsEqual(a: EditorSnapshot, b: EditorSnapshot) {
	return snapshotsEqual(imageOutputSnapshot(a), imageOutputSnapshot(b));
}

export function ImageEditor({ image, onCancel, onSave }: ImageEditorProps) {
	const canvasRef = useCanvasRef();
	const insets = useSafeAreaInsets();
	const { height: windowHeight, width: windowWidth } = useWindowDimensions();
	const { toast } = useAppToast();
	const [sourceImage, setSourceImage] = useState<null | SkImage>(null);
	const [imageLoadStatus, setImageLoadStatus] =
		useState<ImageLoadStatus>("loading");
	const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
	const [editorState, setEditorState] = useState<EditorSnapshot>(() =>
		makeInitialSnapshot(),
	);
	const [past, setPast] = useState<EditorSnapshot[]>([]);
	const [future, setFuture] = useState<EditorSnapshot[]>([]);
	const [tool, setTool] = useState<EditorTool | null>(null);
	const [editingTextId, setEditingTextId] = useState<null | string>(null);
	const [textFocusKey, setTextFocusKey] = useState(0);
	const [textColor, setTextColor] = useState<string>(TEXT_COLORS[0]);
	const [brushColor, setBrushColor] = useState<string>(BRUSH_COLORS[0]);
	const [brushWidth, setBrushWidth] = useState(6);
	const [blurWidth, setBlurWidth] = useState(30);
	const [isSaving, setIsSaving] = useState(false);
	const [isApplyingTool, setIsApplyingTool] = useState(false);
	const [sourceRevision, setSourceRevision] = useState(0);
	const [hasPendingToolChanges, setHasPendingToolChangesState] =
		useState(false);
	const editorStateRef = useRef(editorState);
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
		size: number;
	} | null>(null);
	const sourceRatio = sourceImage
		? sourceImage.width() / sourceImage.height()
		: 1;

	const loadSourceImage = useCallback(async () => {
		setImageLoadStatus("loading");
		setSourceImage(null);
		originalSourceRevisionRef.current = 0;
		setSourceRevision(0);
		try {
			const decodedImage = await loadEditorImage(image.uri);
			setSourceImage(decodedImage);
			setImageLoadStatus("ready");
		} catch {
			setImageLoadStatus("error");
		}
	}, [image.uri]);

	useEffect(() => {
		void loadSourceImage();
	}, [loadSourceImage]);

	useEffect(() => {
		editorStateRef.current = editorState;
	}, [editorState]);

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
			if (options?.edit) {
				setEditingTextId(hitText.id);
				setTextFocusKey((value) => value + 1);
			} else {
				setEditingTextId(null);
			}
			return hitText;
		},
		[setEditorStateAndRef],
	);

	const createEditableTextAtPoint = useCallback(
		(point: Point) => {
			const id = `text-${Date.now()}`;
			const nextText: TextLayer = {
				color: textColorRef.current,
				id,
				rotation: 0,
				size: 24,
				value: "",
				x: clamp(point.x, 80, Math.max(80, canvasSize.width - 80)),
				y: clamp(point.y, 42, Math.max(42, canvasSize.height - 42)),
			};
			const current = editorStateRef.current;
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
		[canvasSize.height, canvasSize.width, stageEditorState],
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
			fireHaptic();
			const hitText = selectTextAtPoint({ x, y }, { edit: true });
			if (!hitText) {
				createEditableTextAtPoint({ x, y });
			}
		},
		[createEditableTextAtPoint, selectTextAtPoint],
	);

	const handlePanBegin = useCallback(
		(x: number, y: number) => {
			const current = editorStateRef.current;
			gestureStartStateRef.current = current;
			const currentTool = toolRef.current;
			const point = { x, y };

			if (currentTool === "draw") {
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
				if (!mode) return;
				dragStartRef.current = point;
				cropStartRectRef.current = current.cropRect;
				cropDragModeRef.current = mode;
				return;
			}

			if (currentTool !== "transform") return;
			transformStartRef.current = current.transform;
		},
		[selectTextAtPoint, setEditorStateAndRef],
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
							? {
									...text,
									x: clamp(
										x - offset.x,
										18,
										Math.max(18, canvasSize.width - 18),
									),
									y: clamp(
										y - offset.y,
										24,
										Math.max(24, canvasSize.height - 24),
									),
								}
							: text,
					),
				}));
				return;
			}

			if (currentTool === "crop") {
				const mode = cropDragModeRef.current;
				if (!mode) return;
				setEditorStateAndRef((state) => ({
					...state,
					cropDirty: true,
					cropRect: resizeCropRect({
						bounds: imageRect,
						mode,
						ratio: state.cropRatio,
						sourceRatio,
						startPoint: dragStartRef.current,
						startRect: cropStartRectRef.current,
						x,
						y,
					}),
				}));
				return;
			}

			if (currentTool !== "transform") return;
			setEditorStateAndRef((state) => ({
				...state,
				selectedTextId: null,
				transform: {
					...state.transform,
					translateX: transformStartRef.current.translateX + translationX,
					translateY: transformStartRef.current.translateY + translationY,
				},
			}));
		},
		[
			canvasSize.height,
			canvasSize.width,
			imageRect,
			setEditorStateAndRef,
			sourceRatio,
		],
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
							? { ...text, size: clamp(startText.size * scale, 18, 96) }
							: text,
					),
				}));
				return;
			}

			if (toolRef.current !== "transform") return;
			setEditorStateAndRef((state) => ({
				...state,
				transform: {
					...state.transform,
					scale: clamp(transformStartRef.current.scale * scale, 0.5, 4),
				},
			}));
		},
		[setEditorStateAndRef],
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
					size: selectedText.size,
				}
			: null;
	}, []);

	const handleRotationChange = useCallback(
		(rotation: number) => {
			if (toolRef.current !== "transform") return;
			setEditorStateAndRef((state) => ({
				...state,
				transform: {
					...state.transform,
					rotation: transformStartRef.current.rotation + rotation,
				},
			}));
		},
		[setEditorStateAndRef],
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
			tool === "transform"
				? Gesture.Simultaneous(
						panGesture,
						tapGesture,
						pinchGesture,
						rotationGesture,
					)
				: tool === "text"
					? Gesture.Simultaneous(panGesture, tapGesture, pinchGesture)
					: Gesture.Simultaneous(panGesture, tapGesture),
		[panGesture, pinchGesture, rotationGesture, tapGesture, tool],
	);

	const undo = () => {
		if (toolRef.current || hasPendingToolChangesRef.current) return;
		fireHaptic();
		setPast((items) => {
			const previous = items[items.length - 1];
			if (!previous) return items;
			setFuture((futureItems) => [editorStateRef.current, ...futureItems]);
			setEditorStateAndRef(previous);
			resetToolDraftBase(previous);
			return items.slice(0, -1);
		});
	};

	const redo = () => {
		if (toolRef.current || hasPendingToolChangesRef.current) return;
		fireHaptic();
		setFuture((items) => {
			const next = items[0];
			if (!next) return items;
			setPast((pastItems) => [...pastItems.slice(-29), editorStateRef.current]);
			setEditorStateAndRef(next);
			resetToolDraftBase(next);
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
					x: canvasSize.width / 2,
					y: canvasSize.height / 2,
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
				setSourceImage(croppedImage);
				setImageLoadStatus("ready");
				setPast([]);
				setFuture([]);
				setEditorStateAndRef(next);
				resetToolDraftBase(next);
				setHasPendingToolChanges(false);
				setSourceRevision((value) => value + 1);
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
			setPast((items) => [...items.slice(-29), base]);
			setFuture([]);
		}
		resetToolDraftBase(current);
		setHasPendingToolChanges(false);
		toolRef.current = null;
		setTool(null);
	};

	const rotateImage = () => {
		fireHaptic();
		stageEditorState({
			...editorStateRef.current,
			selectedTextId: null,
			transform: {
				...editorStateRef.current.transform,
				rotation: editorStateRef.current.transform.rotation + Math.PI / 2,
			},
		});
	};

	const zoomImage = (delta: number) => {
		fireHaptic();
		stageEditorState({
			...editorStateRef.current,
			selectedTextId: null,
			transform: {
				...editorStateRef.current.transform,
				scale: clamp(editorStateRef.current.transform.scale + delta, 0.5, 4),
			},
		});
	};

	const resetTransform = () => {
		fireHaptic();
		stageEditorState({
			...editorStateRef.current,
			selectedTextId: null,
			transform: initialTransform,
		});
	};

	const setCropRatio = (ratio: CropRatio) => {
		fireHaptic();
		stageEditorState({
			...editorStateRef.current,
			cropDirty: true,
			cropRatio: ratio,
			cropRect: makeCenteredCropRect(imageRect, ratio, sourceRatio),
			selectedTextId: null,
		});
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

	const updateTextSize = (delta: number) => {
		fireHaptic();
		updateSelectedText(
			(text) => ({ ...text, size: clamp(text.size + delta, 18, 96) }),
			{ commit: true },
		);
	};

	const updateSelectedTextValue = (value: string) => {
		updateSelectedText((text) => ({ ...text, value }), { commit: true });
	};

	const deleteSelectedText = () => {
		fireHaptic();
		const current = editorStateRef.current;
		if (!current.selectedTextId) return;
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
		setIsSaving(true);
		try {
			const snapshotRect = editorStateRef.current.cropDirty
				? editorStateRef.current.cropRect
				: imageRect;
			const exportSize = makeExportSize(snapshotRect, sourceImage);
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

			onSave({
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
			});
		} catch (error) {
			toast.show({
				variant: "danger",
				label: error instanceof Error ? error.message : "图片保存失败",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const canvasHeight = Math.min(640, Math.max(360, windowHeight * 0.66));
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
					<EditorTopBar
						activeTool={tool}
						canRedo={canRedo}
						canUndo={canUndo}
						isApplyingTool={isApplyingTool}
						isSaving={isSaving}
						onCancel={requestEditorCancel}
						onCancelToolChanges={cancelToolChanges}
						onConfirmToolChanges={confirmToolChanges}
						onRedo={redo}
						onSave={saveImage}
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

					<View className="flex-1 justify-center px-3">
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
								sourceImage={sourceImage}
								textFocusKey={textFocusKey}
								tool={tool}
							/>
						</View>
					</View>

					<EditorBottomControls
						blurWidth={blurWidth}
						brushColor={brushColor}
						brushWidth={brushWidth}
						canDeleteText={Boolean(selectedText)}
						cropRatio={editorState.cropRatio}
						onBlurWidthChange={setBlurWidth}
						onBrushColorChange={setBrushColor}
						onBrushWidthChange={setBrushWidth}
						onDeleteText={deleteSelectedText}
						onResetTransform={resetTransform}
						onRotateImage={rotateImage}
						onSetCropRatio={setCropRatio}
						onSetTool={selectTool}
						onTextColorChange={updateTextColor}
						onTextSizeChange={updateTextSize}
						onZoomImage={zoomImage}
						textColor={selectedText?.color ?? textColor}
						tool={tool}
					/>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	);
}
