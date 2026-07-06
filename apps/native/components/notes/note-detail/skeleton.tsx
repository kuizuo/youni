import { Skeleton } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppSeparator } from "@/components/shared/app-separator";

import { SimpleTopBar } from "./content";

export function NoteDetailSkeleton({
	imageHeight,
	onBack,
	pageWidth,
}: {
	imageHeight: number;
	onBack: () => void;
	pageWidth: number;
}) {
	const insets = useSafeAreaInsets();

	return (
		<View className="flex-1 bg-background">
			<View className="mx-auto w-full max-w-xl">
				<SimpleTopBar onBack={onBack} />
				<Skeleton
					className="bg-content2"
					style={{ width: pageWidth, height: imageHeight }}
				/>
				<View className="gap-6 px-4 py-5">
					<View className="gap-3">
						<Skeleton className="h-7 w-4/5 rounded-md" />
						<Skeleton className="h-4 w-full rounded-md" />
						<Skeleton className="h-4 w-full rounded-md" />
						<Skeleton className="h-4 w-3/5 rounded-md" />
					</View>
					<View className="gap-4 pt-5">
						<AppSeparator />
						<View className="flex-row items-center justify-between">
							<Skeleton className="h-5 w-16 rounded-md" />
							<Skeleton className="h-8 w-32 rounded-full" />
						</View>
						<View className="flex-row gap-3">
							<Skeleton className="size-9 rounded-full" />
							<View className="min-w-0 flex-1 gap-2">
								<Skeleton className="h-4 w-24 rounded-md" />
								<Skeleton className="h-4 w-full rounded-md" />
								<Skeleton className="h-4 w-2/3 rounded-md" />
							</View>
						</View>
					</View>
				</View>
			</View>
			<AppSeparator />
			<View
				className="mt-auto bg-background px-4 pt-3"
				style={{ paddingBottom: insets.bottom + 10 }}
			>
				<View className="mx-auto w-full max-w-xl flex-row items-center gap-2">
					<Skeleton className="h-10 w-12 rounded-full" />
					<Skeleton className="h-10 w-12 rounded-full" />
					<Skeleton className="h-10 min-w-0 flex-1 rounded-full" />
					<Skeleton className="size-9 rounded-full" />
				</View>
			</View>
		</View>
	);
}
