import { Ionicons } from "@expo/vector-icons";
import { PressableFeedback, Spinner, Text } from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";
import type { MediaImage } from "@/lib/media/types";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import {
	createMediaPreviewLoadGuard,
	initialMediaPreviewStatus,
	resolveMediaPreviewFailure,
} from "./media-preview-load-guard";

export function MediaTilePreview({
	image,
	initiallyLoaded,
	label,
	onLoad,
}: {
	image: MediaImage;
	initiallyLoaded: boolean;
	label: string;
	onLoad: () => void;
}) {
	const [status, setStatus] = useState<"loaded" | "loading" | "retry">(
		initialMediaPreviewStatus(initiallyLoaded),
	);
	const [attempt, setAttempt] = useState(0);
	const [retryEpoch, setRetryEpoch] = useState(0);
	const loadGuardRef = useRef<null | ReturnType<
		typeof createMediaPreviewLoadGuard
	>>(null);
	const candidateUris = useMemo(
		() =>
			[image.uri, image.originalUri, image.asset?.uri].filter(
				(uri, index, values): uri is string =>
					Boolean(uri) && values.indexOf(uri) === index,
			),
		[image.asset?.uri, image.originalUri, image.uri],
	);
	const sourceUri = candidateUris[attempt % Math.max(1, candidateUris.length)];
	const imageSource = useMemo(
		() => (sourceUri ? { uri: sourceUri } : undefined),
		[sourceUri],
	);

	// Keep retries local to the current image when an edited image replaces its URI.
	// biome-ignore lint/correctness/useExhaustiveDependencies: image identity resets the retry cursor
	useEffect(() => {
		setAttempt(0);
		setRetryEpoch(0);
	}, [image.id, image.uri]);

	// A retry must restart the deadline even when there is only one candidate URI.
	// biome-ignore lint/correctness/useExhaustiveDependencies: attempt is the retry token
	useEffect(() => {
		loadGuardRef.current?.dispose();
		if (!sourceUri) {
			setStatus("retry");
			return;
		}
		if (initiallyLoaded && attempt === 0 && retryEpoch === 0) {
			setStatus("loaded");
			return;
		}
		setStatus("loading");
		const guard = createMediaPreviewLoadGuard({
			onTimeout: () => {
				const next = resolveMediaPreviewFailure(attempt, candidateUris.length);
				setAttempt(next.attempt);
				setStatus(next.status);
			},
		});
		loadGuardRef.current = guard;
		guard.start();
		return () => guard.dispose();
	}, [attempt, initiallyLoaded, retryEpoch, sourceUri]);

	const settleLoaded = () => {
		loadGuardRef.current?.settle();
		setStatus("loaded");
		onLoad();
	};

	const tryNextSource = () => {
		loadGuardRef.current?.settle();
		const next = resolveMediaPreviewFailure(attempt, candidateUris.length);
		setAttempt(next.attempt);
		setStatus(next.status);
	};

	const retry = () => {
		fireHaptic();
		setAttempt(0);
		setRetryEpoch((current) => current + 1);
	};

	return (
		<View className="h-full w-full overflow-hidden rounded-xl border border-border bg-content2">
			<Image
				key={`${image.id}:${attempt}:${retryEpoch}`}
				accessibilityLabel={label}
				className="h-full w-full"
				onError={tryNextSource}
				onLoad={settleLoaded}
				resizeMode="cover"
				source={imageSource}
			/>
			{status === "loading" ? (
				<View className="absolute inset-0 items-center justify-center bg-content2">
					<Spinner size="sm" />
				</View>
			) : null}
			{status === "retry" ? (
				<Pressable
					accessibilityLabel={`${label}需要重新加载`}
					accessibilityRole="button"
					className="absolute inset-0 items-center justify-center gap-0.5 bg-content2"
					onPress={(event) => {
						event.stopPropagation();
						retry();
					}}
				>
					<Ionicons color="#6b7280" name="refresh" size={20} />
					<Text.Paragraph color="muted" type="body-xs">
						重新加载
					</Text.Paragraph>
				</Pressable>
			) : null}
		</View>
	);
}

export function MediaRemoveButton({
	label,
	onRemove,
}: {
	label: string;
	onRemove: () => void;
}) {
	return (
		<PressableFeedback
			accessibilityLabel={`移除${label}`}
			accessibilityRole="button"
			className="absolute top-1 right-1 z-10 size-6 items-center justify-center rounded-full bg-overlay-backdrop"
			hitSlop={8}
			onPress={onRemove}
		>
			<Ionicons color="white" name="close" size={14} />
		</PressableFeedback>
	);
}

export function MediaTile({
	image,
	initiallyLoaded,
	label,
	onEdit,
	onLoad,
	onRemove,
}: {
	image: MediaImage;
	initiallyLoaded: boolean;
	label: string;
	onEdit: () => void;
	onLoad: () => void;
	onRemove: () => void;
}) {
	return (
		<View className="h-22 w-22">
			<PressableFeedback
				accessibilityHint="长按并拖动可调整顺序"
				accessibilityLabel={`编辑${label}`}
				accessibilityRole="button"
				className="h-full w-full"
				onPress={onEdit}
			>
				<MediaTilePreview
					image={image}
					initiallyLoaded={initiallyLoaded}
					label={label}
					onLoad={onLoad}
				/>
			</PressableFeedback>
			<MediaRemoveButton label={label} onRemove={onRemove} />
		</View>
	);
}
