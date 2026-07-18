import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import type { ProfilesOutputs } from "@youni/api/contracts/profiles";
import type { ContentNoteStatus } from "@youni/api/contracts/shared";
import { Image } from "expo-image";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Button,
	Chip,
	PressableFeedback,
	Spinner,
	Surface,
	Typography,
	useThemeColor,
} from "heroui-native";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { ErrorState } from "@/components/social-states";
import { formatCount, formatRelativeTime } from "@/utils/format";
import { orpc } from "@/utils/orpc";

type CreatorNote = ProfilesOutputs["meFeed"][number];
type ContentFilter = "all" | "published" | "audit" | "rejected";

const CONTENT_FILTERS: Array<{ key: ContentFilter; label: string }> = [
	{ key: "all", label: "全部" },
	{ key: "published", label: "已发布" },
	{ key: "audit", label: "审核中" },
	{ key: "rejected", label: "未通过" },
];

export default function CreatorCenterScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const accentColor = useThemeColor("accent");
	const [activeFilter, setActiveFilter] = useState<ContentFilter>("all");
	const [isRefreshing, setIsRefreshing] = useState(false);
	const stats = useQuery(orpc.notes.creatorStats.queryOptions());
	const notes = useQuery(
		orpc.profiles.meFeed.queryOptions({
			input: { limit: 60, tab: "notes" },
		}),
	);
	const data = stats.data;
	const itemsByFilter = useMemo(() => {
		const items = notes.data ?? [];
		return {
			all: items,
			audit: items.filter((note) => note.status === "audit"),
			published: items.filter((note) => note.status === "published"),
			rejected: items.filter((note) => note.status === "rejected"),
		};
	}, [notes.data]);

	const openPublish = () => router.push("/publish" as Href);
	const refreshContent = async () => {
		setIsRefreshing(true);
		try {
			await Promise.all([stats.refetch(), notes.refetch()]);
		} finally {
			setIsRefreshing(false);
		}
	};
	const editNote = (id: string) =>
		router.push({
			pathname: "/publish",
			params: { noteId: id },
		} as unknown as Href);

	return (
		<View className="flex-1 bg-background">
			<ProfilePageHeader
				title="创作者中心"
				action={
					<Button
						isIconOnly
						size="sm"
						variant="ghost"
						accessibilityLabel="发布新图文"
						onPress={openPublish}
					>
						<Ionicons name="add" size={24} color={accentColor} />
					</Button>
				}
			/>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				refreshControl={
					<RefreshControl
						colors={[accentColor]}
						refreshing={isRefreshing}
						tintColor={accentColor}
						onRefresh={refreshContent}
					/>
				}
				contentContainerClassName="mx-auto w-full max-w-xl gap-8 px-4 pt-5"
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
			>
				{stats.isLoading ? (
					<View className="items-center justify-center py-20">
						<Spinner />
					</View>
				) : stats.isError || !data ? (
					<ErrorState onRetry={() => stats.refetch()} />
				) : (
					<>
						<Surface className="gap-5 rounded-3xl p-5">
							<View className="flex-row items-start justify-between">
								<View className="gap-1">
									<Typography.Paragraph type="body-sm" color="muted">
										累计浏览
									</Typography.Paragraph>
									<Typography.Heading
										className="text-4xl"
										style={{
											fontVariant: ["tabular-nums"],
											lineHeight: 52,
										}}
									>
										{formatCount(data.views)}
									</Typography.Heading>
								</View>
								<Chip size="sm" variant="soft" color="default">
									<Chip.Label>累计数据</Chip.Label>
								</Chip>
							</View>
							<View className="flex-row">
								<PerformanceMetric label="获赞" value={data.liked} />
								<PerformanceMetric label="收藏" value={data.collected} />
								<PerformanceMetric label="评论" value={data.comments} />
							</View>
						</Surface>

						<View className="gap-4">
							<View className="gap-1">
								<Typography.Paragraph
									type="body"
									weight="bold"
									className="text-xl"
								>
									我的内容
								</Typography.Paragraph>
								<Typography.Paragraph type="body-sm" color="muted">
									查看表现，处理审核状态或继续编辑
								</Typography.Paragraph>
							</View>

							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerClassName="gap-2"
							>
								{CONTENT_FILTERS.map((filter) => {
									const isSelected = filter.key === activeFilter;
									return (
										<Button
											key={filter.key}
											accessibilityLabel={`${filter.label}，${itemsByFilter[filter.key].length} 篇`}
											accessibilityState={{ selected: isSelected }}
											className="h-9 rounded-full px-3"
											size="sm"
											variant={isSelected ? "secondary" : "ghost"}
											onPress={() => setActiveFilter(filter.key)}
										>
											<Button.Label>
												{filter.label} {itemsByFilter[filter.key].length}
											</Button.Label>
										</Button>
									);
								})}
							</ScrollView>
							<ContentList
								filter={
									CONTENT_FILTERS.find(
										(filter) => filter.key === activeFilter,
									) ?? CONTENT_FILTERS[0]
								}
								isError={notes.isError}
								isLoading={notes.isLoading}
								items={itemsByFilter[activeFilter]}
								onCreate={openPublish}
								onEdit={editNote}
								onRetry={() => notes.refetch()}
							/>
						</View>
					</>
				)}
			</ScrollView>
		</View>
	);
}

function PerformanceMetric({ label, value }: { label: string; value: number }) {
	return (
		<View className="min-w-0 flex-1 gap-0.5">
			<Typography.Paragraph
				weight="bold"
				style={{ fontVariant: ["tabular-nums"] }}
			>
				{formatCount(value)}
			</Typography.Paragraph>
			<Typography.Paragraph type="body-xs" color="muted">
				{label}
			</Typography.Paragraph>
		</View>
	);
}

function ContentList({
	filter,
	isError,
	isLoading,
	items,
	onCreate,
	onEdit,
	onRetry,
}: {
	filter: (typeof CONTENT_FILTERS)[number];
	isError: boolean;
	isLoading: boolean;
	items: CreatorNote[];
	onCreate: () => void;
	onEdit: (id: string) => void;
	onRetry: () => void;
}) {
	const accentColor = useThemeColor("accent");
	if (isLoading) {
		return (
			<View className="items-center py-12">
				<Spinner size="sm" />
			</View>
		);
	}
	if (isError) return <ErrorState onRetry={onRetry} />;
	if (items.length === 0) {
		return (
			<Surface
				variant="secondary"
				className="items-start gap-3 rounded-3xl p-5"
			>
				<View className="size-10 items-center justify-center rounded-full bg-accent-soft">
					<Ionicons
						name={filter.key === "all" ? "images-outline" : "checkmark"}
						size={20}
						color={accentColor}
					/>
				</View>
				<View className="gap-1">
					<Typography.Paragraph weight="semibold">
						{filter.key === "all"
							? "还没有发布内容"
							: `没有${filter.label}的内容`}
					</Typography.Paragraph>
					<Typography.Paragraph type="body-sm" color="muted">
						{filter.key === "all"
							? "发布第一篇图文，数据会在这里开始积累"
							: "目前不需要处理这一类内容"}
					</Typography.Paragraph>
				</View>
				{filter.key === "all" ? (
					<Button size="sm" variant="primary" onPress={onCreate}>
						<Button.Label>去发布</Button.Label>
					</Button>
				) : null}
			</Surface>
		);
	}

	return (
		<Surface className="overflow-hidden rounded-3xl p-0">
			{items.map((note, index) => (
				<ContentRow
					key={note.id}
					note={note}
					showDivider={index < items.length - 1}
					onEdit={() => onEdit(note.id)}
				/>
			))}
		</Surface>
	);
}

function ContentRow({
	note,
	onEdit,
	showDivider,
}: {
	note: CreatorNote;
	onEdit: () => void;
	showDivider: boolean;
}) {
	const mutedColor = useThemeColor("muted");
	const status = STATUS_LABELS[note.status];

	return (
		<View>
			<PressableFeedback
				accessibilityLabel={`编辑 ${note.title || "未命名作品"}`}
				accessibilityRole="button"
				className="flex-row items-center gap-3 p-3"
				onPress={onEdit}
			>
				<View className="size-[72px] overflow-hidden rounded-2xl bg-content2">
					{note.cover ? (
						<Image
							source={{ uri: note.cover }}
							contentFit="cover"
							className="flex-1"
						/>
					) : (
						<View className="flex-1 items-center justify-center">
							<Ionicons name="image-outline" size={22} color={mutedColor} />
						</View>
					)}
				</View>
				<View className="min-w-0 flex-1 gap-2">
					<Typography.Paragraph weight="semibold" numberOfLines={1}>
						{note.title || "未命名作品"}
					</Typography.Paragraph>
					<View className="flex-row items-center gap-2">
						<Chip size="sm" variant="soft" color={status.color}>
							<Chip.Label>{status.label}</Chip.Label>
						</Chip>
						<Typography.Paragraph type="body-xs" color="muted">
							{formatRelativeTime(note.updatedAt)}
						</Typography.Paragraph>
					</View>
					<Typography.Paragraph type="body-xs" color="muted">
						{formatCount(note.viewCount ?? 0)} 浏览 ·{" "}
						{formatCount(note.likedCount)}赞 ·{" "}
						{formatCount(note.collectedCount)} 收藏 ·{" "}
						{formatCount(note.commentCount)}
						评论
					</Typography.Paragraph>
				</View>
				<Ionicons name="chevron-forward" size={18} color={mutedColor} />
			</PressableFeedback>
			{showDivider ? <View className="ml-24 h-px bg-separator" /> : null}
		</View>
	);
}

const STATUS_LABELS: Record<
	ContentNoteStatus,
	{
		color: "danger" | "default" | "success" | "warning";
		label: string;
	}
> = {
	audit: { color: "warning", label: "审核中" },
	draft: { color: "default", label: "草稿" },
	hidden: { color: "default", label: "已隐藏" },
	published: { color: "success", label: "已发布" },
	rejected: { color: "danger", label: "未通过" },
};
