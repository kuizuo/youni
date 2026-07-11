import { Ionicons } from "@expo/vector-icons";
import { ListGroup, PressableFeedback, Spinner, Text } from "heroui-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";

import { AppSeparator } from "@/components/shared/app-separator";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import type { ComposerImage } from "./create-types";
import {
	createMediaPreviewLoadGuard,
	initialMediaPreviewStatus,
	resolveMediaPreviewFailure,
} from "./media-preview-load-guard";

export type IoniconName = keyof typeof Ionicons.glyphMap;

export function MediaTilePreview({
	image,
	initiallyLoaded,
	label,
	onLoad,
}: {
	image: ComposerImage;
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
				onError={tryNextSource}
				onLoad={settleLoaded}
				resizeMode="cover"
				source={imageSource}
				className="h-full w-full"
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
					onPress={(event) => {
						event.stopPropagation();
						retry();
					}}
					className="absolute inset-0 items-center justify-center gap-0.5 bg-content2"
				>
					<Ionicons name="refresh" size={20} color="#6b7280" />
					<Text.Paragraph type="body-xs" color="muted">
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
			hitSlop={8}
			onPress={onRemove}
			className="absolute top-1 right-1 z-10 size-6 items-center justify-center rounded-full bg-overlay-backdrop"
		>
			<Ionicons name="close" size={14} color="white" />
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
	image: ComposerImage;
	initiallyLoaded: boolean;
	label: string;
	onEdit: () => void;
	onLoad: () => void;
	onRemove: () => void;
}) {
	return (
		<View className="h-22 w-22">
			<PressableFeedback
				accessibilityLabel={`编辑${label}`}
				accessibilityHint="长按并拖动可调整顺序"
				accessibilityRole="button"
				onPress={onEdit}
				className="h-full w-full"
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

export function SuggestionChip({
	label,
	onPress,
}: {
	label: string;
	onPress?: () => void;
}) {
	const content = (
		<View className="rounded-full bg-content2 px-3 py-1.5">
			<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
				{label}
			</Text.Paragraph>
		</View>
	);

	if (!onPress) {
		return content;
	}

	return (
		<PressableFeedback
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress}
		>
			{content}
		</PressableFeedback>
	);
}

export function SettingsListItem({
	foregroundColor,
	icon,
	label,
	mutedColor,
	onPress,
	value,
}: {
	foregroundColor: string;
	icon: IoniconName;
	label: string;
	mutedColor: string;
	onPress?: () => void;
	value?: string;
}) {
	return (
		<ListGroup.Item
			accessibilityLabel={label}
			accessibilityRole="button"
			onPress={onPress ?? (() => fireHaptic())}
			className="gap-2.5 px-3 py-3"
		>
			<ListGroup.ItemPrefix>
				<Ionicons name={icon} size={21} color={foregroundColor} />
			</ListGroup.ItemPrefix>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle className="text-sm">{label}</ListGroup.ItemTitle>
			</ListGroup.ItemContent>
			<ListGroup.ItemSuffix className="flex-row items-center gap-2">
				{value ? (
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{value}
					</Text.Paragraph>
				) : null}
				<Ionicons name="chevron-forward" size={19} color={mutedColor} />
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	);
}

export function ListDivider() {
	return <AppSeparator className="opacity-60" />;
}
