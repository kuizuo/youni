import { Ionicons } from "@expo/vector-icons";
import { Alert, Button, Card, Skeleton, Surface, Text } from "heroui-native";

export function FeedSkeleton() {
	return (
		<Surface variant="transparent" className="flex-row gap-3 px-3 py-2">
			{[0, 1].map((column) => (
				<Surface
					key={column}
					variant="transparent"
					className="flex-1 gap-3 p-0"
				>
					{[0, 1].map((item) => (
						<Card key={`${column}-${item}`} className="overflow-hidden p-0">
							<Skeleton className="h-48 w-full rounded-none" />
							<Surface variant="transparent" className="gap-2 p-3">
								<Skeleton className="h-4 w-full rounded-full" />
								<Skeleton className="h-4 w-3/4 rounded-full" />
								<Surface
									variant="transparent"
									className="mt-1 flex-row items-center gap-2 p-0"
								>
									<Skeleton className="size-6 rounded-full" />
									<Skeleton className="h-3 flex-1 rounded-full" />
								</Surface>
							</Surface>
						</Card>
					))}
				</Surface>
			))}
		</Surface>
	);
}

export function EmptyState({
	icon = "sparkles-outline",
	title,
	description,
	actionLabel,
	onAction,
}: {
	icon?: keyof typeof Ionicons.glyphMap;
	title: string;
	description: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	return (
		<Card className="mx-6 my-12 items-center gap-3 rounded-3xl p-6">
			<Surface className="size-14 items-center justify-center rounded-full bg-accent-soft p-0">
				<Ionicons name={icon} size={26} color="#f62c55" />
			</Surface>
			<Text.Paragraph align="center" weight="semibold">
				{title}
			</Text.Paragraph>
			<Text.Paragraph align="center" color="muted" type="body-sm">
				{description}
			</Text.Paragraph>
			{actionLabel && onAction ? (
				<Button
					size="sm"
					variant="primary"
					feedbackVariant="scale-ripple"
					onPress={onAction}
				>
					<Ionicons name="sparkles-outline" size={14} color="#ffffff" />
					<Button.Label>{actionLabel}</Button.Label>
				</Button>
			) : null}
		</Card>
	);
}

export function ErrorState({
	title = "暂时加载失败",
	description = "网络或服务暂时不可用，请稍后再试。",
	onRetry,
}: {
	title?: string;
	description?: string;
	onRetry?: () => void;
}) {
	return (
		<Alert status="danger" className="mx-4 my-8 rounded-3xl">
			<Alert.Indicator />
			<Alert.Content>
				<Alert.Title>{title}</Alert.Title>
				<Alert.Description>{description}</Alert.Description>
			</Alert.Content>
			{onRetry ? (
				<Button
					size="sm"
					variant="danger"
					feedbackVariant="scale-ripple"
					onPress={onRetry}
				>
					<Ionicons name="refresh-outline" size={14} color="#ffffff" />
					<Button.Label>重试</Button.Label>
				</Button>
			) : null}
		</Alert>
	);
}
