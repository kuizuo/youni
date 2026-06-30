import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { PressableFeedback, Spinner, Text, useThemeColor } from "heroui-native";
import { Image, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { EmptyState, ErrorState } from "@/components/social-states";
import { fireHaptic } from "@/lib/utils/fire-haptic";
import { orpc } from "@/utils/orpc";

type DraftNote = {
	content: string;
	cover: null | string;
	draftSavedAt: Date | null | string;
	id: string;
	images: string[];
	title: string;
	updatedAt: Date | string;
};

function formatDate(value: Date | string | null) {
	if (!value) return "刚刚保存";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "刚刚保存";
	return `${date.getMonth() + 1}/${date.getDate()} ${date
		.getHours()
		.toString()
		.padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

export default function DraftsScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const drafts = useQuery(orpc.social.drafts.queryOptions());
	const items = (drafts.data ?? []) as DraftNote[];

	const openDraft = (id: string) => {
		fireHaptic();
		router.push({
			pathname: "/publish",
			params: { draftId: id },
		} as unknown as Href);
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="我的草稿" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						refreshing={drafts.isRefetching}
						onRefresh={() => drafts.refetch()}
					/>
				}
				contentContainerClassName="gap-3 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				{drafts.isLoading ? (
					<View className="items-center justify-center py-20">
						<Spinner />
					</View>
				) : drafts.isError ? (
					<ErrorState
						description="草稿暂时没有加载出来，请稍后重试。"
						onRetry={() => drafts.refetch()}
					/>
				) : items.length > 0 ? (
					items.map((item) => (
						<DraftRow key={item.id} item={item} onPress={openDraft} />
					))
				) : (
					<EmptyState
						icon="document-text-outline"
						title="还没有草稿"
						description="保存过的草稿会出现在这里。"
						actionLabel="去发布"
						onAction={() => router.push("/publish" as Href)}
					/>
				)}
			</ScrollView>
		</View>
	);
}

function DraftRow({
	item,
	onPress,
}: {
	item: DraftNote;
	onPress: (id: string) => void;
}) {
	const mutedColor = useThemeColor("muted");
	const cover = item.cover ?? item.images[0] ?? null;
	const title = item.title || "未命名草稿";
	const preview = item.content.trim() || "还没有正文";

	return (
		<PressableFeedback
			accessibilityLabel={`编辑 ${title}`}
			accessibilityRole="button"
			className="flex-row gap-3 rounded-3xl bg-surface p-3"
			onPress={() => onPress(item.id)}
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
				<Text.Paragraph weight="semibold" numberOfLines={1}>
					{title}
				</Text.Paragraph>
				<Text.Paragraph type="body-sm" color="muted" numberOfLines={2}>
					{preview}
				</Text.Paragraph>
				<Text.Paragraph type="body-xs" color="muted" numberOfLines={1}>
					{formatDate(item.draftSavedAt ?? item.updatedAt)}
				</Text.Paragraph>
			</View>
			<View className="justify-center">
				<Ionicons name="chevron-forward" size={20} color={mutedColor} />
			</View>
		</PressableFeedback>
	);
}
