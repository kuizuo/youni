import { Button, Spinner } from "@heroui/react";

export function AdminTableEmptyState({
	emptyText,
	errorMessage,
	isLoading,
	onRetry,
}: {
	emptyText: string;
	errorMessage?: string | null;
	isLoading: boolean;
	onRetry?: () => unknown;
}) {
	return (
		<div className="flex min-h-36 w-full items-center justify-center">
			{isLoading ? (
				<Spinner aria-label="加载中" color="accent" size="md" />
			) : errorMessage ? (
				<div className="flex flex-col items-center gap-3 text-center">
					<span className="text-danger text-sm">{errorMessage}</span>
					{onRetry ? (
						<Button
							size="sm"
							variant="secondary"
							onPress={() => void onRetry()}
						>
							重新加载
						</Button>
					) : null}
				</div>
			) : (
				<span className="text-muted text-sm">{emptyText}</span>
			)}
		</div>
	);
}
