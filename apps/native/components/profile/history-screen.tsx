import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { Alert, Image, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { EmptyState, ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { useAppToast } from "@/utils/app-toast";
import { orpc, queryClient } from "@/utils/orpc";
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

function formatRelativeTime(value: Date | string) {
	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (Number.isNaN(date.getTime())) return "刚刚";
	if (diff < minute) return "刚刚";
	if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
	if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
	if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
	return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function HistoryScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { toast } = useAppToast();
	const history = useQuery({
		...orpc.social.viewHistory.queryOptions({
			input: { limit: 60 },
		}),
	});
	const items = (history.data ?? []) as HistoryItem[];
	const deleteMutation = useMutation(
		orpc.social.deleteViewHistory.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries();
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
			},
		}),
	);
	const clearMutation = useMutation(
		orpc.social.clearViewHistory.mutationOptions({
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				toast.show({ label: "浏览记录已清空" });
			},
			onError: (error) => {
				if (isRequestTimeoutError(error)) return;
				toast.show({ variant: "danger", label: error.message });
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
							{clearMutation.isPending ? <Spinner size="sm" /> : null}
							<Button.Label>清空</Button.Label>
						</Button>
					) : null
				}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						refreshing={history.isRefetching}
						onRefresh={() => history.refetch()}
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
					<ErrorState
						description="浏览记录暂时没有加载出来，请稍后重试。"
						onRetry={() => history.refetch()}
					/>
				) : items.length > 0 ? (
					items.map((item) => (
						<HistoryRow
							key={item.note.id}
							item={item}
							isDeleting={
								deleteMutation.isPending &&
								deleteMutation.variables?.id === item.note.id
							}
							onDelete={deleteItem}
							onOpen={openNote}
						/>
					))
				) : (
					<EmptyState
						icon="time-outline"
						title="还没有浏览记录"
						description="打开过的笔记会显示在这里。"
					/>
				)}
			</ScrollView>
		</View>
	);
}

function HistoryRow({
	isDeleting,
	item,
	onDelete,
	onOpen,
}: {
	isDeleting: boolean;
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
					<Text.Paragraph weight="semibold" numberOfLines={2}>
						{title}
					</Text.Paragraph>
					<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
						{item.note.author.name}
					</Text.Paragraph>
					<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
						{formatRelativeTime(item.viewedAt)}
					</Text.Paragraph>
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
				{isDeleting ? (
					<Spinner size="sm" />
				) : (
					<Ionicons name="close-outline" size={20} color={mutedColor} />
				)}
			</Button>
		</View>
	);
}
