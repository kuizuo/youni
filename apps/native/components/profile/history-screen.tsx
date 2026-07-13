import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	PressableFeedback,
	Spinner,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { Alert, Image, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { EmptyState, ErrorState } from "@/components/social-states";
import {
	invalidateViewHistory,
	optimisticClearHistory,
	optimisticDeleteHistoryItem,
} from "@/lib/query/optimistic-cache";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { formatRelativeTime } from "@/utils/format";
import { orpc } from "@/utils/orpc";
import { isRequestTimeoutError } from "@/utils/request-timeout";

type HistoryItem = {
	note: {
		author: {
			name: string;
		};
		cover: null | string;
		id: string;
		images: string[];
		title: string;
	};
	viewedAt: Date | string;
};

export default function HistoryScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const history = useQuery({
		...orpc.notes.viewHistory.queryOptions({
			input: { limit: 60 },
		}),
	});
	const items = (history.data ?? []) as HistoryItem[];
	const deleteMutation = useMutation(
		orpc.notes.deleteViewHistory.mutationOptions<{ rollback?: () => void }>({
			onError: (error, _variables, context) => {
				context?.rollback?.();
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onMutate: (variables) => optimisticDeleteHistoryItem(variables.id),
			onSettled: () => {
				void invalidateViewHistory();
			},
		}),
	);
	const clearMutation = useMutation(
		orpc.notes.clearViewHistory.mutationOptions<{ rollback?: () => void }>({
			onError: (error, _variables, context) => {
				context?.rollback?.();
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
			onMutate: () => optimisticClearHistory(),
			onSettled: () => {
				void invalidateViewHistory();
			},
		}),
	);

	const openNote = (id: string) => {
		fireHaptic();
		router.push({
			pathname: "/note/[id]",
			params: { id },
		} as unknown as Href);
	};
	const deleteItem = (id: string) => {
		fireHaptic();
		deleteMutation.mutate({ id });
	};
	const confirmClear = () => {
		if (items.length === 0 || clearMutation.isPending) return;
		Alert.alert("清空浏览记录", "清空后不能恢复。", [
			{ text: "取消", style: "cancel" },
			{
				text: "清空",
				style: "destructive",
				onPress: () => clearMutation.mutate(undefined),
			},
		]);
	};
	const refreshHistory = async () => {
		setIsManuallyRefreshing(true);
		try {
			await history.refetch();
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader
				title="浏览记录"
				action={
					items.length > 0 ? (
						<Button
							size="sm"
							variant="ghost"
							className="rounded-full"
							feedbackVariant="scale-ripple"
							onPress={confirmClear}
						>
							<Button.Label>清空</Button.Label>
						</Button>
					) : null
				}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						refreshing={isManuallyRefreshing}
						onRefresh={refreshHistory}
					/>
				}
				contentContainerClassName="gap-3 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				{history.isLoading ? (
					<View className="items-center justify-center py-20">
						<Spinner />
					</View>
				) : history.isError ? (
					<ErrorState onRetry={() => history.refetch()} />
				) : items.length > 0 ? (
					items.map((item) => (
						<HistoryRow
							key={item.note.id}
							item={item}
							onDelete={deleteItem}
							onOpen={openNote}
						/>
					))
				) : (
					<EmptyState
						icon="time-outline"
						title="浏览过的图文会出现在这里，去逛逛吧"
					/>
				)}
			</ScrollView>
		</View>
	);
}

function HistoryRow({
	item,
	onDelete,
	onOpen,
}: {
	item: HistoryItem;
	onDelete: (id: string) => void;
	onOpen: (id: string) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const cover = item.note.cover ?? item.note.images[0] ?? null;
	const title = item.note.title || "未命名笔记";

	return (
		<View className="flex-row gap-2 rounded-3xl bg-surface p-3">
			<PressableFeedback
				accessibilityLabel={`打开 ${title}`}
				accessibilityRole="button"
				className="min-w-0 flex-1 flex-row gap-3"
				onPress={() => onOpen(item.note.id)}
			>
				<View className="size-20 overflow-hidden rounded-2xl bg-content2">
					{cover ? (
						<Image
							source={{ uri: cover }}
							resizeMode="cover"
							className="h-full w-full"
						/>
					) : (
						<View className="h-full w-full items-center justify-center">
							<Ionicons name="image-outline" size={24} color={mutedColor} />
						</View>
					)}
				</View>
				<View className="min-w-0 flex-1 justify-center gap-1">
					<Typography.Paragraph weight="semibold" numberOfLines={2}>
						{title}
					</Typography.Paragraph>
					<Typography.Paragraph type="body-sm" color="muted" numberOfLines={1}>
						{item.note.author.name}
					</Typography.Paragraph>
					<Typography.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{formatRelativeTime(item.viewedAt, "刚刚")}
					</Typography.Paragraph>
				</View>
			</PressableFeedback>
			<Button
				isIconOnly
				size="sm"
				variant="ghost"
				className="self-center rounded-full"
				feedbackVariant="scale-ripple"
				accessibilityLabel="删除浏览记录"
				onPress={() => onDelete(item.note.id)}
			>
				<Ionicons name="close-outline" size={20} color={mutedColor} />
			</Button>
		</View>
	);
}
