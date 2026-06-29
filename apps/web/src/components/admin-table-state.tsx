import { Spinner } from "@heroui/react";

export function AdminTableEmptyState({
	emptyText,
	isLoading,
}: {
	emptyText: string;
	isLoading: boolean;
}) {
	return (
		<div className="flex min-h-36 w-full items-center justify-center">
			{isLoading ? (
				<Spinner aria-label="加载中" color="accent" size="md" />
			) : (
				<span className="text-muted text-sm">{emptyText}</span>
			)}
		</div>
	);
}
