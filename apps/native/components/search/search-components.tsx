import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import {
	Avatar,
	Button,
	PressableFeedback,
	Spinner,
	Text,
	useThemeColor,
} from "heroui-native";
import { ScrollView, View } from "react-native";

import {
	formatCount,
	SEARCH_TABS,
	type SearchTabKey,
	type TopicSearchItem,
	type UserSearchItem,
} from "@/components/search/search-utils";
import { useSocialNavigation } from "@/lib/social/use-social-actions";
import { fireHaptic } from "@/lib/utils/fire-haptic";

export function SearchTabs({
	activeTab,
	onChange,
}: {
	activeTab: SearchTabKey;
	onChange: (tab: SearchTabKey) => void;
}) {
	return (
		<View className="h-11 flex-row items-end">
			{SEARCH_TABS.map((item) => {
				const active = item.key === activeTab;
				return (
					<PressableFeedback
						key={item.key}
						accessibilityRole="tab"
						accessibilityState={active ? { selected: true } : undefined}
						className="flex-1 items-center justify-end gap-2"
						onPress={() => {
							fireHaptic();
							onChange(item.key);
						}}
					>
						<Text.Paragraph
							weight="semibold"
							className={active ? "text-foreground" : "text-muted"}
						>
							{item.label}
						</Text.Paragraph>
						<View
							className={
								active ? "h-1 w-14 rounded-full bg-accent" : "h-1 w-14"
							}
						/>
					</PressableFeedback>
				);
			})}
		</View>
	);
}

export function UserResultRow({
	currentUserId,
	isPending,
	item,
	onToggleFollow,
}: {
	currentUserId?: string;
	isPending: boolean;
	item: UserSearchItem;
	onToggleFollow: (userId: string) => void;
}) {
	const router = useRouter();
	const socialNavigation = useSocialNavigation();
	const mutedColor = useThemeColor("muted");
	const isSelf = currentUserId === item.id;
	const secondaryName = item.handle ? `@${item.handle}` : "未设置用户名";

	const openProfile = () => {
		socialNavigation.goTo({ type: "user", id: item.id });
	};

	return (
		<View className="flex-row items-start gap-3 border-border-tertiary border-b px-4 py-4">
			<PressableFeedback
				accessibilityRole="button"
				accessibilityLabel={`查看 ${item.name} 的主页`}
				className="min-w-0 flex-1 flex-row items-start gap-3"
				onPress={openProfile}
			>
				<Avatar size="md" alt={item.name}>
					{item.image ? <Avatar.Image source={{ uri: item.image }} /> : null}
					<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
				</Avatar>

				<View className="min-w-0 flex-1 gap-1">
					<View className="gap-0.5">
						<Text.Paragraph
							weight="semibold"
							numberOfLines={1}
							className="text-foreground"
						>
							{item.name}
						</Text.Paragraph>
						<Text.Paragraph type="body-sm" color="muted" numberOfLines={1}>
							{secondaryName}
						</Text.Paragraph>
					</View>

					{item.bio ? (
						<Text.Paragraph
							type="body-sm"
							numberOfLines={2}
							className="text-foreground leading-5"
						>
							{item.bio}
						</Text.Paragraph>
					) : null}

					<View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
						<UserMetric label="作品" value={item.noteCount} />
						<UserMetric label="粉丝" value={item.followerCount} />
						<View className="flex-row items-center gap-1">
							<Ionicons name="heart-outline" size={14} color={mutedColor} />
							<Text.Paragraph type="body-xs" color="muted">
								{formatCount(item.likedCount)}
							</Text.Paragraph>
						</View>
					</View>
				</View>
			</PressableFeedback>

			{isSelf ? (
				<Button
					size="sm"
					variant="secondary"
					className="rounded-full px-3"
					feedbackVariant="scale-ripple"
					onPress={() => router.push("/me" as Href)}
				>
					<Button.Label>我</Button.Label>
				</Button>
			) : (
				<Button
					size="sm"
					variant={item.isFollowing ? "secondary" : "primary"}
					className="rounded-full px-4"
					feedbackVariant="scale-ripple"
					isDisabled={isPending}
					onPress={() => onToggleFollow(item.id)}
				>
					<Button.Label>{item.isFollowing ? "已关注" : "关注"}</Button.Label>
				</Button>
			)}
		</View>
	);
}

export function TopicResultRow({
	item,
	onPress,
}: {
	item: TopicSearchItem;
	onPress: (topicId: string) => void;
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<PressableFeedback
			accessibilityRole="button"
			accessibilityLabel={`查看话题 ${item.name}`}
			className="flex-row items-center gap-3 border-border-tertiary border-b px-4 py-4"
			onPress={() => onPress(item.id)}
		>
			<View className="size-12 items-center justify-center rounded-full bg-content2">
				<Ionicons name="pricetag-outline" size={22} color={mutedColor} />
			</View>
			<View className="min-w-0 flex-1 gap-1">
				<Text.Paragraph
					weight="semibold"
					numberOfLines={1}
					className="text-foreground"
				>
					#{item.name}
				</Text.Paragraph>
				<Text.Paragraph type="body-sm" color="muted">
					{formatCount(item.noteCount)} 篇图文
					{item.discussionCount > 0
						? ` · ${formatCount(item.discussionCount)} 条讨论`
						: ""}
				</Text.Paragraph>
			</View>
			<Ionicons name="chevron-forward" size={18} color={mutedColor} />
		</PressableFeedback>
	);
}

export function PagingFooter({
	hasItems,
	hasMore,
	isLoading,
}: {
	hasItems: boolean;
	hasMore: boolean;
	isLoading: boolean;
}) {
	if (!hasItems) return null;

	if (isLoading) {
		return (
			<View className="items-center py-5">
				<Spinner size="sm" />
			</View>
		);
	}

	if (!hasMore) {
		return (
			<View className="items-center py-5">
				<Text.Paragraph type="body-xs" color="muted">
					没有更多了
				</Text.Paragraph>
			</View>
		);
	}

	return <View className="h-5" />;
}

export function SearchHome({
	bottomInset,
	isEditingHistory,
	mutedColor,
	onClearHistory,
	onDeleteHistoryWord,
	onFinishEditingHistory,
	onPressWord,
	onStartEditingHistory,
	quickWords,
	recentWords,
}: {
	bottomInset: number;
	isEditingHistory: boolean;
	mutedColor: string;
	onClearHistory: () => void;
	onDeleteHistoryWord: (word: string) => void;
	onFinishEditingHistory: () => void;
	onPressWord: (word: string) => void;
	onStartEditingHistory: () => void;
	quickWords: readonly string[];
	recentWords: readonly string[];
}) {
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="mx-auto w-full max-w-xl gap-7 px-4 pt-5"
			contentContainerStyle={{ paddingBottom: bottomInset + 28 }}
			keyboardShouldPersistTaps="handled"
		>
			{recentWords.length > 0 ? (
				<View className="gap-3">
					<View className="flex-row items-center justify-between">
						<Text.Paragraph weight="semibold" className="text-foreground">
							历史记录
						</Text.Paragraph>
						{isEditingHistory ? (
							<View className="flex-row items-center gap-3">
								<Button
									size="sm"
									variant="ghost"
									className="h-9 rounded-full px-2"
									feedbackVariant="scale-ripple"
									accessibilityLabel="全部删除搜索历史"
									onPress={onClearHistory}
								>
									<Button.Label className="text-muted">全部删除</Button.Label>
								</Button>
								<View className="h-4 w-px bg-border" />
								<Button
									size="sm"
									variant="ghost"
									className="h-9 rounded-full px-2"
									feedbackVariant="scale-ripple"
									accessibilityLabel="完成编辑搜索历史"
									onPress={onFinishEditingHistory}
								>
									<Button.Label className="text-muted">完成</Button.Label>
								</Button>
							</View>
						) : (
							<Button
								isIconOnly
								size="sm"
								variant="ghost"
								className="h-9 w-9 rounded-full"
								accessibilityLabel="编辑搜索历史"
								onPress={onStartEditingHistory}
							>
								<Ionicons name="trash-outline" size={17} color={mutedColor} />
							</Button>
						)}
					</View>
					<WordWrap
						isEditing={isEditingHistory}
						words={recentWords}
						onDeleteWord={onDeleteHistoryWord}
						onPressWord={onPressWord}
					/>
				</View>
			) : null}

			<View className="gap-3">
				<Text.Paragraph weight="semibold" className="text-foreground">
					推荐搜索
				</Text.Paragraph>
				<WordWrap words={quickWords} onPressWord={onPressWord} />
			</View>
		</ScrollView>
	);
}

function UserMetric({ label, value }: { label: string; value: number }) {
	return (
		<Text.Paragraph type="body-xs" color="muted">
			{formatCount(value)} {label}
		</Text.Paragraph>
	);
}

function WordWrap({
	isEditing = false,
	onDeleteWord,
	onPressWord,
	words,
}: {
	isEditing?: boolean;
	onDeleteWord?: (word: string) => void;
	onPressWord: (word: string) => void;
	words: readonly string[];
}) {
	const mutedColor = useThemeColor("muted");

	return (
		<View className="flex-row flex-wrap gap-2">
			{words.map((item) =>
				isEditing ? (
					<View
						key={item}
						className="h-10 flex-row items-center rounded-full border border-border bg-content2 pr-1 pl-4"
					>
						<Text.Paragraph numberOfLines={1} className="text-foreground">
							{item}
						</Text.Paragraph>
						<Button
							isIconOnly
							size="sm"
							variant="ghost"
							className="h-8 w-8 rounded-full"
							feedbackVariant="scale-ripple"
							accessibilityLabel={`删除搜索历史 ${item}`}
							onPress={() => onDeleteWord?.(item)}
						>
							<Ionicons name="close-outline" size={17} color={mutedColor} />
						</Button>
					</View>
				) : (
					<Button
						key={item}
						size="sm"
						variant="secondary"
						className="rounded-full px-4"
						feedbackVariant="scale-ripple"
						onPress={() => onPressWord(item)}
					>
						<Button.Label>{item}</Button.Label>
					</Button>
				),
			)}
		</View>
	);
}
