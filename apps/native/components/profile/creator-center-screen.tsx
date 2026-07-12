import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Spinner,
	Surface,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { ErrorState } from "@/components/social-states";
import { formatCount } from "@/utils/format";
import { orpc } from "@/utils/orpc";

export default function CreatorCenterScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const accentColor = useThemeColor("accent");
	const accentForegroundColor = useThemeColor("accent-foreground");
	const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
	const stats = useQuery(orpc.creatorStats.queryOptions());
	const data = stats.data;
	const refreshStats = async () => {
		setIsManuallyRefreshing(true);
		try {
			await stats.refetch();
		} finally {
			setIsManuallyRefreshing(false);
		}
	};

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader title="创作者中心" />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						refreshing={isManuallyRefreshing}
						onRefresh={refreshStats}
					/>
				}
				contentContainerClassName="gap-4 px-4 pt-4"
				contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
			>
				{stats.isLoading ? (
					<View className="items-center justify-center py-20">
						<Spinner />
					</View>
				) : stats.isError || !data ? (
					<ErrorState
						description="创作者数据暂时没有加载出来，请稍后重试。"
						onRetry={() => stats.refetch()}
					/>
				) : (
					<>
						<Surface className="gap-4 rounded-3xl p-4">
							<View className="flex-row items-center justify-between">
								<Typography.Paragraph weight="bold">
									内容表现
								</Typography.Paragraph>
								<View className="size-11 items-center justify-center rounded-full bg-accent-soft">
									<Ionicons name="stats-chart" size={22} color={accentColor} />
								</View>
							</View>
							<View className="flex-row gap-3">
								<StatBlock label="作品" value={data.published} />
								<StatBlock label="获赞" value={data.liked} />
								<StatBlock label="收藏" value={data.collected} />
								<StatBlock label="评论" value={data.comments} />
							</View>
						</Surface>

						<Surface className="gap-3 rounded-3xl p-4">
							<Typography.Paragraph weight="bold">
								内容状态
							</Typography.Paragraph>
							<View className="flex-row flex-wrap gap-3">
								<StatusPill label="全部" value={data.total} />
								<StatusPill label="审核中" value={data.audit} />
								<StatusPill label="未通过" value={data.rejected} />
								<StatusPill label="已隐藏" value={data.hidden} />
							</View>
						</Surface>

						<Surface className="gap-3 rounded-3xl p-4">
							<Typography.Paragraph weight="bold">
								快捷操作
							</Typography.Paragraph>
							<Button
								variant="primary"
								className="rounded-full"
								feedbackVariant="scale-ripple"
								onPress={() => router.push("/publish" as Href)}
							>
								<Ionicons
									name="add-circle-outline"
									size={18}
									color={accentForegroundColor}
								/>
								<Button.Label>发布新图文</Button.Label>
							</Button>
							<Button
								variant="outline"
								className="rounded-full"
								feedbackVariant="scale-ripple"
								onPress={() => router.push("/drafts" as Href)}
							>
								<Ionicons
									name="document-text-outline"
									size={18}
									color={accentColor}
								/>
								<Button.Label>查看我的草稿</Button.Label>
							</Button>
						</Surface>
					</>
				)}
			</ScrollView>
		</View>
	);
}

function StatBlock({ label, value }: { label: string; value: number }) {
	return (
		<View className="min-w-0 flex-1 gap-1 rounded-2xl bg-content2 px-3 py-3">
			<Typography.Paragraph
				weight="bold"
				className="text-foreground"
				style={{ fontVariant: ["tabular-nums"] }}
			>
				{formatCount(value)}
			</Typography.Paragraph>
			<Typography.Paragraph type="body-xs" color="muted" numberOfLines={1}>
				{label}
			</Typography.Paragraph>
		</View>
	);
}

function StatusPill({ label, value }: { label: string; value: number }) {
	return (
		<View className="min-w-[92px] flex-1 rounded-2xl bg-content2 px-3 py-3">
			<Typography.Paragraph type="body-xs" color="muted">
				{label}
			</Typography.Paragraph>
			<Typography.Paragraph
				weight="bold"
				style={{ fontVariant: ["tabular-nums"] }}
			>
				{value}
			</Typography.Paragraph>
		</View>
	);
}
