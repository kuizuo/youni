import { Ionicons } from "@expo/vector-icons";
import {
	Alert,
	Button,
	Skeleton,
	Typography,
	useThemeColor,
} from "heroui-native";
import { View } from "react-native";

const FEED_SKELETON_COLUMNS = [
	[0.82, 1.18, 0.9],
	[1.08, 0.76, 1.05],
] as const;

export function FeedSkeleton() {
	return (
		<View className="flex-row gap-3 px-3 py-2">
			{FEED_SKELETON_COLUMNS.map((column) => (
				<View key={column[0]} className="flex-1 gap-3">
					{column.map((aspectRatio) => (
						<View
							key={aspectRatio}
							className="overflow-hidden rounded-xl bg-surface"
						>
							<Skeleton
								animation={{ exiting: "disabled" }}
								className="w-full rounded-none"
								style={{ aspectRatio }}
							/>
							<View className="gap-2 p-3">
								<Skeleton
									animation={{ exiting: "disabled" }}
									className="h-4 w-full rounded-full"
								/>
								<Skeleton
									animation={{ exiting: "disabled" }}
									className="h-4 w-3/4 rounded-full"
								/>
								<View className="mt-1 flex-row items-center gap-2">
									<Skeleton
										animation={{ exiting: "disabled" }}
										className="size-6 rounded-full"
									/>
									<Skeleton
										animation={{ exiting: "disabled" }}
										className="h-3 flex-1 rounded-full"
									/>
								</View>
							</View>
						</View>
					))}
				</View>
			))}
		</View>
	);
}

export function EmptyState({
	icon = "sparkles-outline",
	iconColor,
	title,
	description,
	actionLabel,
	onAction,
}: {
	icon?: keyof typeof Ionicons.glyphMap;
	iconColor?: string;
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	const accentColor = useThemeColor("accent");

	return (
		<View className="mx-6 my-14 items-center gap-3 px-6 py-4">
			<View className="size-12 items-center justify-center">
				<Ionicons name={icon} size={26} color={iconColor ?? accentColor} />
			</View>
			<Typography.Paragraph align="center" weight="semibold">
				{title}
			</Typography.Paragraph>
			{description ? (
				<Typography.Paragraph align="center" color="muted" type="body-sm">
					{description}
				</Typography.Paragraph>
			) : null}
			{actionLabel && onAction ? (
				<Button
					size="sm"
					variant="primary"
					feedbackVariant="scale-ripple"
					onPress={onAction}
				>
					<Button.Label>{actionLabel}</Button.Label>
				</Button>
			) : null}
		</View>
	);
}

export function ErrorState({
	title = "未能成功加载",
	description = "请重试。",
	onRetry,
}: {
	title?: string;
	description?: string;
	onRetry?: () => void;
}) {
	const dangerForegroundColor = useThemeColor("danger-foreground");
	const foregroundColor = useThemeColor("foreground");
	const mutedColor = useThemeColor("muted");

	return (
		<Alert status="danger" className="mx-4 my-8 rounded-2xl">
			<Alert.Indicator />
			<Alert.Content>
				<Alert.Title style={{ color: foregroundColor }}>{title}</Alert.Title>
				<Alert.Description style={{ color: mutedColor }}>
					{description}
				</Alert.Description>
			</Alert.Content>
			{onRetry ? (
				<Button
					size="sm"
					variant="danger"
					feedbackVariant="scale-ripple"
					onPress={onRetry}
				>
					<Ionicons
						name="refresh-outline"
						size={14}
						color={dangerForegroundColor}
					/>
					<Button.Label className="text-danger-foreground">重试</Button.Label>
				</Button>
			) : null}
		</Alert>
	);
}
